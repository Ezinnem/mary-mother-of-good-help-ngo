const Fellow = require("../models/Fellow");

exports.getMyProfile = async (req, res) => {
  const fellow = await Fellow
    .findOne({ user: req.user.id })
    .populate("user", "-passwordHash");

  if (!fellow) {
    return res.status(404).json({ error: "Fellow profile not found" });
  }

  res.json(fellow);
};
