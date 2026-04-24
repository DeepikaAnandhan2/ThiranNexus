const express = require("express");
const router = express.Router();

const {
  getRecommendedSchemes,
  getSchemeById,
  saveScheme,
  applyScheme,
  getUserSchemes
} = require("../controllers/schemeController");

router.get("/recommended", getRecommendedSchemes);
router.get("/:id", getSchemeById);
router.post("/save", saveScheme);
router.post("/apply", applyScheme);
router.get("/user/:userId", getUserSchemes);

module.exports = router;