// ─── Gemini AI Service ────────────────────────────────────
// Used for:
//  1. Simplify text (for cognitive / visual / hearing impaired students)
//  2. Generate quiz questions from content
//  3. Answer student questions via voice
//  4. [NEW] Generate full educational content when DIKSHA only returns a title

const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;

const getClient = () => {
  if (!genAI) genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genAI;
};


const getModel = () => getClient().getGenerativeModel({ model: 'models/gemini-flash-latest' });
// ── 1. Simplify content ────────────────────────────────────
const simplifyContent = async (text, disabilityType = 'cognitive') => {
  try {
    const model = getModel();

    const promptMap = {
      cognitive: `Rewrite the following educational content in very simple, easy-to-understand language for a student with cognitive disability. Use short sentences, simple words, and bullet points. Avoid complex vocabulary. Make it friendly and encouraging.\n\nContent:\n${text}`,
      visual:    `Rewrite the following content to be very descriptive and audio-friendly for a visually impaired student. Remove references to "see", "look", "diagram", "figure". Describe everything clearly in words. Use structured headings, numbered points, and full descriptive sentences so a screen reader conveys the full picture.\n\nContent:\n${text}`,
      hearing:   `Rewrite the following content with very clear text formatting for a hearing impaired student. Use bullet points, clear headings, bold key terms (mark with **term**), and visual structure. Keep sentences short and direct.\n\nContent:\n${text}`,
    };

    const prompt = promptMap[disabilityType] || promptMap['cognitive'];
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err) {
    console.error('Gemini simplify error:', err.message);
    return text;
  }
};

// ── 2. Generate quiz ───────────────────────────────────────
const generateQuiz = async (text, numQuestions = 3) => {
  try {
    const model = getModel();
    const prompt = `Based on the following educational content, generate ${numQuestions} simple multiple choice questions suitable for differently abled students.

For each question provide:
- question text
- 4 options (A, B, C, D)
- correct answer letter

Return ONLY valid JSON array like:
[{"question":"...","options":{"A":"...","B":"...","C":"...","D":"..."},"answer":"A"}]

Content:
${text.slice(0, 1500)}`;

    const result = await model.generateContent(prompt);
    const raw    = result.response.text();
    const clean  = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch (err) {
    console.error('Gemini quiz error:', err.message);
    return [];
  }
};

// ── 3. Answer student question ─────────────────────────────
const answerQuestion = async (question, context) => {
  try {
    const model  = getModel();
    const prompt = `You are a friendly, patient teacher for differently abled students. 
A student asked: "${question}"

Based on this study content:
${context.slice(0, 1500)}

Give a simple, clear, encouraging answer in 2-3 sentences maximum. Use simple words.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err) {
    console.error('Gemini answer error:', err.message);
    return 'Sorry, I could not answer that right now. Please try again.';
  }
};

// ── 4. [NEW] Generate full educational content ─────────────
// Called when DIKSHA only returns a topic title and short description,
// so the student always gets a full, readable lesson — not just a stub.
const generateFullContent = async ({ title, grade, subject }) => {
  try {
    const model  = getModel();
    const prompt = `You are an expert NCERT curriculum teacher for Indian schools.

Generate a complete, well-structured educational lesson for the following:
- Topic: ${title}
- Class: ${grade}
- Subject: ${subject}

Include:
1. A clear introduction (2-3 sentences)
2. Key concepts with explanations (use numbered headings)
3. Real-life examples that Indian school students can relate to
4. Important facts / definitions (as bullet points)
5. A short summary

Write in simple, student-friendly language. Avoid jargon. Keep total length around 400-600 words.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err) {
    console.error('Gemini content generation error:', err.message);
    return `This topic covers ${title} for Class ${grade} ${subject}. Content could not be loaded right now. Please try again.`;
  }
};

module.exports = { simplifyContent, generateQuiz, answerQuestion, generateFullContent };