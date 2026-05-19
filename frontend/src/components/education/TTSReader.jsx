import { useState, useCallback, useRef, useEffect } from 'react'
import './TTSReader.css'
import { FaPlay, FaPause, FaStop } from 'react-icons/fa'

export default function TTSReader({ text }) {
  const [playing, setPlaying] = useState(false)
  const [paused, setPaused] = useState(false)
  const [rate, setRate] = useState(0.9)
  const [voices, setVoices] = useState([])
  const [selectedVoice, setSelectedVoice] = useState(null)

  const utterRef = useRef(null)

  // 🔊 Load voices properly (important fix)
 useEffect(() => {
  const loadVoices = () => {
    const allVoices = window.speechSynthesis.getVoices()

    if (allVoices.length > 0) {
      setVoices(allVoices)

      // Better fallback logic
      const female = allVoices.find(v =>
        v.name.toLowerCase().includes('female') ||
        v.name.toLowerCase().includes('zira')
      )

      const male = allVoices.find(v =>
        v.name.toLowerCase().includes('male') ||
        v.name.toLowerCase().includes('david')
      )

      setSelectedVoice(female || male || allVoices[0])
    }
  }

  loadVoices()

  window.speechSynthesis.onvoiceschanged = loadVoices

  return () => {
    window.speechSynthesis.onvoiceschanged = null
  }
}, [])

const speak = useCallback(() => {
  if (!window.speechSynthesis) return

  window.speechSynthesis.cancel()

  const utter = new SpeechSynthesisUtterance(text)

  // 🔥 Detect Tamil text
  const isTamil = /[\u0B80-\u0BFF]/.test(text)

  // ✅ Set language properly
  utter.lang = isTamil ? 'ta-IN' : 'en-US'

  utter.rate = rate
  utter.pitch = 1

  // 🔥 Pick correct voice based on language
  if (isTamil) {
    const tamilVoice = voices.find(v => v.lang.includes('ta'))
    if (tamilVoice) {
      utter.voice = tamilVoice
    }
  } else {
    utter.voice = selectedVoice
  }

  utter.onstart = () => {
    setPlaying(true)
    setPaused(false)
  }

  utter.onend = () => {
    setPlaying(false)
    setPaused(false)
  }

  utter.onerror = () => {
    setPlaying(false)
    setPaused(false)
  }

  utterRef.current = utter
  window.speechSynthesis.speak(utter)
}, [text, rate, selectedVoice, voices])


  const handlePlay = () => {
    if (paused) {
      window.speechSynthesis.resume()
      setPaused(false)
      setPlaying(true)
    } else {
      speak()
    }
  }

  const handlePause = () => {
    window.speechSynthesis.pause()
    setPaused(true)
    setPlaying(false)
  }

  const handleStop = () => {
    window.speechSynthesis.cancel()
    setPlaying(false)
    setPaused(false)
  }

  return (
    <div className="tts-wrap">
      <div className="tts-label">🔊 Read Aloud</div>

      <div className="tts-controls">

        {!playing ? (
          <button className="tts-btn tts-play" onClick={handlePlay}>
            <FaPlay /> Play
          </button>
        ) : (
          <button className="tts-btn tts-pause" onClick={handlePause}>
            <FaPause /> Pause
          </button>
        )}

        <button className="tts-btn tts-stop" onClick={handleStop}>
          <FaStop /> Stop
        </button>

        {/* 🔥 Voice Selection */}
        
        <select
          className="tts-voice-select"
          value={selectedVoice?.name || ''}
          onChange={(e) => {
            const v = voices.find(v => v.name === e.target.value)
            setSelectedVoice(v)
          }}
        >
          {voices.map(v => (
            <option key={v.name} value={v.name}>
              {v.name}
            </option>
          ))}
        </select>

        {/* Speed */}
        <div className="tts-speed">
          {[0.7, 0.9, 1.1, 1.3].map(r => (
            <button
              key={r}
              className={rate === r ? 'tts-speed-active' : ''}
              onClick={() => setRate(r)}
            >
              {r === 0.7 ? 'Slow' : r === 0.9 ? 'Normal' : r === 1.1 ? 'Fast' : 'Faster'}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}