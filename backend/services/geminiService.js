// ─── Gemini AI Service ────────────────────────────────────
const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;

const getClient = () => {
  if (!genAI) genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genAI;
};

const getModel = () => getClient().getGenerativeModel({ model: 'models/gemini-flash-latest' });

// ── 1. Simplify content (Disability-Aware) ──────────────────
const simplifyContent = async (text, disabilityType = 'cognitive') => {
  try {
    const model = getModel();

    const promptMap = {
      cognitive: `Rewrite the following educational content in very simple language for a student with cognitive disability. Use short sentences, simple words, and bullet points. Make it friendly.\n\nContent:\n${text}`,
      visual:    `Rewrite this to be audio-friendly for a visually impaired student. Describe all visual concepts in words. Use structured headings and numbered points for screen readers. Avoid words like "see" or "look at the image".\n\nContent:\n${text}`,
      hearing:   `Rewrite this with clear text formatting for a hearing impaired student. Use bold key terms (**term**), short direct sentences, and a very clear visual structure.\n\nContent:\n${text}`,
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
    const prompt = `Based on the following content, generate ${numQuestions} simple multiple choice questions.
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
    const prompt = `Friendly teacher persona. Answer: "${question}" based on: ${context.slice(0, 1000)}. 2-3 sentences max.`;
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err) {
    return 'Sorry, I could not answer that right now.';
  }
};

// ── 4. Generate full educational content (Tamil Nadu Focused) ──
const generateFullContent = async ({ title, grade, subject }) => {
  try {
    const model  = getModel();
    
    // Check if we need to respond in Tamil
    const isTamilSubject = subject.toLowerCase() === 'tamil';
    const languageInstruction = isTamilSubject 
      ? "IMPORTANT: Provide the entire response in the Tamil language (தமிழ்)." 
      : "Provide the response in English, tailored for the Tamil Nadu State Board curriculum.";

    const prompt = `You are an expert teacher for the Tamil Nadu State Board (Samacheer Kalvi).
    ${languageInstruction}

    Generate a complete lesson for:
    - Topic: ${title}
    - Class: ${grade}
    - Subject: ${subject}

    Include:
    1. Clear Introduction
    2. Key Concepts (numbered)
    3. Real-life examples relevant to students in Tamil Nadu
    4. Summary

    Use simple, student-friendly language.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err) {
    console.error('Gemini content generation error:', err.message);
    return `Content for ${title} could not be loaded.`;
  }
};

module.exports = { simplifyContent, generateQuiz, answerQuestion, generateFullContent };