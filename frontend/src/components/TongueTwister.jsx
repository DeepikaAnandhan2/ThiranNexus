import { useState, useCallback, useRef } from 'react'
import { speak, listenOnce, stopSpeaking } from '../utils/speech'

const API = ''
const DIFFICULTY_LABELS = { easy: '😊 Easy', medium: '🔥 Medium', hard: '💪 Hard' }

export default function TongueTwister({ onBack }) {
  const [phase, setPhase]       = useState('idle')
  const [twister, setTwister]   = useState(null)
  const [difficulty, setDiff]   = useState('easy')
  const [result, setResult]     = useState(null)
  const [score, setScore]       = useState(0)
  const [round, setRound]       = useState(0)
  const [statusMsg, setStatus]  = useState('Select difficulty and press Start Game.')
  const abortRef = useRef(false)

  const fetchAndSpeak = useCallback(async (diff = difficulty) => {
    abortRef.current = false
    setPhase('loading'); setResult(null); setStatus('Fetching tongue twister…')
    try {
      const res  = await fetch(`${API}/api/twisters?difficulty=${diff}`)
      const data = await res.json()
      setTwister(data); setPhase('ready')
      await speak(`Round ${round + 1}. Here is your tongue twister.`, { rate: 0.85 })
      if (abortRef.current) return
      await speak(data.text, { rate: 0.8 })
      if (abortRef.current) return
      setStatus('Tongue twister spoken. Press Record or replay.')
    } catch {
      setStatus('Error loading. Please try again.')
      setPhase('idle')
    }
  }, [difficulty, round])

  const handleReplay = useCallback(async () => {
    if (!twister) return
    stopSpeaking(); setStatus('Replaying…')
    await speak(twister.text, { rate: 0.75 })
    setStatus('Replay done. Press Record when ready.')
  }, [twister])

  const handleRecord = useCallback(async () => {
    if (!twister) return
    stopSpeaking(); setPhase('listening'); setStatus('Listening… speak now!')
    await speak('Go! Say the tongue twister now.', { rate: 1 })
    try {
      const spoken = await listenOnce({ timeout: 10000 })
      if (!spoken) {
        setStatus('No speech detected. Try again.')
        setPhase('ready')
        await speak('I did not hear anything. Press Record and try again.')
        return
      }
      setPhase('evaluating'); setStatus('Evaluating…')
      const res  = await fetch(`${API}/api/validate/twister`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ original: twister.text, spoken }),
      })
      const evaluation = await res.json()
      setResult({ ...evaluation, spoken })
      setRound(r => r + 1)
      if (evaluation.rating === 'excellent') setScore(s => s + 3)
      else if (evaluation.rating === 'good')  setScore(s => s + 1)
      setPhase('result')
      await speak(evaluation.feedback, { rate: 0.9 })
      setStatus(evaluation.feedback)
    } catch {
      setStatus('Could not process voice. Please try again.')
      setPhase('ready')
      await speak('Something went wrong. Please try again.')
    }
  }, [twister])

  const handleBack = useCallback(async () => {
    abortRef.current = true; stopSpeaking()
    await speak('Going back to main menu.')
    onBack()
  }, [onBack])

  const handleDiff = useCallback(async (d) => {
    setDiff(d); setPhase('idle'); setResult(null); setTwister(null)
    setStatus(`Difficulty set to ${d}. Press Start Game.`)
    await speak(`Difficulty set to ${d}.`)
  }, [])

  return (
    <div className="game-container" role="main" aria-label="Tongue Twister Challenge">

      {/* Banner */}
      <div className="game-banner">
        <div className="game-banner-bubbles" aria-hidden="true">
          <div className="gb1"/><div className="gb2"/>
        </div>
        <div className="game-header">
          <button className="back-btn" onClick={handleBack} aria-label="Back to main menu">← Back</button>
          <div className="score-badge" aria-label={`Score: ${score}`}>
            <span className="score-val">{score}</span>
            <span className="score-lbl">pts</span>
          </div>
        </div>
        <div className="game-title-wrap">
          <div className="game-avatar" aria-hidden="true">🗣️</div>
          <h1 className="game-title">Tongue Twister</h1>
          <p className="game-subtitle">Speak clearly • Score points</p>
        </div>
      </div>

      {/* Body */}
      <div className="game-body">

        {/* Stats */}
        {round > 0 && (
          <div className="stats-row" aria-label={`Round ${round}`}>
            <div className="stat-chip">Round {round}</div>
            <div className={`stat-chip diff-chip ${difficulty.replace(/[^a-z]/g,'')}`}>
              {DIFFICULTY_LABELS[difficulty]}
            </div>
          </div>
        )}

        {/* Difficulty selector */}
        {phase === 'idle' && (
          <div className="diff-selector" role="group" aria-label="Select difficulty">
            <p className="hint-text">Choose difficulty level:</p>
            {Object.entries(DIFFICULTY_LABELS).map(([key, label]) => (
              <button
                key={key}
                className={`diff-btn ${difficulty === key ? 'active' : ''}`}
                onClick={() => handleDiff(key)}
                aria-pressed={difficulty === key}
                aria-label={`Difficulty: ${label}`}
              >{label}</button>
            ))}
          </div>
        )}

        {/* Twister card */}
        {twister && (
          <div className="twister-card" aria-live="polite" aria-label={`Tongue twister: ${twister.text}`}>
            <div className="twister-card-header">
              <div className="twister-card-icon" aria-hidden="true">📖</div>
              <span className="twister-card-label">Your Tongue Twister</span>
            </div>
            <p className="twister-text">{twister.text}</p>
            <span className="diff-tag">{DIFFICULTY_LABELS[twister.difficulty]}</span>
          </div>
        )}

        {/* Status */}
        <div className="status-text" role="status" aria-live="assertive">{statusMsg}</div>

        {/* Result */}
        {phase === 'result' && result && (
          <div className={`result-card ${result.rating}`} aria-live="polite">
            <div className="result-icon">
              {result.rating === 'excellent' ? '🏆' : result.rating === 'good' ? '👍' : '🔄'}
            </div>
            <p className="result-label">{result.feedback}</p>
            <p className="result-score-text">Accuracy: {result.score}%</p>
            {result.spoken && (
              <p className="spoken-text">You said: "{result.spoken}"</p>
            )}
          </div>
        )}

        {/* Loaders */}
        {phase === 'loading'    && <div className="loader" aria-label="Loading">⏳ Loading twister…</div>}
        {phase === 'evaluating' && <div className="loader" aria-label="Evaluating">🔍 Evaluating…</div>}
        {phase === 'listening'  && (
          <div className="mic-indicator" aria-label="Listening">
            <span className="mic-ring"/>
            <span className="mic-icon">🎙️</span>
            <p>Listening… speak now!</p>
          </div>
        )}

        {/* Actions */}
        <div className="action-btns">
          {phase === 'idle' && (
            <button className="primary-btn" onClick={() => fetchAndSpeak(difficulty)} aria-label="Start game">
              🎮 Start Game
            </button>
          )}
          {phase === 'ready' && (
            <>
              <button className="primary-btn" onClick={handleRecord} aria-label="Record your voice">🎙️ Record My Voice</button>
              <button className="secondary-btn" onClick={handleReplay} aria-label="Replay twister">🔁 Replay Twister</button>
            </>
          )}
          {phase === 'result' && (
            <>
              <button className="primary-btn" onClick={() => fetchAndSpeak()} aria-label="Next twister">➡️ Next Twister</button>
              <button className="secondary-btn" onClick={handleRecord} aria-label="Try again">🔄 Try Again</button>
              <button className="ghost-btn" onClick={handleReplay} aria-label="Replay">🔁 Replay</button>
            </>
          )}
        </div>

        {round > 0 && <p className="round-info">🎯 {round} round{round > 1 ? 's' : ''} completed</p>}
      </div>
    </div>
  )
}