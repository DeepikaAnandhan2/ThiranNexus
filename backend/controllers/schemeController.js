const Scheme = require("../models/Scheme");
const UserScheme = require("../models/UserScheme");

// 🔥 Normalize function (VERY IMPORTANT)
const normalize = (type) => {
  if (!type) return "none";

  const t = type.toLowerCase();

  if (t.includes("vis")) return "visual";
  if (t.includes("hea")) return "hearing";
  if (t.includes("cog")) return "cognitive";
  if (t.includes("phy")) return "physical";

  return t;
};

// ✅ GET RECOMMENDED SCHEMES
exports.getRecommendedSchemes = async (req, res) => {
  try {
    const userType = normalize(req.query.disabilityType);

    console.log("USER TYPE:", userType);

    const schemes = await Scheme.find();

    const filtered = schemes.filter((s) => {
      const type = normalize(s.disabilityType);

      return type === userType || type === "all";
    });

    console.log("FILTERED:", filtered.length);

    res.json(filtered.slice(0, 4)); // limit 4
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ GET SCHEME DETAILS
exports.getSchemeById = async (req, res) => {
  try {
    const scheme = await Scheme.findById(req.params.id);
    res.json(scheme);
  } catch (err) {
    res.status(500).json({ error: "Error fetching scheme" });
  }
};

// ✅ SAVE SCHEME (FIXED DUPLICATE ISSUE)
exports.saveScheme = async (req, res) => {
  try {
    const { userId, schemeId } = req.body;

    const exists = await UserScheme.findOne({
      userId,
      schemeId,
      status: "saved"
    });

    if (exists) {
      return res.status(400).json({ message: "Already saved" });
    }

    await UserScheme.create({
      userId,
      schemeId,
      status: "saved"
    });

    res.json({ message: "Saved successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Save failed" });
  }
};

// ✅ APPLY SCHEME (FIXED)
exports.applyScheme = async (req, res) => {
  try {
    const { userId, schemeId } = req.body;

    const exists = await UserScheme.findOne({
      userId,
      schemeId,
      status: "applied"
    });

    if (exists) {
      return res.status(400).json({ message: "Already applied" });
    }

    await UserScheme.create({
      userId,
      schemeId,
      status: "applied"
    });

    res.json({ message: "Applied successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Apply failed" });
  }
};

// ✅ GET USER SCHEMES (IMPORTANT FOR SAVED PAGE)
exports.getUserSchemes = async (req, res) => {
  try {
    const data = await UserScheme.find({
      userId: req.params.userId
    }).populate("schemeId");

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Error fetching user schemes" });
  }
};