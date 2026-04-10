import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import {
  FaUserCircle, FaIdCard, FaBrain, FaBook, FaGamepad,
  FaTrophy, FaBell, FaChartBar, FaChild, FaHeart,
  FaCheckCircle, FaExclamationTriangle, FaInfoCircle,
  FaFire, FaBullseye, FaClock, FaStar, FaSchool,
  FaHandsHelping, FaShieldAlt
} from 'react-icons/fa'
import '../styles/ParentDashboard.css'

const API = 'http://localhost:5000'
const token = () => localStorage.getItem('tn_token')
const headers = () => ({ Authorization: `Bearer ${token()}` })

const DISABILITY_ICONS = {
  visual: '👁️', hearing: '👂', cognitive: '🧠',
  motor: '✋', speech: '🗣️', multiple: '♿', other: '📋',
}

const DISABILITY_COLORS = {
  visual: '#8B5CF6', hearing: '#2DC9A6', cognitive: '#FF8C42',
  motor: '#3B82F6', speech: '#EF4444', multiple: '#F59E0B', other: '#6366F1',
}

export default function ParentDashboard() {
  const [children, setChildren] = useState([])
  const [selectedChild, setSelectedChild] = useState(null)
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [dashLoading, setDashLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [error, setError] = useState('')

  // Safely parse parent data - check both id and _id
  const storedUser = JSON.parse(localStorage.getItem('tn_user') || '{}')
  const parentId = storedUser.id || storedUser._id
  console.log("Parent data:", storedUser, "parentId:", parentId) // DEBUG

  // ── 1. Fetch children (Only if parent.id is valid) ──────────────────
  useEffect(() => {
    if (!parentId || parentId === 'undefined') {
      console.log("No valid parent ID, skipping fetch")
      setLoading(false);
      return;
    }

    const fetchChildren = async () => {
      try {
        console.log("Fetching from:", `${API}/api/pdc/parent/${parentId}`)
        const res = await axios.get(`${API}/api/pdc/parent/${parentId}`, { headers: headers() })
        console.log("Children response:", res.data)
        const childData = res.data.children || []
        setChildren(childData)
        
        if (childData.length > 0) {
          setSelectedChild(childData[0])
        }
      } catch (err) {
        console.error("Error fetching children:", err.response?.data || err.message)
        setError(err.response?.data?.error || err.message)
        setChildren([]) 
      } finally { 
        setLoading(false) 
      }
    }
    fetchChildren()
  }, [parentId]) // Depend on parent.id

  // ── 2. Fetch dashboard for selected child ─────────────────
  useEffect(() => {
    if (!selectedChild || !selectedChild._id) return

    const fetchDashboard = async () => {
      setDashLoading(true)
      try {
        const res = await axios.get(`${API}/api/pdc/child/${selectedChild._id}`, { headers: headers() })
        setDashboard(res.data)
      } catch (err) {
        console.error("Error fetching dashboard:", err)
        setDashboard(null) 
      } finally { 
        setDashLoading(false) 
      }
    }
    fetchDashboard()
  }, [selectedChild?._id]) // Depend on specific ID

  if (loading) return (
    <div className="pd-loading">
      <div className="pd-spinner" />
      <p>Loading your family dashboard…</p>
    </div>
  )

  if (error) return (
    <div className="pd-loading">
      <p style={{color: 'red'}}>Error: {error}</p>
    </div>
  )

  console.log("Render: children.length =", children.length, "selectedChild =", selectedChild?._id)

  // Derived Data
  const child = dashboard?.child || selectedChild
  const stats = dashboard?.stats
  const chart = dashboard?.weeklyChart || []
  const notifs = dashboard?.notifications || []
  const recent = dashboard?.recentActivity || []
  const disColor = DISABILITY_COLORS[child?.disabilityType] || '#8B5CF6'

  return (
    <div className="pd-page">

      {/* ── Sidebar ── */}
      <aside className="pd-sidebar">
        <div className="pd-sidebar-header">
          <FaHandsHelping className="pd-sidebar-icon" />
          <span className="pd-sidebar-title">Parent Dashboard</span>
        </div>

        <p className="pd-sidebar-label">My Children</p>

        <div className="pd-child-list">
          {children.map(c => (
            <button
              key={c._id}
              className={`pd-child-btn ${selectedChild?._id === c._id ? 'active' : ''}`}
              onClick={() => setSelectedChild(c)}
            >
              <span className="pd-child-avatar">
                {DISABILITY_ICONS[c.disabilityType] || '🧒'}
              </span>
              <div className="pd-child-info">
                <span className="pd-child-name">{c.name}</span>
                <span className="pd-child-type">{c.disabilityType || 'Student'}</span>
              </div>
            </button>
          ))}
        </div>

        {children.length === 0 && (
          <p className="pd-no-children">No children linked to this account.</p>
        )}

        {/* Navigation Tabs */}
        <div className="pd-nav">
          {[
            { id:'overview', icon:<FaChartBar/>, label:'Overview'   },
            { id:'games',    icon:<FaGamepad/>,  label:'Games'      },
            { id:'study',    icon:<FaBook/>,     label:'Study'      },
            { id:'activity', icon:<FaClock/>,    label:'Activity'   },
            { id:'alerts',   icon:<FaBell/>,     label:`Alerts ${notifs.length > 0 ? `(${notifs.length})` : ''}` },
          ].map(({ id, icon, label }) => (
            <button
              key={id}
              className={`pd-nav-btn ${activeTab === id ? 'active' : ''}`}
              onClick={() => setActiveTab(id)}
            >
              {icon} {label}
            </button>
          ))}
        </div>
      </aside>

      {/* ── Main Dashboard Area ── */}
      <main className="pd-main">

        {dashLoading && (
          <div className="pd-loading-overlay">
            <div className="pd-spinner" />
          </div>
        )}

        {!child ? (
          <div className="pd-empty">
            <FaChild className="pd-empty-icon" />
            <p>Select a child profile to view progress and activity</p>
          </div>
        ) : (
          <>
            {/* ── Child Profile Header ── */}
            <div className="pd-profile-banner" style={{ '--dis-color': disColor }}>
              <div className="pd-profile-avatar" style={{ background: `${disColor}22`, border: `2px solid ${disColor}` }}>
                <span>{DISABILITY_ICONS[child.disabilityType] || '🧒'}</span>
              </div>
              <div className="pd-profile-info">
                <h1 className="pd-profile-name">{child.name}</h1>
                <div className="pd-profile-tags">
                  <span className="pd-tag" style={{ background: `${disColor}22`, color: disColor }}>
                    {child.disabilityDetails || child.disabilityType}
                  </span>
                  {child.educationLevel && child.educationLevel !== 'none' && (
                    <span className="pd-tag pd-tag-edu">
                      <FaSchool /> {child.educationLevel === 'school' ? `Class ${child.className}` : child.course || child.educationLevel}
                    </span>
                  )}
                  {child.udid && (
                    <span className="pd-tag pd-tag-udid">
                      <FaIdCard /> {child.udid}
                    </span>
                  )}
                </div>
              </div>

              {/* Top Row Quick Stats */}
              <div className="pd-quick-stats">
                <div className="pd-quick-stat">
                  <span className="pd-qs-val">{stats?.totalStudyHours || 0}h</span>
                  <span className="pd-qs-label">Study Time</span>
                </div>
                <div className="pd-quick-stat">
                  <span className="pd-qs-val">{(stats?.twisters?.played||0)+(stats?.math?.played||0)+(stats?.scribble?.played||0)}</span>
                  <span className="pd-qs-label">Games</span>
                </div>
                <div className="pd-quick-stat">
                  <span className="pd-qs-val">{stats?.totalGameScore || 0}</span>
                  <span className="pd-qs-label">Points</span>
                </div>
                <div className="pd-quick-stat">
                  <span className="pd-qs-val" style={{ color: stats?.daysSinceLogin >= 2 ? '#EF4444' : '#2DC9A6' }}>
                    {stats?.daysSinceLogin === 0 ? 'Today' : stats?.daysSinceLogin === 1 ? 'Yesterday' : stats?.daysSinceLogin ? `${stats.daysSinceLogin}d ago` : '—'}
                  </span>
                  <span className="pd-qs-label">Last Seen</span>
                </div>
              </div>
            </div>

            {/* ══ OVERVIEW TAB ══ */}
            {activeTab === 'overview' && (
              <div className="pd-tab-content">
                <div className="pd-card pd-chart-card">
                  <div className="pd-card-header">
                    <FaChartBar className="pd-card-icon" style={{ color: '#8B5CF6' }} />
                    <h2 className="pd-card-title">Weekly Engagement</h2>
                  </div>
                  <div className="pd-chart">
                    {chart.map((day, i) => {
                      const maxMins = Math.max(...chart.map(d => d.studyMins), 1)
                      const pct = Math.min((day.studyMins / maxMins) * 100, 100)
                      return (
                        <div key={i} className="pd-chart-col">
                          <span className="pd-chart-val">{day.studyMins > 0 ? `${day.studyMins}m` : ''}</span>
                          <div className="pd-chart-bar-wrap">
                            <div
                              className="pd-chart-bar"
                              style={{ height: `${Math.max(pct, day.active ? 8 : 3)}%`, background: day.active ? disColor : '#2a2a3e' }}
                            />
                          </div>
                          <span className="pd-chart-day">{day.day}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="pd-stats-grid">
                  <div className="pd-stat-card" style={{ '--accent': '#8B5CF6' }}>
                    <div className="pd-stat-icon"><FaBook/></div>
                    <div className="pd-stat-body">
                      <span className="pd-stat-val">{stats?.totalStudyHours || 0}h</span>
                      <span className="pd-stat-label">Learning Time</span>
                      <span className="pd-stat-sub">{stats?.subjectsTouched?.join(', ') || 'Waiting for first session'}</span>
                    </div>
                  </div>

                  <div className="pd-stat-card" style={{ '--accent': '#2DC9A6' }}>
                    <div className="pd-stat-icon"><FaBullseye style={{color:'#2DC9A6'}}/></div>
                    <div className="pd-stat-body">
                      <span className="pd-stat-val">{stats?.avgAccuracy || 0}%</span>
                      <span className="pd-stat-label">Speech Accuracy</span>
                      <span className="pd-stat-sub">Based on Tongue Twisters</span>
                    </div>
                  </div>

                  <div className="pd-stat-card" style={{ '--accent': '#FF8C42' }}>
                    <div className="pd-stat-icon"><FaFire style={{color:'#FF8C42'}}/></div>
                    <div className="pd-stat-body">
                      <span className="pd-stat-val">{stats?.bestMathStreak || 0}</span>
                      <span className="pd-stat-label">Math Streak</span>
                      <span className="pd-stat-sub">Record correct answers</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ══ GAMES TAB ══ */}
            {activeTab === 'games' && (
              <div className="pd-tab-content">
                <div className="pd-games-grid">
                  {/* Game Stats Logic (Tongue Twister, Math, etc. can go here similar to previous tabs) */}
                  <div className="pd-game-card">
                    <div className="pd-game-header" style={{ background: 'linear-gradient(135deg,#8B5CF6,#7C3AED)' }}>
                      <span className="pd-game-emoji">🌀</span>
                      <div>
                        <h3 className="pd-game-name">Tongue Twister</h3>
                        <p className="pd-game-desc">Improves speech clarity</p>
                      </div>
                    </div>
                    <div className="pd-game-stats">
                        <p>Accuracy: {stats?.avgAccuracy || 0}%</p>
                        <p>Rounds: {stats?.twisters?.played || 0}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ══ ALERTS TAB ══ */}
            {activeTab === 'alerts' && (
              <div className="pd-tab-content">
                <div className="pd-card">
                  <div className="pd-card-header">
                    <FaBell className="pd-card-icon" style={{ color: '#F59E0B' }} />
                    <h2 className="pd-card-title">Recent Alerts</h2>
                  </div>
                  <div className="pd-notif-list-full">
                    {notifs.length === 0 ? (
                      <p className="pd-empty-state">No new notifications.</p>
                    ) : (
                      notifs.map((n, i) => (
                        <div key={i} className={`pd-notif pd-notif-${n.type}`}>
                          <span className="pd-notif-icon">{n.icon}</span>
                          <div className="pd-notif-body">
                            <p className="pd-notif-msg">{n.message}</p>
                            <span className="pd-notif-time">{n.time}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* AI Support Tips */}
                <div className="pd-support-card" style={{ '--dis-color': disColor, marginTop: '20px' }}>
                  <div className="pd-support-header">
                    <FaShieldAlt style={{ color: disColor }} />
                    <h3>AI-Powered Tips for {child.name}</h3>
                  </div>
                  <div className="pd-support-tips">
                      <p>• {child.disabilityType === 'visual' ? "Use High Contrast modes in the study modules." : "Encourage 15-minute focused gaming sessions."}</p>
                      <p>• Check local government schemes in {child.state || "your area"} for education grants.</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}