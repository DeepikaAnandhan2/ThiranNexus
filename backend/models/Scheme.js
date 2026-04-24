const mongoose = require("mongoose");

const schemeSchema = new mongoose.Schema({
  title: String,
  description: String,
  disabilityType: String, // visual, hearing, cognitive, all
  eligibility: [String],
  benefits: String,
  documentsRequired: [String],
  applyLink: String
}, { timestamps: true });

module.exports = mongoose.model("Scheme", schemeSchema);