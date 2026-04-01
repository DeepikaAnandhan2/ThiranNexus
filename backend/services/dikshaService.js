// ─── DIKSHA / NCERT Service ───────────────────────────────
// Fetches school study material from DIKSHA (free, no API key)
// Docs: https://diksha.gov.in/explore
// Owner: Teammate 2

const axios = require('axios')

const DIKSHA_BASE = 'https://diksha.gov.in/api/content/v1'

// ── Subject + Grade map ────────────────────────────────────
const GRADE_MAP = {
  '1':'Class 1','2':'Class 2','3':'Class 3','4':'Class 4',
  '5':'Class 5','6':'Class 6','7':'Class 7','8':'Class 8',
  '9':'Class 9','10':'Class 10','11':'Class 11','12':'Class 12',
}

const SUBJECTS = ['Mathematics','Science','English','Hindi',
  'Social Science','Physics','Chemistry','Biology','History',
  'Geography','Economics','Political Science','Computer Science']

// ── Search DIKSHA content ──────────────────────────────────
const searchDIKSHA = async ({ grade, subject, query = '' }) => {
  try {
    const gradeLabel = GRADE_MAP[grade] || grade
    const res = await axios.get(`${DIKSHA_BASE}/search`, {
      params: {
        'request.filters.gradeLevel': gradeLabel,
        'request.filters.subject':    subject,
        'request.filters.contentType':['TextBook','Resource','ExplanationResource'],
        'request.filters.medium':     'English',
        'request.limit':              10,
        'request.query':              query || subject,
        'request.fields':             [
          'name','description','gradeLevel','subject',
          'identifier','downloadUrl','artifactUrl',
          'appIcon','mimeType','contentType'
        ].join(','),
      },
      timeout: 8000,
    })

    const items = res.data?.result?.content || []
    return items.map(item => ({
      id:          item.identifier,
      title:       item.name,
      description: item.description || '',
      grade:       item.gradeLevel?.join(', ') || gradeLabel,
      subject:     item.subject?.join(', ') || subject,
      type:        item.contentType,
      icon:        item.appIcon || '',
      downloadUrl: item.artifactUrl || item.downloadUrl || '',
      mimeType:    item.mimeType || '',
    }))
  } catch (err) {
    console.error('DIKSHA fetch error:', err.message)
    // Fallback to mock data for demo
    return getMockSchoolContent(grade, subject)
  }
}

// ── Get content detail ─────────────────────────────────────
const getDIKSHAContent = async (contentId) => {
  try {
    const res = await axios.get(`${DIKSHA_BASE}/read/${contentId}`, {
      timeout: 8000
    })
    return res.data?.result?.content || null
  } catch (err) {
    console.error('DIKSHA content error:', err.message)
    return null
  }
}

// ── Mock fallback for demo (when DIKSHA API is down) ───────
const getMockSchoolContent = (grade, subject) => {
  const mockContent = {
    Science: [
      {
        id: 'mock-sci-1',
        title: `Class ${grade} - Photosynthesis`,
        description: 'Photosynthesis is the process by which green plants make their own food using sunlight, water, and carbon dioxide. Chlorophyll in the leaves absorbs sunlight. The plant takes in carbon dioxide from the air through tiny pores called stomata. Water is absorbed through the roots. The plant uses energy from sunlight to convert water and carbon dioxide into glucose and oxygen. The oxygen is released into the air.',
        grade: `Class ${grade}`, subject: 'Science',
        type: 'Resource', icon: '', downloadUrl: '', mimeType: 'text/plain',
      },
      {
        id: 'mock-sci-2',
        title: `Class ${grade} - Human Digestive System`,
        description: 'The human digestive system breaks down food into nutrients. It starts from the mouth where teeth chew food and saliva begins digestion. Food travels through the esophagus to the stomach. The stomach uses acid and enzymes to break down food further. The small intestine absorbs nutrients into the blood. The large intestine absorbs water. Waste is stored in the rectum and expelled through the anus.',
        grade: `Class ${grade}`, subject: 'Science',
        type: 'Resource', icon: '', downloadUrl: '', mimeType: 'text/plain',
      },
    ],
    Mathematics: [
      {
        id: 'mock-math-1',
        title: `Class ${grade} - Fractions`,
        description: 'A fraction represents a part of a whole. It has two parts: the numerator (top number) and denominator (bottom number). The numerator tells how many parts we have. The denominator tells how many equal parts the whole is divided into. For example, three-fourths means we have 3 parts out of 4 equal parts. To add fractions with the same denominator, add the numerators and keep the denominator same.',
        grade: `Class ${grade}`, subject: 'Mathematics',
        type: 'Resource', icon: '', downloadUrl: '', mimeType: 'text/plain',
      },
    ],
    English: [
      {
        id: 'mock-eng-1',
        title: `Class ${grade} - Parts of Speech`,
        description: 'Parts of speech are categories of words based on their function in a sentence. Nouns are names of people, places, or things. Pronouns replace nouns. Verbs show action or state of being. Adjectives describe nouns. Adverbs describe verbs, adjectives, or other adverbs. Prepositions show relationships between words. Conjunctions join words or clauses. Interjections express emotion.',
        grade: `Class ${grade}`, subject: 'English',
        type: 'Resource', icon: '', downloadUrl: '', mimeType: 'text/plain',
      },
    ],
  }

  return mockContent[subject] || mockContent['Science']
}

module.exports = { searchDIKSHA, getDIKSHAContent, SUBJECTS, GRADE_MAP }