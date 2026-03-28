import { useState, useCallback, useEffect, useRef } from 'react'
import { speak, listenOnce, stopSpeaking } from '../utils/speech'

const API = ''
const TIMER_DURATIONS  = { easy: 15, medium: 12, hard: 10 }
const SCORE_PER_CORRECT = { easy: 1, medium: 2, hard: 3 }

export default function MathGame({ onBack }) {
  const [phase, setPhase]       = useState('idle')
  const [question, setQuestion] = useState(null)
  const [difficulty, setDiff]   = useState('easy')
  const [score, setScore]       = useState(0)
  const [streak, setStreak]     = useState(0)
  const [round, setRound]       = useState(0)
  const [result, setResult]     = useState(null)
  const [timeLeft, setTimeLeft] = useState(15)
  const [statusMsg, setStatus]  = useState('Press Start to begin!')
  const timerRef = useRef(null)
  const abortRef = useRef(false)

  const clearTimer = () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null } }

  const startTimer = useCallback((duration, onTimeout) => {
    clearTimer(); setTimeLeft(duration)
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearTimer(); onTimeout(); return 0 }
        return prev - 1
      })
    }, 1000)
  }, [])

  useEffect(() => () => clearTimer(), [])

  useEffect(() => {
    if (streak >= 5  && difficulty === 'easy')   { setDiff('medium'); speak('Great streak! Moving to medium!') }
    if (streak >= 10 && difficulty === 'medium')  { setDiff('hard');   speak('Incredible! Moving to hard!') }
  }, [streak, difficulty])

  const fetchQuestion = useCallback(async (diff = difficulty) => {
    abortRef.current = false
    setPhase('speaking'); setResult(null)
    try {
      const res  = await fetch(`${API}/api/math?difficulty=${diff}`)
      const data = await res.json()
      setQuestion(data); setStatus(`Question: ${data.question}`)
      await speak(`Question ${round + 1}. ${data.question}`, { rate: 0.85 })
      if (abortRef.current) return
      setPhase('listening'); setStatus('Listening for your answer…')
      await speak('Your answer?', { rate: 1 })

      const duration = TIMER_DURATIONS[diff]
      startTimer(duration, async () => {
        if (abortRef.current) return
        clearTimer(); setPhase('result'); setStreak(0)
        const r = { correct: false, feedback: `Time's up! The answer was ${data.answer}.` }
        setResult(r); setRound(n => n + 1)
        await speak(r.feedback)
      })

      const spoken = await listenOnce({ timeout: (duration + 2) * 1000 })
      clearTimer()
      if (abortRef.current) return

      if (!spoken) {
        setPhase('result'); setStreak(0)
        const r = { correct: false, feedback: `No answer heard. The answer was ${data.answer}.` }
        setResult(r); setRound(n => n + 1); await speak(r.feedback); return
      }

      // Parse number words
      const numberWords = {
        zero:0,one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,
        eleven:11,twelve:12,thirteen:13,fourteen:14,fifteen:15,sixteen:16,seventeen:17,
        eighteen:18,nineteen:19,twenty:20,thirty:30,forty:40,fifty:50,sixty:60,
        seventy:70,eighty:80,ninety:90,hundred:100,
      }
      let parsed = parseInt(spoken.replace(/[^0-9\-]/g,''), 10)
      if (isNaN(parsed)) {
        const lower = spoken.toLowerCase()
        const found = Object.entries(numberWords).find(([w]) => lower.includes(w))
        parsed = found ? found[1] : NaN
      }

      const correct = !isNaN(parsed) && parsed === data.answer
      const feedback = correct
        ? `Correct! Well done! The answer is ${data.answer}.`
        : `Not quite. You said ${isNaN(parsed) ? spoken : parsed}. The answer was ${data.answer}.`

      setResult({ correct, feedback, userAnswer: spoken })
      setScore(s => s + (correct ? SCORE_PER_CORRECT[diff] : 0))
      setStreak(s => correct ? s + 1 : 0)
      setRound(n => n + 1)
      setPhase('result')
      await speak(feedback); setStatus(feedback)
    } catch {
      setStatus('Error loading question. Try again.')
      setPhase('idle'); clearTimer()
    }
  }, [difficulty, round, startTimer])

  const handleReplay = useCallback(async () => {
    if (!question) return
    stopSpeaking(); await speak(question.question, { rate: 0.8 })
  }, [question])

  const handleBack = useCallback(async () => {
    abortRef.current = true; clearTimer(); stopSpeaking()
    await speak('Going back to main menu.'); onBack()
  }, [onBack])

  const timerColor = timeLeft <= 5 ? '#EF4444' : timeLeft <= 10 ? '#FF8C42' : '#2DC9A6'
  const timerPct   = (timeLeft / TIMER_DURATIONS[difficulty]) * 100

  return (
    <div className="game-container" role="main" aria-label="Mental Math Game">

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
          <div className="game-avatar" aria-hidden="true">🧮</div>
          <h1 className="game-title">Mental Math</h1>
          <p className="game-subtitle">Speak your answer • Beat the clock</p>
        </div>
      </div>

      {/* Body */}
      <div className="game-body">

        {/* Stats row */}
        <div className="stats-row" aria-label={`Round ${round}, Streak ${streak}`}>
          <div className="stat-chip">Round {round}</div>
          <div className="stat-chip">🔥 {streak} streak</div>
          <div className={`stat-chip diff-chip ${difficulty}`}>{difficulty}</div>
        </div>

        {/* Question card */}
        {question && phase !== 'idle' && (
          <div className="question-card" aria-live="polite" aria-label={`Question: ${question.question}`}>
            <p className="question-text">{question.question}</p>
          </div>
        )}

        {/* Timer */}
        {phase === 'listening' && (
          <div className="timer-wrap" aria-label={`${timeLeft} seconds remaining`}>
            <div className="timer-track">
              <div className="timer-bar" style={{ width: `${timerPct}%`, background: timerColor }}
                role="progressbar" aria-valuenow={timeLeft} aria-valuemin={0} aria-valuemax={TIMER_DURATIONS[difficulty]} />
            </div>
            <span className="timer-num" style={{ color: timerColor }}>{timeLeft}s</span>
          </div>
        )}

        {/* Status */}
        <div className="status-text" role="status" aria-live="assertive">{statusMsg}</div>

        {/* Mic */}
        {phase === 'listening' && (
          <div className="mic-indicator" aria-label="Listening for answer">
            <span className="mic-ring"/>
            <span className="mic-icon">🎙️</span>
            <p>Speak your answer!</p>
          </div>
        )}

        {/* Speaking */}
        {phase === 'speaking' && <div className="loader" aria-label="Asking question">📢 Asking question…</div>}

        {/* Result */}
        {phase === 'result' && result && (
          <div className={`result-card ${result.correct ? 'excellent' : 'tryAgain'}`} aria-live="polite">
            <div className="result-icon">{result.correct ? '✅' : '❌'}</div>
            <p className="result-label">{result.feedback}</p>
            {result.userAnswer && <p className="spoken-text">You said: "{result.userAnswer}"</p>}
          </div>
        )}

        {/* Actions */}
        <div className="action-btns">
          {phase === 'idle' && (
            <button className="primary-btn" onClick={() => fetchQuestion(difficulty)} aria-label="Start math game">
              🎮 Start Game
            </button>
          )}
          {phase === 'result' && (
            <>
              <button className="primary-btn" onClick={() => fetchQuestion(difficulty)} aria-label="Next question">➡️ Next Question</button>
              <button className="ghost-btn" onClick={handleReplay} aria-label="Replay question">🔁 Replay Question</button>
            </>
          )}
          {phase === 'listening' && (
            <button className="secondary-btn" onClick={handleReplay} aria-label="Replay question">🔁 Replay Question</button>
          )}
        </div>

        {round > 0 && <p className="round-info">🎯 {round} question{round > 1 ? 's' : ''} answered</p>}
      </div>
    </div>
  )
}