const axios = require('axios');
const WordExplanation = require('../models/WordExplanation');
const { generateISLGloss } = require('../services/geminiService');

// 🚫 Stop words (won't be stored in DB)
const STOP_WORDS = ["the", "and", "is", "was", "of", "to", "a", "in", "on", "for", "am", "are", "as", "with", "by", "that", "this", "it", "from", "at", "be", "or", "he", "she", "they", "we", "you", "his", "her", "their", "my", "your", "its"];

// 🌄 Educational Images
const CUSTOM_IMAGES = {
  female: 'https://images.unsplash.com/photo-1543332143-4e8c27e3256f?w=500&q=80',
  male: 'https://images.unsplash.com/photo-1555685812-4b743e48cbc7?w=500&q=80',
  plant: 'https://images.unsplash.com/photo-1459156212016-c812468e2115?w=500&q=80',
  plants: 'https://images.unsplash.com/photo-1459156212016-c812468e2115?w=500&q=80',
  flower: 'https://images.unsplash.com/photo-1490750967868-88cb44cb2753?w=500&q=80',
  pollination: 'https://images.unsplash.com/photo-1531127027419-f418d18471b0?w=500&q=80',
  ovary: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Mature_flower_diagram.svg/500px-Mature_flower_diagram.svg.png',
  stigma: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Mature_flower_diagram.svg/500px-Mature_flower_diagram.svg.png',
  pistil: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Mature_flower_diagram.svg/500px-Mature_flower_diagram.svg.png',
  carpel: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Mature_flower_diagram.svg/500px-Mature_flower_diagram.svg.png',
  anther: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Mature_flower_diagram.svg/500px-Mature_flower_diagram.svg.png',
  stamen: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Mature_flower_diagram.svg/500px-Mature_flower_diagram.svg.png',
  reproduction: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=500&q=80',
};

// ── Wikimedia Commons image lookup ────────────────────────────────────────────
async function fetchWikimediaImage(word, subject) {
  const userAgent = 'ThiranNexus/1.0 (educational platform)';

  try {
    const summaryRes = await axios.get(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(word)}`,
      { timeout: 5000, headers: { 'User-Agent': userAgent } }
    );
    const imageUrl = summaryRes.data?.thumbnail?.source || summaryRes.data?.originalimage?.source;
    if (imageUrl) {
      const sized = imageUrl.replace(/\/\d+px-/, '/500px-');
      console.log(`🖼 Wikimedia image found for '${word}': ${sized}`);
      return sized;
    }
  } catch (e) {
    console.log(`Wikimedia miss for '${word}':`, e.message);
  }

  const searchCommons = async (searchQuery) => {
    try {
      const searchRes = await axios.get('https://commons.wikimedia.org/w/api.php', {
        params: {
          action: 'query', generator: 'search',
          gsrsearch: searchQuery, gsrnamespace: 6, gsrlimit: 5,
          prop: 'imageinfo', iiprop: 'url|mime', iiurlwidth: 500,
          format: 'json', origin: '*'
        },
        headers: { 'User-Agent': userAgent },
        timeout: 5000
      });
      const pages = Object.values(searchRes.data?.query?.pages || {});
      const imgPage = pages.find(p => (p.imageinfo?.[0]?.mime || '').startsWith('image/'));
      return imgPage?.imageinfo?.[0]?.thumburl;
    } catch (e) {
      console.log(`Commons search error for '${searchQuery}':`, e.message);
      return null;
    }
  };

  if (subject && subject !== 'general') {
    const contextualUrl = await searchCommons(`${word} ${subject}`);
    if (contextualUrl) return contextualUrl;
  }

  return await searchCommons(word) || null;
}

// ── Main image resolver ───────────────────────────────────────────────────────
async function getEducationalImageUrl(word, subject) {
  if (CUSTOM_IMAGES[word]) return CUSTOM_IMAGES[word];
  const wikiImage = await fetchWikimediaImage(word, subject);
  if (wikiImage) return wikiImage;
  return null;
}

// ── NEW: YouTube ISL Sign Video lookup ────────────────────────────────────────
// Uses your existing YOUTUBE_API_KEY to search for ISL sign videos.
// Searches specifically for Indian Sign Language videos for the word.
// Returns an embeddable YouTube URL (embed format, not watch format).
async function fetchISLSignVideoUrl(word) {
  try {
    if (!process.env.YOUTUBE_API_KEY) {
      console.log('⚠ No YOUTUBE_API_KEY — skipping ISL sign video fetch');
      return '';
    }

    // Search query targets ISL sign videos specifically
    // Multiple query strategies tried in order of specificity
    const queries = [
      `${word} Indian sign language ISL`,
      `${word} ISL sign`,
      `${word} sign language India`,
    ];

    for (const query of queries) {
      try {
        const ytRes = await axios.get(
          'https://www.googleapis.com/youtube/v3/search',
          {
            params: {
              part: 'snippet',
              q: query,
              type: 'video',
              key: process.env.YOUTUBE_API_KEY,
              maxResults: 3,
              safeSearch: 'strict',
              relevanceLanguage: 'en',
              regionCode: 'IN',          // bias toward Indian results
            },
            timeout: 5000
          }
        );

        const items = ytRes.data?.items || [];

        // Filter: prefer videos whose title/description mentions ISL or sign language
        const islVideo = items.find(item => {
          const title = (item.snippet?.title || '').toLowerCase();
          const desc  = (item.snippet?.description || '').toLowerCase();
          return (
            title.includes('isl') ||
            title.includes('sign language') ||
            title.includes('indian sign') ||
            desc.includes('isl') ||
            desc.includes('sign language')
          );
        }) || items[0]; // fallback to first result if none match filter

        const videoId = islVideo?.id?.videoId;
        if (videoId) {
          // Return embed URL (not watch URL) — can be used directly in <iframe>
          const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1`;
          console.log(`🤟 ISL sign video found for '${word}': ${embedUrl}`);
          return embedUrl;
        }
      } catch (queryErr) {
        console.log(`YouTube query failed for '${query}':`, queryErr.message);
      }
    }

    console.log(`🤷 No ISL sign video found for '${word}'`);
    return '';

  } catch (e) {
    console.log(`ISL sign video fetch error for '${word}':`, e.message);
    return '';
  }
}

