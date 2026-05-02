// ─── DIKSHA Service — HEARING IMPAIRED ENHANCED ───────────
// Strategy:
//  1. Local NCERT DB → organized chapters (always works)
//  2. DIKSHA API → fetch VIDEO resources for hearing impaired
//  3. Gemini → generate content when DIKSHA text is thin
// Tamil Nadu State Board aligned — Classes 6 to 10

const axios = require('axios')
const {
  getChapters,
  getChapterContent,
  getSubjectsForClass,
  SUPPORTED_GRADES,
  SUPPORTED_SUBJECTS,
} = require('../data/ncertContent')

const DIKSHA_BASE = 'https://diksha.gov.in/api/content/v1'

const GRADE_MAP = {
  '1':'Class 1','2':'Class 2','3':'Class 3','4':'Class 4',
  '5':'Class 5','6':'Class 6','7':'Class 7','8':'Class 8',
  '9':'Class 9','10':'Class 10','11':'Class 11','12':'Class 12',
}

// Added Tamil + all subjects
const SUBJECTS = [
  'Tamil','Mathematics','Science','English','Hindi',
  'Social Science','Physics','Chemistry','Biology',
  'History','Geography','Economics','Political Science','Computer Science'
]

// ─────────────────────────────────────────────────────────
// searchDIKSHA — Main search
// Returns chapters from local DB + DIKSHA videos (for hearing)
// ─────────────────────────────────────────────────────────
const searchDIKSHA = async ({ grade, subject, query = '', disabilityType = 'none' }) => {

  // ── Always serve local NCERT chapters first ────────────
  const localChapters = getChapters(grade, subject)

  let results = []

  if (localChapters.length > 0) {
    results = localChapters.map(ch => ({
      id:             ch.id,
      title:          ch.title,
      description:    ch.preview,
      grade:          `Class ${grade}`,
      subject,
      type:           'Chapter',
      source:         'local',
      hasFullContent: true,
      chapter:        ch.chapter,
      hasQuiz:        ch.hasQuiz,
      videoUrl:       null,
      thumbnailUrl:   null,
    }))
  }

  // ── For hearing impaired: also fetch DIKSHA videos ─────
  if (disabilityType === 'hearing') {
    const videos = await fetchDIKSHAVideos({ grade, subject, query })
    // Merge: put videos FIRST for hearing impaired
    results = [...videos, ...results]
  }

  // ── Fallback if nothing found ──────────────────────────
  if (results.length === 0) {
    results = getMockContent(grade, subject)
  }

  return results
}

