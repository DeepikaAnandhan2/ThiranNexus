// src/components/dashboard/BadgeGrid.jsx
export default function BadgeGrid({ badges = [] }) {
  return (
    <div className="tn-badge-grid">
      {badges.map(b => (
        <div key={b.id} className={`tn-badge-card ${b.state === 'locked' ? 'locked' : 'earned'}`}>
          <span className="tn-badge-icon">{b.icon}</span>
          <div className="tn-badge-name">{b.name}</div>
          <div className="tn-badge-desc">{b.desc}</div>

          {b.state === 'progress' && (
            <div className="tn-prog-bar">
              <div className="tn-prog-fill" style={{ width: `${b.pct}%`, background: b.color }} />
            </div>
          )}

          <span className={`tn-badge-tag ${b.state === 'earned' ? 'tag-earned' : b.state === 'progress' ? 'tag-progress' : 'tag-locked'}`}>
            {b.state === 'earned' ? 'EARNED' : b.state === 'progress' ? `${b.pct}%` : 'LOCKED'}
          </span>
        </div>
      ))}
    </div>
  )
}