// ── Main controller ───────────────────────────────────────────────────────────
const getWordExplanation = async (req, res) => {
  try {
    let word = req.params.word.toLowerCase().trim();
    const reqSubject = req.query.subject || 'general';

    word = word.replace(/[^a-z]/g, '');
    if (!word) return res.status(400).json({ error: 'Word is required' });

    // 🚫 Stop words
    if (STOP_WORDS.includes(word)) {
      return res.json({
        word,
        definition: "This is a commonly used word in sentences.",
        simplifiedDefinition: "This is a common word.",
        islGloss: [word],
        islSignVideoUrl: '',
        example: "",
        subject: "general",
        level: "easy",
        color: "#64748b",
        animationUrl: "",
        videoUrl: "",
        directSignUrl: ""
      });
    }

    // ── 1. Cache check ────────────────────────────────────────────────────────
    const cached = await WordExplanation.findOne({ word });
    if (cached) {
      const badImage =
        !cached.animationUrl ||
        cached.animationUrl.includes('placeholder.com') ||
        cached.animationUrl.includes('loremflickr.com') ||
        cached.animationUrl.includes('pollinations.ai');

      const missingFields =
        !cached.simplifiedDefinition ||
        !cached.islGloss ||
        cached.islGloss.length === 0;

      // Also refetch if islSignVideoUrl is missing (new field)
      const missingSignVideo = cached.islSignVideoUrl === undefined;

      if (!badImage && !missingFields && !missingSignVideo) {
        console.log(`✅ Cache hit: '${word}'`);
        return res.json(cached);
      }
      console.log(`⚠ Cache hit for '${word}' but needs update, refetching…`);
    }

    console.log(`🔍 Fetching data for: '${word}', Context: '${reqSubject}'`);

    // ── 2. Definition ─────────────────────────────────────────────────────────
    let definition = `${word} is an important concept.`;
    let example = '';
    let subject = reqSubject;
    let level = 'medium';
    let color = '#7c3aed';

    try {
      const dictRes = await axios.get(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`,
        { timeout: 5000 }
      );
      const meanings = dictRes.data?.[0]?.meanings;
      if (meanings?.length) {
        const defObj = meanings[0].definitions[0];
        definition = defObj.definition || definition;
        example = defObj.example || '';
      }
    } catch (e) {
      console.log('Dictionary miss:', e.message);
    }

    // ── 2b. Gemini ISL Gloss & Simplified Definition ──────────────────────────
    let simplifiedDefinition = '';
    let islGloss = [];
    try {
      const geminiRes = await generateISLGloss(word, definition);
      simplifiedDefinition = geminiRes.simplifiedDefinition;
      islGloss = geminiRes.islGloss || [];
    } catch (geminiErr) {
      console.error('Gemini fallback:', geminiErr.message);
      simplifiedDefinition = definition.split('.')[0] + '.';
      islGloss = word.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/).filter(Boolean);
    }

    // ── 3. Visual ─────────────────────────────────────────────────────────────
    const animationUrl = await getEducationalImageUrl(word, reqSubject);
    console.log(`🖼 Image URL for '${word}': ${animationUrl}`);

    // ── 4. YouTube explanation video (existing) ───────────────────────────────
    let videoUrl = '';
    try {
      if (process.env.YOUTUBE_API_KEY) {
        const ytRes = await axios.get(
          'https://www.googleapis.com/youtube/v3/search',
          {
            params: {
              part: 'snippet',
              q: `${word} explanation for students`,
              type: 'video',
              key: process.env.YOUTUBE_API_KEY,
              maxResults: 1,
              safeSearch: 'strict'
            },
            timeout: 5000
          }
        );
        const videoId = ytRes.data?.items?.[0]?.id?.videoId;
        if (videoId) {
          videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
        }
      }
    } catch (e) {
      console.log('YouTube explanation miss:', e.message);
    }

    // ── 4b. NEW: YouTube ISL Sign Video ───────────────────────────────────────
    const islSignVideoUrl = await fetchISLSignVideoUrl(word);

    // ── 5. Save to DB ─────────────────────────────────────────────────────────
    const doc = await WordExplanation.findOneAndUpdate(
      { word },
      {
        word,
        definition,
        simplifiedDefinition,
        islGloss,
        directSignUrl: '',
        islSignVideoUrl,          // ← new field
        example,
        subject,
        level,
        color,
        animationUrl,
        videoUrl
      },
      { new: true, upsert: true }
    );

    console.log(`💾 Saved '${word}' to DB`);
    return res.json(doc);

  } catch (err) {
    console.error('getWordExplanation error:', err);
    res.status(500).json({ error: 'Failed to fetch word explanation' });
  }
};

module.exports = { getWordExplanation };