const express = require("express");
const { registerAdmin , getAllCompanies , getAllFellows } = require("../controllers/auth.controller");
const { auth } = require("../middleware/auth");
const { matchFellowsToCompanies } = require("../controllers/admin.controller");

const router = express.Router();

// Only admins can create admins
router.post("/register", auth(["ADMIN"]), registerAdmin);
router.get("/companies", auth(["ADMIN"]), getAllCompanies);
router.get("/fellows", auth(["ADMIN"]), getAllFellows);
router.post("/match-fellows", auth(["ADMIN"]), matchFellowsToCompanies);


module.exports = router;

