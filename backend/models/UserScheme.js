const mongoose = require("mongoose");

const userSchemeSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      trim: true
    },

    schemeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Scheme",
      required: true
    },

    status: {
      type: String,
      enum: ["saved", "applied"],
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "UserScheme",
  userSchemeSchema
);