const express = require("express");

const router = express.Router();

const {
  getRecommendedSchemes,
  getSchemeById,
  saveScheme,
  applyScheme,
  getUserSchemes,
  deleteUserScheme
} = require("../controllers/schemeController");


/* =========================================================
   RECOMMENDED SCHEMES

   IMPORTANT:
   These routes come before /:id
========================================================= */

router.get(
  "/recommended",
  getRecommendedSchemes
);


/* =========================================================
   USER SAVED + APPLIED SCHEMES
========================================================= */

router.get(
  "/user/:userId",
  getUserSchemes
);


/* =========================================================
   SAVE
========================================================= */

router.post(
  "/save",
  saveScheme
);


/* =========================================================
   APPLY
========================================================= */

router.post(
  "/apply",
  applyScheme
);


/* =========================================================
   DELETE SAVED/APPLIED
========================================================= */

router.delete(
  "/user/:userSchemeId",
  deleteUserScheme
);


/* =========================================================
   SINGLE SCHEME

   Keep this LAST
========================================================= */

router.get(
  "/:id",
  getSchemeById
);


module.exports = router;