const express = require('express');
const router  = express.Router();
const {
  getSubjects,
  getSchoolMaterial,
  getSchoolContent,
  getSchoolInfographic,   // ← new
  getCollegeMaterial,
  getISL,
  simplify,
  getQuiz,
  askQuestion,
} = require('../controllers/educationController');
const { protect } = require('../middleware/authMiddleware');

// All routes require JWT
router.use(protect);

// ─── SCHOOL ROUTES ───────────────────────────────────────
router.get('/subjects',                getSubjects);
router.get('/school',                  getSchoolMaterial);
router.get('/school/content/:id',      getSchoolContent);
router.get('/school/infographic',      getSchoolInfographic);   // ← new (Class 8 & 9 only)

// ─── COLLEGE ROUTES ──────────────────────────────────────
router.get('/college',                 getCollegeMaterial);
router.get('/isl',                     getISL);

// ─── AI ROUTES ───────────────────────────────────────────
router.post('/simplify',               simplify);
router.post('/quiz',                   getQuiz);
router.post('/ask',                    askQuestion);

module.exports = router;