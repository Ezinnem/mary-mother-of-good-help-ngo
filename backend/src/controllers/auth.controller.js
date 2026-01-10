// src/controllers/auth.controller.js
const pool = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../utils/email");

const registerUser = async (req, res) => {
  try {
    const { fullName, email, password, role, phone, location, skillsInterest, skillsOffered, capacity } = req.body;

    const existing = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const userResult = await pool.query(
      `INSERT INTO users (name, email, phone, password, role) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [fullName, email, phone, hashedPassword, role]
    );
    const user = userResult.rows[0];

    if (role === "COMPANY") {
      await pool.query(
        `INSERT INTO company_profiles (user_id, skills_offered, capacity, state, city) VALUES ($1,$2,$3,$4,$5)`,
        [user.id, skillsOffered || [], capacity || 0, location?.state, location?.city]
      );
    }

    if (role === "FELLOW") {
      await pool.query(
        `INSERT INTO fellow_profiles (user_id, skills_interested, state, city) VALUES ($1,$2,$3,$4)`,
        [user.id, skillsInterest || [], location?.state, location?.city]
      );
    }

    await sendEmail(email, "Welcome to NGO Platform", `Hello ${fullName}, your account has been created.`);

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

    res.status(201).json({ user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find user
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const user = result.rows[0];

    // 2. Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 3. Create token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // 4. Respond
    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

const registerAdmin = async (req, res) => {
  try {
    const { fullName, email, password, phone } = req.body;

    const existing = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `
      INSERT INTO users (name, email, phone, password, role)
      VALUES ($1,$2,$3,$4,'ADMIN')
      RETURNING id, name, email, role
      `,
      [fullName, email, phone, hashedPassword]
    );

    res.status(201).json({
      message: "Admin created",
      admin: result.rows[0],
    });
  } catch (err) {
    console.error("registerAdmin error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get all companies
const getAllCompanies = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u.name, u.email, cp.skills_offered, cp.capacity, cp.state, cp.city
      FROM users u
      JOIN company_profiles cp ON cp.user_id = u.id
      WHERE u.role = 'COMPANY'
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get all fellows
const getAllFellows = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u.name, u.email, fp.skills_interested, fp.state, fp.city
      FROM users u
      JOIN fellow_profiles fp ON fp.user_id = u.id
      WHERE u.role = 'FELLOW'
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { 
  registerUser, 
  loginUser , 
  registerAdmin,
  getAllCompanies,
  getAllFellows,
};
