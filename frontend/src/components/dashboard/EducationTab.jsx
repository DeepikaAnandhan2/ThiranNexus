// src/components/dashboard/EducationTab.jsx
import { useEffect, useRef, useState } from 'react'
import CategoryBars from './CategoryBars'
import {
  Chart, BarElement, ArcElement, LinearScale,
  CategoryScale, Tooltip, Legend,
} from 'chart.js'

Chart.register(BarElement, ArcElement, LinearScale, CategoryScale, Tooltip, Legend)

const isDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches
const gc     = () => isDark() ? 'rgba(255,255,255,.1)' : 'rgba(0,0,0,.07)'
const tc     = () => isDark() ? '#9c9a92' : '#73726c'

const SUBJ_KEYS = ['all', 'Mathematics', 'Science', 'English', 'Social Studies']

export default function EducationTab({ education }) {
  const [activeSubj, setActiveSubj] = useState('all')
  const weekRef  = useRef(null)
  const quizRef  = useRef(null)
  const weekInst = useRef(null)
  const quizInst = useRef(null)

  const { breakdown = [], weeklyTrend = {}, quizStats = {} } = education || {}

  const filteredBars = activeSubj === 'all'
    ? breakdown.map(d => ({ label: d.subject, pct: d.quizAvg, color: d.color }))
    : breakdown
        .filter(d => d.subject === activeSubj)
        .flatMap(d => [{ label: 'Quiz avg', pct: d.quizAvg, color: d.color },
                        { label: 'Lessons',  pct: Math.min(100, d.lessonsCompleted * 10), color: d.color }])

  // Weekly stacked bar
  useEffect(() => {
    if (!weekRef.current || !weeklyTrend.labels) return
    weekInst.current?.destroy()
    weekInst.current = new Chart(weekRef.current, {
      type: 'bar',
      data: {
        labels: weeklyTrend.labels,
        datasets: (weeklyTrend.datasets || []).map(ds => ({
          label: ds.label,
          data: ds.data,
          backgroundColor: ds.color,
          borderRadius: 4,
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { stacked: true, grid: { color: gc() }, ticks: { color: tc(), font: { size: 11 } } },
          y: { stacked: true, grid: { color: gc() }, ticks: { color: tc(), font: { size: 11 } } },
        },
      },
    })
    return () => weekInst.current?.destroy()
  }, [weeklyTrend])

  // Quiz doughnut
  useEffect(() => {
    if (!quizRef.current || !quizStats.correct) return
    quizInst.current?.destroy()
    quizInst.current = new Chart(quizRef.current, {
      type: 'doughnut',
      data: {
        labels: ['Correct', 'Wrong', 'Skipped'],
        datasets: [{
          data: [quizStats.correct, quizStats.wrong, quizStats.skipped],
          backgroundColor: ['#1D9E75', '#E24B4A', '#EF9F27'],
          borderWidth: 0,
          hoverOffset: 4,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: { legend: { display: false } },
      },
    })
    return () => quizInst.current?.destroy()
  }, [quizStats])

  return (
    <>
      {/* Subject filter chips */}
      <div className="tn-filter-row">
        {SUBJ_KEYS.map(k => (
          <button
            key={k}
            className={`tn-fchip ${activeSubj === k ? 'on' : ''}`}
            onClick={() => setActiveSubj(k)}
          >
            {k === 'all' ? 'All subjects' : k}
          </button>
        ))}
      </div>

      {/* Subject breakdown bars */}
      <div className="tn-card">
        <div className="tn-card-title">Subject breakdown</div>
        <CategoryBars data={filteredBars} />
      </div>

      {/* Weekly stacked bar */}
      <div className="tn-card">
        <div className="tn-card-title">Progress over 4 weeks</div>
        {/* Custom legend */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
          {(weeklyTrend.datasets || []).map(ds => (
            <span key={ds.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: tc() }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: ds.color, display: 'inline-block' }} />
              {ds.label}
            </span>
          ))}
        </div>
        <div style={{ position: 'relative', width: '100%', height: 200 }}>
          <canvas ref={weekRef} />
        </div>
      </div>

      {/* Quiz doughnut */}
      <div className="tn-card">
        <div className="tn-card-title">Quiz accuracy</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ position: 'relative', width: 140, height: 140, flexShrink: 0 }}>
            <canvas ref={quizRef} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { label: 'Correct', pct: quizStats.correct, color: '#1D9E75' },
              { label: 'Wrong',   pct: quizStats.wrong,   color: '#E24B4A' },
              { label: 'Skipped', pct: quizStats.skipped, color: '#EF9F27' },
            ].map(q => (
              <div key={q.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: q.color, flexShrink: 0 }} />
                <span style={{ color: 'var(--color-text-secondary)', minWidth: 52 }}>{q.label}</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 500 }}>{q.pct ?? 0}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}