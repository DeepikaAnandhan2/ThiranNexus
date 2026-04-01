// ─── Education Controller ─────────────────────────────────
// Owner: Teammate 2
const { searchDIKSHA, getDIKSHAContent, SUBJECTS, GRADE_MAP } = require('../services/dikshaService')
const { searchYouTube, getVideoCaptions, getISLVideos }        = require('../services/youtubeService')
const { simplifyContent, generateQuiz, answerQuestion }        = require('../services/geminiService')

// ─────────────────────────────────────────────────────────
// GET /api/education/subjects
// Returns list of subjects and grades for school
// ─────────────────────────────────────────────────────────
const getSubjects = (req, res) => {
  res.json({ subjects: SUBJECTS, grades: Object.keys(GRADE_MAP) })
}

// ─────────────────────────────────────────────────────────
// GET /api/education/school?grade=8&subject=Science&query=
// Fetch school material from DIKSHA
// ─────────────────────────────────────────────────────────
const getSchoolMaterial = async (req, res) => {
  try {
    const { grade = '8', subject = 'Science', query = '' } = req.query
    const results = await searchDIKSHA({ grade, subject, query })
    res.json({ success: true, grade, subject, count: results.length, results })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// ─────────────────────────────────────────────────────────
// GET /api/education/school/content/:id
// Get full content of a specific DIKSHA item
// ─────────────────────────────────────────────────────────
const getSchoolContent = async (req, res) => {
  try {
    const content = await getDIKSHAContent(req.params.id)
    if (!content) return res.status(404).json({ error: 'Content not found' })
    res.json({ success: true, content })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// ─────────────────────────────────────────────────────────
// GET /api/education/college?query=Data+Structures&captions=true
// Fetch YouTube college lectures
// ─────────────────────────────────────────────────────────
const getCollegeMaterial = async (req, res) => {
  try {
    const { query = 'Introduction to Programming', captions = 'false' } = req.query
    const results = await searchYouTube({
      query,
      maxResults:   8,
      captionsOnly: captions === 'true',
    })
    res.json({ success: true, query, count: results.length, results })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// ─────────────────────────────────────────────────────────
// GET /api/education/isl?topic=photosynthesis
// Get Indian Sign Language videos for a topic
// ─────────────────────────────────────────────────────────
const getISL = async (req, res) => {
  try {
    const { topic = 'science' } = req.query
    const results = await getISLVideos(topic)
    res.json({ success: true, topic, results })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// ─────────────────────────────────────────────────────────
// POST /api/education/simplify
// Gemini AI simplifies text based on disability type
// Body: { text, disabilityType }
// ─────────────────────────────────────────────────────────
const simplify = async (req, res) => {
  try {
    const { text, disabilityType = 'cognitive' } = req.body
    if (!text) return res.status(400).json({ error: 'Text is required' })
    const simplified = await simplifyContent(text, disabilityType)
    res.json({ success: true, original: text, simplified })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// ─────────────────────────────────────────────────────────
// POST /api/education/quiz
// Gemini generates quiz from content
// Body: { text, numQuestions }
// ─────────────────────────────────────────────────────────
const getQuiz = async (req, res) => {
  try {
    const { text, numQuestions = 3 } = req.body
    if (!text) return res.status(400).json({ error: 'Text is required' })
    const questions = await generateQuiz(text, numQuestions)
    res.json({ success: true, questions })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// ─────────────────────────────────────────────────────────
// POST /api/education/ask
// Student asks a question by voice — AI answers
// Body: { question, context }
// ─────────────────────────────────────────────────────────
const askQuestion = async (req, res) => {
  try {
    const { question, context = '' } = req.body
    if (!question) return res.status(400).json({ error: 'Question is required' })
    const answer = await answerQuestion(question, context)
    res.json({ success: true, question, answer })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

module.exports = {
  getSubjects, getSchoolMaterial, getSchoolContent,
  getCollegeMaterial, getISL, simplify, getQuiz, askQuestion,
}