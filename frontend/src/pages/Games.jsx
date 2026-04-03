import { useState } from 'react'
import { useNavigate } from 'react-router-dom' // 1. Import useNavigate
import TongueTwister from '../components/games/TongueTwister'
import MathGame      from '../components/games/MathGame'
import { speak }     from '../utils/speech'
import { useGestures } from '../utils/useGestures'
import '../styles/Games.css'

const GAMES = [
  { id: 'twister',  icon: '🌀', title: 'Tongue Twister', desc: 'Practice tricky phrases aloud',      badge: '👈 Swipe Left',  color: 'teal'   },
  { id: 'math',     icon: '🧮', title: 'Mental Math',    desc: 'Solve equations using your voice',    badge: '👆👆 Double Tap', color: 'orange' },
  { id: 'scribble', icon: '✍️', title: 'Scribble',       desc: 'Draw and improve brain coordination', badge: '👉 Swipe Right',  color: 'purple' },
]

export default function Games() {
  const [activeGame, setActiveGame] = useState(null)
  const navigate = useNavigate() // 2. Initialize navigate

  const selectGame = async (id, title) => {
    await speak(`Starting ${title}.`)
    
    // 3. Check if it's scribble to navigate to the page
    if (id === 'scribble') {
      navigate('/scribble') 
    } else {
      setActiveGame(id)
    }
  }

  const goBack = async () => {
    await speak('Back to game selection.')
    setActiveGame(null)
  }

  // Gestures on selection screen
  useGestures({
    onSwipeLeft:  () => { if (!activeGame) selectGame('twister', 'Tongue Twister') },
    onSwipeRight: () => { if (!activeGame) selectGame('scribble', 'Scribble') },
    onDoubleTap:  () => { if (!activeGame) selectGame('math', 'Mental Math') },
    onSwipeUp:    () => { if (!activeGame) speak('Swipe left for Tongue Twister. Double tap for Math. Swipe right for Scribble.') },
    onLongPress:  () => speak('Games screen. Swipe left for Tongue Twister. Double tap for Mental Math. Swipe right for Scribble.'),
  }, [activeGame])

  // Render active game (Internal Components)
  if (activeGame === 'twister')  return (
    <TongueTwister
      onBack={goBack}
    />
  )
  if (activeGame === 'math')     return (
    <MathGame
      onBack={goBack}
    />
  )

  // Game selection screen
  return (
    <div className="games-page">

      {/* Banner */}
      <div className="games-banner">
        <div className="games-banner-bubble1" aria-hidden="true" />
        <div className="games-banner-bubble2" aria-hidden="true" />
        <div className="games-banner-avatar" aria-hidden="true">🎮</div>
        <h1 className="games-banner-title">Games</h1>
        <p className="games-banner-subtitle">Train your brain • Have fun</p>
      </div>

      {/* Body */}
      <div className="games-body">

        <div className="games-gesture-hint" aria-label="Gesture hints">
          <span> Tongue Twister</span>
          <span> Math</span>
          <span> Scribble</span>
        </div>

        <p className="games-section-label">Choose a Game</p>

        {/* Game cards */}
        <nav className="games-nav" role="navigation" aria-label="Game selection">
          {GAMES.map(({ id, icon, title, desc, badge, color }) => (
            <button
              key={id}
              className={`games-card ${color}`}
              onClick={() => selectGame(id, title)} // This now handles the navigation
              aria-label={`${title}. ${desc}`}
            >
              <div className="games-card-avatar" aria-hidden="true">{icon}</div>
              <div className="games-card-info">
                <h2 className="games-card-title">{title}</h2>
                <p className="games-card-desc">{desc}</p>
                <span className="games-card-badge">{badge}</span>
              </div>
              <span className="games-card-arrow" aria-hidden="true">›</span>
            </button>
          ))}
        </nav>

        {/* Replay instructions */}
        <div className="games-replay-wrap">
          <button
            className="games-replay-btn"
            onClick={() => speak('Swipe left for Tongue Twister. Double tap for Mental Math. Swipe right for Scribble.')}
          >
            🔊 Replay Instructions
          </button>
        </div>

      </div>
    </div>
  )
}