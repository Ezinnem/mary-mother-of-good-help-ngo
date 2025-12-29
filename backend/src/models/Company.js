// src/models/Company.js
const mongoose = require("mongoose");

const companySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  companyName: { type: String, required: true },
  skillsOffered: [String],
  capacity: { type: Number, required: true },
  mergedFellows: [{ type: mongoose.Schema.Types.ObjectId, ref: "Fellow" }],
}, { timestamps: true });

module.exports = mongoose.model("Company", companySchema);
