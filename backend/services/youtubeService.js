// ─── YouTube Service ──────────────────────────────────────
// Fetches college lecture videos from YouTube Data API v3
// Owner: Teammate 3

const axios = require('axios');
const YT_BASE = 'https://www.googleapis.com/youtube/v3';

// ── Search educational videos ──────────────────────────────
const searchYouTube = async ({ query, maxResults = 8, isHearingImpaired = false }) => {
  try {
    // If student is hearing impaired, prioritize content with Sign Language/ISL keywords
    const enhancedQuery = isHearingImpaired 
      ? `${query} Indian Sign Language ISL` 
      : `${query} lecture tutorial`;

    const params = {
      key:                process.env.YOUTUBE_API_KEY,
      q:                  enhancedQuery,
      part:               'snippet',
      type:               'video',
      maxResults,
      videoCategoryId:    '27', // Education category
      relevanceLanguage:  'en',
      safeSearch:         'strict',
    };

    // Force closed captions if user is hearing impaired
    if (isHearingImpaired) {
      params.videoCaption = 'closedCaption';
    }

    const res = await axios.get(`${YT_BASE}/search`, { params, timeout: 8000 });

    return res.data.items.map(item => ({
      videoId:     item.id.videoId,
      title:       item.snippet.title,
      description: item.snippet.description,
      thumbnail:   item.snippet.thumbnails?.medium?.url || '',
      channel:     item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      // Logic: Force CC load in the embed player for hearing impaired
      embedUrl:    `https://www.youtube.com/embed/${item.id.videoId}?cc_load_policy=1&cc_lang_pref=en`,
      watchUrl:    `https://www.youtube.com/watch?v=${item.id.videoId}`,
    }));
  } catch (err) {
    console.error('YouTube fetch error:', err.message);
    return getMockCollegeContent(query);
  }
};

// ── Get ISL (Indian Sign Language) videos ─────────────────
const getISLVideos = async (topic) => {
  try {
    const res = await axios.get(`${YT_BASE}/search`, {
      params: {
        key:        process.env.YOUTUBE_API_KEY,
        q:          `${topic} Indian Sign Language ISL education`,
        part:       'snippet',
        type:       'video',
        maxResults: 4,
        relevanceLanguage: 'en',
      },
      timeout: 8000,
    });

    return res.data.items.map(item => ({
      videoId:   item.id.videoId,
      title:     item.snippet.title,
      thumbnail: item.snippet.thumbnails?.medium?.url || '',
      channel:   item.snippet.channelTitle,
      embedUrl:  `https://www.youtube.com/embed/${item.id.videoId}`,
    }));
  } catch (err) {
    console.error('ISL fetch error:', err.message);
    return [];
  }
};

const getVideoCaptions = async (videoId) => {
  try {
    const res = await axios.get(`${YT_BASE}/captions`, {
      params: {
        key:  process.env.YOUTUBE_API_KEY,
        part: 'snippet',
        videoId,
      },
      timeout: 8000,
    });
    return res.data.items || [];
  } catch (err) {
    return [];
  }
};

// ── Mock fallback ──────────────────────────────────────────
const getMockCollegeContent = (query) => [
  {
    videoId:     'dQw4w9WgXcQ',
    title:       `${query} - Demo Lecture`,
    description: `A fallback lecture on ${query}.`,
    channel:     'ThiranNexus Demo',
    embedUrl:    `https://www.youtube.com/embed/dQw4w9WgXcQ?cc_load_policy=1`,
  }
];

module.exports = { searchYouTube, getVideoCaptions, getISLVideos };