// ─── SchoolView — HEARING IMPAIRED ENHANCED ───────────────
// Visual-first for hearing impaired:
//   → Videos from DIKSHA + YouTube shown FIRST
//   → ISL (Indian Sign Language) videos section
//   → Infographic visual cards
//   → Captions/subtitles always enabled
// Audio-first for visual impaired:
//   → TTS auto-reads content
//   → Large text, high contrast

import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import TTSReader  from './TTSReader'
import STTSearch  from './STTSearch'
import './SchoolView.css'
import {
  FaSearch, FaBookOpen, FaBrain, FaArrowLeft,
  FaQuestionCircle, FaImages, FaChevronLeft,
  FaChevronRight, FaPlay, FaHandPaper, FaFilm,
  FaCheckCircle, FaTimesCircle,
} from 'react-icons/fa'

const API     = ''
const token   = () => localStorage.getItem('tn_token')
const headers = () => token() ? { Authorization: `Bearer ${token()}` } : {}

const SUBJECTS = [
  'Tamil','Mathematics','Science','English','Hindi',
  'Social Science','Physics','Chemistry','Biology',
  'History','Geography','Computer Science',
]

// ── Markdown renderer ─────────────────────────────────────
function RenderContent({ text }) {
  if (!text) return null
  return (
    <div className="rendered-content">
      {text.split('\n').map((line, i) => {
        if (!line.trim()) return <br key={i} />
        if (line.startsWith('# '))   return <h2 key={i} className="rc-h2">{line.slice(2)}</h2>
        if (line.startsWith('## '))  return <h3 key={i} className="rc-h3">{line.slice(3)}</h3>
        if (line.startsWith('### ')) return <h4 key={i} className="rc-h4">{line.slice(4)}</h4>
        if (line.startsWith('- ') || line.startsWith('• ')) {
          return <li key={i} className="rc-li">{line.slice(2)}</li>
        }
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

// ── Video Player Card ─────────────────────────────────────
function VideoCard({ video, onPlay, isPlaying }) {
  return (
    <div className={`video-card ${isPlaying ? 'video-card--playing' : ''}`}>
      {isPlaying && video.embedUrl ? (
        <div className="video-embed-wrap">
          <iframe
            className="video-embed"
            src={video.embedUrl}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : video.embedUrl && video.embedUrl.endsWith('.mp4') ? (
        <div className="video-embed-wrap">
          <video className="video-embed" controls>
            <source src={video.embedUrl} type="video/mp4" />
          </video>
        </div>
      ) : (
        <div className="video-thumb-wrap" onClick={() => onPlay(video)}>
          {video.thumbnailUrl ? (
            <img src={video.thumbnailUrl} alt={video.title} className="video-thumb" />
          ) : (
            <div className="video-thumb-placeholder">
              <FaPlay className="video-thumb-icon" />
            </div>
          )}
          <div className="video-play-overlay">
            <div className="video-play-btn"><FaPlay /></div>
          </div>
          {video.source === 'diksha' && (
            <span className="video-badge video-badge--diksha">📚 DIKSHA</span>
          )}
          {video.source === 'youtube' && (
            <span className="video-badge video-badge--yt">▶ YouTube</span>
          )}
        </div>
      )}
      <div className="video-info">
        <h4 className="video-title">{video.title}</h4>
        {video.channel && <p className="video-channel">📺 {video.channel}</p>}
        {video.description && (
          <p className="video-desc">{video.description.slice(0, 80)}…</p>
        )}
        {video.videoUrl && !isPlaying && (
          <a href={video.videoUrl} target="_blank" rel="noreferrer" className="video-open-link">
            Open in new tab ↗
          </a>
        )}
      </div>
    </div>
  )
}

// ── Infographic Detail ────────────────────────────────────
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
          <div key={i} className="infographic-step">
            <div className="infographic-step__num">{i + 1}</div>
            <div className="infographic-step__icon">{step.icon}</div>
            <div className="infographic-step__body">
              <strong className="infographic-step__label">{step.label}</strong>
              <p className="infographic-step__detail">{step.detail}</p>
            </div>
          </div>
        ))}
      </div>
      {info.keyFacts?.length > 0 && (
        <div className="infographic-facts" style={{ borderColor: info.color }}>
          <h4 className="infographic-facts__title">⭐ Key Facts</h4>
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

  const [grade,          setGrade]          = useState(user?.className || '8')
  const [subject,        setSubject]        = useState(user?.subject  || 'Science')
  const [chapters,       setChapters]       = useState([])
  const [videos,         setVideos]         = useState([])
  const [islVideos,      setIslVideos]      = useState([])
  const [selected,       setSelected]       = useState(null)
  const [fullContent,    setFullContent]    = useState(null)
  const [loading,        setLoading]        = useState(false)
  const [contentLoading, setContentLoading] = useState(false)
  const [videoLoading,   setVideoLoading]   = useState(false)
  const [simplified,     setSimplified]     = useState('')
  const [simplifying,    setSimplifying]    = useState(false)
  const [quiz,           setQuiz]           = useState([])
  const [quizLoading,    setQuizLoading]    = useState(false)
  const [quizAnswer,     setQuizAnswer]     = useState({})
  const [quizResult,     setQuizResult]     = useState({})
  const [aiAnswer,       setAiAnswer]       = useState('')
  const [aiLoading,      setAiLoading]      = useState(false)
  const [infographics,   setInfographics]   = useState([])
  const [infoLoading,    setInfoLoading]    = useState(false)
  const [activeInfo,     setActiveInfo]     = useState(0)
  const [playingVideo,   setPlayingVideo]   = useState(null)
  const [view,           setView]           = useState('list') // list|read|quiz|infographic|videos|isl

  const grades    = Array.from({ length: 12 }, (_, i) => String(i + 1))
  const readerRef = useRef(null)

  // ── Fetch chapters + videos ────────────────────────────
  const fetchContent = async () => {
    setLoading(true)
    setSelected(null); setFullContent(null); setSimplified('')
    setVideos([]); setIslVideos([]); setView('list')
    try {
      const res = await axios.get(`${API}/api/education/school`, {
        params: { grade, subject },
        headers: headers(),
      })
      setChapters(res.data.chapters || res.data.results || [])
      setVideos(res.data.videos || [])
    } catch {
      setChapters([])
    } finally {
      setLoading(false)
    }

    // For hearing impaired: also fetch dedicated video + ISL content
    if (isHearing) {
      fetchVideosForHearing()
    }
  }

  useEffect(() => { fetchContent() }, [grade, subject]) // eslint-disable-line

  // ── Fetch videos (hearing impaired) ───────────────────
  const fetchVideosForHearing = async () => {
    setVideoLoading(true)
    try {
      const res = await axios.get(`${API}/api/education/school/videos`, {
        params: { grade, subject },
        headers: headers(),
      })
      setVideos(prev => {
        // Merge, deduplicate by id
        const all = [...(res.data.dikshaVideos || []), ...(res.data.ytVideos || []), ...prev]
        const seen = new Set()
        return all.filter(v => { if (seen.has(v.id)) return false; seen.add(v.id); return true })
      })
      setIslVideos(res.data.islVideos || [])
    } catch (err) {
      console.error('Video fetch error:', err.message)
    } finally {
      setVideoLoading(false)
    }
  }

  // ── Select chapter → load full content ────────────────
  const selectContent = async (item) => {
    setSelected(item); setSimplified(''); setQuiz([])
    setAiAnswer(''); setFullContent(null); setView('read')
    setContentLoading(true)
    try {
      const res = await axios.get(`${API}/api/education/school/content/${item.id}`, {
        params:  { grade, subject, disabilityType },
        headers: headers(),
      })
      const data = res.data.content || res.data.data
      setFullContent(data)
      if (data?.quiz?.length > 0) setQuiz(data.quiz)
      // Auto-speak for visual impaired
      if (isVisual && data?.content) {
        const utter = new SpeechSynthesisUtterance(
          `Opening lesson: ${data.title}. ${data.content.slice(0, 280)}`
        )
        utter.rate = 0.9; utter.lang = 'en-IN'
        window.speechSynthesis.speak(utter)
      }
    } catch {
      setFullContent({ title: item.title, content: item.description || '', quiz: [] })
    } finally {
      setContentLoading(false)
      setTimeout(() => readerRef.current?.focus(), 150)
    }
  }

  // ── Load infographic ───────────────────────────────────
  const loadInfographic = async () => {
    setInfoLoading(true); setActiveInfo(0)
    try {
      const res = await axios.get(`${API}/api/education/school/infographic`, {
        params: { grade, subject }, headers: headers(),
      })
      const data = res.data.data || []
      if (data.length === 0) {
        alert('Visual guide not available for this class/subject. Try Class 8 or 9 Science.')
        return
      }
      setInfographics(data)
      setView('infographic')
    } catch {
      alert('Could not load visual guide. Try again.')
    } finally {
      setInfoLoading(false)
    }
  }

  // ── Simplify ───────────────────────────────────────────
  const handleSimplify = async () => {
    const text = fullContent?.content || ''
    if (!text) return
    setSimplifying(true)
    try {
      const res = await axios.post(`${API}/api/education/simplify`,
        { text, disabilityType: disabilityType || 'cognitive' },
        { headers: headers() }
      )
      setSimplified(res.data.simplified || res.data.data || '')
    } catch { setSimplified('') }
    finally   { setSimplifying(false) }
  }

  // ── Quiz ───────────────────────────────────────────────
  const handleQuiz = async () => {
    setView('quiz'); setQuizAnswer({}); setQuizResult({})
    if (quiz.length > 0) return
    setQuizLoading(true)
    try {
      const text = fullContent?.content || ''
      const res  = await axios.post(`${API}/api/education/quiz`,
        { text, numQuestions: 3 }, { headers: headers() }
      )
      setQuiz(res.data.questions || res.data.data || [])
    } catch { setQuiz([]) }
    finally   { setQuizLoading(false) }
  }

  const handleQuizAnswer = (qIdx, option) => {
    if (quizAnswer[qIdx]) return
    setQuizAnswer(p => ({ ...p, [qIdx]: option }))
    const correct = quiz[qIdx]?.answer === option
    setQuizResult(p  => ({ ...p, [qIdx]: correct }))
    const msg = correct ? 'Correct! Well done!' : `Wrong. Correct answer is ${quiz[qIdx]?.answer}.`
    const u   = new SpeechSynthesisUtterance(msg)
    u.rate = 0.9; window.speechSynthesis.speak(u)
  }

  // ── Ask question ───────────────────────────────────────
  const handleAsk = async (question) => {
    setAiLoading(true); setAiAnswer('')
    try {
      const res = await axios.post(`${API}/api/education/ask`,
        { question, context: fullContent?.content || '' },
        { headers: headers() }
      )
      const answer = res.data.answer || res.data.data || 'No answer returned.'
      setAiAnswer(answer)
      const u = new SpeechSynthesisUtterance(answer)
      u.rate = 0.9; window.speechSynthesis.speak(u)
    } catch { setAiAnswer('Sorry, could not get an answer.') }
    finally   { setAiLoading(false) }
  }

  const displayText = simplified || fullContent?.content || selected?.description || ''

  return (
    <div className={`school-wrap ${isVisual ? 'school-wrap--visual' : ''} ${isHearing ? 'school-wrap--hearing' : ''}`}>

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
          <FaSearch /> {loading ? 'Loading…' : 'Search'}
        </button>

        {/* Visual guide button — hearing impaired */}
        {isHearing && (
          <button className="school-infographic-btn" onClick={loadInfographic} disabled={infoLoading}>
            <FaImages /> {infoLoading ? 'Loading…' : 'Visual Guide'}
          </button>
        )}

        {/* Videos tab button — hearing impaired */}
        {isHearing && videos.length > 0 && (
          <button className="school-video-btn" onClick={() => setView('videos')}>
            <FaFilm /> Videos ({videos.length})
          </button>
        )}

        {/* ISL videos button */}
        {isHearing && islVideos.length > 0 && (
          <button className="school-isl-btn" onClick={() => setView('isl')}>
            <FaHandPaper /> Sign Language
          </button>
        )}
      </div>

      {/* ── Accessibility banners ── */}
      {isVisual && (
        <div className="access-banner access-banner--visual" role="status">
          🎧 Audio mode — content will be read aloud automatically
        </div>
      )}
      {isHearing && (
        <div className="access-banner access-banner--hearing" role="status">
          👁️ Visual mode — videos, infographics and sign language available
        </div>
      )}

      {/* ══════════════ LIST VIEW ══════════════ */}
      {view === 'list' && (
        <div className="school-list">
          {loading && (
            <div className="school-loading">
              <div className="school-spinner" /><p>Loading study material…</p>
            </div>
          )}

          {/* Hearing: show videos first */}
          {isHearing && !loading && videos.length > 0 && (
            <div className="school-video-preview">
              <div className="school-section-header">
                <FaFilm className="school-section-icon" />
                <h3 className="school-section-title">📹 Video Lessons</h3>
                <button className="school-see-all-btn" onClick={() => setView('videos')}>
                  See all {videos.length} →
                </button>
              </div>
              <div className="school-video-row">
                {videos.slice(0, 3).map((v, i) => (
                  <VideoCard
                    key={v.id || i}
                    video={v}
                    onPlay={setPlayingVideo}
                    isPlaying={playingVideo?.id === v.id}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ISL preview for hearing impaired */}
          {isHearing && !loading && islVideos.length > 0 && (
            <div className="school-isl-preview">
              <div className="school-section-header">
                <FaHandPaper className="school-section-icon" style={{ color: '#8B5CF6' }} />
                <h3 className="school-section-title">🤟 Sign Language Videos</h3>
                <button className="school-see-all-btn" onClick={() => setView('isl')}>
                  See all →
                </button>
              </div>
              <div className="school-video-row">
                {islVideos.slice(0, 2).map((v, i) => (
                  <VideoCard
                    key={v.videoId || i}
                    video={{ ...v, id: v.videoId, embedUrl: v.embedUrl, thumbnailUrl: v.thumbnail }}
                    onPlay={setPlayingVideo}
                    isPlaying={playingVideo?.id === v.videoId}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Text chapters */}
          {!loading && chapters.length > 0 && (
            <div className="school-section-header">
              <FaBookOpen className="school-section-icon" />
              <h3 className="school-section-title">📖 Lessons</h3>
            </div>
          )}

          {!loading && chapters.length === 0 && videos.length === 0 && (
            <div className="school-empty">
              <p>📚 No content found. Try a different grade or subject.</p>
            </div>
          )}

          {!loading && chapters.map((item, i) => (
            <button
              key={item.id}
              className="school-content-card"
              onClick={() => selectContent(item)}
              aria-label={`Chapter ${item.chapter || i+1}: ${item.title}`}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="school-card-chapter" aria-hidden="true">
                {item.chapter || i + 1}
              </div>
              <div className="school-card-info">
                <h3 className="school-card-title">{item.title}</h3>
                <p className="school-card-desc">
                  {item.description?.slice(0, 100)}{item.description?.length > 100 ? '…' : ''}
                </p>
                <div className="school-card-tags">
                  <span className="school-tag">{item.grade}</span>
                  <span className="school-tag">{item.subject}</span>
                  {item.hasQuiz && <span className="school-tag school-tag--quiz">📝 Quiz</span>}
                </div>
              </div>
              <span className="school-card-arrow" aria-hidden="true">
                {isVisual ? '🎧' : '›'}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* ══════════════ VIDEOS VIEW ══════════════ */}
      {view === 'videos' && (
        <div className="school-videos-view">
          <button className="school-back-btn" onClick={() => setView('list')}>
            <FaArrowLeft /> Back
          </button>
          <h2 className="school-section-heading">📹 Video Lessons — Class {grade} {subject}</h2>

          {videoLoading && (
            <div className="school-loading">
              <div className="school-spinner" /><p>Loading videos from DIKSHA & YouTube…</p>
            </div>
          )}

          {videos.length === 0 && !videoLoading && (
            <div className="school-empty">
              <p>No videos found. Try a different class or subject.</p>
            </div>
          )}

          <div className="school-video-grid">
            {videos.map((v, i) => (
              <VideoCard
                key={v.id || i}
                video={v}
                onPlay={setPlayingVideo}
                isPlaying={playingVideo?.id === v.id}
              />
            ))}
          </div>
        </div>
      )}

      {/* ══════════════ ISL VIEW ══════════════ */}
      {view === 'isl' && (
        <div className="school-isl-view">
          <button className="school-back-btn" onClick={() => setView('list')}>
            <FaArrowLeft /> Back
          </button>
          <h2 className="school-section-heading">🤟 Sign Language Videos — {subject}</h2>
          <p className="school-isl-desc">Indian Sign Language (ISL) videos to help you learn visually</p>

          <div className="school-video-grid">
            {islVideos.map((v, i) => (
              <VideoCard
                key={v.videoId || i}
                video={{
                  id:           v.videoId,
                  title:        v.title,
                  thumbnailUrl: v.thumbnail,
                  embedUrl:     v.embedUrl,
                  videoUrl:     `https://www.youtube.com/watch?v=${v.videoId}`,
                  channel:      v.channel,
                  source:       'isl',
                }}
                onPlay={setPlayingVideo}
                isPlaying={playingVideo?.id === v.videoId}
              />
            ))}
          </div>

          {islVideos.length === 0 && (
            <div className="school-empty">
              <p>🤟 No ISL videos found for this topic. Try searching a different subject.</p>
            </div>
          )}
        </div>
      )}

      {/* ══════════════ READ VIEW ══════════════ */}
      {view === 'read' && selected && (
        <div className="school-reader" ref={readerRef} tabIndex={-1}>
          <button className="school-back-btn" onClick={() => { setView('list'); window.speechSynthesis.cancel() }}>
            <FaArrowLeft /> Back
          </button>

          <h2 className="school-reader-title">{fullContent?.title || selected.title}</h2>

          <div className="school-reader-tags">
            <span className="school-tag">{selected.grade}</span>
            <span className="school-tag">{selected.subject}</span>
            {fullContent?.generatedBy === 'gemini' && (
              <span className="school-tag school-tag--ai">✨ AI Enhanced</span>
            )}
          </div>

          {contentLoading && (
            <div className="school-loading school-loading--inline">
              <div className="school-spinner" />
              <p>{isVisual ? 'Preparing audio…' : 'Loading lesson…'}</p>
            </div>
          )}

          {/* TTS reader for all */}
          {!contentLoading && displayText && <TTSReader text={displayText} />}

          {/* Key points */}
          {!contentLoading && fullContent?.keyPoints?.length > 0 && (
            <div className="school-keypoints">
              <h4 className="school-keypoints-title">🔑 Key Points</h4>
              <ul className="school-keypoints-list">
                {fullContent.keyPoints.map((kp, i) => (
                  <li key={i} className="school-keypoint">{kp}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Content */}
          {!contentLoading && (
            <div className="school-content-box">
              {simplifying && <p className="school-simplifying">🤖 Simplifying…</p>}
              <RenderContent text={displayText} />
            </div>
          )}

          {/* Actions */}
          {!contentLoading && (
            <div className="school-actions">
              {!simplified && (
                <button className="school-action-btn school-action-btn--simplify"
                  onClick={handleSimplify} disabled={simplifying}>
                  <FaBrain /> {simplifying ? 'Simplifying…' : 'Simplify Text'}
                </button>
              )}
              {simplified && (
                <button className="school-action-btn school-action-btn--reset"
                  onClick={() => setSimplified('')}>
                  Show Original
                </button>
              )}
              <button className="school-action-btn school-action-btn--quiz" onClick={handleQuiz}>
                <FaQuestionCircle /> Take Quiz
              </button>
            </div>
          )}

          {/* Ask question */}
          {!contentLoading && (
            <div className="school-ask-wrap">
              <STTSearch
                onResult={handleAsk}
                placeholder="Ask a question about this topic…"
                label="🎙️ Ask a Question"
              />
              {aiLoading && <p className="school-ai-loading">🤖 Thinking…</p>}
              {aiAnswer && (
                <div className="school-ai-answer" role="status">
                  <p className="school-ai-label">🤖 Answer:</p>
                  <p className="school-ai-text">{aiAnswer}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ══════════════ QUIZ VIEW ══════════════ */}
      {view === 'quiz' && (
        <div className="school-quiz">
          <button className="school-back-btn" onClick={() => setView('read')}>
            <FaArrowLeft /> Back to Reading
          </button>
          <h2 className="school-quiz-title">📝 Quiz — {fullContent?.title || selected?.title}</h2>

          {quizLoading && (
            <div className="school-loading"><div className="school-spinner" /><p>Generating quiz…</p></div>
          )}

          {!quizLoading && quiz.map((q, idx) => (
            <div key={idx} className="school-quiz-card">
              <p className="school-quiz-q">{idx + 1}. {q.question}</p>
              <div className="school-quiz-options">
                {Object.entries(q.options || {}).map(([key, val]) => {
                  const chosen  = quizAnswer[idx] === key
                  const correct = quizResult[idx] !== undefined && key === q.answer
                  const wrong   = chosen && quizResult[idx] === false
                  return (
                    <button
                      key={key}
                      className={`school-quiz-opt ${chosen ? 'school-quiz-chosen' : ''} ${correct ? 'school-quiz-correct' : ''} ${wrong ? 'school-quiz-wrong' : ''}`}
                      onClick={() => handleQuizAnswer(idx, key)}
                      disabled={!!quizAnswer[idx]}
                    >
                      <span className="school-quiz-key">{key}</span> {val}
                      {correct && <FaCheckCircle className="quiz-icon-correct" />}
                      {wrong   && <FaTimesCircle className="quiz-icon-wrong"   />}
                    </button>
                  )
                })}
              </div>
              {quizResult[idx] !== undefined && (
                <p className={`school-quiz-feedback ${quizResult[idx] ? 'correct' : 'wrong'}`}>
                  {quizResult[idx] ? '✅ Correct!' : `❌ Answer: ${q.answer} — ${q.options?.[q.answer]}`}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ══════════════ INFOGRAPHIC VIEW ══════════════ */}
      {view === 'infographic' && (
        <div className="school-infographic">
          <button className="school-back-btn" onClick={() => setView('list')}>
            <FaArrowLeft /> Back
          </button>
          <h2 className="school-section-heading">🖼️ Visual Guide — Class {grade} {subject}</h2>

          {infographics.length > 0 && (
            <>
              {/* Topic selector */}
              <div className="infographic-pills">
                {infographics.map((info, i) => (
                  <button
                    key={i}
                    className={`infographic-pill ${activeInfo === i ? 'infographic-pill--active' : ''}`}
                    style={{ '--ic': info.color }}
                    onClick={() => setActiveInfo(i)}
                  >
                    <span>{info.emoji}</span> {info.topic}
                  </button>
                ))}
              </div>

              <InfographicDetail info={infographics[activeInfo]} key={activeInfo} />

              {/* Navigation */}
              <div className="infographic-nav">
                <button className="infographic-nav__btn"
                  onClick={() => setActiveInfo(i => Math.max(0, i - 1))}
                  disabled={activeInfo === 0}>
                  <FaChevronLeft /> Prev
                </button>
                <span className="infographic-nav__count">{activeInfo + 1} / {infographics.length}</span>
                <button className="infographic-nav__btn"
                  onClick={() => setActiveInfo(i => Math.min(infographics.length - 1, i + 1))}
                  disabled={activeInfo === infographics.length - 1}>
                  Next <FaChevronRight />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}