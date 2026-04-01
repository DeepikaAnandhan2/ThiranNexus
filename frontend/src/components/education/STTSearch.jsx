// ─── STT Search Component ─────────────────────────────────
// Voice-based search + ask questions
// Used by: Education.jsx, SchoolView, CollegeView

import { useState, useCallback } from 'react'
import './STTSearch.css'

export default function STTSearch({ onResult, placeholder = 'Ask a question or search...', label = '🎙️ Voice Search' }) {
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error,      setError]      = useState('')

  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { setError('Speech recognition not supported in this browser.'); return }

    setError(''); setTranscript(''); setListening(true)

    const rec        = new SR()
    rec.lang         = 'en-US'
    rec.continuous   = false
    rec.interimResults= false

    rec.onresult = (e) => {
      const text = e.results[0][0].transcript
      setTranscript(text)
      setListening(false)
      if (onResult) onResult(text)
    }

    rec.onerror = (e) => {
      setError('Could not hear you. Please try again.')
      setListening(false)
    }

    rec.onend = () => setListening(false)

    rec.start()
  }, [onResult])

  const handleType = (e) => {
    setTranscript(e.target.value)
  }

  const handleSubmit = () => {
    if (transcript.trim() && onResult) onResult(transcript.trim())
  }

  return (
    <div className="stt-wrap" aria-label="Voice search">
      <p className="stt-label">{label}</p>

      <div className="stt-row">
        <input
          type="text"
          className="stt-input"
          placeholder={placeholder}
          value={transcript}
          onChange={handleType}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          aria-label="Search input"
        />
        <button
          className={`stt-mic-btn ${listening ? 'stt-listening' : ''}`}
          onClick={startListening}
          disabled={listening}
          aria-label={listening ? 'Listening...' : 'Start voice input'}
        >
          {listening ? '⏳' : '🎙️'}
        </button>
        <button
          className="stt-search-btn"
          onClick={handleSubmit}
          disabled={!transcript.trim()}
          aria-label="Submit search"
        >
          Search
        </button>
      </div>

      {listening && (
        <div className="stt-status" aria-live="assertive">
          <span className="stt-pulse" />
          Listening… speak now
        </div>
      )}

      {error && <p className="stt-error">⚠️ {error}</p>}
    </div>
  )
}