// ─── Gemini AI Service ────────────────────────────────────
// Used for:
//  1. Simplify text (for cognitive disability students)
//  2. Generate quiz questions from content
//  3. Answer student questions via voice
// Owner: Teammate 3

const { GoogleGenerativeAI } = require('@google/generative-ai')

let genAI = null

const getClient = () => {
  if (!genAI) genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  return genAI
}

// ── 1. Simplify content for cognitive disability ───────────
const simplifyContent = async (text, disabilityType = 'cognitive') => {
  try {
    const model  = getClient().getGenerativeModel({ model: 'gemini-pro' })

    const promptMap = {
      cognitive: `Rewrite the following educational content in very simple, easy-to-understand language for a student with cognitive disability. Use short sentences, simple words, and bullet points. Avoid complex vocabulary. Make it friendly and encouraging.\n\nContent:\n${text}`,
      visual:    `Rewrite the following content to be very descriptive and audio-friendly for a visually impaired student. Remove any references to "see", "look", "diagram", "figure". Describe everything in words. Use clear structure.\n\nContent:\n${text}`,
      hearing:   `Rewrite the following content with very clear text formatting for a hearing impaired student. Use bullet points, clear headings, and visual structure. Emphasize key terms in caps.\n\nContent:\n${text}`,
    }

    const prompt = promptMap[disabilityType] || promptMap['cognitive']
    const result = await model.generateContent(prompt)
    return result.response.text()
  } catch (err) {
    console.error('Gemini simplify error:', err.message)
    return text // return original if AI fails
  }
}

// ── 2. Generate quiz from content ─────────────────────────
const generateQuiz = async (text, numQuestions = 3) => {
  try {
    const model = getClient().getGenerativeModel({ model: 'gemini-pro' })
    const prompt = `Based on the following educational content, generate ${numQuestions} simple multiple choice questions suitable for differently abled students. 
    
For each question provide:
- question text
- 4 options (A, B, C, D)
- correct answer letter

Return ONLY valid JSON array like:
[{"question":"...","options":{"A":"...","B":"...","C":"...","D":"..."},"answer":"A"}]

Content:
${text.slice(0, 1500)}`

    const result = await model.generateContent(prompt)
    const raw    = result.response.text()
    const clean  = raw.replace(/```json|```/g, '').trim()
    return JSON.parse(clean)
  } catch (err) {
    console.error('Gemini quiz error:', err.message)
    return []
  }
}

// ── 3. Answer student question ─────────────────────────────
const answerQuestion = async (question, context) => {
  try {
    const model  = getClient().getGenerativeModel({ model: 'gemini-pro' })
    const prompt = `You are a friendly, patient teacher for differently abled students. 
A student asked: "${question}"

Based on this study content:
${context.slice(0, 1500)}

Give a simple, clear, encouraging answer in 2-3 sentences maximum. Use simple words.`

    const result = await model.generateContent(prompt)
    return result.response.text()
  } catch (err) {
    console.error('Gemini answer error:', err.message)
    return 'Sorry, I could not answer that right now. Please try again.'
  }
}

module.exports = { simplifyContent, generateQuiz, answerQuestion }