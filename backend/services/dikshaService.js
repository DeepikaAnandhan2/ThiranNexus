// ─── DIKSHA / NCERT Service ───────────────────────────────
// Fetches school study material from DIKSHA (free, no API key)
// Enhanced: Gemini fills in full content when DIKSHA only returns topic titles
// Docs: https://diksha.gov.in/explore

const axios = require('axios');
const { simplifyContent, generateQuiz, generateFullContent } = require('./geminiService');

const DIKSHA_BASE = 'https://diksha.gov.in/api/content/v1';

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
const searchDIKSHA = async ({ grade, subject, query = '' }) => {
  try {
    const gradeLabel = GRADE_MAP[grade] || `Class ${grade}`;

    const response = await axios.post(`${DIKSHA_BASE}/search`, {
      request: {
        filters: {
          gradeLevel: [gradeLabel],
          subject: [subject],
          contentType: ['TextBook', 'ExplanationResource', 'Resource'],
          status: ['Live']
        },
        query: query || subject,
        limit: 10,
        fields: [
          'name', 'description', 'gradeLevel', 'subject',
          'identifier', 'downloadUrl', 'artifactUrl',
          'appIcon', 'mimeType', 'contentType', 'body'
        ]
      }
    }, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0'
      },
      timeout: 8000
    });

    const items = response.data?.result?.content || [];
    if (items.length === 0) return getMockSchoolContent(grade, subject);

    return items.map(item => ({
      id: item.identifier,
      title: item.name,
      // DIKSHA often returns only a brief description — we flag it for Gemini enrichment
      description: item.description || '',
      hasFullContent: !!(item.body && item.body.trim().length > 200),
      fullContent: item.body || '',
      grade: item.gradeLevel?.join(', ') || gradeLabel,
      subject: item.subject?.join(', ') || subject,
      type: item.contentType,
      icon: item.appIcon || '',
      downloadUrl: item.artifactUrl || item.downloadUrl || '',
      mimeType: item.mimeType || '',
    }));
  } catch (err) {
    console.error('DIKSHA fetch error:', err.message);
    return getMockSchoolContent(grade, subject);
  }
};

// ── Get content detail by ID ───────────────────────────────
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

// ── Get enriched content (DIKSHA + Gemini fallback) ────────
// This is the main function used by the controller for school/content/:id
// It ensures the student ALWAYS gets full readable content, not just a title.
const getEnrichedContent = async (contentId, { grade, subject, disabilityType = 'none' }) => {
  // Step 1: Try DIKSHA for actual content
  const dikshaContent = await getDIKSHAContent(contentId);

  let rawText = '';
  let title   = '';

  if (dikshaContent && dikshaContent.body && dikshaContent.body.trim().length > 200) {
    // DIKSHA returned real content — use it
    rawText = dikshaContent.body;
    title   = dikshaContent.name;
  } else {
    // DIKSHA only gave us a title/stub — use Gemini to generate full content
    title   = dikshaContent?.name || `${subject} - Class ${grade}`;
    rawText = await generateFullContent({ title, grade, subject });
  }

  // Step 2: Simplify based on disability type
  let displayContent = rawText;
  if (disabilityType !== 'none') {
    displayContent = await simplifyContent(rawText, disabilityType);
  }

  // Step 3: Generate quiz
  const quiz = await generateQuiz(displayContent, 3);

  return {
    id:             contentId,
    title,
    grade:          `Class ${grade}`,
    subject,
    content:        displayContent,
    rawContent:     rawText,
    quiz,
    generatedBy:    dikshaContent?.body?.length > 200 ? 'diksha' : 'gemini',
  };
};

