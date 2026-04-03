import { useState, useEffect } from 'react'
import SchoolView  from '../components/education/SchoolView'
import CollegeView from '../components/education/CollegeView'
import '../styles/Education.css'
// MainLayout import removed to prevent double headers
import schoolImg from '../assets/school.png'
import collegeImg from '../assets/college.png'

export default function Education() {
  const [user, setUser] = useState(null)
  const [activeLevel, setActiveLevel] = useState(null)

  useEffect(() => {
    const saved = localStorage.getItem('tn_user')
    if (saved) {
      const u = JSON.parse(saved)
      setUser(u)
      if (u.educationLevel === 'school')  setActiveLevel('school')
      if (u.educationLevel === 'college') setActiveLevel('college')
    }
  }, [])

  const handleLevelSelect = (level) => {
    setActiveLevel(level);
    const utter = new SpeechSynthesisUtterance(`Opening ${level} mode`);
    window.speechSynthesis.speak(utter);
  }

  return (
    <div className="education-container">
      <div className="edu-content">
        {!activeLevel ? (
          <div className="welcome-screen">
            <h1 className="main-title">Online Learning</h1>
            <p className="main-subtitle">
              Choose your path to start exploring interactive courses and materials.
            </p>

            <div className="level-cards-grid">
              
              {/* School */}
              <div className="level-card school-card" onClick={() => handleLevelSelect('school')}>
                <div className="card-illustration">
                  <img src={schoolImg} alt="School" />
                </div>
                <div className="card-text">
                  <h3>School Level</h3>
                  <p>NCERT & Interactive Lessons</p>
                </div>
                <button className="start-btn">Get Started</button>
              </div>

              {/* College */}
              <div className="level-card college-card" onClick={() => handleLevelSelect('college')}>
                <div className="card-illustration">
                  <img 
                    src={collegeImg} 
                    alt="College" 
                    className="college-img"
                  />
                </div>
                <div className="card-text">
                  <h3>College Level</h3>
                  <p>Advanced Lectures & ISL Support</p>
                </div>
                <button className="start-btn">Explore</button>
              </div>

            </div>
          </div>
        ) : (
          <div className="active-view-container">
            <button className="back-pill" onClick={() => setActiveLevel(null)}>
              ← Switch Level
            </button>

            {activeLevel === 'school'
              ? <SchoolView user={user} />
              : <CollegeView user={user} />}
          </div>
        )}
      </div>
    </div>
  )
}