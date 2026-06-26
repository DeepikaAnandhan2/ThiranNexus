const axios = require('axios');
const WordExplanation = require('../models/WordExplanation');
const { generateISLGloss } = require('../services/geminiService');

// 🚫 Stop words (won't be stored in DB)
const STOP_WORDS = ["the", "and", "is", "was", "of", "to", "a", "in", "on", "for", "am", "are", "as", "with", "by", "that", "this", "it", "from", "at", "be", "or", "he", "she", "they", "we", "you", "his", "her", "their", "my", "your", "its"];

// 🌄 Educational Images (Pre-selected high-quality safe images for common words)
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

// ── Wikimedia Commons image lookup ───────────────────────────────────────────
// Uses the Wikipedia REST API to find the main image for a topic.
// Completely free, no API key, returns high-quality encyclopedic images.
async function fetchWikimediaImage(word) {
  try {
    // Step 1: Get the Wikipedia page summary — it includes the lead image
    const summaryRes = await axios.get(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(word)}`,
      {
        timeout: 5000,
        headers: { 'User-Agent': 'ThiranNexus/1.0 (educational platform)' }
      }
    );

    const imageUrl = summaryRes.data?.thumbnail?.source || summaryRes.data?.originalimage?.source;

    if (imageUrl) {
      // Prefer a 500px-wide version if the URL supports thumb sizing
      const sized = imageUrl.replace(/\/\d+px-/, '/500px-');
      console.log(`🖼 Wikimedia image found for '${word}': ${sized}`);
      return sized;
    }
  } catch (e) {
    console.log(`Wikimedia miss for '${word}':`, e.message);
  }

  // Step 2: If no lead image, try Wikimedia Commons search for a relevant image
  try {
    const searchRes = await axios.get(
      'https://commons.wikimedia.org/w/api.php',
      {
        params: {
          action: 'query',
          generator: 'search',
          gsrsearch: `${word} biology science`,
          gsrnamespace: 6,           // File namespace only
          gsrlimit: 5,
          prop: 'imageinfo',
          iiprop: 'url|mime',
          iiurlwidth: 500,
          format: 'json',
          origin: '*'
        },
        timeout: 5000
      }
    );

    const pages = Object.values(searchRes.data?.query?.pages || {});
    // Filter to images only (no audio/video)
    const imgPage = pages.find(p => {
      const mime = p.imageinfo?.[0]?.mime || '';
      return mime.startsWith('image/');
    });

    const thumbUrl = imgPage?.imageinfo?.[0]?.thumburl;
    if (thumbUrl) {
      console.log(`🖼 Commons search image found for '${word}'`);
      return thumbUrl;
    }
  } catch (e) {
    console.log(`Commons search miss for '${word}':`, e.message);
  }

  return null;
}

// ── Main image resolver ───────────────────────────────────────────────────────
async function getEducationalImageUrl(word) {
  // 1. Check hardcoded curated images first (fastest)
  if (CUSTOM_IMAGES[word]) {
    return CUSTOM_IMAGES[word];
  }

  // 2. Try Wikimedia / Wikipedia (free, accurate, no API key)
  const wikiImage = await fetchWikimediaImage(word);
  if (wikiImage) return wikiImage;

  // 3. Final fallback — generic science illustration via Unsplash source
  //    (topic-based, not random — "science" and "biology" are valid Unsplash topics)
  return `https://source.unsplash.com/500x300/?${encodeURIComponent(word)},biology,science`;
}


const getWordExplanation = async (req, res) => {
  try {
    let word = req.params.word.toLowerCase().trim();

    // clean word (remove symbols like -, . , etc.)
    word = word.replace(/[^a-z]/g, '');

    if (!word) return res.status(400).json({ error: 'Word is required' });

    // 🚫 Handle stop words (don't store in DB)
    if (STOP_WORDS.includes(word)) {
      return res.json({
        word,
        definition: "This is a commonly used word in sentences.",
        simplifiedDefinition: "This is a common word.",
        islGloss: [word],
        example: "",
        subject: "general",
        level: "easy",
        color: "#64748b",
        animationUrl: "",
        videoUrl: "",
        directSignUrl: ""
      });
    }

    // ── 1. Cache check ───────────────────────────────────────────────────────
    // Invalidate cache if the image looks like the old bad loremflickr fallback
    // or if the new avatar fields are missing
    const cached = await WordExplanation.findOne({ word });
    if (cached) {
      const badImage =
        !cached.animationUrl ||
        cached.animationUrl.includes('placeholder.com') ||
        cached.animationUrl.includes('loremflickr.com') ||      // ← invalidate old bad images
        cached.animationUrl.includes('pollinations.ai');

      const missingAvatarFields = !cached.simplifiedDefinition || !cached.islGloss || cached.islGloss.length === 0;

      if (!badImage && !missingAvatarFields) {
        console.log(`✅ Cache hit: '${word}'`);
        return res.json(cached);
      }
      console.log(`⚠ Cache hit for '${word}' but fields need update, refetching…`);
    }

    console.log(`🔍 Fetching data for: '${word}'`);

    // ── 2. Definition ────────────────────────────────────────────────────────
    let definition = `${word} is an important concept.`;
    let example = '';
    let subject = 'general';
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
      console.error('Failed to generate ISL Gloss with Gemini, using fallback:', geminiErr.message);
      simplifiedDefinition = definition.split('.')[0] + '.';
      islGloss = word.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/).filter(Boolean);
    }

    // ── 3. Visual (Wikimedia / Wikipedia image) ──────────────────────────────
    const animationUrl = await getEducationalImageUrl(word);
    console.log(`🖼 Image URL for '${word}': ${animationUrl}`);

    // ── 4. YouTube Video ─────────────────────────────────────────────────────
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
      console.log('YouTube miss:', e.message);
    }

    // ── 5. Save to DB ────────────────────────────────────────────────────────
    const doc = await WordExplanation.findOneAndUpdate(
      { word },
      { 
        word, 
        definition, 
        simplifiedDefinition, 
        islGloss, 
        directSignUrl: '', 
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