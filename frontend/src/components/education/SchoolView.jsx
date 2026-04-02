// ─── School View Component ────────────────────────────────
// NCERT/DIKSHA content reader with TTS + AI simplify + Quiz
// Used by: Education.jsx (when educationLevel === 'school')

import { useState, useEffect } from 'react'
import axios from 'axios'
import TTSReader from './TTSReader'
import STTSearch from './STTSearch'
import './SchoolView.css'
import {
  FaSearch,
  FaBookOpen,
  FaBrain,
  FaQuestionCircle,
  FaArrowLeft
} from 'react-icons/fa'

const API    = 'http://localhost:5000'
const token = () => localStorage.getItem('token')
const headers= () => ({ Authorization: `Bearer ${token()}` })

const SUBJECTS = ['Mathematics','Science','English','Hindi','Social Science',
  'Physics','Chemistry','Biology','History','Geography','Computer Science']

export default function SchoolView({ user }) {
  const [grade,       setGrade]       = useState(user?.className || '8')
  const [subject,     setSubject]     = useState('Science')
  const [contents,    setContents]    = useState([])
  const [selected,    setSelected]    = useState(null)
  const [loading,     setLoading]     = useState(false)
  const [simplified,  setSimplified]  = useState('')
  const [simplifying, setSimplifying] = useState(false)
  const [quiz,        setQuiz]        = useState([])
  const [quizAnswer,  setQuizAnswer]  = useState({})
  const [quizResult,  setQuizResult]  = useState({})
  const [aiAnswer,    setAiAnswer]    = useState('')
  const [aiLoading,   setAiLoading]   = useState(false)
  const [view,        setView]        = useState('list') // list | read | quiz

  const grades = Array.from({ length: 12 }, (_, i) => String(i + 1))

  // ── Fetch content ─────────────────────────────────────
  const fetchContent = async () => {
    setLoading(true); setSelected(null); setSimplified(''); setView('list')
    try {
      const res = await axios.get(`${API}/api/education/school`, {
        params: { grade, subject }, headers: headers()
      })
      setContents(res.data.results || [])
    } catch { setContents([]) }
    finally  { setLoading(false) }
  }

  useEffect(() => { fetchContent() }, [grade, subject])

  // ── Select content ────────────────────────────────────
  const selectContent = async (item) => {
    setSelected(item); setSimplified(''); setQuiz([]); setAiAnswer('')
    setView('read')
    // Auto simplify for cognitive disability
    if (user?.disabilityType === 'cognitive' && item.description) {
      handleSimplify(item.description)
    }
  }

  // ── AI Simplify ───────────────────────────────────────
  const handleSimplify = async (text) => {
    setSimplifying(true)
    try {
      const res = await axios.post(`${API}/api/education/simplify`,
        { text, disabilityType: user?.disabilityType || 'cognitive' },
        { headers: headers() }
      )
      setSimplified(res.data.simplified)
    } catch { setSimplified('') }
    finally  { setSimplifying(false) }
  }

  // ── Generate Quiz ─────────────────────────────────────
  const handleQuiz = async () => {
    setView('quiz'); setQuiz([]); setQuizAnswer({}); setQuizResult({})
    try {
      const res = await axios.post(`${API}/api/education/quiz`,
        { text: selected.description, numQuestions: 3 },
        { headers: headers() }
      )
      setQuiz(res.data.questions || [])
    } catch { setQuiz([]) }
  }

  // ── Ask question by voice ─────────────────────────────
  const handleAsk = async (question) => {
    setAiLoading(true); setAiAnswer('')
    try {
      const res = await axios.post(`${API}/api/education/ask`,
        { question, context: selected?.description || '' },
        { headers: headers() }
      )
      setAiAnswer(res.data.answer)
      // Speak the answer
      const utter = new SpeechSynthesisUtterance(res.data.answer)
      utter.rate = 0.9; utter.lang = 'en-US'
      window.speechSynthesis.speak(utter)
    } catch { setAiAnswer('Sorry, could not get an answer.') }
    finally  { setAiLoading(false) }
  }

  const handleQuizAnswer = (qIdx, option) => {
    setQuizAnswer(prev => ({ ...prev, [qIdx]: option }))
    const correct = quiz[qIdx]?.answer === option
    setQuizResult(prev => ({ ...prev, [qIdx]: correct }))
    const feedback = correct ? 'Correct! Well done!' : `Wrong. The answer is ${quiz[qIdx]?.answer}.`
    const utter = new SpeechSynthesisUtterance(feedback)
    window.speechSynthesis.speak(utter)
  }

  const displayText = simplified || selected?.description || ''

  return (
    <div className="school-wrap">

      {/* ── Filters ── */}
      <div className="school-filters">
        <div className="school-filter-group">
          <label className="school-filter-label">Grade</label>
          <select className="school-select" value={grade} onChange={e => setGrade(e.target.value)}>
            {grades.map(g => <option key={g} value={g}>Class {g}</option>)}
          </select>
        </div>
        <div className="school-filter-group">
          <label className="school-filter-label">Subject</label>
          <select className="school-select" value={subject} onChange={e => setSubject(e.target.value)}>
            {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <button className="school-fetch-btn" onClick={fetchContent} disabled={loading}>
          <FaSearch /> {loading ? 'Loading...' : 'Search'}
        </button>
      </div>

      {/* ── Content List ── */}
      {view === 'list' && (
        <div className="school-list">
          {loading && (
            <div className="school-loading">
              <div className="school-spinner" />
              <p>Fetching study material…</p>
            </div>
          )}
          {!loading && contents.length === 0 && (
            <div className="school-empty">
              <p>📚 No content found. Try a different grade or subject.</p>
            </div>
          )}
          {!loading && contents.map(item => (
            <button
              key={item.id}
              className="school-content-card"
              onClick={() => selectContent(item)}
              aria-label={`Open ${item.title}`}
            >
              <div className="school-card-icon">
                <FaBookOpen />
              </div>
              <div className="school-card-info">
                <h3 className="school-card-title">{item.title}</h3>
                <p className="school-card-desc">{item.description?.slice(0, 100)}…</p>
                <div className="school-card-tags">
                  <span className="school-tag">{item.grade}</span>
                  <span className="school-tag">{item.subject}</span>
                  <span className="school-tag">{item.type}</span>
                </div>
              </div>
              <span className="school-card-arrow">›</span>
            </button>
          ))}
        </div>
      )}

      {/* ── Read View ── */}
      {view === 'read' && selected && (
        <div className="school-reader">
          <button className="school-back-btn" onClick={() => setView('list')}>← Back</button>
          <h2 className="school-reader-title">{selected.title}</h2>

          <div className="school-reader-tags">
            <span className="school-tag">{selected.grade}</span>
            <span className="school-tag">{selected.subject}</span>
          </div>

          {/* TTS Reader */}
          <TTSReader text={displayText} />

          {/* Content */}
          <div className="school-content-box">
            {simplifying && <p className="school-simplifying">🤖 Simplifying for you…</p>}
            <p className="school-content-text">{displayText}</p>
          </div>

          {/* Action buttons */}
          <div className="school-actions">
            {!simplified && (
              <button
                className="school-action-btn"
                onClick={() => handleSimplify(selected.description)}
              >
                <FaBrain /> Simplify
              </button>

             
            )}
            <button className="school-back-btn" onClick={() => setView('list')}>
              <FaArrowLeft /> Back
            </button>
          </div>

          {/* Ask by voice */}
          <div className="school-ask-wrap">
            <STTSearch
              onResult={handleAsk}
              placeholder="Ask a question about this topic…"
              label="🎙️ Ask a Question"
            />
            {aiLoading && <p className="school-ai-loading">🤖 Thinking…</p>}
            {aiAnswer && (
              <div className="school-ai-answer">
                <p className="school-ai-label">🤖 Answer:</p>
                <p className="school-ai-text">{aiAnswer}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Quiz View ── */}
      {view === 'quiz' && (
        <div className="school-quiz">
          <button className="school-back-btn" onClick={() => setView('read')}>← Back to Reading</button>
          <h2 className="school-quiz-title">📝 Quiz — {selected?.title}</h2>

          {quiz.length === 0 && (
            <div className="school-loading"><div className="school-spinner" /><p>Generating quiz…</p></div>
          )}

          {quiz.map((q, idx) => (
            <div key={idx} className="school-quiz-card">
              <p className="school-quiz-q">{idx + 1}. {q.question}</p>
              <div className="school-quiz-options">
                {Object.entries(q.options || {}).map(([key, val]) => (
                  <button
                    key={key}
                    className={`school-quiz-opt
                      ${quizAnswer[idx] === key ? (quizResult[idx] ? 'school-quiz-correct' : 'school-quiz-wrong') : ''}
                      ${quizAnswer[idx] && q.answer === key ? 'school-quiz-correct' : ''}
                    `}
                    onClick={() => !quizAnswer[idx] && handleQuizAnswer(idx, key)}
                    disabled={!!quizAnswer[idx]}
                  >
                    <span className="school-quiz-key">{key}</span> {val}
                  </button>
                ))}
              </div>
              {quizResult[idx] !== undefined && (
                <p className={`school-quiz-feedback ${quizResult[idx] ? 'correct' : 'wrong'}`}>
                  {quizResult[idx] ? '✅ Correct!' : `❌ Correct answer: ${q.answer}`}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  )
}