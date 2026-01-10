// src/controllers/fellow.controller.js
const pool = require("../db");

const getFellowCompany = async (req, res) => {
  try {
    const fellowResult = await pool.query(
      `SELECT c.* FROM fellow_profiles f 
       JOIN company_profiles c ON f.assigned_company_id = c.id 
       WHERE f.user_id = $1`,
      [req.user.id]
    );
    res.json(fellowResult.rows[0] || null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getFellowCompany };
