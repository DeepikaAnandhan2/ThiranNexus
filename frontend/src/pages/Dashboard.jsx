// frontend/src/pages/Dashboard/Dashboard.jsx
// Drop straight into AppLayout — no sidebar/topbar needed, just the inner content

import { useState, useEffect, useRef } from 'react'
import { dashboardService } from '../services/dashboardService'
import {
  FaGamepad, FaTrophy, FaFire, FaMedal,
  FaChartLine, FaBook, FaBrain, FaLock,
  FaCheckCircle, FaClock, FaStar, FaGraduationCap,
  FaBolt, FaPalette, FaCalculator, FaLanguage,
  FaSpinner, FaRedo,
} from 'react-icons/fa'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale,
  PointElement, LineElement,
  BarElement, ArcElement,
  Filler, Tooltip, Legend,
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import '../styles/Dashboard.css'

ChartJS.register(
  CategoryScale, LinearScale,
  PointElement, LineElement,
  BarElement, ArcElement,
  Filler, Tooltip, Legend,
)

// ── Schemes (static for now) ──────────────────────────────
const SCHEMES = [
  { icon: <FaGraduationCap />, title: 'National Scholarship for Disabled Students', meta: 'Central Govt · Visual · Class 8–12', status: 'saved' },
  { icon: <FaBook />,          title: 'Tamil Nadu Disability Welfare Scheme',        meta: 'State Govt · All disabilities',      status: 'applied' },
  { icon: <FaBolt />,          title: 'Assistive Technology Grant',                  meta: 'Central Govt · Up to ₹25,000',       status: 'saved' },
  { icon: <FaStar />,          title: 'Free Bus Pass – Disabled Students',           meta: 'TN Transport · All education levels', status: 'new' },
]

// ── Game icon map ─────────────────────────────────────────
const GAME_ICONS = {
  scribble:        <FaPalette />,
  'mental math':   <FaCalculator />,
  'tongue twister': <FaLanguage />,
}

// ── Chart shared options ──────────────────────────────────
const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { color: 'rgba(124,58,237,.15)' }, ticks: { color: '#a78bfa', font: { size: 11, family: 'Inter' } } },
    y: { grid: { color: 'rgba(124,58,237,.15)' }, ticks: { color: '#a78bfa', font: { size: 11, family: 'Inter' } }, min: 0 },
  },
}

// ── Skeleton ──────────────────────────────────────────────
function Skel({ h = 20, mb = 10, radius = 8 }) {
  return <div className="tn-skel" style={{ height: h, marginBottom: mb, borderRadius: radius }} />
}

// ── Stat card ─────────────────────────────────────────────
function StatCard({ icon, label, value, delta, deltaUp, accent }) {
  return (
    <div className="tn-stat-card" style={{ '--accent': accent }}>
      <div className="tn-stat-icon">{icon}</div>
      <div className="tn-stat-body">
        <div className="tn-stat-label">{label}</div>
        <div className="tn-stat-value">{value ?? '—'}</div>
        {delta && <div className={`tn-stat-delta ${deltaUp ? 'up' : 'neutral'}`}>{delta}</div>}
      </div>
    </div>
  )
}

// ── Category bar ──────────────────────────────────────────
function CategoryBars({ data }) {
  const [animated, setAnimated] = useState(false)
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 100); return () => clearTimeout(t) }, [data])
  return (
    <div className="tn-cat-list">
      {data.map(c => (
        <div key={c.label} className="tn-cat-row">
          <span className="tn-cat-label">{c.label}</span>
          <div className="tn-cat-track">
            <div
              className="tn-cat-fill"
              style={{ width: animated ? `${c.pct}%` : '0%', background: c.color }}
            />
          </div>
          <span className="tn-cat-pct">{c.pct}%</span>
        </div>
      ))}
    </div>
  )
}

