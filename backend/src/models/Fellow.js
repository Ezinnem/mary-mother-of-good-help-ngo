// src/models/Fellow.js
const mongoose = require("mongoose");

const fellowSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  skillsInterest: [String],
  mergedCompany: { type: mongoose.Schema.Types.ObjectId, ref: "Company", default: null },
}, { timestamps: true });

module.exports = mongoose.model("Fellow", fellowSchema);
