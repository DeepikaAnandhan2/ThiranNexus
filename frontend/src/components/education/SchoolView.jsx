// ─── School View Component ────────────────────────────────
// NCERT/DIKSHA content reader with TTS + AI simplify + Quiz
// Disability-aware:
//   visual   → TTS auto-reads, screen-reader optimised
//   hearing  → Infographic visual cards (Class 8 & 9)
//   others   → Standard read + simplify + quiz
// Used by: Education.jsx (when educationLevel === 'school')

import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import TTSReader from './TTSReader'
import STTSearch from './STTSearch'
import './SchoolView.css'
import {
  FaSearch, FaBookOpen, FaBrain,
  FaArrowLeft, FaQuestionCircle,
  FaImages, FaChevronLeft, FaChevronRight
} from 'react-icons/fa'

const API    = ''
const token  = () => localStorage.getItem('token')
const headers = () => token() ? { Authorization: `Bearer ${token()}` } : {}

const SUBJECTS = [
  'Mathematics', 'Science', 'English', 'Hindi',
  'Social Science', 'Physics', 'Chemistry', 'Biology',
  'History', 'Geography', 'Computer Science'
]

// ── Simple markdown renderer for Gemini output ───────────
function RenderContent({ text }) {
  if (!text) return null
  return (
    <div className="rendered-content">
      {text.split('\n').map((line, i) => {
        if (!line.trim()) return <br key={i} />
        if (line.startsWith('# '))  return <h2 key={i} className="rc-h2">{line.slice(2)}</h2>
        if (line.startsWith('## ')) return <h3 key={i} className="rc-h3">{line.slice(3)}</h3>
        if (line.startsWith('- ') || line.startsWith('• ')) {
          return <li key={i} className="rc-li">{line.slice(2)}</li>
        }
        // Bold **term**
        const parts = line.split(/\*\*(.*?)\*\*/g)
        return (
          <p key={i} className="rc-p">
            {parts.map((p, j) => j % 2 === 1 ? <strong key={j}>{p}</strong> : p)}
          </p>
        )
      })}
    </div>
  )
}