// ─────────────────────────────────────────────────────────
// fetchDIKSHAVideos — Fetch video resources from DIKSHA
// Specifically for hearing impaired students
// ─────────────────────────────────────────────────────────
const fetchDIKSHAVideos = async ({ grade, subject, query = '' }) => {
  try {
    const gradeLabel = GRADE_MAP[grade] || `Class ${grade}`
    console.log(`🎬 Fetching DIKSHA videos for Class ${grade} ${subject}`)

    const response = await axios.post(`${DIKSHA_BASE}/search`, {
      request: {
        filters: {
          board:       ['State (Tamil Nadu)', 'CBSE'],
          medium:      ['Tamil', 'English'],
          gradeLevel:  [gradeLabel],
          subject:     [subject],
          // Only video types
          contentType: ['VideoResource', 'Video', 'ExplanationResource', 'FocusSpot'],
          mimeType:    ['video/x-youtube', 'video/mp4', 'application/vnd.ekstep.ecml-archive'],
          status:      ['Live'],
        },
        query:  query || subject,
        limit:  8,
        fields: [
          'name','description','gradeLevel','subject',
          'identifier','mimeType','artifactUrl',
          'previewUrl','thumbnail','appIcon','contentType',
          'body','streamingUrl',
        ],
      }
    }, {
      headers: { 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0' },
      timeout: 10000,
    })

    const items = response.data?.result?.content || []
    console.log(`✅ DIKSHA returned ${items.length} video items for Class ${grade} ${subject}`)

    if (items.length === 0) {
      // Fallback: try YouTube search via our service
      return await getYouTubeFallbackVideos(grade, subject)
    }

    return items.map(item => ({
      id:           item.identifier,
      title:        item.name,
      description:  item.description || '',
      grade:        item.gradeLevel?.join(', ') || `Class ${grade}`,
      subject:      item.subject?.join(', ') || subject,
      type:         'Video',
      source:       'diksha',
      hasFullContent: false,
      isVideo:      true,
      // Video URL resolution
      videoUrl:     resolveVideoUrl(item),
      embedUrl:     resolveEmbedUrl(item),
      thumbnailUrl: item.thumbnail || item.appIcon || '',
      mimeType:     item.mimeType || '',
    })).filter(item => item.videoUrl || item.embedUrl) // only items with actual video
  } catch (err) {
    console.error('DIKSHA video fetch error:', err.message)
    return await getYouTubeFallbackVideos(grade, subject)
  }
}

// ─────────────────────────────────────────────────────────
// resolveVideoUrl — Figure out the actual playable URL
// DIKSHA stores videos in different formats
// ─────────────────────────────────────────────────────────
const resolveVideoUrl = (item) => {
  // 1. Direct streaming URL (best)
  if (item.streamingUrl) return item.streamingUrl
  // 2. Artifact URL
  if (item.artifactUrl) return item.artifactUrl
  // 3. Preview URL
  if (item.previewUrl) return item.previewUrl
  // 4. Extract from body if YouTube embed
  if (item.body && item.body.includes('youtube.com')) {
    const match = item.body.match(/youtube\.com\/embed\/([^"&?/\s]+)/)
    if (match) return `https://www.youtube.com/watch?v=${match[1]}`
  }
  return null
}

// ─────────────────────────────────────────────────────────
// resolveEmbedUrl — For iframe embedding
// ─────────────────────────────────────────────────────────
const resolveEmbedUrl = (item) => {
  const url = item.streamingUrl || item.artifactUrl || item.previewUrl || ''

  // YouTube URL → embed URL
  if (url.includes('youtube.com/watch')) {
    const videoId = url.split('v=')[1]?.split('&')[0]
    if (videoId) return `https://www.youtube.com/embed/${videoId}?cc_load_policy=1&cc_lang_pref=en&hl=en`
  }
  if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1]?.split('?')[0]
    if (videoId) return `https://www.youtube.com/embed/${videoId}?cc_load_policy=1`
  }
  // Already an embed URL
  if (url.includes('/embed/')) return url + '?cc_load_policy=1'
  // DIKSHA player URL
  if (url.includes('diksha.gov.in')) return url
  // MP4 → return as-is for HTML5 video
  if (url.endsWith('.mp4')) return url
  return null
}

// ─────────────────────────────────────────────────────────
// getYouTubeFallbackVideos
// When DIKSHA has no videos, search YouTube for Tamil Nadu NCERT content
// ─────────────────────────────────────────────────────────
const getYouTubeFallbackVideos = async (grade, subject) => {
  try {
    const { searchYouTube } = require('./youtubeService')
    const query = `Class ${grade} ${subject} Tamil Nadu NCERT lesson`
    const videos = await searchYouTube({ query, maxResults: 5, captionsOnly: true })
    return videos.map(v => ({
      id:           v.videoId,
      title:        v.title,
      description:  v.description,
      grade:        `Class ${grade}`,
      subject,
      type:         'Video',
      source:       'youtube',
      isVideo:      true,
      videoUrl:     v.watchUrl,
      embedUrl:     v.embedUrl,
      thumbnailUrl: v.thumbnail,
      channel:      v.channel,
    }))
  } catch (err) {
    console.error('YouTube fallback error:', err.message)
    return []
  }
}

// ─────────────────────────────────────────────────────────
// getDIKSHAContent — Get full content by ID
// Local content returned instantly, DIKSHA as fallback
// ─────────────────────────────────────────────────────────
const getDIKSHAContent = async (contentId) => {
  // Local content IDs
  if (contentId.match(/^c\d/) || contentId.startsWith('mock-')) {
    const chapter = getChapterContent(contentId)
    if (chapter) {
      return {
        identifier:  chapter.id,
        name:        chapter.title,
        subject:     [chapter.subject],
        gradeLevel:  [chapter.grade],
        description: chapter.content,
        body:        chapter.content,
        quiz:        chapter.quiz,
        keyPoints:   chapter.keyPoints,
        source:      'local',
        videoUrl:    null,
      }
    }
  }

  // DIKSHA video IDs
  try {
    const res = await axios.get(`${DIKSHA_BASE}/read/${contentId}`, { timeout: 8000 })
    const item = res.data?.result?.content
    if (!item) return null
    return {
      ...item,
      videoUrl:  resolveVideoUrl(item),
      embedUrl:  resolveEmbedUrl(item),
      source:    'diksha',
    }
  } catch (err) {
    console.error('DIKSHA content read error:', err.message)
    return null
  }
}

// ─────────────────────────────────────────────────────────
// getEnrichedContent — Full content with Gemini fallback
// Used by /api/education/school/content/:id
// ─────────────────────────────────────────────────────────
const getEnrichedContent = async (contentId, { grade, subject, disabilityType = 'none' }) => {
  const raw = await getDIKSHAContent(contentId)

  let text  = ''
  let title = ''
  let videoUrl  = raw?.videoUrl  || null
  let embedUrl  = raw?.embedUrl  || null
  let thumbUrl  = raw?.thumbnail || raw?.appIcon || null

  if (raw?.body && raw.body.trim().length > 300) {
    text  = raw.body
    title = raw.name
  } else {
    title = raw?.name || `${subject} — Class ${grade}`
    try {
      const { generateFullContent } = require('./geminiService')
      text = await generateFullContent({ title, grade, subject })
    } catch {
      text = raw?.description || raw?.body || ''
    }
  }

  // Simplify for disability
  let displayContent = text
  if (disabilityType !== 'none' && disabilityType !== 'other' && text) {
    try {
      const { simplifyContent } = require('./geminiService')
      displayContent = await simplifyContent(text, disabilityType)
    } catch { /* use original */ }
  }

  // Quiz
  let quiz = raw?.quiz || []
  if (quiz.length === 0 && displayContent) {
    try {
      const { generateQuiz } = require('./geminiService')
      quiz = await generateQuiz(displayContent, 3)
    } catch { /* empty quiz */ }
  }

  return {
    id:          contentId,
    title,
    grade:       `Class ${grade}`,
    subject,
    content:     displayContent,
    rawContent:  text,
    quiz,
    keyPoints:   raw?.keyPoints || [],
    videoUrl,
    embedUrl,
    thumbnailUrl:thumbUrl,
    source:      raw?.source || 'local',
    generatedBy: raw?.body?.length > 300 ? 'diksha' : 'gemini',
  }
}

// ─────────────────────────────────────────────────────────
// getInfographicContent — Visual cards for hearing impaired
// ─────────────────────────────────────────────────────────
const getInfographicContent = (grade, subject) => {
  const key = `${grade}_${subject}`

  const infographics = {
    '6_Science': [
      {
        topic: 'Food Sources',
        color: '#4CAF50', emoji: '🍎',
        steps: [
          { icon: '🌱', label: 'Plants', detail: 'Fruits, vegetables, cereals, pulses' },
          { icon: '🐄', label: 'Animals', detail: 'Milk, eggs, meat, honey' },
          { icon: '🌾', label: 'Cereals', detail: 'Rice, wheat, maize — energy foods' },
          { icon: '🫘', label: 'Pulses', detail: 'Dal, beans, peas — protein foods' },
        ],
        keyFacts: ['Plants give us most of our food', 'Honey is made by bees from nectar', 'Rice is staple food of Tamil Nadu'],
      },
      {
        topic: 'Nutrition in Food',
        color: '#FF9800', emoji: '💊',
        steps: [
          { icon: '⚡', label: 'Carbohydrates', detail: 'Rice, wheat → give energy' },
          { icon: '💪', label: 'Proteins', detail: 'Dal, egg, milk → build body' },
          { icon: '🔆', label: 'Vitamins', detail: 'Fruits, vegetables → prevent disease' },
          { icon: '🦴', label: 'Minerals', detail: 'Milk, spinach → strong bones & blood' },
        ],
        keyFacts: ['Lack of Vitamin C → Scurvy', 'Lack of Iron → Anaemia', 'Balanced diet has all nutrients'],
      },
    ],
    '7_Science': [
      {
        topic: 'Photosynthesis',
        color: '#4CAF50', emoji: '🌿',
        steps: [
          { icon: '☀️', label: 'Sunlight', detail: 'Energy source — absorbed by chlorophyll' },
          { icon: '💧', label: 'Water', detail: 'Absorbed from soil through roots' },
          { icon: '💨', label: 'CO₂', detail: 'Carbon dioxide enters through stomata' },
          { icon: '🍬', label: 'Glucose', detail: 'Food made and stored in plant' },
          { icon: '🌬️', label: 'Oxygen', detail: 'Released into air — we breathe this!' },
        ],
        keyFacts: ['Chlorophyll makes leaves green', 'Stomata are tiny pores on leaves', 'Plants are called producers'],
      },
      {
        topic: 'Nutrition Types',
        color: '#9C27B0', emoji: '🌱',
        steps: [
          { icon: '🌿', label: 'Autotrophs', detail: 'Make own food — all green plants' },
          { icon: '🕸️', label: 'Parasites', detail: 'Steal food from host — Cuscuta' },
          { icon: '🪤', label: 'Insectivores', detail: 'Trap insects — Pitcher plant' },
          { icon: '🍄', label: 'Saprophytes', detail: 'Eat dead matter — Mushroom, Mould' },
        ],
        keyFacts: ['Cuscuta is yellow thread-like parasite', 'Pitcher plant grows in nitrogen-poor soil', 'Mushrooms decompose dead matter'],
      },
    ],
    '8_Science': [
      {
        topic: 'Crop Production & Management',
        color: '#4CAF50', emoji: '🌾',
        steps: [
          { icon: '🌱', label: 'Preparation of Soil', detail: 'Ploughing loosens soil for roots' },
          { icon: '🌿', label: 'Sowing Seeds', detail: 'Seeds planted at correct depth' },
          { icon: '💧', label: 'Irrigation', detail: 'Water supply — Mettur Dam in Tamil Nadu' },
          { icon: '🧪', label: 'Fertilizers', detail: 'NPK — Nitrogen, Phosphorus, Potassium' },
          { icon: '🌾', label: 'Harvesting', detail: 'Sickle or combine harvester' },
          { icon: '🏠', label: 'Storage', detail: 'Silos, godowns — prevent pests' },
        ],
        keyFacts: ['Paddy (rice) is Kharif crop', 'Drip irrigation saves water', 'Tamil Nadu: major paddy growing state'],
      },
      {
        topic: 'Synthetic Fibres & Plastics',
        color: '#2196F3', emoji: '🧵',
        steps: [
          { icon: '🪢', label: 'Nylon', detail: 'First synthetic fibre — very strong' },
          { icon: '👗', label: 'Polyester', detail: 'PET — wrinkle resistant, dries fast' },
          { icon: '🧶', label: 'Acrylic', detail: 'Artificial wool — cheaper than real wool' },
          { icon: '🎗️', label: 'Rayon', detail: 'Artificial silk — from wood pulp' },
          { icon: '⚠️', label: 'Plastics Problem', detail: 'Non-biodegradable — banned in Tamil Nadu 2019' },
        ],
        keyFacts: ['Kanchipuram silk is natural — from silkworm', 'Tamil Nadu banned single-use plastics', 'Thermoplastics can be remoulded'],
      },
      {
        topic: 'Force and Pressure',
        color: '#FF5722', emoji: '💪',
        steps: [
          { icon: '👊', label: 'What is Force?', detail: 'Push or pull that changes motion or shape' },
          { icon: '🧲', label: 'Non-contact Forces', detail: 'Magnetic, Gravitational, Electrostatic' },
          { icon: '🚶', label: 'Friction', detail: 'Opposes motion — helps us walk!' },
          { icon: '📐', label: 'Pressure Formula', detail: 'Pressure = Force ÷ Area' },
          { icon: '🐪', label: 'Camel\'s Feet', detail: 'Wide feet → less pressure on sand' },
        ],
        keyFacts: ['Sharp knife: small area → high pressure', 'Atmospheric pressure = 101,325 Pa', 'Friction causes heat'],
      },
      {
        topic: 'Light',
        color: '#FFC107', emoji: '💡',
        steps: [
          { icon: '➡️', label: 'Straight Line', detail: 'Light travels in straight lines' },
          { icon: '🔄', label: 'Reflection', detail: 'Angle of incidence = Angle of reflection' },
          { icon: '🔍', label: 'Concave Mirror', detail: 'Converges light → torch, dentist mirror' },
          { icon: '🚗', label: 'Convex Mirror', detail: 'Rear-view mirror → wide field of view' },
          { icon: '👁️', label: 'Human Eye', detail: 'Pupil → Lens → Retina → Optic nerve → Brain' },
        ],
        keyFacts: ['Light speed = 3×10⁸ m/s', 'Myopia: concave lens', 'Hypermetropia: convex lens'],
      },
    ],
    '9_Science': [
      {
        topic: 'States of Matter',
        color: '#607D8B', emoji: '⚗️',
        steps: [
          { icon: '🧊', label: 'Solid', detail: 'Fixed shape + volume — tightly packed' },
          { icon: '💧', label: 'Liquid', detail: 'Fixed volume — takes shape of container' },
          { icon: '💨', label: 'Gas', detail: 'No fixed shape or volume — spreads everywhere' },
          { icon: '🌡️', label: 'Heat Effect', detail: 'Solid → Liquid → Gas with heating' },
          { icon: '✨', label: 'Sublimation', detail: 'Solid → Gas directly (camphor, dry ice)' },
        ],
        keyFacts: ['Dry ice = solid CO₂ — sublimates', 'LPG is gas stored as liquid under pressure', 'Plasma = 4th state (sun, stars)'],
      },
      {
        topic: 'Motion',
        color: '#E91E63', emoji: '🚀',
        steps: [
          { icon: '📍', label: 'Distance', detail: 'Total path length — scalar quantity' },
          { icon: '➡️', label: 'Displacement', detail: 'Shortest path — vector quantity' },
          { icon: '⚡', label: 'Speed', detail: 'Distance ÷ Time = m/s' },
          { icon: '🎯', label: 'Velocity', detail: 'Displacement ÷ Time — has direction' },
          { icon: '📈', label: 'Acceleration', detail: 'Change in velocity ÷ Time' },
        ],
        keyFacts: ['v = u + at (1st equation)', 'Area under v-t graph = distance', 'Uniform motion → straight line on d-t graph'],
      },
      {
        topic: "Newton's Laws of Motion",
        color: '#8BC34A', emoji: '⚖️',
        steps: [
          { icon: '😴', label: '1st Law (Inertia)', detail: 'Object stays at rest or motion unless force acts' },
          { icon: '📊', label: '2nd Law (F=ma)', detail: 'More force → more acceleration' },
          { icon: '↩️', label: '3rd Law (Action-Reaction)', detail: 'Every action has equal opposite reaction' },
          { icon: '🚀', label: 'Rocket Example', detail: 'Gas pushed down → rocket goes up (3rd law)' },
          { icon: '🏋️', label: 'Momentum', detail: 'p = m × v — conserved when no external force' },
        ],
        keyFacts: ['SI unit of force = Newton', 'Walking uses Newton\'s 3rd law', 'Seat belt works on inertia (1st law)'],
      },
    ],
    '10_Science': [
      {
        topic: 'Chemical Reactions',
        color: '#9C27B0', emoji: '⚗️',
        steps: [
          { icon: '➕', label: 'Combination', detail: 'A + B → AB (CaO + H₂O → Ca(OH)₂)' },
          { icon: '➗', label: 'Decomposition', detail: 'AB → A + B (CaCO₃ → CaO + CO₂)' },
          { icon: '🔄', label: 'Displacement', detail: 'Fe + CuSO₄ → FeSO₄ + Cu (iron displaces copper)' },
          { icon: '⬇️', label: 'Double Displacement', detail: 'Precipitation — Na₂SO₄ + BaCl₂ → BaSO₄↓' },
          { icon: '⚡', label: 'Redox', detail: 'Oxidation + Reduction always together' },
        ],
        keyFacts: ['Rusting = iron + oxygen + water', 'Rancidity = fat oxidation', 'Balancing uses Law of Conservation of Mass'],
      },
      {
        topic: 'Electricity',
        color: '#FF9800', emoji: '⚡',
        steps: [
          { icon: '🔋', label: 'Potential Difference', detail: 'V = W/Q — measured in Volts' },
          { icon: '🔌', label: 'Ohm\'s Law', detail: 'V = IR — Voltage = Current × Resistance' },
          { icon: '📏', label: 'Series Circuit', detail: 'Same current, voltage divides — R_total = R₁+R₂' },
          { icon: '📐', label: 'Parallel Circuit', detail: 'Same voltage, current divides — R_total is less' },
          { icon: '🔥', label: 'Heating Effect', detail: 'H = I²Rt — used in heater, iron, bulb' },
        ],
        keyFacts: ['1 kWh = 1 unit of electricity', 'TANGEDCO distributes power in Tamil Nadu', 'Kudankulam is nuclear power plant in Tamil Nadu'],
      },
    ],
    '8_Mathematics': [
      {
        topic: 'Rational Numbers',
        color: '#3F51B5', emoji: '🔢',
        steps: [
          { icon: '➗', label: 'What is p/q?', detail: 'Any number as fraction where q ≠ 0' },
          { icon: '0️⃣', label: 'Additive Identity', detail: '0 — adding 0 changes nothing' },
          { icon: '1️⃣', label: 'Multiplicative Identity', detail: '1 — multiplying by 1 changes nothing' },
          { icon: '🔄', label: 'Inverse', detail: 'Additive: 3/4 + (-3/4) = 0. Multiplicative: 3/4 × 4/3 = 1' },
          { icon: '📏', label: 'Number Line', detail: 'Infinite rationals between any two points' },
        ],
        keyFacts: ['Between any two rationals, infinite rationals exist', '0/5 = 0 is rational', '-3/4 is negative rational'],
      },
    ],
    '9_Mathematics': [
      {
        topic: 'Number Systems',
        color: '#795548', emoji: '🔢',
        steps: [
          { icon: '1️⃣', label: 'Natural (N)', detail: '1, 2, 3... — counting numbers' },
          { icon: '0️⃣', label: 'Whole (W)', detail: '0, 1, 2, 3... — natural + zero' },
          { icon: '➖', label: 'Integers (Z)', detail: '...-2,-1,0,1,2... — positive + negative' },
          { icon: '➗', label: 'Rational (Q)', detail: 'p/q form — terminating or recurring decimal' },
          { icon: '√', label: 'Irrational', detail: '√2, π — non-terminating, non-recurring' },
        ],
        keyFacts: ['π = 3.14159... is irrational', 'Every integer is rational', 'N ⊂ W ⊂ Z ⊂ Q ⊂ R'],
      },
    ],
    '8_Social Science': [
      {
        topic: 'British Rule in India',
        color: '#795548', emoji: '🏛️',
        steps: [
          { icon: '⚔️', label: '1757 Plassey', detail: 'British defeated Nawab of Bengal' },
          { icon: '🌾', label: 'Ryotwari System', detail: 'Tamil Nadu: farmers paid tax directly to British' },
          { icon: '🚂', label: '1853 Railways', detail: 'First railway: Mumbai to Thane' },
          { icon: '✊', label: '1857 Revolt', detail: 'First War of Independence — Sepoy Mutiny' },
          { icon: '🏁', label: '1947 Freedom', detail: 'India independent — August 15' },
        ],
        keyFacts: ['V.O. Chidambaram Pillai — Tamil freedom fighter', 'Subramania Bharati — poet + activist', 'Pondicherry was French colony'],
      },
    ],
    '9_Social Science': [
      {
        topic: 'French Revolution (1789)',
        color: '#3F51B5', emoji: '🗽',
        steps: [
          { icon: '👑', label: 'Old Regime', detail: '3 Estates — clergy, nobles, common people' },
          { icon: '💸', label: 'Causes', detail: 'Debt + hunger + inequality + Enlightenment ideas' },
          { icon: '✊', label: 'July 14, 1789', detail: 'Bastille stormed — Revolution begins!' },
          { icon: '📜', label: 'Rights Declared', detail: 'Liberty, Equality, Fraternity' },
          { icon: '🏛️', label: 'Napoleon', detail: 'Rose to power 1799, crowned Emperor 1804' },
        ],
        keyFacts: ['Pondicherry was French in Tamil Nadu', 'French motto: Liberté, Égalité, Fraternité', 'French Revolution inspired Indian freedom movement'],
      },
    ],
    '10_Social Science': [
      {
        topic: 'Rise of Nationalism in Europe',
        color: '#E91E63', emoji: '🏳️',
        steps: [
          { icon: '👑', label: 'Old Europe', detail: 'Kingdoms ruled — people had no national identity' },
          { icon: '⚔️', label: 'Napoleon', detail: 'Spread revolutionary ideas across Europe' },
          { icon: '🇩🇪', label: 'Germany Unified', detail: 'Bismarck — "Blood and Iron" — 1871' },
          { icon: '🇮🇹', label: 'Italy Unified', detail: 'Mazzini + Garibaldi + Cavour — 1861' },
          { icon: '💥', label: 'Balkans → WWI', detail: 'Nationalism + rivalry → World War I (1914)' },
        ],
        keyFacts: ['Germany unified 1871 — Kaiser Wilhelm I', 'Italy: Garibaldi led Red Shirts', 'Assassination of Franz Ferdinand → WWI'],
      },
    ],
  }

  // Exact match → Grade+Subject default → Grade+Science → Class 8 Science
  return (
    infographics[key] ||
    infographics[`${grade}_Science`] ||
    infographics[`${grade}_Social Science`] ||
    infographics['8_Science']
  )
}

// ── Minimal mock fallback ──────────────────────────────────
const getMockContent = (grade, subject) => [{
  id:             `mock-${grade}-${subject.toLowerCase().replace(/ /g,'-')}-1`,
  title:          `${subject} — Class ${grade} (Tamil Nadu NCERT)`,
  description:    `${subject} content for Class ${grade}. Tap to open full lesson.`,
  grade:          `Class ${grade}`,
  subject,
  type:           'Chapter',
  source:         'mock',
  hasFullContent: false,
  isVideo:        false,
  videoUrl:       null,
}]

// ── Get subjects for a grade ───────────────────────────────
const getSubjectsForGrade = (grade) => {
  const local = getSubjectsForClass(grade)
  if (local.length > 0) return local
  return SUBJECTS.map(s => ({ subject: s, chapterCount: 0 }))
}

module.exports = {
  searchDIKSHA,
  getDIKSHAContent,
  getEnrichedContent,
  getInfographicContent,
  fetchDIKSHAVideos,
  getSubjectsForGrade,
  SUBJECTS,
  GRADE_MAP,
  SUPPORTED_GRADES,
}