const express = require('express')
const router  = express.Router()
const {
  getSubjects, getSchoolMaterial, getSchoolContent,
  getSchoolVideos, getSchoolInfographic,
  getCollegeMaterial, getISL, simplify, getQuiz, askQuestion,
} = require('../controllers/educationController')
const { protect } = require('../middleware/authMiddleware')

router.use(protect)

// School routes
router.get('/subjects',                  getSubjects)
router.get('/school',                    getSchoolMaterial)
router.get('/school/content/:id',        getSchoolContent)
router.get('/school/videos',             getSchoolVideos)       // NEW
router.get('/school/infographic',        getSchoolInfographic)  // NEW

// College routes
router.get('/college',                   getCollegeMaterial)
router.get('/isl',                       getISL)

// AI routes
router.post('/simplify',                 simplify)
router.post('/quiz',                     getQuiz)
router.post('/ask',                      askQuestion)

module.exports = router