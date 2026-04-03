const express = require('express')
const router  = express.Router()
const {
  getSubjects, getSchoolMaterial, getSchoolContent,
  getCollegeMaterial, getISL, simplify, getQuiz, askQuestion,
} = require('../controllers/educationController')
const { protect } = require('../middleware/authMiddleware')

// ─── AUTHENTICATION LAYER ────────────────────────────────
// All routes below this line require a valid JWT token
router.use(protect)

// ─── SCHOOL ROUTES ───────────────────────────────────────
router.get('/subjects',           getSubjects)
router.get('/school',             getSchoolMaterial)
router.get('/school/content/:id', getSchoolContent)

// ─── COLLEGE ROUTES ──────────────────────────────────────
// Removed 'protect' from the individual route as router.use(protect) handles it
router.get('/college',            getCollegeMaterial)
router.get('/isl',                getISL)

// ─── AI ASSISTANCE ROUTES ────────────────────────────────
router.post('/simplify',          simplify)
router.post('/quiz',              getQuiz)
router.post('/ask',               askQuestion)

module.exports = router