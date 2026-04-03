const express = require("express");
const router = express.Router();

const Scheme = require("../models/Scheme");
const UserScheme = require("../models/UserScheme");
const { protect } = require("../middleware/authMiddleware");

// Apply authentication to all routes
router.use(protect);

// ─────────────────────────────────────────────
// ✅ 1. AI RECOMMENDED SCHEMES
// ─────────────────────────────────────────────
router.get("/recommended", async (req, res) => {
  try {
    // Try to get disability type from authenticated user's profile
    let disabilityType = req.query.disabilityType;
    
    // If no query param but user is authenticated, get from their profile
    if (!disabilityType && req.user?.disabilityType) {
      disabilityType = req.user.disabilityType;
    }

    let schemes;
    if (disabilityType && disabilityType !== 'none' && disabilityType !== 'All') {
      schemes = await Scheme.find({
        $or: [
          { disabilityType: { $regex: new RegExp(`^${disabilityType}$`, 'i') } },
          { disabilityType: { $regex: new RegExp(disabilityType, 'i') } },
          { disabilityType: 'All' }
        ]
      });
    } else {
      schemes = await Scheme.find({});
    }

    res.json(schemes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
});


// ─────────────────────────────────────────────
// ✅ 2. GET SINGLE SCHEME DETAILS
// ─────────────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const scheme = await Scheme.findById(req.params.id);

    if (!scheme) {
      return res.status(404).json({ error: "Scheme not found" });
    }

    res.json(scheme);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
});


// ─────────────────────────────────────────────
// ✅ 3. SAVE SCHEME
// ─────────────────────────────────────────────
router.post("/save", async (req, res) => {
  try {
    const { userId, schemeId } = req.body;

    // prevent duplicate save
    const exists = await UserScheme.findOne({
      userId,
      schemeId,
      status: "saved"
    });

    if (exists) {
      return res.json({ message: "Already saved" });
    }

    const newSave = new UserScheme({
      userId,
      schemeId,
      status: "saved"
    });

    await newSave.save();

    res.json({ message: "Saved successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
});


// ─────────────────────────────────────────────
// ✅ 4. APPLY SCHEME
// ─────────────────────────────────────────────
router.post("/apply", async (req, res) => {
  try {
    const { userId, schemeId } = req.body;

    // prevent duplicate apply
    const exists = await UserScheme.findOne({
      userId,
      schemeId,
      status: "applied"
    });

    if (exists) {
      return res.json({ message: "Already applied" });
    }

    const newApply = new UserScheme({
      userId,
      schemeId,
      status: "applied"
    });

    await newApply.save();

    res.json({ message: "Applied successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
});


// ─────────────────────────────────────────────
// ✅ 5. GET USER SAVED + APPLIED SCHEMES
// ─────────────────────────────────────────────
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const data = await UserScheme.find({ userId })
      .populate("schemeId"); // 🔥 IMPORTANT

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
});


module.exports = router;