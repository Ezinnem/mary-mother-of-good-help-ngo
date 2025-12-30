const Company = require("../models/Company");

exports.getMyCompany = async (req, res) => {
  const company = await Company
    .findOne({ user: req.user.id })
    .populate("user", "-passwordHash");

  if (!company) {
    return res.status(404).json({ error: "Company profile not found" });
  }

  res.json(company);
};
