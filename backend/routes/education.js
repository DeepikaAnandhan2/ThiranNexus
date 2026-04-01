const express = require('express')
const router  = express.Router()
const {
  getSubjects, getSchoolMaterial, getSchoolContent,
  getCollegeMaterial, getISL, simplify, getQuiz, askQuestion,
} = require('../controllers/educationController')
const { protect } = require('../middleware/authMiddleware')

// All routes protected — user must be logged in
router.use(protect)

// School routes
router.get('/subjects',           getSubjects)
router.get('/school',             getSchoolMaterial)
router.get('/school/content/:id', getSchoolContent)

// College routes
router.get('/college',            getCollegeMaterial)
router.get('/isl',                getISL)

// AI routes
router.post('/simplify',          simplify)
router.post('/quiz',              getQuiz)
router.post('/ask',               askQuestion)

module.exports = router