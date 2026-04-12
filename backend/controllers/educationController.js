// ─── Education Controller ─────────────────────────────────
// Handles school (DIKSHA + Gemini) and college (YouTube) education routes
// Disability-aware: routes content differently for visual vs hearing impaired

const {
  searchDIKSHA,
  getEnrichedContent,
  getInfographicContent,
  SUBJECTS,
  GRADE_MAP,
} = require('../services/dikshaService');

const {
  searchYouTube,
  getISLVideos,
} = require('../services/youtubeService');

const {
  simplifyContent,
  generateQuiz,
  answerQuestion,
} = require('../services/geminiService');

// ─── GET /api/education/subjects ─────────────────────────
const getSubjects = async (req, res) => {
  try {
    res.json({ subjects: SUBJECTS, grades: Object.keys(GRADE_MAP) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── GET /api/education/school ───────────────────────────
// Returns topic list from DIKSHA (or mock)
// Query params: grade, subject
const getSchoolMaterial = async (req, res) => {
  try {
    const { grade, subject } = req.query;

    if (!grade || !subject) {
      return res.status(400).json({ error: 'grade and subject are required' });
    }

    const items = await searchDIKSHA({ grade, subject });
    res.json({ success: true, data: items, total: items.length });
  } catch (err) {
    console.error('getSchoolMaterial error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// ─── GET /api/education/school/content/:id ───────────────
// Returns FULL enriched content for a specific topic
// Disability-aware: adapts content for visual / hearing / cognitive impaired
// Query params: grade, subject, disabilityType
const getSchoolContent = async (req, res) => {
  try {
    const { id }            = req.params;
    const { grade, subject, disabilityType = 'none' } = req.query;

    if (!grade || !subject) {
      return res.status(400).json({ error: 'grade and subject are required' });
    }

    // Get enriched content (DIKSHA full text OR Gemini-generated)
    const content = await getEnrichedContent(id, { grade, subject, disabilityType });

    res.json({ success: true, data: content });
  } catch (err) {
    console.error('getSchoolContent error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// ─── GET /api/education/school/infographic ───────────────
// [NEW] Returns visual infographic data for hearing-impaired students
// Only for Class 8 and 9 (as per requirement)
// Query params: grade (8 or 9), subject
const getSchoolInfographic = async (req, res) => {
  try {
    const { grade, subject = 'Science' } = req.query;

    if (!['8', '9'].includes(String(grade))) {
      return res.status(400).json({
        error: 'Infographic content is currently available only for Class 8 and 9'
      });
    }

    const infographics = getInfographicContent(String(grade), subject);

    if (!infographics || infographics.length === 0) {
      return res.status(404).json({ error: 'No infographic content found for this subject' });
    }

    res.json({
      success:  true,
      grade:    `Class ${grade}`,
      subject,
      data:     infographics,
      total:    infographics.length,
    });
  } catch (err) {
    console.error('getSchoolInfographic error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// ─── GET /api/education/college ──────────────────────────
const getCollegeMaterial = async (req, res) => {
  try {
    const { course, query, isHearingImpaired = false } = req.query;
    const searchQuery = query || course || 'engineering lecture';
    const videos = await searchYouTube({
      query: searchQuery,
      maxResults: 8,
      isHearingImpaired: isHearingImpaired === 'true',
    });
    res.json({ success: true, data: videos });
  } catch (err) {
    console.error('getCollegeMaterial error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// ─── GET /api/education/isl ──────────────────────────────
const getISL = async (req, res) => {
  try {
    const { topic = 'education' } = req.query;
    const videos = await getISLVideos(topic);
    res.json({ success: true, data: videos });
  } catch (err) {
    console.error('getISL error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// ─── POST /api/education/simplify ────────────────────────
const simplify = async (req, res) => {
  try {
    const { text, disabilityType = 'cognitive' } = req.body;
    if (!text) return res.status(400).json({ error: 'text is required' });
    const simplified = await simplifyContent(text, disabilityType);
    res.json({ success: true, data: simplified });
  } catch (err) {
    console.error('simplify error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// ─── POST /api/education/quiz ─────────────────────────────
const getQuiz = async (req, res) => {
  try {
    const { text, numQuestions = 3 } = req.body;
    if (!text) return res.status(400).json({ error: 'text is required' });
    const quiz = await generateQuiz(text, numQuestions);
    res.json({ success: true, data: quiz });
  } catch (err) {
    console.error('getQuiz error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// ─── POST /api/education/ask ──────────────────────────────
const askQuestion = async (req, res) => {
  try {
    const { question, context = '' } = req.body;
    if (!question) return res.status(400).json({ error: 'question is required' });
    const answer = await answerQuestion(question, context);
    res.json({ success: true, data: answer });
  } catch (err) {
    console.error('askQuestion error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getSubjects,
  getSchoolMaterial,
  getSchoolContent,
  getSchoolInfographic,   // ← new export
  getCollegeMaterial,
  getISL,
  simplify,
  getQuiz,
  askQuestion,
};