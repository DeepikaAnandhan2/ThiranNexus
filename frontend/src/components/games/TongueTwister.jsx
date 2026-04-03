import { useState, useCallback, useRef, useEffect } from 'react'
import { speak, listenOnce, stopSpeaking } from '../../utils/speech'
import { useGestures } from '../../utils/useGestures'
import axios from 'axios'
import './TongueTwister.css'

const API         = ''
const DIFF_LABELS = { easy: '😊 Easy', medium: '🔥 Medium', hard: '💪 Hard' }
const DIFF_KEYS   = Object.keys(DIFF_LABELS)
const HELP_TEXT   = 'Tongue Twister. Swipe right to go back. Swipe up to replay. Swipe down to cycle difficulty. Double tap to record. Long press for help.'

export default function TongueTwister({ onBack, gestureAction, clearGestureAction }) {
  const [phase,     setPhase]   = useState('idle')
  const [twister,   setTwister] = useState(null)
  const [difficulty,setDiff]    = useState('easy')
  const [result,    setResult]  = useState(null)
  const [score,     setScore]   = useState(0)
  const [round,     setRound]   = useState(0)
  const [statusMsg, setStatus]  = useState('Select difficulty and press Start Game.')
  const abortRef   = useRef(false)
  const phaseRef   = useRef(phase)
  const twisterRef = useRef(twister)

  useEffect(() => { phaseRef.current   = phase   }, [phase])
  useEffect(() => { twisterRef.current = twister }, [twister])

  // ── Fetch twister & speak ─────────────────────────────────
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

  // ── Replay ───────────────────────────────────────────────
  const handleReplay = useCallback(async () => {
    if (!twisterRef.current) { await speak('No twister loaded yet.'); return }
    stopSpeaking()
    setStatus('Replaying…')
    await speak(twisterRef.current.text, { rate: 0.75 })
    setStatus('Replay done. Press Record when ready.')
  }, [])

  // ── Record voice ─────────────────────────────────────────
  const handleRecord = useCallback(async () => {
    if (!twisterRef.current) { await speak('Please start a game first.'); return }
    stopSpeaking()
    setPhase('listening')
    setStatus('Listening… speak now!')
    await speak('Go! Say the tongue twister now.', { rate: 1 })
    try {
      const spoken = await listenOnce({ timeout: 10000 })
      if (!spoken) {
        setStatus('No speech detected. Try again.')
        setPhase('ready')
        await speak('I did not hear you. Try again.')
        return
      }
      setPhase('evaluating')
      setStatus('Evaluating…')
      const res = await fetch(`${API}/api/validate/twister`, {
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
      
      // Save score to backend
      try {
        const token = localStorage.getItem('token')
        await axios.post('/api/dashboard/game/score', {
          gameType: 'twister',
          score: ev.rating === 'excellent' ? 3 : ev.rating === 'good' ? 1 : 0,
          streak: ev.rating !== 'tryAgain' ? round + 1 : 0
        }, { headers: { Authorization: `Bearer ${token}` } })
      } catch (scoreErr) {
        console.error('Failed to save score:', scoreErr.message)
      }
      
      await speak(ev.feedback, { rate: 0.9 })
      setStatus(ev.feedback)
    } catch {
      setStatus('Could not process voice. Try again.')
      setPhase('ready')
    }
  }, [])

  // ── Cycle difficulty ─────────────────────────────────────
  const cycleDifficulty = useCallback(async () => {
    setDiff(prev => {
      const next = DIFF_KEYS[(DIFF_KEYS.indexOf(prev) + 1) % DIFF_KEYS.length]
      speak(`Difficulty changed to ${next}.`)
      return next
    })
  }, [])

  // ── Back ─────────────────────────────────────────────────
  const handleBack = useCallback(async () => {
    abortRef.current = true
    stopSpeaking()
    await speak('Going back.')
    onBack()
  }, [onBack])

  // ── Handle gesture from Games.jsx ────────────────────────
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
      else speak(`Currently ${p}. Please wait.`)
    },
    onLongPress: () => speak(HELP_TEXT),
  }, [difficulty, phase])

  // ── Difficulty chip class ─────────────────────────────────
  const chipClass = `tt-chip tt-chip-${difficulty}`

  return (
    <div className="tt-container" role="main" aria-label="Tongue Twister Challenge">

      {/* ── Banner ────────────────────────────────────────── */}
      <div className="tt-banner">
        <div className="tt-banner-bubble1" aria-hidden="true" />
        <div className="tt-banner-bubble2" aria-hidden="true" />

        <div className="tt-banner-top">
          <button className="tt-back-btn" onClick={handleBack} aria-label="Back">← Back</button>
          <div className="tt-score-badge" aria-label={`Score: ${score}`}>
            <span className="tt-score-val">{score}</span>
            <span className="tt-score-lbl">pts</span>
          </div>
        </div>

        <div className="tt-avatar" aria-hidden="true">🗣️</div>
        <h1 className="tt-title">Tongue Twister</h1>
        <p className="tt-subtitle">Speak clearly • Score points</p>

        <div className="tt-gesture-bar" aria-hidden="true">
          <span>👉 Back</span>
          <span>👆 Replay</span>
          <span>👇 Difficulty</span>
          <span>👆👆 {phase === 'ready' ? 'Record' : 'Start'}</span>
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────── */}
      <div className="tt-body">

        {/* Stats */}
        {round > 0 && (
          <div className="tt-stats-row">
            <span className="tt-chip">Round {round}</span>
            <span className={chipClass}>{DIFF_LABELS[difficulty]}</span>
            <span className="tt-chip">🏆 {score} pts</span>
          </div>
        )}

        {/* Difficulty selector */}
        {phase === 'idle' && (
          <div className="tt-diff-selector" role="group" aria-label="Select difficulty">
            <p className="tt-hint-text">Choose difficulty (or swipe down to cycle):</p>
            {DIFF_KEYS.map(key => (
              <button
                key={key}
                className={`tt-diff-btn${difficulty === key ? ' tt-active' : ''}`}
                onClick={async () => { setDiff(key); await speak(`Difficulty: ${key}.`) }}
                aria-pressed={difficulty === key}
              >
                {DIFF_LABELS[key]}
              </button>
            ))}
          </div>
        )}

        {/* Twister card */}
        {twister && (
          <div className="tt-card" aria-live="polite" aria-label={`Tongue twister: ${twister.text}`}>
            <div className="tt-card-header">
              <div className="tt-card-icon" aria-hidden="true">📖</div>
              <span className="tt-card-label">Your Tongue Twister</span>
            </div>
            <p className="tt-text">{twister.text}</p>
            <span className="tt-diff-tag">{DIFF_LABELS[twister.difficulty]}</span>
          </div>
        )}

        {/* Status */}
        <div className="tt-status" role="status" aria-live="assertive">{statusMsg}</div>

        {/* Result */}
        {phase === 'result' && result && (
          <div
            className={`tt-result tt-${result.rating === 'excellent' ? 'excellent' : result.rating === 'good' ? 'good' : 'try-again'}`}
            aria-live="polite"
          >
            <div className="tt-result-icon">
              {result.rating === 'excellent' ? '🏆' : result.rating === 'good' ? '👍' : '🔄'}
            </div>
            <p className="tt-result-label">{result.feedback}</p>
            <p className="tt-result-score">Accuracy: {result.score}%</p>
            {result.spoken && <p className="tt-spoken-text">You said: "{result.spoken}"</p>}
          </div>
        )}

        {/* Loaders */}
        {phase === 'loading'    && <div className="tt-loader" aria-label="Loading">⏳ Loading twister…</div>}
        {phase === 'evaluating' && <div className="tt-loader" aria-label="Evaluating">🔍 Evaluating…</div>}
        {phase === 'listening'  && (
          <div className="tt-mic-wrap" aria-label="Listening">
            <span className="tt-mic-ring" />
            <span className="tt-mic-icon">🎙️</span>
            <p className="tt-mic-text">Listening… speak now!</p>
          </div>
        )}

        {/* Buttons */}
        <div className="tt-actions">
          {phase === 'idle' && (
            <button className="tt-btn-primary" onClick={() => fetchAndSpeak()} aria-label="Start game">
              🎮 Start Game <span className="tt-btn-hint">or double tap</span>
            </button>
          )}
          {phase === 'ready' && (
            <>
              <button className="tt-btn-primary" onClick={handleRecord} aria-label="Record voice">
                🎙️ Record My Voice <span className="tt-btn-hint">or double tap</span>
              </button>
              <button className="tt-btn-secondary" onClick={handleReplay} aria-label="Replay">
                🔁 Replay <span className="tt-btn-hint">or swipe up</span>
              </button>
            </>
          )}
          {phase === 'result' && (
            <>
              <button className="tt-btn-primary" onClick={() => fetchAndSpeak()} aria-label="Next twister">
                ➡️ Next Twister <span className="tt-btn-hint">or double tap</span>
              </button>
              <button className="tt-btn-secondary" onClick={handleRecord} aria-label="Try again">
                🔄 Try Again
              </button>
              <button className="tt-btn-ghost" onClick={handleReplay} aria-label="Replay">
                🔁 Replay <span className="tt-btn-hint">or swipe up</span>
              </button>
            </>
          )}
        </div>

        {round > 0 && (
          <p className="tt-round-info">🎯 {round} round{round > 1 ? 's' : ''} completed</p>
        )}

      </div>
    </div>
  )
}