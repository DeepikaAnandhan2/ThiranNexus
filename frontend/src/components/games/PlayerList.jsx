import { FaCrown, FaPencilAlt, FaCheck } from 'react-icons/fa'
import './PlayerList.css'

export default function PlayerList({ players, currentDrawerId, myId }) {
  const sorted = [...players].sort((a, b) => b.score - a.score)

  return (
    <div className="plist-wrap">
      <div className="plist-header">
        <FaCrown className="plist-crown" /> Players
      </div>
      <div className="plist-items">
        {sorted.map((player, idx) => (
          <div
            key={player.userId}
            className={`plist-item
              ${player.userId === myId ? 'plist-me' : ''}
              ${player.userId === currentDrawerId ? 'plist-drawing' : ''}
            `}
          >
            <div className="plist-rank">#{idx + 1}</div>
            <div className="plist-avatar">{player.avatar || '😊'}</div>
            <div className="plist-info">
              <span className="plist-name">
                {player.nickname}
                {player.userId === myId && <span className="plist-you">(you)</span>}
              </span>
              <span className="plist-score">{player.score} pts</span>
            </div>
            <div className="plist-status">
              {player.userId === currentDrawerId && (
                <FaPencilAlt className="plist-icon plist-icon-draw" title="Drawing" />
              )}
              {player.hasGuessed && player.userId !== currentDrawerId && (
                <FaCheck className="plist-icon plist-icon-check" title="Guessed!" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}