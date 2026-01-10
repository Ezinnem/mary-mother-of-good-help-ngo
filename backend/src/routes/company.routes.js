// src/routes/company.routes.js
const express = require("express");
const { getCompanyFellows, assignFellow } = require("../controllers/company.controller");
const { auth } = require("../middleware/auth");

const router = express.Router();
router.get("/fellows", auth(["COMPANY"]), getCompanyFellows);
router.post("/assign", auth(["COMPANY"]), assignFellow);

module.exports = router;
