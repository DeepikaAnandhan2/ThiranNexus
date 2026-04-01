// ─── College View Component ───────────────────────────────
// YouTube lectures + Transcript + Sign Language + STT search
// Used by: Education.jsx (when educationLevel === 'college')

import { useState } from 'react'
import axios from 'axios'
import TTSReader from './TTSReader'
import STTSearch from './STTSearch'
import './CollegeView.css'

const API    = 'http://localhost:5000'
const token = () => localStorage.getItem('token')
const headers= () => ({ Authorization: `Bearer ${token()}` })

export default function CollegeView({ user }) {
  const [videos,      setVideos]      = useState([])
  const [islVideos,   setIslVideos]   = useState([])
  const [selected,    setSelected]    = useState(null)
  const [loading,     setLoading]     = useState(false)
  const [islLoading,  setIslLoading]  = useState(false)
  const [showISL,     setShowISL]     = useState(false)
  const [showTranscript, setShowTranscript] = useState(false)
  const [transcript,  setTranscript]  = useState('')
  const [aiAnswer,    setAiAnswer]    = useState('')
  const [aiLoading,   setAiLoading]   = useState(false)
  const [lastQuery,   setLastQuery]   = useState('')

  // ── Search YouTube ─────────────────────────────────────
  const handleSearch = async (query) => {
    if (!query.trim()) return
    setLoading(true); setVideos([]); setSelected(null)
    setLastQuery(query); setShowISL(false); setShowTranscript(false)
    try {
      const res = await axios.get(`${API}/api/education/college`, {
        params: { query, captions: 'true' }, headers: headers()
      })
      setVideos(res.data.results || [])
    } catch { setVideos([]) }
    finally  { setLoading(false) }
  }

  // ── Select video ───────────────────────────────────────
  const selectVideo = (video) => {
    setSelected(video); setAiAnswer(''); setTranscript('')
    setShowISL(false); setShowTranscript(false)
    // Announce to screen reader
    const utter = new SpeechSynthesisUtterance(`Opening video: ${video.title}`)
    utter.rate = 0.9; window.speechSynthesis.speak(utter)
  }

  // ── Fetch ISL videos ───────────────────────────────────
  const handleISL = async () => {
    setShowISL(true); setIslLoading(true)
    try {
      const res = await axios.get(`${API}/api/education/isl`, {
        params: { topic: lastQuery || selected?.title || 'education' },
        headers: headers()
      })
      setIslVideos(res.data.results || [])
    } catch { setIslVideos([]) }
    finally  { setIslLoading(false) }
  }

  // ── Generate transcript description ───────────────────
  const handleTranscript = async () => {
    setShowTranscript(true)
    if (!selected) return
    setTranscript(`Transcript for: "${selected.title}"\n\n${selected.description}\n\nNote: Full transcript available with closed captions on YouTube. Click CC button in the video player to enable subtitles.`)
  }

  // ── Ask by voice ───────────────────────────────────────
  const handleAsk = async (question) => {
    setAiLoading(true); setAiAnswer('')
    try {
      const res = await axios.post(`${API}/api/education/ask`,
        { question, context: `${selected?.title}: ${selected?.description}` },
        { headers: headers() }
      )
      setAiAnswer(res.data.answer)
      const utter = new SpeechSynthesisUtterance(res.data.answer)
      utter.rate = 0.9; window.speechSynthesis.speak(utter)
    } catch { setAiAnswer('Sorry, could not answer. Try again.') }
    finally  { setAiLoading(false) }
  }

  return (
    <div className="college-wrap">

      {/* ── Search ── */}
      <div className="college-search-wrap">
        <STTSearch
          onResult={handleSearch}
          placeholder="Search topic (e.g. Data Structures, Organic Chemistry…)"
          label="🎙️ Search College Topics"
        />
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div className="college-loading">
          <div className="college-spinner" />
          <p>Searching YouTube…</p>
        </div>
      )}

      {/* ── Video List ── */}
      {!selected && !loading && videos.length > 0 && (
        <div className="college-video-list">
          <p className="college-results-label">
            📹 {videos.length} videos found for "{lastQuery}"
          </p>
          {videos.map(video => (
            <button
              key={video.videoId}
              className="college-video-card"
              onClick={() => selectVideo(video)}
              aria-label={`Play ${video.title} by ${video.channel}`}
            >
              {video.thumbnail && (
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="college-thumb"
                />
              )}
              {!video.thumbnail && (
                <div className="college-thumb-placeholder">▶</div>
              )}
              <div className="college-video-info">
                <h3 className="college-video-title">{video.title}</h3>
                <p className="college-video-channel">📺 {video.channel}</p>
                <p className="college-video-desc">{video.description?.slice(0, 80)}…</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* ── Video Player ── */}
      {selected && (
        <div className="college-player-wrap">
          <button className="college-back-btn" onClick={() => setSelected(null)}>← Back to Results</button>

          <h2 className="college-player-title">{selected.title}</h2>
          <p className="college-player-channel">📺 {selected.channel}</p>

          {/* YouTube embed with CC enabled */}
          <div className="college-embed-wrap">
            <iframe
              className="college-embed"
              src={selected.embedUrl}
              title={selected.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          {/* Action buttons */}
          <div className="college-actions">
            <button
              className={`college-action-btn ${showTranscript ? 'active' : ''}`}
              onClick={handleTranscript}
            >
              📄 Transcript
            </button>
            <button
              className={`college-action-btn ${showISL ? 'active' : ''}`}
              onClick={handleISL}
            >
              🤟 Sign Language
            </button>
            <a
              className="college-action-btn"
              href={selected.watchUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Open in YouTube"
            >
              ▶ YouTube
            </a>
          </div>

          {/* Transcript panel */}
          {showTranscript && transcript && (
            <div className="college-transcript">
              <div className="college-panel-header">
                <h3 className="college-panel-title">📄 Transcript / Subtitles</h3>
                <button className="college-panel-close" onClick={() => setShowTranscript(false)}>✕</button>
              </div>
              <TTSReader text={transcript} />
              <pre className="college-transcript-text">{transcript}</pre>
            </div>
          )}

          {/* ISL panel */}
          {showISL && (
            <div className="college-isl-panel">
              <div className="college-panel-header">
                <h3 className="college-panel-title">🤟 Indian Sign Language Videos</h3>
                <button className="college-panel-close" onClick={() => setShowISL(false)}>✕</button>
              </div>
              {islLoading && (
                <div className="college-loading"><div className="college-spinner" /><p>Finding ISL videos…</p></div>
              )}
              <div className="college-isl-grid">
                {islVideos.map(v => (
                  <div key={v.videoId} className="college-isl-card">
                    <iframe
                      className="college-isl-embed"
                      src={v.embedUrl}
                      title={v.title}
                      allowFullScreen
                    />
                    <p className="college-isl-title">{v.title}</p>
                  </div>
                ))}
                {!islLoading && islVideos.length === 0 && (
                  <p className="college-isl-empty">No ISL videos found for this topic.</p>
                )}
              </div>
            </div>
          )}

          {/* Ask question */}
          <div className="college-ask-wrap">
            <STTSearch
              onResult={handleAsk}
              placeholder="Ask about this video topic…"
              label="🎙️ Ask a Question"
            />
            {aiLoading && <p className="college-ai-loading">🤖 Thinking…</p>}
            {aiAnswer && (
              <div className="college-ai-answer">
                <p className="college-ai-label">🤖 Answer:</p>
                <p className="college-ai-text">{aiAnswer}</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* Empty state */}
      {!loading && videos.length === 0 && !selected && (
        <div className="college-empty">
          <div className="college-empty-icon">🎓</div>
          <p>Search for any college topic above</p>
          <p className="college-empty-sub">Data Structures • Organic Chemistry • Calculus • History…</p>
        </div>
      )}

    </div>
  )
}