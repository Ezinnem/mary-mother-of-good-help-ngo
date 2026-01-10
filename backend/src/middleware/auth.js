// src/middleware/auth.js
const jwt = require("jsonwebtoken");
require("dotenv").config();

const auth = (roles = []) => {
  return (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        return res.status(401).json({ message: "No token provided" });
      }

      const token = authHeader.split(" ")[1];
      if (!token) {
        return res.status(401).json({ message: "Invalid token format" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Role check (ADMIN, COMPANY, FELLOW)
      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ message: "Forbidden" });
      }

      req.user = decoded;
      next();
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  };
};

module.exports = { auth };
