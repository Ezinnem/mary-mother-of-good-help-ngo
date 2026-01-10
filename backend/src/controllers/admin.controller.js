const pool = require("../db");
const { sendEmail } = require("../utils/email");
/**
 * Get all companies (admin only)
 */
const getAllCompanies = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        u.id AS user_id,
        u.name,
        u.email,
        u.phone,
        u.role,
        c.id AS company_id,
        c.skills_offered,
        c.capacity,
        c.state,
        c.city
      FROM users u
      JOIN company_profiles c ON c.user_id = u.id
      WHERE u.role = 'COMPANY'
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("getAllCompanies error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Get all fellows (admin only)
 */
const getAllFellows = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        u.id AS user_id,
        u.name,
        u.email,
        u.phone,
        u.role,
        f.id AS fellow_id,
        f.skills_interested,
        f.state,
        f.city,
        f.assigned_company_id
      FROM users u
      JOIN fellow_profiles f ON f.user_id = u.id
      WHERE u.role = 'FELLOW'
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("getAllFellows error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Filter fellows by skill
 * ?skill=javascript
 */
const getFellowsBySkill = async (req, res) => {
  try {
    const { skill } = req.query;

    const result = await pool.query(
      `
      SELECT 
        u.id AS user_id,
        u.name,
        u.email,
        f.skills_interested,
        f.state,
        f.city
      FROM users u
      JOIN fellow_profiles f ON f.user_id = u.id
      WHERE $1 = ANY(f.skills_interested)
      `,
      [skill]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("getFellowsBySkill error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Filter companies by skill offered
 * ?skill=react
 */
const getCompaniesBySkill = async (req, res) => {
  try {
    const { skill } = req.query;

    const result = await pool.query(
      `
      SELECT 
        u.id AS user_id,
        u.name,
        u.email,
        c.skills_offered,
        c.capacity,
        c.state,
        c.city
      FROM users u
      JOIN company_profiles c ON c.user_id = u.id
      WHERE $1 = ANY(c.skills_offered)
      `,
      [skill]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("getCompaniesBySkill error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Match fellows to companies by skill
const matchFellowsToCompanies = async (req, res) => {
  try {
    // 1. Get all unassigned fellows
    const fellowsResult = await pool.query(
      `SELECT fp.id AS fellow_id, u.email, u.name, fp.skills_interested, fp.assigned_company_id
       FROM fellow_profiles fp
       JOIN users u ON fp.user_id = u.id
       WHERE fp.assigned_company_id IS NULL`
    );
    const fellows = fellowsResult.rows;

    // 2. Get all companies with capacity remaining
    const companiesResult = await pool.query(
      `SELECT cp.id AS company_id, u.email AS company_email, u.name AS company_name, cp.skills_offered, cp.capacity,
              (SELECT COUNT(*) FROM fellow_profiles WHERE assigned_company_id = cp.id) AS assigned_count
       FROM company_profiles cp
       JOIN users u ON cp.user_id = u.id`
    );
    const companies = companiesResult.rows;

    const matches = [];

    for (const fellow of fellows) {
      for (const company of companies) {
        // Skip company if at full capacity
        if (parseInt(company.assigned_count) >= company.capacity) continue;

        // Check if skills match
        const skillsMatch = fellow.skills_interested.some(skill => company.skills_offered.includes(skill));
        if (skillsMatch) {
          // Assign fellow to this company
          await pool.query(
            `UPDATE fellow_profiles SET assigned_company_id = $1 WHERE id = $2`,
            [company.company_id, fellow.fellow_id]
          );

          // Send email to fellow
          await sendEmail(
            fellow.email,
            "You have been assigned to a company!",
            `Hi ${fellow.name}, you are now assigned to ${company.company_name}.`
          );

          matches.push({ fellow: fellow.name, company: company.company_name });

          // Notify admin if company reached capacity
          if (parseInt(company.assigned_count) + 1 >= company.capacity) {
            await sendEmail(
              req.user.email, // admin's email from token
              `Company ${company.company_name} capacity full`,
              `Company ${company.company_name} has reached its maximum capacity of ${company.capacity} fellows.`
            );
          }

          break; // move to next fellow after assignment
        }
      }
    }

    res.json({ message: "Fellows matched to companies", matches });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllCompanies,
  getAllFellows,
  getFellowsBySkill,
  getCompaniesBySkill,
  matchFellowsToCompanies
};
