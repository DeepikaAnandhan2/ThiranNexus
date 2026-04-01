const Scheme = require("../models/Scheme");
const UserScheme = require("../models/UserScheme");

// AI Recommendation
exports.getRecommendedSchemes = async (req, res) => {
  const { disabilityType } = req.query;
  const schemes = await Scheme.find({ disabilityType });
  res.json(schemes);
};

// Get scheme details
exports.getSchemeById = async (req, res) => {
  const scheme = await Scheme.findById(req.params.id);
  res.json(scheme);
};

// Save scheme
exports.saveScheme = async (req, res) => {
  const { userId, schemeId } = req.body;

  await UserScheme.create({ userId, schemeId, status: "saved" });

  res.json({ message: "Saved" });
};

// Apply scheme
exports.applyScheme = async (req, res) => {
  const { userId, schemeId } = req.body;

  await UserScheme.create({ userId, schemeId, status: "applied" });

  res.json({ message: "Applied" });
};

// Get saved/applied
exports.getUserSchemes = async (req, res) => {
  const data = await UserScheme.find({ userId: req.params.userId })
    .populate("schemeId");

  res.json(data);
};