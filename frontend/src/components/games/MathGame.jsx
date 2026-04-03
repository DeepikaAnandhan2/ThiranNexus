import { useState, useCallback, useEffect, useRef } from 'react'
import { speak, listenOnce, stopSpeaking } from '../../utils/speech'
import { useGestures } from '../../utils/useGestures'
import axios from 'axios'
import './MathGame.css'

const API              = ''
const TIMER_DURATIONS  = { easy: 15, medium: 12, hard: 10 }
const SCORE_PER_CORRECT= { easy: 1,  medium: 2,  hard: 3  }
const HELP_TEXT        = 'Mental Math. Swipe right to go back. Swipe up to replay. Swipe down to hear score. Double tap for next question. Long press for help.'

const NUMBER_WORDS = {
  zero:0, one:1, two:2, three:3, four:4, five:5, six:6, seven:7, eight:8,
  nine:9, ten:10, eleven:11, twelve:12, thirteen:13, fourteen:14, fifteen:15,
  sixteen:16, seventeen:17, eighteen:18, nineteen:19, twenty:20,
  thirty:30, forty:40, fifty:50, sixty:60, seventy:70, eighty:80, ninety:90, hundred:100,
}

function parseSpokenNumber(spoken) {
  let parsed = parseInt(spoken.replace(/[^0-9\-]/g, ''), 10)
  if (isNaN(parsed)) {
    const lower = spoken.toLowerCase()
    const found = Object.entries(NUMBER_WORDS).find(([w]) => lower.includes(w))
    parsed = found ? found[1] : NaN
  }
  return parsed
}

