import { useState, useEffect, useCallback } from 'react'
import TongueTwister from './components/TongueTwister'
import MathGame from './components/MathGame'
import { speak } from './utils/speech'

export default function App() {
  const [screen, setScreen] = useState('home')

  useEffect(() => {
    const timer = setTimeout(() => {
      speak('Welcome to ThiranNexus. An audio-first educational platform. Choose a game to begin.', { rate: 0.85 })
    }, 600)
    return () => clearTimeout(timer)
  }, [])

  const goTo = useCallback(async (dest, announcement) => {
    await speak(announcement, { rate: 0.9 })
    setScreen(dest)
  }, [])

  if (screen === 'twister') return <TongueTwister onBack={() => { setScreen('home'); speak('Back at main menu.') }} />
  if (screen === 'math')    return <MathGame      onBack={() => { setScreen('home'); speak('Back at main menu.') }} />

  return (
    <div className="home-container" role="main" aria-label="ThiranNexus Home">

      {/* ── Hero ── */}
      <div className="home-hero">
        <div className="hero-bubbles" aria-hidden="true">
          <div className="bubble bubble-1" />
          <div className="bubble bubble-2" />
          <div className="bubble bubble-3" />
        </div>

        <div className="logo-wrap" aria-hidden="true">
          <span className="logo-emoji">🎓</span>
        </div>

        <h1 className="brand-name">Thiran<span>Nexus</span></h1>
        <p className="brand-tagline">Audio-First Cognitive Training</p>

        {/* Education avatar strip */}
        <div className="avatar-strip" aria-hidden="true">
          {[
            ['📚', 'Read'],
            ['✏️', 'Write'],
            ['🧮', 'Math'],
            ['🗣️', 'Speak'],
          ].map(([emoji, label]) => (
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
            onClick={() => goTo('twister', 'Starting Tongue Twister Challenge.')}
            aria-label="Tongue Twister Challenge. Practice pronunciation with fun sentences."
          >
            <div className="card-avatar-wrap" aria-hidden="true">🌀</div>
            <div className="card-info">
              <h2 className="card-title">Tongue Twister</h2>
              <p className="card-desc">Practice tricky phrases by speaking aloud</p>
              <span className="card-badge">Voice Game</span>
            </div>
            <span className="card-arrow" aria-hidden="true">›</span>
          </button>

          <button
            className="game-card"
            onClick={() => goTo('math', 'Starting Mental Math Game.')}
            aria-label="Mental Math Game. Solve arithmetic questions by voice."
          >
            <div className="card-avatar-wrap" aria-hidden="true">🧠</div>
            <div className="card-info">
              <h2 className="card-title">Mental Math</h2>
              <p className="card-desc">Solve arithmetic questions using your voice</p>
              <span className="card-badge">Math Game</span>
            </div>
            <span className="card-arrow" aria-hidden="true">›</span>
          </button>
        </nav>

        {/* Feature chips */}
        <div className="features-row" aria-label="Platform features" role="list">
          {[['🎙️','Voice-First'],['♿','Accessible'],['📈','Adaptive'],['🔊','Audio Feedback']].map(([icon, label]) => (
            <div key={label} className="feature-chip" role="listitem">
              <span aria-hidden="true">{icon}</span> {label}
            </div>
          ))}
        </div>

        <footer className="home-footer" role="contentinfo">
          <button
            className="replay-btn"
            onClick={() => speak('Welcome to ThiranNexus. Choose Tongue Twister or Mental Math to begin.')}
            aria-label="Replay welcome message"
          >
            🔊 Replay Welcome
          </button>
          <p className="footer-note">Designed for visually impaired learners</p>
        </footer>
      </div>

    </div>
  )
}