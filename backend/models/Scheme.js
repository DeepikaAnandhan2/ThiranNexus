const mongoose = require("mongoose");

const schemeSchema = new mongoose.Schema({
  title: String,
  description: String,
  disabilityType: String,
  eligibility: [String],
  benefits: String,

  documentsRequired: [String],
  startDate: String,   // ✅ NEW
  lastDate: String,
  applyLink: String
});

module.exports = mongoose.model("Scheme", schemeSchema);