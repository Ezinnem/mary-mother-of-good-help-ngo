const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const {
  getAllUsers,
  getAllFellows,
  getAllCompanies,
} = require("../controllers/admin.controller");

router.get("/users", auth(["ADMIN"]), getAllUsers);
router.get("/fellows", auth(["ADMIN"]), getAllFellows);
router.get("/companies", auth(["ADMIN"]), getAllCompanies);

module.exports = router;
