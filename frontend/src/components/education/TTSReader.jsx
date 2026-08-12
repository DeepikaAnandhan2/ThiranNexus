import { useState, useCallback, useRef, useEffect } from 'react'
import './TTSReader.css'
import { FaPlay, FaPause, FaStop } from 'react-icons/fa'

function splitText(text) {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const chunks = [];
  sentences.forEach(s => {
    const trimmed = s.trim();
    if (trimmed) chunks.push(trimmed);
  });
  return chunks;
}

export default function TTSReader({ text }) {
  const [playing, setPlaying] = useState(false)
  const [paused, setPaused] = useState(false)
  const [rate, setRate] = useState(0.9)
  const [voices, setVoices] = useState([])
  const [selectedVoice, setSelectedVoice] = useState(null)

  const chunkIndexRef = useRef(0)
  const chunksRef = useRef([])

  // Load voices properly
  useEffect(() => {
    const loadVoices = () => {
      const allVoices = window.speechSynthesis.getVoices()
      if (allVoices.length > 0) {
        setVoices(allVoices)
        const female = allVoices.find(v => v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('zira'))
        const male = allVoices.find(v => v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('david'))
        setSelectedVoice(female || male || allVoices[0])
      }
    }
    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices
    return () => { window.speechSynthesis.onvoiceschanged = null }
  }, [])

  const speakChunk = useCallback(() => {
    if (chunkIndexRef.current >= chunksRef.current.length) {
      setPlaying(false)
      setPaused(false)
      return;
    }
    
    const chunkText = chunksRef.current[chunkIndexRef.current]
    const utter = new SpeechSynthesisUtterance(chunkText)
    
    const isTamil = /[\u0B80-\u0BFF]/.test(chunkText)
    utter.lang = isTamil ? 'ta-IN' : 'en-US'
    utter.rate = rate
    utter.pitch = 1

    if (isTamil) {
      const tamilVoice = voices.find(v => v.lang.includes('ta'))
      if (tamilVoice) utter.voice = tamilVoice
    } else {
      utter.voice = selectedVoice
    }

    utter.onstart = () => {
      setPlaying(true)
      setPaused(false)
    }

    utter.onend = () => {
      chunkIndexRef.current += 1
      speakChunk()
    }

    utter.onerror = () => {
      setPlaying(false)
      setPaused(false)
    }

    // Fix Chrome garbage collection bug
    window._currentUtterance = utter;
    window.speechSynthesis.speak(utter)
  }, [rate, selectedVoice, voices])

  const speak = useCallback(() => {
    window.speechSynthesis.cancel()
    chunksRef.current = splitText(text || '')
    chunkIndexRef.current = 0
    speakChunk()
  }, [text, speakChunk])

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
    chunkIndexRef.current = chunksRef.current.length // Stop sequence
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

        {/* Voice Selection */}
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