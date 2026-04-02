// ─── TTS Reader Component ─────────────────────────────────
// Reads any text content aloud with controls
// Used by: SchoolView, CollegeView

import { useState, useCallback, useRef } from 'react'
import './TTSReader.css'
import { FaPlay, FaPause, FaStop } from 'react-icons/fa'

export default function TTSReader({ text, autoPlay = false }) {
  const [playing,  setPlaying]  = useState(false)
  const [paused,   setPaused]   = useState(false)
  const [rate,     setRate]     = useState(0.9)
  const utterRef = useRef(null)

  const speak = useCallback((textToRead) => {
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()

    const utter   = new SpeechSynthesisUtterance(textToRead)
    utter.rate    = rate
    utter.lang    = 'en-US'
    utter.pitch   = 1

    utter.onstart = () => { setPlaying(true); setPaused(false) }
    utter.onend   = () => { setPlaying(false); setPaused(false) }
    utter.onerror = () => { setPlaying(false); setPaused(false) }

    utterRef.current = utter
    window.speechSynthesis.speak(utter)
  }, [rate])

  const handlePlay = () => {
    if (paused) {
      window.speechSynthesis.resume()
      setPaused(false); setPlaying(true)
    } else {
      speak(text)
    }
  }

  const handlePause = () => {
    window.speechSynthesis.pause()
    setPaused(true); setPlaying(false)
  }

  const handleStop = () => {
    window.speechSynthesis.cancel()
    setPlaying(false); setPaused(false)
  }

  return (
    <div className="tts-wrap" aria-label="Text to Speech controls">
      <div className="tts-label">🔊 Read Aloud</div>

      <div className="tts-controls">
        {!playing ? (
          <button
            className="tts-btn tts-play"
            onClick={handlePlay}
            aria-label={paused ? 'Resume reading' : 'Start reading'}
          >
            <FaPlay /> Play
          </button>
        ) : (
          <button
            className="tts-btn tts-pause"
            onClick={handlePause}
            aria-label="Pause reading"
          >
             <FaPause /> Pause
          </button>
        )}

        <button
          className="tts-btn tts-stop"
          onClick={handleStop}
          disabled={!playing && !paused}
          aria-label="Stop reading"
        >
            <FaStop /> Stop


        </button>

        {/* Speed control */}
        <div className="tts-speed" aria-label="Reading speed">
          <span className="tts-speed-label">Speed</span>
          {[0.7, 0.9, 1.1, 1.3].map(r => (
            <button
              key={r}
              className={`tts-speed-btn ${rate === r ? 'tts-speed-active' : ''}`}
              onClick={() => setRate(r)}
              aria-pressed={rate === r}
            >
              {r === 0.7 ? 'Slow' : r === 0.9 ? 'Normal' : r === 1.1 ? 'Fast' : 'Faster'}
            </button>
          ))}
        </div>
      </div>

      {playing && (
        <div className="tts-playing-indicator" aria-label="Currently reading">
          <span className="tts-wave" />
          <span className="tts-wave" />
          <span className="tts-wave" />
          <span>Reading…</span>
        </div>
      )}
    </div>
  )
}