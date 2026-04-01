const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables from .env
const connectDB = require('./config/db'); // Ensure this matches your file path

const app = express();

// ─── Database Connection ──────────────────────────────────────────────────────
connectDB();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth',  require('./routes/auth'))

// Keep existing game routes
app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'ThiranNexus API' }))

// ─── Tongue Twisters ────────────────────────────────────────────────────────
const twisters = [
  { id: 1, text: "She sells seashells by the seashore.", difficulty: "easy" },
  { id: 2, text: "Peter Piper picked a peck of pickled peppers.", difficulty: "easy" },
  { id: 3, text: "How much wood would a woodchuck chuck if a woodchuck could chuck wood?", difficulty: "medium" },
  { id: 4, text: "Red lorry, yellow lorry, red lorry, yellow lorry.", difficulty: "medium" },
  { id: 5, text: "I scream, you scream, we all scream for ice cream.", difficulty: "easy" },
  { id: 6, text: "Fuzzy Wuzzy was a bear. Fuzzy Wuzzy had no hair.", difficulty: "medium" },
  { id: 7, text: "Six slippery snails slid slowly seaward.", difficulty: "hard" },
  { id: 8, text: "The thirty-three thieves thought that they thrilled the throne throughout Thursday.", difficulty: "hard" },
  { id: 9, text: "Betty Botter bought some butter, but the butter was bitter.", difficulty: "medium" },
  { id: 10, text: "A skunk sat on a stump and thunk the stump stunk.", difficulty: "hard" },
  { id: 11, text: "Toy boat, toy boat, toy boat.", difficulty: "easy" },
  { id: 12, text: "Unique New York, unique New York, you know you need unique New York.", difficulty: "hard" },
];

// ─── Math Question Generator ─────────────────────────────────────────────────
const operations = [
  { op: 'plus', fn: (a, b) => a + b },
  { op: 'minus', fn: (a, b) => a - b },
  { op: 'times', fn: (a, b) => a * b },
];

function generateMathQuestion(difficulty = 'easy') {
  let max, ops;
  if (difficulty === 'easy') {
    max = 10;
    ops = [operations[0], operations[1]];
  } else if (difficulty === 'medium') {
    max = 12;
    ops = operations;
  } else {
    max = 20;
    ops = operations;
  }

  const opObj = ops[Math.floor(Math.random() * ops.length)];
  let a = Math.floor(Math.random() * max) + 1;
  let b = Math.floor(Math.random() * max) + 1;

  if (opObj.op === 'minus' && b > a) [a, b] = [b, a];

  return {
    a,
    b,
    operation: opObj.op,
    question: `What is ${a} ${opObj.op} ${b}?`,
    answer: opObj.fn(a, b),
    difficulty,
  };
}

// ─── Validation Helper ────────────────────────────────────────────────────────
function similarity(s1, s2) {
  s1 = s1.toLowerCase().trim();
  s2 = s2.toLowerCase().trim();
  if (s1 === s2) return 1.0;

  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  const longerLen = longer.length;
  if (longerLen === 0) return 1.0;

  let matches = 0;
  for (let i = 0; i < shorter.length; i++) {
    if (longer.includes(shorter[i])) matches++;
  }

  const words1 = s1.split(' ');
  const words2 = s2.split(' ');
  let wordMatches = 0;
  words1.forEach(w => { if (words2.includes(w)) wordMatches++; });
  const wordScore = wordMatches / Math.max(words1.length, words2.length);

  return (matches / longerLen + wordScore) / 2;
}

// ─── Routes ──────────────────────────────────────────────────────────────────
app.get('/api/twisters', (req, res) => {
  const difficulty = req.query.difficulty || 'all';
  let pool = difficulty === 'all'
    ? twisters
    : twisters.filter(t => t.difficulty === difficulty);
  if (!pool.length) pool = twisters;
  const twister = pool[Math.floor(Math.random() * pool.length)];
  res.json(twister);
});

app.get('/api/math', (req, res) => {
  const difficulty = req.query.difficulty || 'easy';
  res.json(generateMathQuestion(difficulty));
});

app.post('/api/validate/twister', (req, res) => {
  const { original, spoken } = req.body;
  if (!original || spoken === undefined) {
    return res.status(400).json({ error: 'Missing original or spoken text' });
  }
  const score = similarity(original, spoken);
  let feedback, rating;
  if (score >= 0.85) {
    rating = 'excellent';
    feedback = 'Excellent! Perfect pronunciation!';
  } else if (score >= 0.6) {
    rating = 'good';
    feedback = 'Good job! Keep practicing!';
  } else {
    rating = 'tryAgain';
    feedback = 'Try again! Listen carefully and speak slowly.';
  }
  res.json({ score: Math.round(score * 100), rating, feedback });
});

app.post('/api/validate/math', (req, res) => {
  const { answer, userAnswer } = req.body;
  const correct = parseInt(userAnswer) === parseInt(answer);
  res.json({
    correct,
    feedback: correct ? 'Correct! Well done!' : `Not quite. The answer was ${answer}.`,
  });
});

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'ThiranNexus API' }));

app.listen(PORT, () => {
    console.log(`ThiranNexus backend running on port ${PORT}`);
});


app.use('/api/education', require('./routes/education'))