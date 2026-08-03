const Scheme = require("../models/Scheme");
const UserScheme = require("../models/UserScheme");

/* ===========================================================
   Normalize Disability Type
=========================================================== */
const normalize = (type) => {
  if (!type) return "all";

  const t = type.toString().trim().toLowerCase();

  if (t.includes("visual") || t.includes("vision") || t.includes("vis"))
    return "visual";

  if (t.includes("hearing") || t.includes("hear") || t.includes("hea"))
    return "hearing";

  if (t.includes("physical") || t.includes("phy"))
    return "physical";

  if (t.includes("cognitive") || t.includes("cog"))
    return "cognitive";

  if (t === "all") return "all";

  return "all";
};

/* ===========================================================
   GET RECOMMENDED SCHEMES
=========================================================== */
exports.getRecommendedSchemes = async (req, res) => {
  try {
    const disabilityType = normalize(req.query.disabilityType);

    console.log("=======================================");
    console.log("Requested Disability :", req.query.disabilityType);
    console.log("Normalized Type      :", disabilityType);

    const schemes = await Scheme.find().sort({ createdAt: -1 });

    console.log("Total Schemes in DB :", schemes.length);

    const filteredSchemes = schemes.filter((scheme) => {
      const schemeType = normalize(scheme.disabilityType);

      return (
        schemeType === disabilityType ||
        schemeType === "all"
      );
    });

    console.log("Matched Schemes :", filteredSchemes.length);
    console.log("=======================================");

    return res.status(200).json(filteredSchemes);
  } catch (err) {
    console.error("Get Recommended Schemes Error:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch schemes",
    });
  }
};

/* ===========================================================
   GET SINGLE SCHEME
=========================================================== */
exports.getSchemeById = async (req, res) => {
  try {
    const scheme = await Scheme.findById(req.params.id);

    if (!scheme) {
      return res.status(404).json({
        success: false,
        message: "Scheme not found",
      });
    }

    res.status(200).json(scheme);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Unable to fetch scheme",
    });
  }
};

/* ===========================================================
   SAVE SCHEME
=========================================================== */
exports.saveScheme = async (req, res) => {
  try {
    const { userId, schemeId } = req.body;

    if (!userId || !schemeId) {
      return res.status(400).json({
        success: false,
        message: "Missing userId or schemeId",
      });
    }

    const alreadySaved = await UserScheme.findOne({
      userId,
      schemeId,
      status: "saved",
    });

    if (alreadySaved) {
      return res.status(409).json({
        success: false,
        message: "Scheme already saved",
      });
    }

    const savedScheme = await UserScheme.create({
      userId,
      schemeId,
      status: "saved",
    });

    res.status(201).json({
      success: true,
      message: "Scheme saved successfully",
      data: savedScheme,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Unable to save scheme",
    });
  }
};

/* ===========================================================
   APPLY SCHEME
=========================================================== */
exports.applyScheme = async (req, res) => {
  try {
    const { userId, schemeId } = req.body;

    if (!userId || !schemeId) {
      return res.status(400).json({
        success: false,
        message: "Missing userId or schemeId",
      });
    }

    const alreadyApplied = await UserScheme.findOne({
      userId,
      schemeId,
      status: "applied",
    });

    if (alreadyApplied) {
      return res.status(409).json({
        success: false,
        message: "Already applied",
      });
    }

    const appliedScheme = await UserScheme.create({
      userId,
      schemeId,
      status: "applied",
    });

    res.status(201).json({
      success: true,
      message: "Application submitted",
      data: appliedScheme,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Unable to apply",
    });
  }
};

/* ===========================================================
   GET SAVED & APPLIED SCHEMES
=========================================================== */
exports.getUserSchemes = async (req, res) => {
  try {
    const { userId } = req.params;

    const schemes = await UserScheme.find({
      userId,
    })
      .populate("schemeId")
      .sort({ createdAt: -1 });

    res.status(200).json(schemes);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Unable to fetch user schemes",
    });
  }
};