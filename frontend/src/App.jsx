import { useState, useEffect, useCallback } from 'react'
import TongueTwister from './components/TongueTwister'
import MathGame from './components/MathGame'
import Login from './pages/Login'
import Register from './pages/Register'
import { speak } from './utils/speech'
import { useGestures } from './utils/useGestures'

// Screens in swipe order: home → twister → math → home
const SCREENS = ['home', 'twister', 'math']

const HELP_TEXT = {
  home:    'You are on the home screen. Swipe left to go to Tongue Twister. Swipe right to go to Mental Math. Double tap anywhere to select the first option. Long press anytime for help.',
  twister: 'You are in Tongue Twister. Swipe right to go back home. Swipe up to replay the twister. Swipe down to change difficulty. Double tap to start recording. Long press for help.',
  math:    'You are in Mental Math. Swipe right to go back home. Swipe up to replay the question. Swipe down to see your score. Double tap to start the game. Long press for help.',
}

export default function App() {

   /* ───────── AUTH STATE ───────── */
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [authPage, setAuthPage] = useState('login') // 👈 NEW

  /* ───────── GAME STATE ───────── */
  const [screen, setScreen] = useState('home')
  const [twisteAction, setTwisterAction] = useState(null)
  const [mathAction, setMathAction] = useState(null)

  /* ───────── AUTH FLOW ───────── */
  if (!isLoggedIn) {
    if (authPage === 'login') {
      return (
        <Login
          onLoginSuccess={() => setIsLoggedIn(true)}
          onSwitchToRegister={() => setAuthPage('register')}
        />
      )
    }

    if (authPage === 'register') {
      return (
        <Register
          onSwitchToLogin={() => setAuthPage('login')}
        />
      )
    }
  }


  // ── Welcome announcement ──────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => {
      speak(
        'Welcome to ThiranNexus. Swipe left for Tongue Twister. Swipe right for Mental Math. Long press anytime for help.',
        { rate: 0.85 }
      )
    }, 700)
    return () => clearTimeout(t)
  }, [])

  // ── Navigation helpers ────────────────────────────────────
  const navigateTo = useCallback(async (dest) => {
    const names = { home: 'Home', twister: 'Tongue Twister', math: 'Mental Math' }
    await speak(`Navigating to ${names[dest]}.`)
    setScreen(dest)
  }, [])

  const navigateByIndex = useCallback(async (dir) => {
    // dir: +1 = left swipe (next), -1 = right swipe (prev)
    setScreen(prev => {
      const idx     = SCREENS.indexOf(prev)
      const nextIdx = (idx + dir + SCREENS.length) % SCREENS.length
      const next    = SCREENS[nextIdx]
      const names   = { home: 'Home screen', twister: 'Tongue Twister', math: 'Mental Math' }
      speak(`Going to ${names[next]}.`)
      return next
    })
  }, [])

  // ── Gesture map per screen ────────────────────────────────
  useGestures({
    onSwipeLeft: () => {
      if (screen === 'home')    navigateTo('twister')
      else if (screen === 'twister') navigateTo('math')
      else if (screen === 'math')    navigateTo('home')
    },
    onSwipeRight: () => {
      if (screen === 'home')    navigateTo('math')
      else if (screen === 'twister') navigateTo('home')
      else if (screen === 'math')    navigateTo('twister')
    },
    onSwipeUp: () => {
      if (screen === 'twister') setTwisterAction('replay')
      else if (screen === 'math') setMathAction('replay')
      else speak('Swipe left for Tongue Twister. Swipe right for Mental Math.')
    },
    onSwipeDown: () => {
      if (screen === 'twister') setTwisterAction('difficulty')
      else if (screen === 'math') speak(`Your current score will be announced after each question.`)
      else speak('You are on the home screen.')
    },
    onDoubleTap: () => {
      if (screen === 'home')    navigateTo('twister')
      else if (screen === 'twister') setTwisterAction('primary')
      else if (screen === 'math')    setMathAction('primary')
    },
    onLongPress: () => {
      speak(HELP_TEXT[screen])
    },
  }, [screen])

  // ── Gesture hint overlay ──────────────────────────────────
  const [showHint, setShowHint] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setShowHint(false), 5000)
    return () => clearTimeout(t)
  }, [screen])

  if (screen === 'twister') {
    return (
      <TongueTwister
        onBack={() => navigateTo('home')}
        gestureAction={twisteAction}
        clearGestureAction={() => setTwisterAction(null)}
      />
    )
  }
  if (screen === 'math') {
    return (
      <MathGame
        onBack={() => navigateTo('home')}
        gestureAction={mathAction}
        clearGestureAction={() => setMathAction(null)}
      />
    )
  }

  return (
    <div className="home-container" role="main" aria-label="ThiranNexus Home">

      {/* Gesture hint toast */}
      {showHint && (
        <div className="gesture-hint" aria-live="polite" aria-label="Gesture hint">
          👈 Swipe left: Tongue Twister &nbsp;|&nbsp; Swipe right: Math 👉
        </div>
      )}

      {/* ── Hero ── */}
      <div className="home-hero">
        <div className="hero-bubbles" aria-hidden="true">
          <div className="bubble bubble-1"/><div className="bubble bubble-2"/><div className="bubble bubble-3"/>
        </div>

        <div className="logo-wrap" aria-hidden="true">
          <span className="logo-emoji">🎓</span>
        </div>
        <h1 className="brand-name">Thiran<span>Nexus</span></h1>
        <p className="brand-tagline">Audio-First Cognitive Training</p>

        <div className="avatar-strip" aria-hidden="true">
          {[['📚','Read'],['✏️','Write'],['🧮','Math'],['🗣️','Speak']].map(([emoji, label]) => (
            <div className="avatar-item" key={label}>
              <div className="avatar-circle">{emoji}</div>
              <span className="avatar-label">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="home-body">
        <p className="section-label">Choose Your Game 🎮</p>

        <nav className="game-nav" role="navigation" aria-label="Game selection">
          <button
            className="game-card"
            onClick={() => navigateTo('twister')}
            aria-label="Tongue Twister Challenge"
          >
            <div className="card-avatar-wrap" aria-hidden="true">🌀</div>
            <div className="card-info">
              <h2 className="card-title">Tongue Twister</h2>
              <p className="card-desc">Practice tricky phrases by speaking aloud</p>
              <span className="card-badge">👈 Swipe Left</span>
            </div>
            <span className="card-arrow" aria-hidden="true">›</span>
          </button>

          <button
            className="game-card"
            onClick={() => navigateTo('math')}
            aria-label="Mental Math Game"
          >
            <div className="card-avatar-wrap" aria-hidden="true">🧠</div>
            <div className="card-info">
              <h2 className="card-title">Mental Math</h2>
              <p className="card-desc">Solve arithmetic questions using your voice</p>
              <span className="card-badge">👉 Swipe Right</span>
            </div>
            <span className="card-arrow" aria-hidden="true">›</span>
          </button>
        </nav>

        {/* Gesture guide card */}
        <div className="gesture-guide" aria-label="Gesture guide">
          <h3 className="gesture-guide-title">✋ Gesture Controls</h3>
          <div className="gesture-list">
            {[
              ['👈', 'Swipe Left',  'Tongue Twister'],
              ['👉', 'Swipe Right', 'Mental Math'],
              ['👆', 'Swipe Up',    'Replay audio'],
              ['👇', 'Swipe Down',  'Change options'],
              ['👆👆','Double Tap', 'Primary action'],
              ['✋', 'Long Press',  'Help & instructions'],
            ].map(([icon, gesture, action]) => (
              <div className="gesture-row" key={gesture}>
                <span className="gesture-icon" aria-hidden="true">{icon}</span>
                <span className="gesture-name">{gesture}</span>
                <span className="gesture-action">{action}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="features-row" aria-label="Platform features" role="list">
          {[['🎙️','Voice-First'],['♿','Accessible'],['📈','Adaptive'],['✋','Gesture Nav']].map(([icon, label]) => (
            <div key={label} className="feature-chip" role="listitem">
              <span aria-hidden="true">{icon}</span> {label}
            </div>
          ))}
        </div>

        <footer className="home-footer" role="contentinfo">
          <button
            className="replay-btn"
            onClick={() => speak(HELP_TEXT.home)}
            aria-label="Replay welcome and gesture instructions"
          >
            🔊 Replay Instructions
          </button>
          <p className="footer-note">Designed for visually impaired learners</p>
        </footer>
      </div>
    </div>
  )
}