// ── Infographic data for Class 8 & 9 (Hearing Impaired) ───
// Visual-first content: icon + short label + color per concept
// Covers core NCERT topics for both classes
const getInfographicContent = (grade, subject) => {
  const key = `${grade}_${subject}`;
  const infographics = {
    '8_Science': [
      {
        topic: 'Crop Production & Management',
        color: '#4CAF50',
        emoji: '🌾',
        steps: [
          { icon: '🌱', label: 'Preparation of Soil', detail: 'Ploughing loosens soil for roots' },
          { icon: '🌿', label: 'Sowing Seeds', detail: 'Seeds planted at correct depth & spacing' },
          { icon: '💧', label: 'Irrigation', detail: 'Regular water supply for growth' },
          { icon: '🧪', label: 'Fertilizers', detail: 'Nutrients added to improve yield' },
          { icon: '🌾', label: 'Harvesting', detail: 'Cutting & collecting mature crops' },
          { icon: '🏠', label: 'Storage', detail: 'Stored in silos/godowns to prevent damage' },
        ],
        keyFacts: ['Kharif crops grow in June–Sep', 'Rabi crops grow in Oct–Mar', 'Zaid crops grow in summer'],
      },
      {
        topic: 'Microorganisms',
        color: '#9C27B0',
        emoji: '🦠',
        steps: [
          { icon: '🔬', label: 'Bacteria', detail: 'Single-celled, cause disease & help in curd' },
          { icon: '🍄', label: 'Fungi', detail: 'Mushrooms, bread mould — good & bad' },
          { icon: '🌊', label: 'Algae', detail: 'Found in water, make own food' },
          { icon: '⚡', label: 'Protozoa', detail: 'Amoeba, parasite, causes malaria' },
          { icon: '💊', label: 'Viruses', detail: 'Cause cold, flu, COVID — need host' },
        ],
        keyFacts: ['Antibiotics kill bacteria, not viruses', 'Lactobacillus makes curd', 'Yeast is used in bread-making'],
      },
      {
        topic: 'Combustion & Flame',
        color: '#FF5722',
        emoji: '🔥',
        steps: [
          { icon: '🧨', label: 'Ignition', detail: 'Every fuel needs a minimum temp to burn' },
          { icon: '💨', label: 'Oxygen', detail: 'Fire needs oxygen to keep burning' },
          { icon: '🔥', label: 'Flame Zones', detail: 'Blue (hottest) → Yellow → Outer dark zone' },
          { icon: '🚒', label: 'Fire Safety', detail: 'Sand/CO₂ extinguisher removes oxygen' },
        ],
        keyFacts: ['Calorific value = heat per gram of fuel', 'LPG burns cleanly', 'Global warming linked to burning fuels'],
      },
      {
        topic: 'Cell — Structure & Functions',
        color: '#2196F3',
        emoji: '🫧',
        steps: [
          { icon: '🧱', label: 'Cell Wall', detail: 'Only in plant cells — gives shape' },
          { icon: '🌀', label: 'Cell Membrane', detail: 'Controls what enters/exits the cell' },
          { icon: '🧬', label: 'Nucleus', detail: 'Brain of the cell — holds DNA' },
          { icon: '⚙️', label: 'Cytoplasm', detail: 'Jelly-like fluid holding organelles' },
          { icon: '🌿', label: 'Chloroplast', detail: 'Only in plants — makes food via sunlight' },
        ],
        keyFacts: ['Smallest cell: Mycoplasma', 'Largest cell: Ostrich egg', 'Cells → Tissue → Organ → System'],
      },
    ],
    '8_Mathematics': [
      {
        topic: 'Rational Numbers',
        color: '#3F51B5',
        emoji: '🔢',
        steps: [
          { icon: '➗', label: 'What is p/q?', detail: 'Any number written as fraction where q ≠ 0' },
          { icon: '➕', label: 'Addition', detail: 'Make denominators same, then add numerators' },
          { icon: '✖️', label: 'Multiplication', detail: 'Multiply numerators × numerators, denominators × denominators' },
          { icon: '📏', label: 'Number Line', detail: 'Rational numbers fill gaps between integers' },
        ],
        keyFacts: ['0 is rational', 'Every integer is rational', 'Between any two rationals, infinite rationals exist'],
      },
      {
        topic: 'Algebraic Expressions',
        color: '#00BCD4',
        emoji: '🔣',
        steps: [
          { icon: '🔤', label: 'Variables', detail: 'Letters (x, y) representing unknown values' },
          { icon: '➕', label: 'Like Terms', detail: 'Same variable → can be added/subtracted' },
          { icon: '🔗', label: 'Binomial', detail: 'Expression with two terms: 3x + 2' },
          { icon: '📦', label: 'Factorisation', detail: 'Breaking expression into product of factors' },
        ],
        keyFacts: ['Monomial = 1 term', 'Binomial = 2 terms', 'Polynomial = many terms'],
      },
    ],
    '9_Science': [
      {
        topic: 'Matter in Our Surroundings',
        color: '#607D8B',
        emoji: '⚗️',
        steps: [
          { icon: '🧊', label: 'Solid', detail: 'Fixed shape & volume, tightly packed particles' },
          { icon: '💧', label: 'Liquid', detail: 'Fixed volume, takes shape of container' },
          { icon: '💨', label: 'Gas', detail: 'No fixed shape or volume, spreads everywhere' },
          { icon: '🌡️', label: 'Temperature Effect', detail: 'Heat → solid melts → liquid evaporates → gas' },
          { icon: '🔄', label: 'State Changes', detail: 'Melting, Freezing, Evaporation, Condensation, Sublimation' },
        ],
        keyFacts: ['Latent heat = heat absorbed during state change', 'Sublimation: solid → gas directly (e.g. dry ice)', 'Plasma is the 4th state of matter'],
      },
      {
        topic: 'Atoms & Molecules',
        color: '#FF9800',
        emoji: '⚛️',
        steps: [
          { icon: '🔴', label: 'Atom', detail: 'Smallest unit of an element that keeps its properties' },
          { icon: '🔗', label: 'Molecule', detail: 'Two or more atoms bonded together' },
          { icon: '🧮', label: 'Atomic Mass', detail: 'Relative mass of atom compared to Carbon-12' },
          { icon: '📐', label: 'Mole Concept', detail: '1 mole = 6.022 × 10²³ particles (Avogadro number)' },
          { icon: '⚖️', label: 'Chemical Formula', detail: 'H₂O, CO₂ — shows which atoms & how many' },
        ],
        keyFacts: ['Dalton proposed atomic theory', 'Atoms are NOT indivisible (protons, neutrons, electrons)', 'Avogadro number = 6.022 × 10²³'],
      },
      {
        topic: 'Motion',
        color: '#E91E63',
        emoji: '🚀',
        steps: [
          { icon: '📍', label: 'Distance', detail: 'Total path length covered (scalar)' },
          { icon: '➡️', label: 'Displacement', detail: 'Shortest path from start to end (vector)' },
          { icon: '⚡', label: 'Speed', detail: 'Distance ÷ Time (m/s)' },
          { icon: '🎯', label: 'Velocity', detail: 'Displacement ÷ Time — has direction too' },
          { icon: '📈', label: 'Acceleration', detail: 'Rate of change of velocity' },
        ],
        keyFacts: ['Uniform motion = constant velocity', 'v = u + at (first equation of motion)', 'Area under v-t graph = distance'],
      },
      {
        topic: 'Force & Laws of Motion',
        color: '#8BC34A',
        emoji: '💪',
        steps: [
          { icon: '😴', label: "Newton's 1st Law", detail: 'Object stays at rest or motion unless force acts' },
          { icon: '📊', label: "Newton's 2nd Law", detail: 'F = ma — more mass needs more force' },
          { icon: '↩️', label: "Newton's 3rd Law", detail: 'Every action has equal & opposite reaction' },
          { icon: '🏋️', label: 'Inertia', detail: 'Resistance to change in state of motion' },
        ],
        keyFacts: ['Momentum = mass × velocity', 'Newton is the unit of force', 'Rocket works on Newton\'s 3rd law'],
      },
    ],
    '9_Mathematics': [
      {
        topic: 'Number Systems',
        color: '#795548',
        emoji: '🔢',
        steps: [
          { icon: '1️⃣', label: 'Natural Numbers', detail: 'Counting numbers: 1, 2, 3, 4...' },
          { icon: '0️⃣', label: 'Whole Numbers', detail: 'Natural + zero: 0, 1, 2, 3...' },
          { icon: '➖', label: 'Integers', detail: 'Whole + negatives: ...-2, -1, 0, 1, 2...' },
          { icon: '➗', label: 'Rational', detail: 'p/q form where q ≠ 0' },
          { icon: '√', label: 'Irrational', detail: 'Cannot be written as fraction: √2, π' },
          { icon: '♾️', label: 'Real Numbers', detail: 'Rational + Irrational together' },
        ],
        keyFacts: ['π = 3.14159... is irrational', '√2 = 1.41421... is irrational', 'Every rational number is real'],
      },
      {
        topic: 'Polynomials',
        color: '#009688',
        emoji: '📐',
        steps: [
          { icon: '1️⃣', label: 'Degree 1 (Linear)', detail: 'ax + b = 0 — straight line graph' },
          { icon: '2️⃣', label: 'Degree 2 (Quadratic)', detail: 'ax² + bx + c — parabola graph' },
          { icon: '3️⃣', label: 'Degree 3 (Cubic)', detail: 'ax³ + bx² + cx + d' },
          { icon: '🎯', label: 'Zeroes of Polynomial', detail: 'Values of x where p(x) = 0' },
          { icon: '➗', label: 'Remainder Theorem', detail: 'p(a) = remainder when divided by (x - a)' },
        ],
        keyFacts: ['Factor theorem: (x-a) is factor if p(a) = 0', 'A polynomial of degree n has at most n zeroes'],
      },
    ],
    '8_Social Science': [
      {
        topic: 'Resources',
        color: '#4CAF50',
        emoji: '🌍',
        steps: [
          { icon: '🏔️', label: 'Natural Resources', detail: 'Air, water, minerals — from nature' },
          { icon: '🏭', label: 'Human-made Resources', detail: 'Buildings, machines — made by humans' },
          { icon: '🧠', label: 'Human Resources', detail: 'Skills & knowledge of people' },
          { icon: '🔋', label: 'Renewable', detail: 'Solar, wind — replenish naturally' },
          { icon: '⛽', label: 'Non-renewable', detail: 'Coal, petroleum — limited supply' },
        ],
        keyFacts: ['Sustainable development = use resources wisely', 'Agenda 21 signed at Rio Summit 1992'],
      },
    ],
    '9_Social Science': [
      {
        topic: 'French Revolution',
        color: '#3F51B5',
        emoji: '🗽',
        steps: [
          { icon: '👑', label: 'Old Regime', detail: 'King Louis XVI — clergy & nobles had privileges' },
          { icon: '💸', label: 'Causes', detail: 'Debt, food shortage, inequality, Enlightenment ideas' },
          { icon: '✊', label: '1789 Revolution', detail: 'Bastille stormed — July 14, 1789' },
          { icon: '📜', label: 'Declaration', detail: 'Rights of Man — liberty, equality, fraternity' },
          { icon: '⚔️', label: 'Reign of Terror', detail: 'Robespierre — mass executions 1793-94' },
          { icon: '🏛️', label: 'Napoleon', detail: 'Rose to power, modernized France, spread revolution' },
        ],
        keyFacts: ['Estates: Clergy (1st), Nobles (2nd), Common people (3rd)', '"Liberty, Equality, Fraternity" is French motto', 'Napoleon crowned 1804'],
      },
    ],
  };

  // Try exact key, then grade+Science as default
  return (
    infographics[key] ||
    infographics[`${grade}_Science`] ||
    infographics['8_Science']
  );
};