// ── Badge card ────────────────────────────────────────────
function BadgeCard({ badge }) {
  const stateIcon = badge.state === 'earned'
    ? <FaCheckCircle className="tn-badge-state earned" />
    : badge.state === 'progress'
      ? <FaClock className="tn-badge-state progress" />
      : <FaLock className="tn-badge-state locked" />

  return (
    <div className={`tn-badge-card ${badge.state}`}>
      <div className="tn-badge-top">
        <span className="tn-badge-emoji">{badge.icon}</span>
        {stateIcon}
      </div>
      <div className="tn-badge-name">{badge.name}</div>
      <div className="tn-badge-desc">{badge.desc}</div>
      {badge.state === 'progress' && (
        <>
          <div className="tn-badge-track">
            <div className="tn-badge-fill" style={{ width: `${badge.pct}%` }} />
          </div>
          <div className="tn-badge-pct">{badge.pct}%</div>
        </>
      )}
      {badge.state === 'earned' && <div className="tn-badge-pill earned">EARNED</div>}
      {badge.state === 'locked' && <div className="tn-badge-pill locked">LOCKED</div>}
    </div>
  )
}

// ════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════
export default function Dashboard() {
  const [tab, setTab]           = useState('overview')
  const [summary, setSummary]   = useState(null)
  const [games, setGames]       = useState(null)
  const [education, setEdu]     = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [subjFilter, setSubjFilter] = useState('all')

const user = JSON.parse(localStorage.getItem('tn_user') || '{}')
  const initials = user.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'ST'

  const fetchAll = async () => {
    setLoading(true); setError(null)
    try {
      const [s, g, e] = await Promise.all([
        dashboardService.getSummary(),
        dashboardService.getGames(),
        dashboardService.getEducation(),
      ])
      setSummary(s); setGames(g); setEdu(e)
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  // ── Chart data builders ────────────────────────────────
  const trendData = summary ? {
    labels: summary.trend.labels,
    datasets: [
      {
        label: 'Lessons',
        data: summary.trend.lessonSeries,
        borderColor: '#7C3AED',
        backgroundColor: 'rgba(124,58,237,.15)',
        tension: 0.4, fill: true, pointRadius: 4,
        pointBackgroundColor: '#7C3AED',
        pointBorderColor: '#fff', pointBorderWidth: 2,
      },
      {
        label: 'Games',
        data: summary.trend.gameSeries,
        borderColor: '#F97316',
        backgroundColor: 'rgba(249,115,22,.1)',
        tension: 0.4, fill: true, pointRadius: 4,
        pointBackgroundColor: '#F97316',
        pointBorderColor: '#fff', pointBorderWidth: 2,
      },
    ],
  } : null

  const eduBreakdown = education?.breakdown || []
  const filteredBars = subjFilter === 'all'
    ? eduBreakdown.map(d => ({ label: d.subject, pct: d.quizAvg, color: d.color }))
    : eduBreakdown.filter(d => d.subject === subjFilter)
        .flatMap(d => [
          { label: 'Quiz avg', pct: d.quizAvg,                             color: d.color },
          { label: 'Lessons',  pct: Math.min(100, d.lessonsCompleted * 10), color: d.color },
        ])

  const weeklyData = education ? {
    labels: education.weeklyTrend.labels,
    datasets: education.weeklyTrend.datasets.map(ds => ({
      label: ds.label,
      data: ds.data,
      backgroundColor: ds.color,
      borderRadius: 6,
    })),
  } : null

  const quizData = education ? {
    labels: ['Correct', 'Wrong', 'Skipped'],
    datasets: [{
      data: [education.quizStats.correct, education.quizStats.wrong, education.quizStats.skipped],
      backgroundColor: ['#10B981', '#EF4444', '#F97316'],
      borderWidth: 0, hoverOffset: 6,
    }],
  } : null

  const TABS = ['overview', 'education', 'games', 'schemes']
  const TAB_LABELS = { overview: 'Overview', education: 'Education', games: 'Games', schemes: 'Schemes' }
  const TAB_ICONS  = { overview: <FaChartLine />, education: <FaBook />, games: <FaGamepad />, schemes: <FaMedal /> }

  return (
    <div className="tn-dash">

      {/* ── Page Header ───────────────────────────────── */}
      <div className="tn-dash-header">
        <div className="tn-dash-header-left">
          <div className="tn-avatar">{initials}</div>
          <div>
            <h1 className="tn-dash-title">
              Welcome back, {user.name?.split(' ')[0] || 'Student'} 👋
            </h1>
            <p className="tn-dash-sub">
              {user.educationLevel === 'school' ? `Class ${user.className}` : user.course || 'Student'}
              {user.disabilityType && user.disabilityType !== 'none' && ` · ${user.disabilityType} disability`}
            </p>
          </div>
        </div>
        <div className="tn-active-pill">
          <span className="tn-active-dot" />
          Active
        </div>
      </div>

      {/* ── Tabs ──────────────────────────────────────── */}
      <div className="tn-tabs">
        {TABS.map(t => (
          <button key={t} className={`tn-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            <span className="tn-tab-icon">{TAB_ICONS[t]}</span>
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      {/* ── Error ─────────────────────────────────────── */}
      {error && (
        <div className="tn-error-banner">
          {error}
          <button className="tn-retry-btn" onClick={fetchAll}>
            <FaRedo /> Retry
          </button>
        </div>
      )}

      {/* ════════════════════════════════════════════════
          OVERVIEW TAB
      ════════════════════════════════════════════════ */}
      {tab === 'overview' && (
        <>
          {/* Stat cards */}
          <div className="tn-stats-grid">
            {loading ? (
              [1,2,3,4].map(i => <Skel key={i} h={100} radius={16} />)
            ) : (
              <>
                <StatCard icon={<FaGamepad />}    label="Games Played"  value={summary?.metrics?.gamesPlayed} delta="+5 this week" deltaUp accent="#7C3AED" />
                <StatCard icon={<FaTrophy />}     label="Total Wins"    value={summary?.metrics?.wins}        delta={`Best: ${summary?.metrics?.bestScore ?? 0} pts`} deltaUp accent="#F97316" />
                <StatCard icon={<FaFire />}       label="Day Streak"    value={`${summary?.metrics?.streak ?? 0}d`} delta="Keep it up!" deltaUp accent="#10B981" />
                <StatCard icon={<FaMedal />}      label="Badges Earned" value={summary?.metrics?.badgesEarned} delta="2 in progress" accent="#F59E0B" />
              </>
            )}
          </div>

          {/* Category performance */}
          <div className="tn-card">
            <div className="tn-card-header">
              <FaChartLine className="tn-card-icon" />
              <span>Category Performance</span>
            </div>
            {loading
              ? [1,2,3,4,5].map(i => <Skel key={i} h={12} mb={14} />)
              : <CategoryBars data={summary?.categoryPerformance || []} />
            }
          </div>

          {/* Trend chart */}
          <div className="tn-card">
            <div className="tn-card-header">
              <FaChartLine className="tn-card-icon" />
              <span>7-Day Learning Trend</span>
              <div className="tn-legend">
                <span className="tn-legend-dot" style={{ background: '#7C3AED' }} /> Lessons
                <span className="tn-legend-dot" style={{ background: '#F97316' }} /> Games
              </div>
            </div>
            {loading
              ? <Skel h={220} radius={12} />
              : trendData && (
                  <div style={{ height: 220 }}>
                    <Line data={trendData} options={chartDefaults} />
                  </div>
                )
            }
          </div>
        </>
      )}

      {/* ════════════════════════════════════════════════
          EDUCATION TAB
      ════════════════════════════════════════════════ */}
      {tab === 'education' && (
        <>
          {/* Subject filter chips */}
          <div className="tn-chips">
            {['all', ...(education?.breakdown?.map(d => d.subject) || [])].map(s => (
              <button
                key={s}
                className={`tn-chip ${subjFilter === s ? 'active' : ''}`}
                onClick={() => setSubjFilter(s)}
              >
                {s === 'all' ? 'All Subjects' : s}
              </button>
            ))}
          </div>

          {/* Subject bars */}
          <div className="tn-card">
            <div className="tn-card-header">
              <FaBook className="tn-card-icon" />
              <span>Subject Breakdown</span>
            </div>
            {loading
              ? [1,2,3,4].map(i => <Skel key={i} h={12} mb={14} />)
              : <CategoryBars data={filteredBars} />
            }
          </div>

          {/* Weekly stacked bar */}
          <div className="tn-card">
            <div className="tn-card-header">
              <FaBook className="tn-card-icon" />
              <span>Progress Over 4 Weeks</span>
              <div className="tn-legend">
                {education?.weeklyTrend?.datasets?.map(ds => (
                  <span key={ds.label} className="tn-legend-item">
                    <span className="tn-legend-dot" style={{ background: ds.color }} />
                    {ds.label}
                  </span>
                ))}
              </div>
            </div>
            {loading
              ? <Skel h={220} radius={12} />
              : weeklyData && (
                  <div style={{ height: 220 }}>
                    <Bar data={weeklyData} options={{ ...chartDefaults, scales: { ...chartDefaults.scales, x: { ...chartDefaults.scales.x, stacked: true }, y: { ...chartDefaults.scales.y, stacked: true } } }} />
                  </div>
                )
            }
          </div>

          {/* Quiz doughnut */}
          <div className="tn-card">
            <div className="tn-card-header">
              <FaBrain className="tn-card-icon" />
              <span>Quiz Accuracy</span>
            </div>
            {loading
              ? <Skel h={180} radius={12} />
              : quizData && (
                  <div className="tn-quiz-wrap">
                    <div style={{ width: 160, height: 160, flexShrink: 0 }}>
                      <Doughnut data={quizData} options={{ ...chartDefaults, scales: undefined, cutout: '68%' }} />
                    </div>
                    <div className="tn-quiz-legend">
                      {[
                        { label: 'Correct', pct: education.quizStats.correct,  color: '#10B981' },
                        { label: 'Wrong',   pct: education.quizStats.wrong,    color: '#EF4444' },
                        { label: 'Skipped', pct: education.quizStats.skipped,  color: '#F97316' },
                      ].map(q => (
                        <div key={q.label} className="tn-quiz-row">
                          <span className="tn-legend-dot" style={{ background: q.color }} />
                          <span className="tn-quiz-label">{q.label}</span>
                          <span className="tn-quiz-pct">{q.pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
            }
          </div>
        </>
      )}

      {/* ════════════════════════════════════════════════
          GAMES TAB
      ════════════════════════════════════════════════ */}
      {tab === 'games' && (
        <>
          {/* Mini stats */}
          <div className="tn-stats-grid">
            {loading ? (
              [1,2,3].map(i => <Skel key={i} h={100} radius={16} />)
            ) : (
              <>
                <StatCard icon={<FaTrophy />}  label="Scribble Wins" value={games?.categoryBreakdown?.find(c => c.game === 'Scribble')?.wins} delta="Rank #1 sessions" deltaUp accent="#7C3AED" />
                <StatCard icon={<FaStar />}    label="Best Score"    value={summary?.metrics?.bestScore} delta="Scribble" accent="#F97316" />
                <StatCard icon={<FaFire />}    label="Current Streak" value={`${summary?.metrics?.streak ?? 0}d`} delta="days in a row" deltaUp accent="#10B981" />
              </>
            )}
          </div>

          {/* Game category breakdown */}
          <div className="tn-card">
            <div className="tn-card-header">
              <FaGamepad className="tn-card-icon" />
              <span>Game Category Stats</span>
            </div>
            <div className="tn-game-cats">
              {loading
                ? [1,2,3].map(i => <Skel key={i} h={72} radius={12} />)
                : (games?.categoryBreakdown || []).map(cat => (
                    <div key={cat.game} className="tn-game-cat-card" style={{ '--cat-color': cat.color }}>
                      <div className="tn-game-cat-name">{cat.game}</div>
                      <div className="tn-game-cat-stats">
                        <span>{cat.played} played</span>
                        <span>{cat.wins} wins</span>
                        <span>avg {cat.avgScore}</span>
                      </div>
                    </div>
                  ))
              }
            </div>
          </div>

          {/* Session history */}
          <div className="tn-card">
            <div className="tn-card-header">
              <FaChartLine className="tn-card-icon" />
              <span>Recent Sessions</span>
            </div>
            {loading
              ? [1,2,3].map(i => <Skel key={i} h={60} mb={10} radius={12} />)
              : (games?.history || []).length === 0
                ? <p className="tn-empty">No game sessions yet — start playing!</p>
                : (games?.history || []).map(s => {
                    const gameKey = (s.gameName || 'scribble').toLowerCase()
                    return (
                      <div key={s._id} className="tn-session-row">
                        <div className="tn-session-icon">
                          {GAME_ICONS[gameKey] || <FaGamepad />}
                        </div>
                        <div className="tn-session-info">
                          <div className="tn-session-name">
                            {s.gameName || 'Scribble'}
                            <span className="tn-session-room">#{s.roomCode}</span>
                          </div>
                          <div className="tn-session-meta">
                            {s.wordsDrawn} drawn · {s.correctGuesses} guessed · {new Date(s.playedAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="tn-session-right">
                          <span className="tn-session-score">{s.totalScore}</span>
                          <span className={`tn-rank-pill rank-${s.rank}`}>#{s.rank}</span>
                        </div>
                      </div>
                    )
                  })
            }
          </div>

          {/* Badges */}
          <div className="tn-card">
            <div className="tn-card-header">
              <FaMedal className="tn-card-icon" />
              <span>Badges</span>
            </div>
            <div className="tn-badge-grid">
              {loading
                ? [1,2,3,4,5,6].map(i => <Skel key={i} h={160} radius={14} />)
                : (summary?.badges || []).map(b => <BadgeCard key={b.id} badge={b} />)
              }
            </div>
          </div>
        </>
      )}

      {/* ════════════════════════════════════════════════
          SCHEMES TAB
      ════════════════════════════════════════════════ */}
      {tab === 'schemes' && (
        <>
          <div className="tn-stats-grid">
            <StatCard icon={<FaMedal />}       label="Matched"  value={8} delta="for your disability" accent="#7C3AED" />
            <StatCard icon={<FaCheckCircle />} label="Saved"    value={3} delta="Review pending" deltaUp accent="#10B981" />
            <StatCard icon={<FaClock />}       label="Applied"  value={1} delta="Processing" accent="#F97316" />
          </div>

          <div className="tn-card">
            <div className="tn-card-header">
              <FaMedal className="tn-card-icon" />
              <span>Recommended Schemes</span>
            </div>
            {SCHEMES.map((s, i) => (
              <div key={i} className="tn-scheme-row">
                <div className="tn-scheme-icon">{s.icon}</div>
                <div className="tn-scheme-body">
                  <div className="tn-scheme-title">{s.title}</div>
                  <div className="tn-scheme-meta">{s.meta}</div>
                  <button className="tn-scheme-btn">
                    {s.status === 'applied' ? 'Track Application'
                      : s.status === 'saved' ? 'View Details'
                      : 'Save Scheme'}
                  </button>
                </div>
                <span className={`tn-scheme-tag ${s.status}`}>{s.status.toUpperCase()}</span>
              </div>
            ))}
          </div>
        </>
      )}

    </div>
  )
}