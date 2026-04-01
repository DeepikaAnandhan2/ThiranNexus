// ─── Education Page ───────────────────────────────────────
// Entry point for education module
// Routes to SchoolView or CollegeView based on user profile

import { useState, useEffect } from 'react'
import SchoolView  from '../components/education/SchoolView'
import CollegeView from '../components/education/CollegeView'
import '../styles/Education.css'

export default function Education() {
  const [user,        setUser]        = useState(null)
  const [activeLevel, setActiveLevel] = useState(null)

  useEffect(() => {
    const saved = localStorage.getItem('tn_user')
    if (saved) {
      const u = JSON.parse(saved)
      setUser(u)
      // Auto-select based on profile
      if (u.educationLevel === 'school')  setActiveLevel('school')
      if (u.educationLevel === 'college') setActiveLevel('college')
    }
    // Announce page
    const utter = new SpeechSynthesisUtterance('Education module. Select school or college level.')
    utter.rate = 0.9; window.speechSynthesis.speak(utter)
  }, [])

  const levels = [
    { id:'school',  icon:'🏫', label:'School',          desc:'NCERT / DIKSHA',    color:'teal'   },
    { id:'college', icon:'🎓', label:'College',          desc:'YouTube / SWAYAM',  color:'orange' },
  ]

  const handleLevelSelect = (level) => {
    setActiveLevel(level)
    const utter = new SpeechSynthesisUtterance(`Opening ${level} education materials.`)
    utter.rate = 0.9; window.speechSynthesis.speak(utter)
  }

  return (
    <div className="edu-page">

      {/* ── Banner ── */}
      <div className="edu-banner">
        <div className="edu-banner-bubble1" aria-hidden="true" />
        <div className="edu-banner-bubble2" aria-hidden="true" />
        <div className="edu-banner-avatar" aria-hidden="true">📚</div>
        <h1 className="edu-banner-title">Education</h1>
        <p className="edu-banner-subtitle">Learn at your own pace</p>

        {/* Disability badge */}
        {user?.disabilityType && user.disabilityType !== 'none' && (
          <div className="edu-disability-badge">
            ♿ Adapted for {user.disabilityType} disability
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <div className="edu-body">

        {/* Level selector tabs */}
        <div className="edu-level-tabs" role="tablist" aria-label="Education level">
          {levels.map(({ id, icon, label, desc, color }) => (
            <button
              key={id}
              className={`edu-level-tab edu-tab-${color} ${activeLevel === id ? 'edu-tab-active' : ''}`}
              onClick={() => handleLevelSelect(id)}
              role="tab"
              aria-selected={activeLevel === id}
              aria-label={`${label} - ${desc}`}
            >
              <span className="edu-tab-icon">{icon}</span>
              <div className="edu-tab-info">
                <span className="edu-tab-label">{label}</span>
                <span className="edu-tab-desc">{desc}</span>
              </div>
            </button>
          ))}
        </div>

        {/* ── School View ── */}
        {activeLevel === 'school' && (
          <div role="tabpanel" aria-label="School education content">
            <SchoolView user={user} />
          </div>
        )}

        {/* ── College View ── */}
        {activeLevel === 'college' && (
          <div role="tabpanel" aria-label="College education content">
            <CollegeView user={user} />
          </div>
        )}

        {/* ── Empty state ── */}
        {!activeLevel && (
          <div className="edu-empty">
            <p className="edu-empty-text">
              👆 Select your education level above to get started
            </p>
            {user && (
              <p className="edu-empty-hint">
                Your profile: {user.educationLevel !== 'none' ? user.educationLevel : 'not set'}
              </p>
            )}
          </div>
        )}

      </div>
    </div>
  )
}