// ── Mock fallback ──────────────────────────────────────────
const getMockSchoolContent = (grade, subject) => {
  const mockContent = {
    Science: [
      {
        id: 'mock-sci-1',
        title: `Class ${grade} - Photosynthesis`,
        description: 'Photosynthesis is the process by which green plants make their own food using sunlight, water, and carbon dioxide.',
        hasFullContent: false,
        grade: `Class ${grade}`, subject: 'Science',
        type: 'Resource', icon: '', downloadUrl: '', mimeType: 'text/plain',
      },
      {
        id: 'mock-sci-2',
        title: `Class ${grade} - Human Digestive System`,
        description: 'The human digestive system breaks down food into nutrients.',
        hasFullContent: false,
        grade: `Class ${grade}`, subject: 'Science',
        type: 'Resource', icon: '', downloadUrl: '', mimeType: 'text/plain',
      },
    ],
    Mathematics: [
      {
        id: 'mock-math-1',
        title: `Class ${grade} - Fractions`,
        description: 'A fraction represents a part of a whole.',
        hasFullContent: false,
        grade: `Class ${grade}`, subject: 'Mathematics',
        type: 'Resource', icon: '', downloadUrl: '', mimeType: 'text/plain',
      },
    ],
    English: [
      {
        id: 'mock-eng-1',
        title: `Class ${grade} - Parts of Speech`,
        description: 'Parts of speech are categories of words based on their function in a sentence.',
        hasFullContent: false,
        grade: `Class ${grade}`, subject: 'English',
        type: 'Resource', icon: '', downloadUrl: '', mimeType: 'text/plain',
      },
    ],
  };

  return mockContent[subject] || mockContent['Science'];
};

module.exports = {
  searchDIKSHA,
  getDIKSHAContent,
  getEnrichedContent,
  getInfographicContent,
  SUBJECTS,
  GRADE_MAP,
};