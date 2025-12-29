// src/controllers/auth.controller.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Fellow = require("../models/Fellow");
const Company = require("../models/Company");

exports.register = async (req, res) => {
  try {
    const {
      fullName, email, password, role, phone,
      location, skillsInterest, skillsOffered, companyName, capacity
    } = req.body;

    if (!fullName || !email || !password || !role || !location?.state || !location?.city) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "Email already exists" });

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email,
      passwordHash,
      role,
      phone,
      location: { state: location.state, city: location.city },
    });

    if (role === "FELLOW") {
      await Fellow.create({
        user: user._id,
        skillsInterest: skillsInterest || [],
      });
    }

    if (role === "SME") {
      await Company.create({
        user: user._id,
        companyName,
        skillsOffered: skillsOffered || [],
        capacity: capacity || 1,
      });
    }

    res.status(201).json({ message: "Registration successful" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token, role: user.role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
