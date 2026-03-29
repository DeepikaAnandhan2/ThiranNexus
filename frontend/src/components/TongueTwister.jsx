import { useState, useCallback, useRef, useEffect } from 'react'
import { speak, listenOnce, stopSpeaking } from '../utils/speech'
import { useGestures } from '../utils/useGestures'

const API = ''
const DIFFICULTIES    = ['easy', 'medium', 'hard']
const DIFF_LABELS     = { easy: '😊 Easy', medium: '🔥 Medium', hard: '💪 Hard' }
const DIFF_KEYS       = Object.keys(DIFF_LABELS)

const HELP_TEXT = 'Tongue Twister help. Swipe right to go back home. Swipe up to replay the twister. Swipe down to cycle difficulty. Double tap to record your voice. Long press for this help message.'

export default function TongueTwister({ onBack, gestureAction, clearGestureAction }) {
  const [phase,      setPhase]    = useState('idle')
  const [twister,    setTwister]  = useState(null)
  const [difficulty, setDiff]     = useState('easy')
  const [result,     setResult]   = useState(null)
  const [score,      setScore]    = useState(0)
  const [round,      setRound]    = useState(0)
  const [statusMsg,  setStatus]   = useState('Select difficulty and press Start Game.')
  const abortRef   = useRef(false)
  const phaseRef   = useRef(phase)
  const twisterRef = useRef(twister)

  useEffect(() => { phaseRef.current   = phase   }, [phase])
  useEffect(() => { twisterRef.current = twister }, [twister])

  // ── Core actions (stable refs for gestures) ───────────────
  const fetchAndSpeak = useCallback(async (diff) => {
    const d = diff || difficulty
    abortRef.current = false
    setPhase('loading'); setResult(null); setStatus('Fetching tongue twister…')
    try {
      const res  = await fetch(`${API}/api/twisters?difficulty=${d}`)
      const data = await res.json()
      setTwister(data); setPhase('ready')
      await speak(`Round ${round + 1}. Here is your tongue twister.`, { rate: 0.85 })
      if (abortRef.current) return
      await speak(data.text, { rate: 0.8 })
      if (abortRef.current) return
      setStatus('Tongue twister spoken. Press Record or replay.')
    } catch {
      setStatus('Error loading. Try again.')
      setPhase('idle')
    }
  }, [difficulty, round])

  const handleReplay = useCallback(async () => {
    if (!twisterRef.current) { await speak('No twister loaded yet.'); return }
    stopSpeaking(); setStatus('Replaying…')
    await speak(twisterRef.current.text, { rate: 0.75 })
    setStatus('Replay done. Press Record when ready.')
  }, [])

  const handleRecord = useCallback(async () => {
    if (!twisterRef.current) { await speak('Please start a game first.'); return }
    stopSpeaking(); setPhase('listening'); setStatus('Listening… speak now!')
    await speak('Go! Say the tongue twister now.', { rate: 1 })
    try {
      const spoken = await listenOnce({ timeout: 10000 })
      if (!spoken) {
        setStatus('No speech detected. Try again.')
        setPhase('ready')
        await speak('I did not hear you. Press Record and try again.')
        return
      }
      setPhase('evaluating'); setStatus('Evaluating…')
      const res  = await fetch(`${API}/api/validate/twister`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ original: twisterRef.current.text, spoken }),
      })
      const ev = await res.json()
      setResult({ ...ev, spoken })
      setRound(r => r + 1)
      if (ev.rating === 'excellent') setScore(s => s + 3)
      else if (ev.rating === 'good') setScore(s => s + 1)
      setPhase('result')
      await speak(ev.feedback, { rate: 0.9 })
      setStatus(ev.feedback)
    } catch {
      setStatus('Could not process voice. Try again.')
      setPhase('ready')
    }
  }, [])

  const cycleDifficulty = useCallback(async () => {
    setDiff(prev => {
      const idx  = DIFF_KEYS.indexOf(prev)
      const next = DIFF_KEYS[(idx + 1) % DIFF_KEYS.length]
      speak(`Difficulty changed to ${next}.`)
      return next
    })
  }, [])

  const handleBack = useCallback(async () => {
    abortRef.current = true; stopSpeaking()
    await speak('Going back to home.'); onBack()
  }, [onBack])

  // ── Handle gestures passed from App ──────────────────────
  useEffect(() => {
    if (!gestureAction) return
    clearGestureAction()
    const p = phaseRef.current
    if (gestureAction === 'replay')     handleReplay()
    if (gestureAction === 'difficulty') cycleDifficulty()
    if (gestureAction === 'primary') {
      if (p === 'idle' || p === 'result') fetchAndSpeak()
      else if (p === 'ready')             handleRecord()
    }
  }, [gestureAction, clearGestureAction, handleReplay, cycleDifficulty, fetchAndSpeak, handleRecord])

  // ── In-screen gestures ────────────────────────────────────
  useGestures({
    onSwipeRight: handleBack,
    onSwipeUp:    handleReplay,
    onSwipeDown:  cycleDifficulty,
    onDoubleTap:  () => {
      const p = phaseRef.current
      if (p === 'idle' || p === 'result') fetchAndSpeak()
      else if (p === 'ready')             handleRecord()
      else speak(`Current phase is ${p}. Please wait.`)
    },
    onLongPress: () => speak(HELP_TEXT),
  }, [difficulty, phase])

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

        {/* Gesture hint bar inside banner */}
        <div className="in-game-gesture-bar" aria-hidden="true">
          <span>👉 Back</span>
          <span>👆 Replay</span>
          <span>👇 Difficulty</span>
          <span>👆👆 {phase === 'ready' ? 'Record' : 'Start'}</span>
        </div>
      </div>

      {/* Body */}
      <div className="game-body">

        {round > 0 && (
          <div className="stats-row">
            <div className="stat-chip">Round {round}</div>
            <div className={`stat-chip diff-chip ${difficulty}`}>{DIFF_LABELS[difficulty]}</div>
            <div className="stat-chip">🏆 {score} pts</div>
          </div>
        )}

        {phase === 'idle' && (
          <div className="diff-selector" role="group" aria-label="Select difficulty">
            <p className="hint-text">Choose difficulty (or swipe down to cycle):</p>
            {DIFF_KEYS.map(key => (
              <button
                key={key}
                className={`diff-btn ${difficulty === key ? 'active' : ''}`}
                onClick={async () => { setDiff(key); await speak(`Difficulty set to ${key}.`) }}
                aria-pressed={difficulty === key}
              >{DIFF_LABELS[key]}</button>
            ))}
          </div>
        )}

        {twister && (
          <div className="twister-card" aria-live="polite" aria-label={`Tongue twister: ${twister.text}`}>
            <div className="twister-card-header">
              <div className="twister-card-icon" aria-hidden="true">📖</div>
              <span className="twister-card-label">Your Tongue Twister</span>
            </div>
            <p className="twister-text">{twister.text}</p>
            <span className="diff-tag">{DIFF_LABELS[twister.difficulty]}</span>
          </div>
        )}

        <div className="status-text" role="status" aria-live="assertive">{statusMsg}</div>

        {phase === 'result' && result && (
          <div className={`result-card ${result.rating}`} aria-live="polite">
            <div className="result-icon">
              {result.rating === 'excellent' ? '🏆' : result.rating === 'good' ? '👍' : '🔄'}
            </div>
            <p className="result-label">{result.feedback}</p>
            <p className="result-score-text">Accuracy: {result.score}%</p>
            {result.spoken && <p className="spoken-text">You said: "{result.spoken}"</p>}
          </div>
        )}

        {phase === 'loading'    && <div className="loader">⏳ Loading twister…</div>}
        {phase === 'evaluating' && <div className="loader">🔍 Evaluating…</div>}
        {phase === 'listening'  && (
          <div className="mic-indicator" aria-label="Listening">
            <span className="mic-ring"/><span className="mic-icon">🎙️</span>
            <p>Listening… speak now!</p>
          </div>
        )}

        <div className="action-btns">
          {phase === 'idle' && (
            <button className="primary-btn" onClick={() => fetchAndSpeak()} aria-label="Start game">
              🎮 Start Game <span className="btn-hint">or double tap</span>
            </button>
          )}
          {phase === 'ready' && (
            <>
              <button className="primary-btn" onClick={handleRecord} aria-label="Record voice">
                🎙️ Record My Voice <span className="btn-hint">or double tap</span>
              </button>
              <button className="secondary-btn" onClick={handleReplay} aria-label="Replay">
                🔁 Replay <span className="btn-hint">or swipe up</span>
              </button>
            </>
          )}
          {phase === 'result' && (
            <>
              <button className="primary-btn" onClick={() => fetchAndSpeak()} aria-label="Next twister">
                ➡️ Next Twister <span className="btn-hint">or double tap</span>
              </button>
              <button className="secondary-btn" onClick={handleRecord} aria-label="Try again">🔄 Try Again</button>
              <button className="ghost-btn" onClick={handleReplay} aria-label="Replay">
                🔁 Replay <span className="btn-hint">or swipe up</span>
              </button>
            </>
          )}
        </div>

        {round > 0 && <p className="round-info">🎯 {round} round{round > 1 ? 's' : ''} completed</p>}
      </div>
    </div>
  )
}