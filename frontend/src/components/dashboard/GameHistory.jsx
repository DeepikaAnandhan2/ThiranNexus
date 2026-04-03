// src/components/dashboard/GameHistory.jsx

const GAME_EMOJI = {
  scribble:      '🎨',
  'mental math': '🧠',
  'tongue twister': '👅',
}

function rankClass(rank) {
  if (rank === 1) return 'r1'
  if (rank === 2) return 'r2'
  return 'r3'
}

export default function GameHistory({ history = [], categoryBreakdown = [] }) {
  return (
    <>
      {/* Per-game category stats */}
      {categoryBreakdown.length > 0 && (
        <div className="tn-game-breakdown">
          {categoryBreakdown.map(cat => (
            <div key={cat.game} className="tn-mcard" style={{ flex: 1 }}>
              <div className="tn-mcard-lbl">{cat.game}</div>
              <div className="tn-mcard-val">{cat.played}</div>
              <div className="tn-mcard-delta" style={{ color: cat.color }}>
                {cat.wins} wins · avg {cat.avgScore}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Session rows */}
      <div className="tn-game-list">
        {history.length === 0 && (
          <p className="tn-empty">No game sessions yet. Start playing!</p>
        )}
        {history.map(s => {
          const gameKey = (s.gameName || 'scribble').toLowerCase()
          const emoji   = GAME_EMOJI[gameKey] || '🎮'
          return (
            <div key={s._id} className="tn-game-row">
              <div className="tn-game-badge">{emoji}</div>
              <div className="tn-game-info">
                <div className="tn-game-name">
                  {s.gameName || 'Scribble'} &nbsp;
                  <span style={{ fontFamily: 'monospace', fontSize: 11 }}>#{s.roomCode}</span>
                </div>
                <div className="tn-game-meta">
                  {s.wordsDrawn} drawn · {s.correctGuesses} guessed ·{' '}
                  {new Date(s.playedAt).toLocaleDateString()}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                <span className="tn-game-score">{s.totalScore}</span>
                <span className={`tn-rank-badge ${rankClass(s.rank)}`}>#{s.rank}</span>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}