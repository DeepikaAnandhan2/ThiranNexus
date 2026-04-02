import { useState } from 'react'
import axios from 'axios'
import TTSReader from './TTSReader'
import STTSearch from './STTSearch'
import './CollegeView.css'

import {
  FaPlay,
  FaArrowLeft,
  FaYoutube,
  FaFileAlt,
  FaHandsHelping,
  FaSearch
} from 'react-icons/fa'

const API = 'http://localhost:5000'
const token = () => localStorage.getItem('token')
const headers = () => ({ Authorization: `Bearer ${token()}` })

export default function CollegeView({ user }) {
  const [videos, setVideos] = useState([])
  const [islVideos, setIslVideos] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(false)
  const [islLoading, setIslLoading] = useState(false)
  const [showISL, setShowISL] = useState(false)
  const [showTranscript, setShowTranscript] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [aiAnswer, setAiAnswer] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [lastQuery, setLastQuery] = useState('')

  const handleSearch = async (query) => {
    if (!query.trim()) return
    setLoading(true)
    setVideos([])
    setSelected(null)
    setLastQuery(query)

    try {
      const res = await axios.get(`${API}/api/education/college`, {
        params: { query },
        headers: headers()
      })
      setVideos(res.data.results || [])
    } catch {
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
    setIslLoading(true)

    try {
      const res = await axios.get(`${API}/api/education/isl`, {
        params: { topic: lastQuery },
        headers: headers()
      })
      setIslVideos(res.data.results || [])
    } catch {
      setIslVideos([])
    } finally {
      setIslLoading(false)
    }
  }

  const handleTranscript = () => {
    setShowTranscript(true)
    setTranscript(`${selected.title}\n\n${selected.description}`)
  }

  return (
    <div className="college-wrap">

      {/* Search */}
      <STTSearch
        onResult={handleSearch}
        placeholder="Search college topics..."
        label="Search Topics"
      />

      {/* Loading */}
      {loading && <div className="college-loading">Searching...</div>}

      {/* Video List */}
      {!selected && videos.length > 0 && (
        <div className="college-video-list">
          <p className="college-results">
            <FaSearch /> {videos.length} results for "{lastQuery}"
          </p>

          {videos.map(video => (
            <div
              key={video.videoId}
              className="college-card"
              onClick={() => selectVideo(video)}
            >
              <img src={video.thumbnail} className="college-thumb" />
              
              <div className="college-info">
                <h3>{video.title}</h3>
                <p className="channel">{video.channel}</p>
                <p className="desc">{video.description?.slice(0, 80)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Player */}
      {selected && (
        <div className="college-player">

          <button className="back-btn" onClick={() => setSelected(null)}>
            <FaArrowLeft /> Back
          </button>

          <h2>{selected.title}</h2>
          <p className="channel">{selected.channel}</p>

          <div className="video-box">
            <iframe src={selected.embedUrl} allowFullScreen />
          </div>

          {/* Actions */}
          <div className="actions">
            <button onClick={handleTranscript}>
              <FaFileAlt /> Transcript
            </button>

            <button onClick={handleISL}>
              <FaHandsHelping /> ISL
            </button>

            <a href={selected.watchUrl} target="_blank">
              <FaYoutube /> YouTube
            </a>
          </div>

          {/* Transcript */}
          {showTranscript && (
            <div className="panel">
              <TTSReader text={transcript} />
              <pre>{transcript}</pre>
            </div>
          )}

          {/* ISL */}
          {showISL && (
            <div className="panel">
              {islLoading ? "Loading ISL..." : (
                <div className="isl-grid">
                  {islVideos.map(v => (
                    <iframe key={v.videoId} src={v.embedUrl} />
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      )}
    </div>
  )
}