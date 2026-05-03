import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TongueTwister from '../components/games/TongueTwister'
import MathGame from '../components/games/MathGame'
import { speak } from '../utils/speech'
import { useGestures } from '../utils/useGestures'
import '../styles/Games.css'

const GAMES = [
  { id: 'twister', icon: '🌀', title: 'Tongue Twister', desc: 'Practice tricky phrases aloud', badge: '👈 Swipe Left', color: 'teal' },
  { id: 'math', icon: '🧮', title: 'Mental Math', desc: 'Solve equations using your voice', badge: '👆👆 Double Tap', color: 'orange' },
  { id: 'logic', icon: '🧩', title: 'Logic Game', desc: 'Solve row-based puzzles', badge: '🧠 Brain Game', color: 'blue' }, // ✅ NEW
  { id: 'scribble', icon: '✍️', title: 'Scribble', desc: 'Draw and improve brain coordination', badge: '👉 Swipe Right', color: 'purple' },
]

export default function Games() {
  const [activeGame, setActiveGame] = useState(null)
  const navigate = useNavigate()

  const selectGame = async (id, title) => {
    await speak(`Starting ${title}.`)

    if (id === 'scribble') {
      navigate('/scribble')
    } else if (id === 'logic') {
      navigate('/games/logic') // ✅ LOGIC NAVIGATION
    } else {
      setActiveGame(id)
    }
  }

  const goBack = async () => {
    await speak('Back to game selection.')
    setActiveGame(null)
  }

  // Gesture Support
  useGestures({
    onSwipeLeft: () => { if (!activeGame) selectGame('twister', 'Tongue Twister') },
    onSwipeRight: () => { if (!activeGame) selectGame('scribble', 'Scribble') },
    onDoubleTap: () => { if (!activeGame) selectGame('math', 'Mental Math') },
    onSwipeUp: () => {
      if (!activeGame)
        speak('Swipe left for Tongue Twister. Double tap for Math. Swipe right for Scribble. Tap Logic Game for puzzle.')
    },
    onLongPress: () =>
      speak('Games screen. Swipe left for Tongue Twister. Double tap for Mental Math. Swipe right for Scribble. Tap Logic Game for puzzle.'),
  }, [activeGame])

  // Render active games
  if (activeGame === 'twister') return <TongueTwister onBack={goBack} />
  if (activeGame === 'math') return <MathGame onBack={goBack} />

  return (
    <div className="games-page">

      {/* Banner */}
      <div className="games-banner">
        <div className="games-banner-bubble1" />
        <div className="games-banner-bubble2" />
        <div className="games-banner-avatar">🎮</div>
        <h1 className="games-banner-title">Games</h1>
        <p className="games-banner-subtitle">Train your brain • Have fun</p>
      </div>

      {/* Body */}
      <div className="games-body">

        {/* Gesture Hint */}
        <div className="games-gesture-hint">
          <span>Tongue Twister</span>
          <span>Math</span>
          <span>Logic</span> {/* ✅ NEW */}
          <span>Scribble</span>
        </div>

        <p className="games-section-label">Choose a Game</p>

        {/* Game Cards */}
        <nav className="games-nav">
          {GAMES.map(({ id, icon, title, desc, badge, color }) => (
            <button
              key={id}
              className={`games-card ${color}`}
              onClick={() => selectGame(id, title)}
            >
              <div className="games-card-avatar">{icon}</div>
              <div className="games-card-info">
                <h2 className="games-card-title">{title}</h2>
                <p className="games-card-desc">{desc}</p>
                <span className="games-card-badge">{badge}</span>
              </div>
              <span className="games-card-arrow">›</span>
            </button>
          ))}
        </nav>

        {/* Replay */}
        <div className="games-replay-wrap">
          <button
            className="games-replay-btn"
            onClick={() =>
              speak('Swipe left for Tongue Twister. Double tap for Math. Swipe right for Scribble. Tap Logic Game for puzzle.')
            }
          >
            🔊 Replay Instructions
          </button>
        </div>

      </div>
    </div>
  )
}