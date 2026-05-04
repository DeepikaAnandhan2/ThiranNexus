import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FaGamepad, FaMedal, FaBook, FaUsers, FaGraduationCap, FaChartLine, FaShieldAlt, FaHistory, FaChevronRight, FaTrophy } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../services/dashboardService';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';

const TAB_LIST = [
  { key: 'overview', label: 'Overview', icon: <FaChartLine /> },
  { key: 'education', label: 'Education', icon: <FaBook /> },
  { key: 'games', label: 'Games', icon: <FaGamepad /> },
  { key: 'schemes', label: 'Schemes', icon: <FaMedal /> },
];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [summary, setSummary] = useState(null);
  
  const [gameHistory, setGameHistory] = useState([]);
  const [gameStats, setGameStats] = useState({ played: 0, wins: 0 });
  const [schemes, setSchemes] = useState([]);
  const [userSchemes, setUserSchemes] = useState({ saved: [], applied: [] });
  const [education, setEducation] = useState({ subjects: [], selectedSubject: '', units: [] });
  
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const currentTabRef = useRef(tab);
  useEffect(() => { 
    currentTabRef.current = tab; 
  }, [tab]);

  /**
   * Independent Leaderboard Fetch
   */
  const loadLeaderboard = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get('/api/users/leaderboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLeaderboard(res.data || []);
    } catch (err) {
      console.error("Leaderboard background sync failed:", err);
    }
  }, []);

  /**
   * Main Tab Fetch Logic
   */
  const loadTab = useCallback(async (selectedTab, isBackground = false) => {
    if (!isBackground) {
        setLoading(true);
        setError(null); 
    }

    const token = localStorage.getItem("token");
    const config = { headers: { Authorization: `Bearer ${token}` } };

    try {
      if (selectedTab === 'overview') {
        const data = await dashboardService.getSummary();
        setSummary(data || {});

        const gameRes = await axios.get('/api/games/history', config);
        const history = gameRes.data || [];
        setGameStats({
          played: history.length,
          wins: history.filter(g => g.result === "Correct").length
        });
      } 
      
      if (selectedTab === 'education') {
        const grade = user?.grade || 'Class 12'; 
        const res = await axios.get(`/api/education2/subjects?className=${grade}`, config);
        setEducation(prev => ({ ...prev, subjects: res.data.subjects || [] }));
      }

      if (selectedTab === 'games') {
        const gameRes = await axios.get('/api/games/history', config);
        setGameHistory(gameRes.data || []);
      }

      if (selectedTab === 'schemes') {
        const disabilityType = user?.disabilityType || "none";
        const recommendedRes = await axios.get(`/api/schemes/recommended?disabilityType=${disabilityType}`, config);
        setSchemes(recommendedRes.data || []);

        if (user?._id) {
          const userRes = await axios.get(`/api/schemes/user/${user._id}`, config);
          setUserSchemes(userRes.data || { saved: [], applied: [] });
        }
      }
    } catch (err) {
      if (!isBackground) {
          setError('Unable to load dashboard data. Please check your connection.');
      }
    } finally {
      if (!isBackground) setLoading(false);
    }
  }, [user]);

  const fetchUnits = async (subjectName) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const grade = user?.grade || 'Class 12';
      const res = await axios.get(`/api/education2/units?className=${grade}&subjectName=${subjectName}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEducation(prev => ({ ...prev, selectedSubject: subjectName, units: res.data.units || [] }));
    } catch (e) {
      setError("Failed to load modules.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTab(tab);
    loadLeaderboard(); 

    const intervalId = setInterval(() => {
      loadTab(currentTabRef.current, true); 
      loadLeaderboard(); 
    }, 5000);

    return () => clearInterval(intervalId);
  }, [tab, loadTab, loadLeaderboard]);

  const greeting = user?.name ? user.name.split(' ')[0] : 'Student';

  return (
    <div className="tn-dash-container">
      {/* tn-dash-main style adjusts if there's no sidebar to ensure a clean layout */}
      <main className="tn-dash-main" style={{ width: tab === 'overview' ? '' : '100%', maxWidth: tab === 'overview' ? '' : '1200px' }}>
        <header className="tn-hero-banner">
          <div>
            <h1 className="tn-welcome-text">Hi {greeting}, ready to learn?</h1>
            <p className="tn-hero-sub">Track your brain training, curriculum, and available schemes.</p>
          </div>
          <div className="tn-status-pill">Live</div>
        </header>

        <nav className="tn-tab-row">
          {TAB_LIST.map((item) => (
            <button
              key={item.key}
              className={`tn-tab-btn ${tab === item.key ? 'active' : ''}`}
              onClick={() => setTab(item.key)}
            >
              <span className="tn-tab-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {error && (
            <div className="tn-error-banner" style={{ background: '#FEF2F2', color: '#991B1B', border: '1px solid #FCA5A5', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
                {error}
            </div>
        )}

        <section className="tn-view-panel">
          {tab === 'overview' && (
            <div className="tn-grid-2">
              <MetricCard title="Games Played" value={gameStats.played} color="#7C3AED" />
              <MetricCard title="Total Wins" value={gameStats.wins} color="#F97316" />
              <MetricCard title="Streak" value={summary?.metrics?.streak ?? 0} color="#10B981" />
              <MetricCard title="Badges" value={summary?.metrics?.badgesEarned ?? 0} color="#F59E0B" />
            </div>
          )}

          {tab === 'education' && (
            <div className="tn-education-view">
              <div className="tn-glass-card" style={{ marginBottom: '20px' }}>
                <h3 className="tn-card-title">My Subjects</h3>
                <div className="tn-subject-grid" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '15px' }}>
                  {education.subjects.map((sub) => (
                    <button 
                      key={sub} 
                      className={`tn-sub-pill ${education.selectedSubject === sub ? 'active' : ''}`}
                      style={{
                        padding: '8px 16px', borderRadius: '8px', border: 'none',
                        background: education.selectedSubject === sub ? '#7C3AED' : '#F3F4F6',
                        color: education.selectedSubject === sub ? '#fff' : '#374151',
                        cursor: 'pointer', fontWeight: '600'
                      }}
                      onClick={() => fetchUnits(sub)}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>

              <div className="tn-glass-card">
                <h3 className="tn-card-title">
                    {education.selectedSubject ? `${education.selectedSubject} Modules` : 'Select a subject'}
                </h3>
                <div className="tn-list">
                  {loading && education.units.length === 0 ? <p>Loading modules...</p> : 
                   education.units.length > 0 ? education.units.map((unit) => (
                    <div key={unit._id} className="tn-list-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid #eee' }}>
                      <span>{unit.unitTitle}</span>
                      <button
                        className="tn-action-link"
                        style={{ color: '#7C3AED', textDecoration: 'none', fontWeight: 'bold', background: 'none', border: 'none', cursor: 'pointer' }}
                        onClick={() => navigate('/education2')}
                      >
                        Start <FaChevronRight size={10}/>
                      </button>
                    </div>
                  )) : (
                    <p style={{ color: '#999', marginTop: '10px' }}>No modules loaded.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {tab === 'games' && (
            <div className="tn-glass-card">
              <div className="tn-card-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h3>Recent Activity</h3>
                <FaHistory />
              </div>
              <div className="tn-list">
                {gameHistory.length > 0 ? gameHistory.map((game, i) => (
                  <div key={i} className="tn-list-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid #eee' }}>
                    <div>
                      <div className="tn-list-name">Game Session</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>{new Date(game.createdAt).toLocaleDateString()}</div>
                    </div>
                    <span className="tn-status-tag" style={{ 
                        backgroundColor: game.result === 'Correct' ? '#d1fae5' : '#fee2e2',
                        color: game.result === 'Correct' ? '#065f46' : '#991b1b',
                        padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' 
                    }}>
                      {game.result}
                    </span>
                  </div>
                )) : <p className="tn-empty-state">No games played yet.</p>}
              </div>
            </div>
          )}

          {tab === 'schemes' && (
            <>
              <div className="tn-grid-2">
                <MetricCard title="Matched" value={schemes.length} color="#7C3AED" subtitle="Based on profile" />
                <MetricCard title="Saved" value={userSchemes.saved?.length || 0} color="#10B981" />
                <MetricCard title="Applied" value={userSchemes.applied?.length || 0} color="#F97316" />
              </div>
              <div className="tn-glass-card" style={{ marginTop: '20px' }}>
                <h3 className="tn-card-title">Recommended Schemes</h3>
                <div className="tn-list">
                  {schemes.length > 0 ? schemes.map((scheme) => (
                    <div key={scheme._id} className="tn-scheme-card" style={{ marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #eee' }}>
                      <div style={{ fontWeight: 'bold' }}>{scheme.title}</div>
                      <div style={{ fontSize: '13px', color: '#666' }}>{scheme.description}</div>
                      <a href={`/scheme/${scheme._id}`} className="tn-tab-btn" style={{ marginTop: '10px', fontSize: '11px', padding: '5px 10px', display: 'inline-block', textDecoration: 'none' }}>View Details</a>
                    </div>
                  )) : <p className="tn-empty-state">No recommended schemes.</p>}
                </div>
              </div>
            </>
          )}
        </section>
      </main>

      {/* ONLY RENDER ASIDE ON OVERVIEW TAB */}
      {tab === 'overview' && (
        <aside className="tn-dash-aside">
          <div className="tn-glass-card" style={{ marginBottom: '20px' }}>
            <h3 className="tn-card-title">Student Info</h3>
            <div className="tn-analysis-stat" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span>Grade</span>
              <strong style={{ textTransform: 'capitalize' }}>{user?.grade || 'Class 12'}</strong>
            </div>
            <div className="tn-analysis-stat" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Status</span>
              <strong style={{ textTransform: 'capitalize' }}>{user?.disabilityType || 'none'}</strong>
            </div>
          </div>

          <div className="tn-glass-card">
            <div className="tn-card-header" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
              <FaTrophy color="#F59E0B" />
              <h3 className="tn-card-title" style={{ margin: 0 }}>Top Students</h3>
            </div>
            <div className="tn-leaderboard-list">
              {leaderboard.length > 0 ? leaderboard.slice(0, 5).map((player, index) => (
                <div key={player._id} style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', 
                  borderBottom: index !== 4 ? '1px solid #f3f4f6' : 'none' 
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontWeight: 'bold', width: '20px', color: index === 0 ? '#F59E0B' : '#9CA3AF' }}>{index + 1}</span>
                    <span style={{ fontSize: '14px', fontWeight: player._id === user?._id ? '700' : '500' }}>
                      {player.name} {player._id === user?._id && '(You)'}
                    </span>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#7C3AED' }}>{player.points || 0} pts</div>
                </div>
              )) : <p style={{ fontSize: '12px', color: '#9CA3AF' }}>No rankings available.</p>}
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}

function MetricCard({ title, value, subtitle, color }) {
  return (
    <div className="tn-metric-card" style={{ borderBottom: `4px solid ${color}`, background: '#fff', padding: '20px', borderRadius: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
      <div className="tn-metric-value" style={{ color, fontSize: '32px', fontWeight: 'bold' }}>{value}</div>
      <div className="tn-metric-title" style={{ fontWeight: '600' }}>{title}</div>
      {subtitle && <div style={{ fontSize: '11px', color: '#888' }}>{subtitle}</div>}
    </div>
  );
}

function SubjectCard({ data }) {
  const navigate = useNavigate();

  return (
    <div className="tn-subject-card" style={{ borderLeft: `6px solid ${data.color}` }}>
      <div className="tn-subject-name">{data.subject}</div>
      <div className="tn-subject-score">{data.quizAvg}%</div>
      <ProgressBar label={`${data.lessonsCompleted} lessons`} pct={data.quizAvg} color={data.color} />
      <button 
        className="tn-start-btn" 
        onClick={() => navigate('/education2', { state: { subject: data.subject } })}
      >
        Start
      </button>
    </div>
  )
}

function SchemeCard({ scheme }) {
  return (
    <div className="tn-scheme-card">
      <div className="tn-scheme-top">
        <FaGraduationCap className="tn-scheme-icon" />
        <span className={`tn-scheme-badge ${scheme.status}`}>{scheme.status}</span>
      </div>
      <div className="tn-scheme-title">{scheme.title}</div>
      <div className="tn-scheme-desc">{scheme.description}</div>
      <div className="tn-scheme-meta">{Array.isArray(scheme.eligibility) ? scheme.eligibility.join(', ') : scheme.disabilityType}</div>
    </div>
  )
}

function ProgressBar({ label, pct, color }) {
  return (
    <div className="tn-progress-row">
      <div className="tn-progress-info-row">
        <span>{label}</span>
        <span>{pct}%</span>
      </div>
      <div className="tn-progress-track">
        <div className="tn-progress-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}