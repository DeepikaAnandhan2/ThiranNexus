// src/components/dashboard/MetricCard.jsx
export default function MetricCard({ label, value, delta, deltaUp }) {
  return (
    <div className="tn-mcard">
      <div className="tn-mcard-lbl">{label}</div>
      <div className="tn-mcard-val">{value ?? '—'}</div>
      {delta && (
        <div className={`tn-mcard-delta ${deltaUp ? 'up' : 'dn'}`}>{delta}</div>
      )}
    </div>
  )
}