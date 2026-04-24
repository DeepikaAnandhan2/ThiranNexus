const mongoose = require("mongoose");

const userSchemeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  schemeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Scheme"
  },
  status: {
    type: String,
    enum: ["saved", "applied"]
  }
}, { timestamps: true });

module.exports = mongoose.model("UserScheme", userSchemeSchema);