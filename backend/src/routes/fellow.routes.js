const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const { getMyProfile } = require("../controllers/fellow.controller");

router.get("/me", auth(["FELLOW"]), getMyProfile);

module.exports = router;
