// ─── DIKSHA / NCERT Service ───────────────────────────────
// Fetches school study material from DIKSHA (free, no API key)
// Docs: https://diksha.gov.in/explore
// Owner: Teammate 2

const axios = require('axios');
const DIKSHA_BASE = 'https://diksha.gov.in/api/content/v1';

// ── Subject + Grade map ────────────────────────────────────
const GRADE_MAP = {
  '1': 'Class 1', '2': 'Class 2', '3': 'Class 3', '4': 'Class 4',
  '5': 'Class 5', '6': 'Class 6', '7': 'Class 7', '8': 'Class 8',
  '9': 'Class 9', '10': 'Class 10', '11': 'Class 11', '12': 'Class 12',
};

const SUBJECTS = [
  'Mathematics', 'Science', 'English', 'Hindi',
  'Social Science', 'Physics', 'Chemistry', 'Biology', 'History',
  'Geography', 'Economics', 'Political Science', 'Computer Science'
];

// ── Search DIKSHA content ──────────────────────────────────
/**
 * Searches DIKSHA content using a POST request.
 * Fixes the "no route found" error by providing the required JSON body.
 */
const searchDIKSHA = async ({ grade, subject, query = '' }) => {
  try {
    const gradeLabel = GRADE_MAP[grade] || `Class ${grade}`;

    // DIKSHA requires a POST request with a "request" wrapper for searches
    const response = await axios.post(`${DIKSHA_BASE}/search`, {
      request: {
        filters: {
          gradeLevel: [gradeLabel],
          subject: [subject],
          contentType: ["TextBook", "ExplanationResource", "Resource"],
          status: ["Live"]
        },
        query: query || subject,
        limit: 10,
        // Fields must be explicitly requested in the POST body
        fields: [
          'name', 'description', 'gradeLevel', 'subject',
          'identifier', 'downloadUrl', 'artifactUrl',
          'appIcon', 'mimeType', 'contentType'
        ]
      }
    }, {
      headers: { 
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0' // Helps avoid automated request blocks
      },
      timeout: 8000
    });

    const items = response.data?.result?.content || [];
    
    // If API returns empty, immediately trigger fallback
    if (items.length === 0) return getMockSchoolContent(grade, subject);

    return items.map(item => ({
      id: item.identifier,
      title: item.name,
      description: item.description || '',
      grade: item.gradeLevel?.join(', ') || gradeLabel,
      subject: item.subject?.join(', ') || subject,
      type: item.contentType,
      icon: item.appIcon || '',
      downloadUrl: item.artifactUrl || item.downloadUrl || '',
      mimeType: item.mimeType || '',
    }));
  } catch (err) {
    console.error('DIKSHA fetch error:', err.message);
    // Graceful fallback to mock data for demo purposes
    return getMockSchoolContent(grade, subject);
  }
};

// ── Get content detail ─────────────────────────────────────
const getDIKSHAContent = async (contentId) => {
  try {
    const res = await axios.get(`${DIKSHA_BASE}/read/${contentId}`, {
      timeout: 8000
    });
    return res.data?.result?.content || null;
  } catch (err) {
    console.error('DIKSHA content error:', err.message);
    return null;
  }
};

// ── Mock fallback for demo (when DIKSHA API is down) ───────
const getMockSchoolContent = (grade, subject) => {
  const mockContent = {
    Science: [
      {
        id: 'mock-sci-1',
        title: `Class ${grade} - Photosynthesis`,
        description: 'Photosynthesis is the process by which green plants make their own food using sunlight, water, and carbon dioxide...',
        grade: `Class ${grade}`, subject: 'Science',
        type: 'Resource', icon: '', downloadUrl: '', mimeType: 'text/plain',
      },
      {
        id: 'mock-sci-2',
        title: `Class ${grade} - Human Digestive System`,
        description: 'The human digestive system breaks down food into nutrients...',
        grade: `Class ${grade}`, subject: 'Science',
        type: 'Resource', icon: '', downloadUrl: '', mimeType: 'text/plain',
      },
    ],
    Mathematics: [
      {
        id: 'mock-math-1',
        title: `Class ${grade} - Fractions`,
        description: 'A fraction represents a part of a whole...',
        grade: `Class ${grade}`, subject: 'Mathematics',
        type: 'Resource', icon: '', downloadUrl: '', mimeType: 'text/plain',
      },
    ],
    English: [
      {
        id: 'mock-eng-1',
        title: `Class ${grade} - Parts of Speech`,
        description: 'Parts of speech are categories of words based on their function in a sentence...',
        grade: `Class ${grade}`, subject: 'English',
        type: 'Resource', icon: '', downloadUrl: '', mimeType: 'text/plain',
      },
    ],
  };

  return mockContent[subject] || mockContent['Science'];
};

module.exports = { searchDIKSHA, getDIKSHAContent, SUBJECTS, GRADE_MAP };