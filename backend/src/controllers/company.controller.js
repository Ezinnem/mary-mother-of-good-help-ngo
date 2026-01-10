// src/controllers/company.controller.js
const pool = require("../db");
const { sendEmail } = require("../utils/email");

const getCompanyFellows = async (req, res) => {
  try {
    const fellowsResult = await pool.query(
      `SELECT f.*, u.name, u.email, u.phone FROM fellow_profiles f
       JOIN users u ON f.user_id = u.id
       WHERE f.assigned_company_id = $1`,
      [req.user.id]
    );
    res.json(fellowsResult.rows || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const assignFellow = async (req, res) => {
  try {
    const { fellowId } = req.body;

    await pool.query(`UPDATE fellow_profiles SET assigned_company_id = $1 WHERE id = $2`, [req.user.id, fellowId]);

    const fellowResult = await pool.query(`SELECT * FROM users WHERE id = $1`, [fellowId]);
    const fellow = fellowResult.rows[0];

    await sendEmail(fellow.email, "You have been assigned!", `Hi ${fellow.name}, you are now assigned to your company.`);

    res.json({ message: "Fellow assigned", fellow });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getCompanyFellows, assignFellow };
