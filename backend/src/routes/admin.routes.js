const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const {
  getAllUsers,
  getAllFellows,
  getAllCompanies,
  mergeFellowToCompany,
} = require("../controllers/admin.controller");

router.get("/users", auth(["ADMIN"]), getAllUsers);
router.get("/fellows", auth(["ADMIN"]), getAllFellows);
router.get("/companies", auth(["ADMIN"]), getAllCompanies);
router.post("/merge", auth(["ADMIN"]), mergeFellowToCompany);

module.exports = router;
