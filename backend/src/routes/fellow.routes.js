// src/routes/fellow.routes.js
const express = require("express");
const { getFellowCompany } = require("../controllers/fellow.controller");
const { auth } = require("../middleware/auth");

const router = express.Router();
router.get("/company", auth(["FELLOW"]), getFellowCompany);

module.exports = router;
