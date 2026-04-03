// src/components/dashboard/CategoryBars.jsx
import { useEffect, useRef } from 'react'

export default function CategoryBars({ data = [] }) {
  const barsRef = useRef(null)

  useEffect(() => {
    if (!barsRef.current) return
    const bars = barsRef.current.querySelectorAll('.tn-cat-fill')
    bars.forEach(b => {
      requestAnimationFrame(() => {
        b.style.width = b.dataset.w + '%'
      })
    })
  }, [data])

  return (
    <div ref={barsRef}>
      {data.map(cat => (
        <div key={cat.label} className="tn-cat-row">
          <span className="tn-cat-label">{cat.label}</span>
          <div className="tn-cat-bar-wrap">
            <div
              className="tn-cat-fill"
              data-w={cat.pct}
              style={{ width: 0, background: cat.color }}
            />
          </div>
          <span className="tn-cat-val">{cat.pct}%</span>
        </div>
      ))}
    </div>
  )
}