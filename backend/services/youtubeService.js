// ─── YouTube Service ──────────────────────────────────────
// Fetches college lecture videos from YouTube Data API v3
// Owner: Teammate 3

const axios = require('axios')

const YT_BASE = 'https://www.googleapis.com/youtube/v3'

// ── Search educational videos ──────────────────────────────
const searchYouTube = async ({ query, maxResults = 8, captionsOnly = false }) => {
  try {
    const params = {
      key:            process.env.YOUTUBE_API_KEY,
      q:              `${query} lecture tutorial`,
      part:           'snippet',
      type:           'video',
      maxResults,
      videoCategoryId:'27', // Education category
      relevanceLanguage: 'en',
      safeSearch:     'strict',
    }

    if (captionsOnly) params.videoCaption = 'closedCaption'

    const res = await axios.get(`${YT_BASE}/search`, { params, timeout: 8000 })

    return res.data.items.map(item => ({
      videoId:     item.id.videoId,
      title:       item.snippet.title,
      description: item.snippet.description,
      thumbnail:   item.snippet.thumbnails?.medium?.url || '',
      channel:     item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      embedUrl:    `https://www.youtube.com/embed/${item.id.videoId}?cc_load_policy=1&cc_lang_pref=en`,
      watchUrl:    `https://www.youtube.com/watch?v=${item.id.videoId}`,
    }))
  } catch (err) {
    console.error('YouTube fetch error:', err.message)
    return getMockCollegeContent(query)
  }
}

// ── Get video captions / transcript ───────────────────────
const getVideoCaptions = async (videoId) => {
  try {
    const res = await axios.get(`${YT_BASE}/captions`, {
      params: {
        key:    process.env.YOUTUBE_API_KEY,
        part:   'snippet',
        videoId,
      },
      timeout: 8000,
    })
    return res.data.items || []
  } catch (err) {
    console.error('Captions fetch error:', err.message)
    return []
  }
}

// ── Get ISL (Indian Sign Language) videos ─────────────────
// Searches ISLRTC channel for sign language content
const getISLVideos = async (topic) => {
  try {
    const res = await axios.get(`${YT_BASE}/search`, {
      params: {
        key:        process.env.YOUTUBE_API_KEY,
        q:          `${topic} Indian Sign Language ISL`,
        part:       'snippet',
        type:       'video',
        maxResults: 4,
        relevanceLanguage: 'en',
      },
      timeout: 8000,
    })

    return res.data.items.map(item => ({
      videoId:   item.id.videoId,
      title:     item.snippet.title,
      thumbnail: item.snippet.thumbnails?.medium?.url || '',
      channel:   item.snippet.channelTitle,
      embedUrl:  `https://www.youtube.com/embed/${item.id.videoId}`,
    }))
  } catch (err) {
    console.error('ISL fetch error:', err.message)
    return []
  }
}

// ── Mock fallback for demo ─────────────────────────────────
const getMockCollegeContent = (query) => [
  {
    videoId:     'dQw4w9WgXcQ',
    title:       `${query} - Complete Lecture`,
    description: `A comprehensive lecture on ${query} for college students.`,
    thumbnail:   '',
    channel:     'ThiranNexus Demo',
    publishedAt: '2024-01-01',
    embedUrl:    `https://www.youtube.com/embed/dQw4w9WgXcQ?cc_load_policy=1`,
    watchUrl:    `https://www.youtube.com/watch?v=dQw4w9WgXcQ`,
  },
  {
    videoId:     'dQw4w9WgXcQ',
    title:       `Introduction to ${query}`,
    description: `Beginner-friendly introduction to ${query}.`,
    thumbnail:   '',
    channel:     'ThiranNexus Demo',
    publishedAt: '2024-01-01',
    embedUrl:    `https://www.youtube.com/embed/dQw4w9WgXcQ?cc_load_policy=1`,
    watchUrl:    `https://www.youtube.com/watch?v=dQw4w9WgXcQ`,
  },
]

module.exports = { searchYouTube, getVideoCaptions, getISLVideos }