const mongoose = require("mongoose");

const userSchemeSchema = new mongoose.Schema({
  userId: String,

  schemeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Scheme" // 🔥 needed for populate
  },

  status: String // "saved" or "applied"
});

module.exports = mongoose.model("UserScheme", userSchemeSchema);