import { useState } from 'react'
import axios from 'axios'
import TTSReader from './TTSReader'
import STTSearch from './STTSearch'
import './CollegeView.css'

import {
  FaArrowLeft,
  FaYoutube,
  FaFileAlt,
  FaHandsHelping,
  FaSearch
} from 'react-icons/fa'

const API = 'http://localhost:5000'

// Helper to get token safely
const getAuthHeaders = () => {
  const userInfo = localStorage.getItem('userInfo');
  const token = userInfo ? JSON.parse(userInfo).token : localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
}

export default function CollegeView({ user }) {
  const [videos, setVideos] = useState([])
  const [islVideos, setIslVideos] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(false)
  const [islLoading, setIslLoading] = useState(false)
  const [showISL, setShowISL] = useState(false)
  const [showTranscript, setShowTranscript] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [lastQuery, setLastQuery] = useState('')

  const handleSearch = async (query) => {
    if (!query.trim()) return
    setLoading(true)
    setVideos([])
    setIslVideos([]) // Clear previous results
    setSelected(null)
    setLastQuery(query)

    try {
      const res = await axios.get(`${API}/api/education/college`, {
        params: { query },
        headers: getAuthHeaders()
      })
      
      // Backend now returns groups: { lectures, signLanguage }
      const { lectures = [], signLanguage = [] } = res.data.groups || {}
      
      setVideos(lectures)
      if (signLanguage.length > 0) {
        setIslVideos(signLanguage)
      }
    } catch (err) {
      console.error("Search failed:", err.response?.status === 401 ? "Unauthorized" : err.message)
      setVideos([])
    } finally {
      setLoading(false)
    }
  }

  const selectVideo = (video) => {
    setSelected(video)
    setShowISL(false)
    setShowTranscript(false)
  }

  const handleISL = async () => {
    setShowISL(true)
    // Avoid re-fetching if we already got ISL videos during main search
    if (islVideos.length > 0) return 

    setIslLoading(true)
    try {
      const res = await axios.get(`${API}/api/education/isl`, {
        params: { topic: lastQuery },
        headers: getAuthHeaders()
      })
      setIslVideos(res.data.results || [])
    } catch {
      setIslVideos([])
    } finally {
      setIslLoading(false)
    }
  }

  const handleTranscript = () => {
    setShowTranscript(!showTranscript)
    setTranscript(`${selected.title}\n\n${selected.description}`)
  }

  return (
    <div className="college-wrap">
      <STTSearch
        onResult={handleSearch}
        placeholder="Search college topics (e.g. Java)..."
        label="Search Topics"
      />

      {loading && <div className="college-loading">Searching resources...</div>}

      {!selected && videos.length > 0 && (
        <div className="college-video-list">
          <p className="college-results">
            <FaSearch /> {videos.length} results for "{lastQuery}"
            {islVideos.length > 0 && <span className="isl-badge"> + Sign Language Content</span>}
          </p>

          <div className="grid-container">
            {videos.map(video => (
              <div key={video.videoId} className="college-card" onClick={() => selectVideo(video)}>
                <img src={video.thumbnail} className="college-thumb" alt="thumbnail" />
                <div className="college-info">
                  <h3>{video.title}</h3>
                  <p className="channel">{video.channel}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selected && (
        <div className="college-player">
          <button className="back-btn" onClick={() => setSelected(null)}>
            <FaArrowLeft /> Back to Search
          </button>

          <div className="player-header">
            <h2>{selected.title}</h2>
            <p className="channel">{selected.channel}</p>
          </div>

          <div className="video-box">
            <iframe src={selected.embedUrl} title="player" allowFullScreen />
          </div>

          <div className="actions">
            <button onClick={handleTranscript} className={showTranscript ? 'active' : ''}>
              <FaFileAlt /> {showTranscript ? 'Hide Transcript' : 'Show Transcript'}
            </button>

            <button onClick={handleISL} className={showISL ? 'active' : ''}>
              <FaHandsHelping /> Sign Language
            </button>

            <a href={selected.watchUrl} target="_blank" rel="noreferrer" className="yt-link">
              <FaYoutube /> Open in YouTube
            </a>
          </div>

          {showTranscript && (
            <div className="panel animate-in">
              <TTSReader text={transcript} />
              <pre className="transcript-text">{transcript}</pre>
            </div>
          )}

          {showISL && (
            <div className="panel animate-in">
              <h3>Indian Sign Language Support</h3>
              {islLoading ? <p>Finding sign language videos...</p> : (
                <div className="isl-grid">
                  {islVideos.length > 0 ? islVideos.map(v => (
                    <div key={v.videoId} className="isl-item">
                       <iframe src={v.embedUrl} title="isl-frame" />
                       <p>{v.title}</p>
                    </div>
                  )) : <p>No sign language videos found for this specific topic.</p>}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}