// ── Infographic step card ─────────────────────────────────
function InfographicDetail({ info }) {
  if (!info) return null
  return (
    <div className="infographic-detail" style={{ '--ic': info.color }}>
      <div className="infographic-detail__header">
        <span className="infographic-detail__emoji" aria-hidden="true">{info.emoji}</span>
        <h3 className="infographic-detail__topic">{info.topic}</h3>
      </div>

      <div className="infographic-steps">
        {info.steps.map((step, i) => (
          <div key={i} className="infographic-step" style={{ '--ic': info.color }}>
            <div className="infographic-step__num" aria-hidden="true">{i + 1}</div>
            <div className="infographic-step__icon" aria-hidden="true">{step.icon}</div>
            <div className="infographic-step__body">
              <strong className="infographic-step__label">{step.label}</strong>
              <p className="infographic-step__detail">{step.detail}</p>
            </div>
          </div>
        ))}
      </div>

      {info.keyFacts?.length > 0 && (
        <div className="infographic-facts" style={{ '--ic': info.color }}>
          <h4 className="infographic-facts__title">⭐ Key Facts to Remember</h4>
          <ul className="infographic-facts__list">
            {info.keyFacts.map((f, i) => (
              <li key={i} className="infographic-facts__item">{f}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// ── Main Component ────────────────────────────────────────
export default function SchoolView({ user }) {
  const disabilityType = user?.disabilityType || 'none'
  const isVisual       = disabilityType === 'visual'
  const isHearing      = disabilityType === 'hearing'

  const [grade,        setGrade]        = useState(user?.className || '8')
  const [subject,      setSubject]      = useState(user?.subject || 'Science')
  const [contents,     setContents]     = useState([])
  const [selected,     setSelected]     = useState(null)   // topic stub from list
  const [fullContent,  setFullContent]  = useState(null)   // enriched content from /content/:id
  const [loading,      setLoading]      = useState(false)
  const [contentLoading, setContentLoading] = useState(false)
  const [simplified,   setSimplified]   = useState('')
  const [simplifying,  setSimplifying]  = useState(false)
  const [quiz,         setQuiz]         = useState([])
  const [quizLoading,  setQuizLoading]  = useState(false)
  const [quizAnswer,   setQuizAnswer]   = useState({})
  const [quizResult,   setQuizResult]   = useState({})
  const [aiAnswer,     setAiAnswer]     = useState('')
  const [aiLoading,    setAiLoading]    = useState(false)
  const [view,         setView]         = useState('list') // list | read | quiz | infographic
  // Infographic state
  const [infographics, setInfographics] = useState([])
  const [infoLoading,  setInfoLoading]  = useState(false)
  const [activeInfo,   setActiveInfo]   = useState(0)

  const grades      = Array.from({ length: 12 }, (_, i) => String(i + 1))
  const readerRef   = useRef(null)

  // ── Fetch topic list ───────────────────────────────────
  const fetchContent = async () => {
    setLoading(true)
    setSelected(null)
    setFullContent(null)
    setSimplified('')
    setView('list')
    try {
      const res = await axios.get(`${API}/api/education/school`, {
        params: { grade, subject },
        headers: headers()
      })
      // Backend returns { success, data: [...], total }
      setContents(res.data.data || res.data.results || [])
    } catch {
      setContents([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchContent() }, [grade, subject]) // eslint-disable-line

  // ── Select a topic → load full enriched content ────────
  const selectContent = async (item) => {
    setSelected(item)
    setSimplified('')
    setQuiz([])
    setAiAnswer('')
    setFullContent(null)
    setView('read')
    setContentLoading(true)

    try {
      const res = await axios.get(`${API}/api/education/school/content/${item.id}`, {
        params: { grade, subject, disabilityType },
        headers: headers()
      })
      // Backend returns { success, data: { title, content, quiz, ... } }
      const data = res.data.data
      setFullContent(data)

      // Pre-load quiz from the enriched response if available
      if (data?.quiz?.length > 0) setQuiz(data.quiz)

      // Visual impaired: auto-speak title + first 300 chars
      if (isVisual && data?.content) {
        const preview = `Opening lesson: ${data.title}. ${data.content.slice(0, 280)}`
        const utter = new SpeechSynthesisUtterance(preview)
        utter.rate = 0.9; utter.lang = 'en-IN'
        window.speechSynthesis.speak(utter)
      }
    } catch {
      // Fallback: use the stub description we already have
      setFullContent({ title: item.title, content: item.description || '', quiz: [] })
    } finally {
      setContentLoading(false)
      setTimeout(() => readerRef.current?.focus(), 150)
    }
  }

  // ── AI Simplify ────────────────────────────────────────
  const handleSimplify = async () => {
    const text = fullContent?.content || selected?.description || ''
    if (!text) return
    setSimplifying(true)
    try {
      const res = await axios.post(`${API}/api/education/simplify`,
        { text, disabilityType: disabilityType || 'cognitive' },
        { headers: headers() }
      )
      // Backend returns { success, data: '...' }
      setSimplified(res.data.data || res.data.simplified || '')
    } catch {
      setSimplified('')
    } finally {
      setSimplifying(false)
    }
  }

  // ── Generate / show Quiz ───────────────────────────────
  const handleQuiz = async () => {
    setView('quiz')
    setQuizAnswer({})
    setQuizResult({})

    // If quiz already loaded from enriched content, just show it
    if (quiz.length > 0) return

    setQuizLoading(true)
    try {
      const text = fullContent?.content || selected?.description || ''
      const res = await axios.post(`${API}/api/education/quiz`,
        { text, numQuestions: 3 },
        { headers: headers() }
      )
      // Backend returns { success, data: [...] }
      setQuiz(res.data.data || res.data.questions || [])
    } catch {
      setQuiz([])
    } finally {
      setQuizLoading(false)
    }
  }

  // ── Ask a question ─────────────────────────────────────
  const handleAsk = async (question) => {
    setAiLoading(true); setAiAnswer('')
    try {
      const res = await axios.post(`${API}/api/education/ask`,
        { question, context: fullContent?.content || selected?.description || '' },
        { headers: headers() }
      )
      // Backend returns { success, data: '...' }
      const answer = res.data.data || res.data.answer || 'No answer returned.'
      setAiAnswer(answer)
      const utter = new SpeechSynthesisUtterance(answer)
      utter.rate = 0.9; utter.lang = 'en-IN'
      window.speechSynthesis.speak(utter)
    } catch {
      setAiAnswer('Sorry, could not get an answer.')
    } finally {
      setAiLoading(false)
    }
  }

  // ── Quiz answer handler ────────────────────────────────
  const handleQuizAnswer = (qIdx, option) => {
    if (quizAnswer[qIdx]) return  // already answered
    setQuizAnswer(prev => ({ ...prev, [qIdx]: option }))
    const correct = quiz[qIdx]?.answer === option
    setQuizResult(prev  => ({ ...prev, [qIdx]: correct }))
    const feedback = correct
      ? 'Correct! Well done!'
      : `Wrong. The correct answer is ${quiz[qIdx]?.answer}: ${quiz[qIdx]?.options?.[quiz[qIdx]?.answer]}.`
    const utter = new SpeechSynthesisUtterance(feedback)
    utter.rate = 0.9; utter.lang = 'en-IN'
    window.speechSynthesis.speak(utter)
  }

  // ── Load infographic (hearing, Class 8 & 9) ───────────
  const loadInfographic = async () => {
    setInfoLoading(true); setActiveInfo(0)
    try {
      const res = await axios.get(`${API}/api/education/school/infographic`, {
        params: { grade, subject },
        headers: headers()
      })
      setInfographics(res.data.data || [])
      setView('infographic')
    } catch {
      setInfographics([])
      alert('Visual infographic is available for Class 8 & 9 only. Try switching your class.')
    } finally {
      setInfoLoading(false)
    }
  }

  // ── Display text ───────────────────────────────────────
  const displayText = simplified || fullContent?.content || selected?.description || ''

  // ── Infographic available? ─────────────────────────────
  const canInfographic = isHearing && ['8', '9'].includes(String(grade))

  // ─────────────────────────────────────────────────────
  return (
    <div className={`school-wrap ${isVisual ? 'school-wrap--visual' : ''} ${isHearing ? 'school-wrap--hearing' : ''}`}>

      {/* ── Filters ── */}
      <div className="school-filters">
        <div className="school-filter-group">
          <label className="school-filter-label" htmlFor="sw-grade">Grade</label>
          <select
            id="sw-grade"
            className="school-select"
            value={grade}
            onChange={e => setGrade(e.target.value)}
          >
            {grades.map(g => <option key={g} value={g}>Class {g}</option>)}
          </select>
        </div>

        <div className="school-filter-group">
          <label className="school-filter-label" htmlFor="sw-subject">Subject</label>
          <select
            id="sw-subject"
            className="school-select"
            value={subject}
            onChange={e => setSubject(e.target.value)}
          >
            {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <button className="school-fetch-btn" onClick={fetchContent} disabled={loading} aria-label="Search topics">
          <FaSearch /> {loading ? 'Loading…' : 'Search'}
        </button>

        {/* Infographic button — hearing impaired, Class 8 or 9 only */}
        {canInfographic && (
          <button
            className="school-infographic-btn"
            onClick={loadInfographic}
            disabled={infoLoading}
            aria-label="Open visual infographic"
          >
            <FaImages /> {infoLoading ? 'Loading…' : 'Visual Guide'}
          </button>
        )}
      </div>

      {/* ── ACCESSIBILITY BANNER ── */}
      {isVisual && (
        <div className="access-banner access-banner--visual" role="status">
          🎧 Audio mode active — content will be read aloud automatically
        </div>
      )}
      {isHearing && (
        <div className="access-banner access-banner--hearing" role="status">
          👁️ Visual mode active — infographic guides available for Class 8 & 9
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          VIEW: TOPIC LIST
      ══════════════════════════════════════════════════ */}
      {view === 'list' && (
        <div className="school-list">
          {loading && (
            <div className="school-loading" aria-live="polite">
              <div className="school-spinner" aria-hidden="true" />
              <p>Fetching study material…</p>
            </div>
          )}

          {!loading && contents.length === 0 && (
            <div className="school-empty">
              <p>📚 No content found. Try a different grade or subject.</p>
            </div>
          )}

          {!loading && contents.map((item, i) => (
            <button
              key={item.id}
              className="school-content-card"
              onClick={() => selectContent(item)}
              aria-label={`Topic ${i + 1}: ${item.title}. ${item.description?.slice(0, 80)}`}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="school-card-icon" aria-hidden="true">
                <FaBookOpen />
              </div>
              <div className="school-card-info">
                <h3 className="school-card-title">{item.title}</h3>
                <p className="school-card-desc">
                  {item.description?.slice(0, 100)}{item.description?.length > 100 ? '…' : ''}
                </p>
                <div className="school-card-tags">
                  <span className="school-tag">{item.grade}</span>
                  <span className="school-tag">{item.subject}</span>
                  {item.type && <span className="school-tag">{item.type}</span>}
                </div>
              </div>
              <span className="school-card-arrow" aria-hidden="true">
                {isVisual ? '🎧' : '›'}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          VIEW: READ
      ══════════════════════════════════════════════════ */}
      {view === 'read' && selected && (
        <div className="school-reader" ref={readerRef} tabIndex={-1} aria-label={`Lesson: ${selected.title}`}>
          <button className="school-back-btn" onClick={() => { setView('list'); window.speechSynthesis.cancel() }}>
            <FaArrowLeft /> Back
          </button>

          <h2 className="school-reader-title">
            {fullContent?.title || selected.title}
          </h2>

          <div className="school-reader-tags">
            <span className="school-tag">{selected.grade}</span>
            <span className="school-tag">{selected.subject}</span>
            {fullContent?.generatedBy === 'gemini' && (
              <span className="school-tag school-tag--ai" title="Content enriched by Gemini AI">✨ AI Enhanced</span>
            )}
          </div>

          {/* Loading full content */}
          {contentLoading && (
            <div className="school-loading school-loading--inline" aria-live="polite">
              <div className="school-spinner" aria-hidden="true" />
              <p>{isVisual ? 'Preparing audio content…' : 'Loading full lesson…'}</p>
            </div>
          )}

          {/* TTS Reader — always shown for all users, critical for visual impaired */}
          {!contentLoading && displayText && (
            <TTSReader text={displayText} />
          )}

          {/* Content body */}
          {!contentLoading && (
            <div className="school-content-box">
              {simplifying && (
                <p className="school-simplifying" aria-live="polite">🤖 Simplifying for you…</p>
              )}
              <RenderContent text={displayText} />
            </div>
          )}

          {/* Action buttons */}
          {!contentLoading && (
            <div className="school-actions">
              {!simplified && (
                <button
                  className="school-action-btn school-action-btn--simplify"
                  onClick={handleSimplify}
                  disabled={simplifying}
                  aria-label="Simplify this content"
                >
                  <FaBrain /> {simplifying ? 'Simplifying…' : 'Simplify'}
                </button>
              )}
              {simplified && (
                <button
                  className="school-action-btn school-action-btn--reset"
                  onClick={() => setSimplified('')}
                  aria-label="Show original content"
                >
                  Show Original
                </button>
              )}
              <button
                className="school-action-btn school-action-btn--quiz"
                onClick={handleQuiz}
                aria-label="Take a quiz on this topic"
              >
                <FaQuestionCircle /> Take Quiz
              </button>
            </div>
          )}

          {/* Ask a question — STT + typed */}
          {!contentLoading && (
            <div className="school-ask-wrap">
              <STTSearch
                onResult={handleAsk}
                placeholder="Ask a question about this topic…"
                label="🎙️ Ask a Question"
              />
              {aiLoading && (
                <p className="school-ai-loading" aria-live="polite">🤖 Thinking…</p>
              )}
              {aiAnswer && (
                <div className="school-ai-answer" role="status" aria-live="polite">
                  <p className="school-ai-label">🤖 Answer:</p>
                  <p className="school-ai-text">{aiAnswer}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          VIEW: QUIZ
      ══════════════════════════════════════════════════ */}
      {view === 'quiz' && (
        <div className="school-quiz">
          <button className="school-back-btn" onClick={() => setView('read')}>
            <FaArrowLeft /> Back to Reading
          </button>
          <h2 className="school-quiz-title">📝 Quiz — {fullContent?.title || selected?.title}</h2>

          {quizLoading && (
            <div className="school-loading" aria-live="polite">
              <div className="school-spinner" aria-hidden="true" />
              <p>Generating quiz…</p>
            </div>
          )}

          {!quizLoading && quiz.length === 0 && (
            <p className="school-empty">Could not generate quiz. Please go back and try again.</p>
          )}

          {!quizLoading && quiz.map((q, idx) => (
            <div key={idx} className="school-quiz-card" aria-label={`Question ${idx + 1}`}>
              <p className="school-quiz-q">
                <span aria-hidden="true">{idx + 1}. </span>{q.question}
              </p>
              <div className="school-quiz-options" role="group" aria-label="Options">
                {Object.entries(q.options || {}).map(([key, val]) => {
                  const chosen  = quizAnswer[idx] === key
                  const correct = quizResult[idx] !== undefined && key === q.answer
                  const wrong   = chosen && quizResult[idx] === false
                  return (
                    <button
                      key={key}
                      className={[
                        'school-quiz-opt',
                        chosen  ? 'school-quiz-chosen'  : '',
                        correct ? 'school-quiz-correct' : '',
                        wrong   ? 'school-quiz-wrong'   : '',
                      ].join(' ')}
                      onClick={() => handleQuizAnswer(idx, key)}
                      disabled={!!quizAnswer[idx]}
                      aria-pressed={chosen}
                      aria-label={`Option ${key}: ${val}`}
                    >
                      <span className="school-quiz-key">{key}</span>
                      <span>{val}</span>
                    </button>
                  )
                })}
              </div>
              {quizResult[idx] !== undefined && (
                <p
                  className={`school-quiz-feedback ${quizResult[idx] ? 'correct' : 'wrong'}`}
                  role="alert"
                >
                  {quizResult[idx]
                    ? '✅ Correct! Well done!'
                    : `❌ Correct answer: ${q.answer} — ${q.options?.[q.answer]}`
                  }
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          VIEW: INFOGRAPHIC (Hearing impaired — Class 8 & 9)
      ══════════════════════════════════════════════════ */}
      {view === 'infographic' && (
        <div className="school-infographic" aria-label="Visual learning infographic">
          <button className="school-back-btn" onClick={() => setView('list')}>
            <FaArrowLeft /> Back
          </button>

          <div className="infographic-header">
            <h2 className="infographic-header__title">
              🖼️ Visual Guide — Class {grade} {subject}
            </h2>
            <p className="infographic-header__sub">Tap a topic card to explore its concepts step by step</p>
          </div>

          {infoLoading && (
            <div className="school-loading" aria-live="polite">
              <div className="school-spinner" aria-hidden="true" />
              <p>Loading visual guide…</p>
            </div>
          )}

          {!infoLoading && infographics.length > 0 && (
            <>
              {/* Topic pill selector */}
              <div className="infographic-pills" role="list" aria-label="Topics">
                {infographics.map((info, i) => (
                  <button
                    key={i}
                    className={`infographic-pill ${activeInfo === i ? 'infographic-pill--active' : ''}`}
                    style={{ '--ic': info.color }}
                    onClick={() => setActiveInfo(i)}
                    aria-label={`Topic: ${info.topic}`}
                    aria-pressed={activeInfo === i}
                  >
                    <span aria-hidden="true">{info.emoji}</span>
                    <span>{info.topic}</span>
                  </button>
                ))}
              </div>

              {/* Active topic detail */}
              <InfographicDetail info={infographics[activeInfo]} key={activeInfo} />

              {/* Prev / Next navigation */}
              <div className="infographic-nav" aria-label="Navigate topics">
                <button
                  className="infographic-nav__btn"
                  onClick={() => setActiveInfo(i => Math.max(0, i - 1))}
                  disabled={activeInfo === 0}
                  aria-label="Previous topic"
                >
                  <FaChevronLeft /> Prev
                </button>
                <span className="infographic-nav__count" aria-label={`Topic ${activeInfo + 1} of ${infographics.length}`}>
                  {activeInfo + 1} / {infographics.length}
                </span>
                <button
                  className="infographic-nav__btn"
                  onClick={() => setActiveInfo(i => Math.min(infographics.length - 1, i + 1))}
                  disabled={activeInfo === infographics.length - 1}
                  aria-label="Next topic"
                >
                  Next <FaChevronRight />
                </button>
              </div>
            </>
          )}

          {!infoLoading && infographics.length === 0 && (
            <p className="school-empty">No visual guide available. Try Class 8 or 9.</p>
          )}
        </div>
      )}

    </div>
  )
}