export default function MathGame({ onBack, gestureAction, clearGestureAction }) {
  const [phase,     setPhase]    = useState('idle')
  const [question,  setQuestion] = useState(null)
  const [difficulty,setDiff]     = useState('easy')
  const [score,     setScore]    = useState(0)
  const [streak,    setStreak]   = useState(0)
  const [round,     setRound]    = useState(0)
  const [result,    setResult]   = useState(null)
  const [timeLeft,  setTimeLeft] = useState(15)
  const [statusMsg, setStatus]   = useState('Press Start to begin!')
  const timerRef    = useRef(null)
  const abortRef    = useRef(false)
  const phaseRef    = useRef(phase)
  const questionRef = useRef(question)

  useEffect(() => { phaseRef.current    = phase    }, [phase])
  useEffect(() => { questionRef.current = question }, [question])

  const clearTimer = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
  }

  const startTimer = useCallback((duration, onTimeout) => {
    clearTimer()
    setTimeLeft(duration)
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearTimer(); onTimeout(); return 0 }
        return prev - 1
      })
    }, 1000)
  }, [])

  useEffect(() => () => clearTimer(), [])

  // Auto escalate difficulty
  useEffect(() => {
    if (streak >= 5  && difficulty === 'easy')   { setDiff('medium'); speak('Great streak! Moving to medium!') }
    if (streak >= 10 && difficulty === 'medium')  { setDiff('hard');   speak('Incredible! Moving to hard!') }
  }, [streak, difficulty])

  // ── Fetch question ────────────────────────────────────────
  const fetchQuestion = useCallback(async (diff) => {
    const d = diff || difficulty
    abortRef.current = false
    setPhase('speaking'); setResult(null)
    try {
      const res  = await fetch(`${API}/api/math?difficulty=${d}`)
      const data = await res.json()
      setQuestion(data)
      setStatus(`Question: ${data.question}`)
      await speak(`Question ${round + 1}. ${data.question}`, { rate: 0.85 })
      if (abortRef.current) return
      setPhase('listening')
      setStatus('Listening for your answer…')
      await speak('Your answer?', { rate: 1 })

      const duration = TIMER_DURATIONS[d]
      startTimer(duration, async () => {
        if (abortRef.current) return
        clearTimer(); setPhase('result'); setStreak(0)
        const r = { correct: false, feedback: `Time's up! The answer was ${data.answer}.` }
        setResult(r); setRound(n => n + 1); await speak(r.feedback)
      })

      const spoken = await listenOnce({ timeout: (duration + 2) * 1000 })
      clearTimer()
      if (abortRef.current) return

      if (!spoken) {
        setPhase('result'); setStreak(0)
        const r = { correct: false, feedback: `No answer heard. The answer was ${data.answer}.` }
        setResult(r); setRound(n => n + 1); await speak(r.feedback); return
      }

      const parsed  = parseSpokenNumber(spoken)
      const correct = !isNaN(parsed) && parsed === data.answer
      const feedback = correct
        ? `Correct! Well done! The answer is ${data.answer}.`
        : `Not quite. You said ${isNaN(parsed) ? spoken : parsed}. The answer was ${data.answer}.`

      setResult({ correct, feedback, userAnswer: spoken })
      setScore(s => s + (correct ? SCORE_PER_CORRECT[d] : 0))
      setStreak(s => correct ? s + 1 : 0)
      setRound(n => n + 1)
      setPhase('result')
      
      // Save score to backend
      try {
        const token = localStorage.getItem('token')
        await axios.post('/api/dashboard/game/score', {
          gameType: 'math',
          score: correct ? SCORE_PER_CORRECT[d] : 0,
          streak: correct ? streak + 1 : 0
        }, { headers: { Authorization: `Bearer ${token}` } })
      } catch (scoreErr) {
        console.error('Failed to save score:', scoreErr.message)
      }
      
      await speak(feedback)
      setStatus(feedback)
    } catch {
      setStatus('Error loading question. Try again.')
      setPhase('idle'); clearTimer()
    }
  }, [difficulty, round, startTimer])

  // ── Replay ───────────────────────────────────────────────
  const handleReplay = useCallback(async () => {
    const q = questionRef.current
    if (!q) { await speak('No question loaded yet.'); return }
    stopSpeaking()
    await speak(q.question, { rate: 0.8 })
  }, [])

  // ── Announce score ────────────────────────────────────────
  const handleAnnounceScore = useCallback(async () => {
    await speak(`Score: ${score} points. Streak: ${streak}. Round: ${round}.`)
  }, [score, streak, round])

  // ── Back ─────────────────────────────────────────────────
  const handleBack = useCallback(async () => {
    abortRef.current = true; clearTimer(); stopSpeaking()
    await speak('Going back.'); onBack()
  }, [onBack])

  // ── Handle gesture from Games.jsx ────────────────────────
  useEffect(() => {
    if (!gestureAction) return
    clearGestureAction()
    const p = phaseRef.current
    if (gestureAction === 'replay')  handleReplay()
    if (gestureAction === 'primary') {
      if (p === 'idle' || p === 'result') fetchQuestion()
      else speak(`Currently ${p}. Please wait.`)
    }
  }, [gestureAction, clearGestureAction, handleReplay, fetchQuestion])

  // ── In-screen gestures ────────────────────────────────────
  useGestures({
    onSwipeRight: handleBack,
    onSwipeUp:    handleReplay,
    onSwipeDown:  handleAnnounceScore,
    onDoubleTap:  () => {
      const p = phaseRef.current
      if (p === 'idle' || p === 'result') fetchQuestion()
      else speak(`Currently ${p}. Please wait.`)
    },
    onLongPress: () => speak(HELP_TEXT),
  }, [difficulty, phase])

  const timerColor = timeLeft <= 5 ? '#EF4444' : timeLeft <= 10 ? '#FF8C42' : '#2DC9A6'
  const timerPct   = (timeLeft / TIMER_DURATIONS[difficulty]) * 100

  return (
    <div className="mg-container" role="main" aria-label="Mental Math Game">

      {/* ── Banner ────────────────────────────────────────── */}
      <div className="mg-banner">
        <div className="mg-banner-bubble1" aria-hidden="true" />
        <div className="mg-banner-bubble2" aria-hidden="true" />

        <div className="mg-banner-top">
          <button className="mg-back-btn" onClick={handleBack} aria-label="Back">← Back</button>
          <div className="mg-score-badge" aria-label={`Score: ${score}`}>
            <span className="mg-score-val">{score}</span>
            <span className="mg-score-lbl">pts</span>
          </div>
        </div>

        <div className="mg-avatar" aria-hidden="true">🧮</div>
        <h1 className="mg-title">Mental Math</h1>
        <p className="mg-subtitle">Speak your answer • Beat the clock</p>

        <div className="mg-gesture-bar" aria-hidden="true">
          <span>👉 Back</span>
          <span>👆 Replay</span>
          <span>👇 Score</span>
          <span>👆👆 {phase === 'idle' || phase === 'result' ? 'Next' : 'Wait'}</span>
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────── */}
      <div className="mg-body">

        {/* Stats */}
        <div className="mg-stats-row">
          <span className="mg-chip">Round {round}</span>
          <span className="mg-chip">🔥 {streak} streak</span>
          <span className={`mg-chip mg-chip-${difficulty}`}>{difficulty}</span>
        </div>

        {/* Question */}
        {question && phase !== 'idle' && (
          <div className="mg-question-card" aria-live="polite" aria-label={`Question: ${question.question}`}>
            <p className="mg-question-text">{question.question}</p>
          </div>
        )}

        {/* Timer */}
        {phase === 'listening' && (
          <div className="mg-timer-wrap" aria-label={`${timeLeft} seconds left`}>
            <div className="mg-timer-track">
              <div
                className="mg-timer-bar"
                style={{ width: `${timerPct}%`, background: timerColor }}
                role="progressbar"
                aria-valuenow={timeLeft}
                aria-valuemin={0}
                aria-valuemax={TIMER_DURATIONS[difficulty]}
              />
            </div>
            <span className="mg-timer-num" style={{ color: timerColor }}>{timeLeft}s</span>
          </div>
        )}

        {/* Status */}
        <div className="mg-status" role="status" aria-live="assertive">{statusMsg}</div>

        {/* Mic */}
        {phase === 'listening' && (
          <div className="mg-mic-wrap" aria-label="Listening">
            <span className="mg-mic-ring" />
            <span className="mg-mic-icon">🎙️</span>
            <p className="mg-mic-text">Speak your answer!</p>
          </div>
        )}

        {phase === 'speaking' && (
          <div className="mg-loader" aria-label="Asking question">📢 Asking question…</div>
        )}

        {/* Result */}
        {phase === 'result' && result && (
          <div className={`mg-result ${result.correct ? 'mg-correct' : 'mg-incorrect'}`} aria-live="polite">
            <div className="mg-result-icon">{result.correct ? '✅' : '❌'}</div>
            <p className="mg-result-label">{result.feedback}</p>
            {result.userAnswer && (
              <p className="mg-spoken-text">You said: "{result.userAnswer}"</p>
            )}
          </div>
        )}

        {/* Buttons */}
        <div className="mg-actions">
          {phase === 'idle' && (
            <button className="mg-btn-primary" onClick={() => fetchQuestion()} aria-label="Start math game">
              🎮 Start Game <span className="mg-btn-hint">or double tap</span>
            </button>
          )}
          {phase === 'result' && (
            <>
              <button className="mg-btn-primary" onClick={() => fetchQuestion()} aria-label="Next question">
                ➡️ Next Question <span className="mg-btn-hint">or double tap</span>
              </button>
              <button className="mg-btn-ghost" onClick={handleReplay} aria-label="Replay question">
                🔁 Replay <span className="mg-btn-hint">or swipe up</span>
              </button>
            </>
          )}
          {phase === 'listening' && (
            <button className="mg-btn-secondary" onClick={handleReplay} aria-label="Replay question">
              🔁 Replay Question <span className="mg-btn-hint">or swipe up</span>
            </button>
          )}
        </div>

        {round > 0 && (
          <p className="mg-round-info">🎯 {round} question{round > 1 ? 's' : ''} answered</p>
        )}

      </div>
    </div>
  )
}