const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const { getMyCompany } = require("../controllers/company.controller");

router.get("/me", auth(["SME"]), getMyCompany);

module.exports = router;
