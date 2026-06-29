/**
 * SignAnimationController.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Pure logic module — NO React, NO UI.
 *
 * Responsibility: Given a word, decide HOW to display its sign:
 *   1. VIDEO   – a real ISL sign video (from backend signVideoUrl, or Spread the Sign)
 *   2. GLOSS   – ISL gloss tokens (animated highlight track, placeholder avatar)
 *   3. SPELL   – fingerspelling fallback (letter-by-letter)
 *
 * Architecture notes
 * ──────────────────
 * This file is intentionally separated from the UI so that swapping the
 * animation engine (e.g. integrating ISLRTC corpus, a 3D WebGL avatar with
 * BVH data, or ReadSpeaker SigningHand) requires changes ONLY here —
 * not in SignAvatarPlayer or Education2.
 *
 * To plug in a real 3D avatar engine later:
 *   1. Add a new STRATEGY = 'avatar3d'
 *   2. In resolveSignStrategy(), return { strategy: 'avatar3d', bvhUrl, ... }
 *   3. In SignAvatarPlayer.jsx, add a branch that renders your WebGL component
 *
 * Public API
 * ──────────
 *   resolveSignStrategy(word, popupData) → SignStrategy
 *   buildSpreadTheSignUrl(word)          → string | null
 *   FINGERSPELL_DELAY_MS                 → number
 */

// ─── Strategy type constants ──────────────────────────────────────────────────
export const STRATEGY = {
  VIDEO:   'video',    // play a real MP4 / embed a sign video
  GLOSS:   'gloss',   // cycle through ISL gloss tokens with placeholder avatar
  SPELL:   'spell',   // fingerspell letter by letter
  NONE:    'none',    // no sign data available at all
};

// ─── Timing constants ─────────────────────────────────────────────────────────
export const FINGERSPELL_DELAY_MS = 600;  // ms per letter at 1× speed
export const GLOSS_DELAY_MS       = 1500; // ms per gloss token at 1× speed

// ─── Spread the Sign ISL embed URL builder ────────────────────────────────────
/**
 * Spread the Sign (spreadthesign.com) hosts ISL video dictionaries.
 * Their search page can be deep-linked by language + word.
 * Language code for Indian Sign Language on their platform: 'is' (ISL)
 *
 * NOTE: This opens the search page, not a direct embed, because Spread the Sign
 * does not provide direct video embed URLs without an API key.
 * Replace with your own ISLRTC corpus URLs or a paid API when available.
 */
export function buildSpreadTheSignUrl(word) {
  if (!word) return null;
  const encoded = encodeURIComponent(word.toLowerCase().trim());
  return `https://www.spreadthesign.com/en.is/search/?q=${encoded}`;
}

// ─── ISL video URL builder (ISLRTC corpus proxy) ─────────────────────────────
/**
 * If your backend stores ISL MP4 URLs in the word API response as `signVideoUrl`,
 * this function returns it directly.
 *
 * You can also extend this to call a proxy endpoint that fetches from the
 * ISLRTC corpus (https://islrtc.nic.in/) once you have API access.
 */
export function resolveVideoUrl(popupData) {
  // Priority 1: backend explicitly provided a direct sign video URL
  if (popupData?.signVideoUrl) return popupData.signVideoUrl;

  // Priority 2: backend provided a directSignUrl (existing field in your API)
  if (popupData?.directSignUrl) return popupData.directSignUrl;

  // Priority 3: no direct video available
  return null;
}

// ─── ISL Gloss extractor ──────────────────────────────────────────────────────
/**
 * Returns the ISL gloss token list for a word.
 * ISL gloss is NOT the same as English — it's the written representation of
 * the sign (e.g. "WATER" might gloss as ["WATER"] or ["DRINK", "LIQUID"]).
 *
 * Currently reads from popupData.islGloss (returned by your /api/word endpoint).
 * If your backend doesn't return this yet, add it to the word API response.
 *
 * @param {string} word
 * @param {object} popupData
 * @returns {string[]}
 */
export function resolveGlossTokens(word, popupData) {
  if (popupData?.islGloss?.length > 0) return popupData.islGloss;
  // Default: treat the word itself as a single gloss token
  return [word.toUpperCase()];
}

// ─── Core: resolve the best available sign strategy ──────────────────────────
/**
 * resolveSignStrategy
 *
 * Given a word and the full popup API data, returns a SignStrategy object
 * that SignAvatarPlayer uses to decide what to render.
 *
 * @param {string} word         - The clicked word (lowercase)
 * @param {object} popupData    - Full response from /api/word/:word
 * @returns {SignStrategy}
 *
 * SignStrategy shape:
 * {
 *   strategy:    'video' | 'gloss' | 'spell' | 'none'
 *   videoUrl:    string | null       // for strategy === 'video'
 *   isExternal:  boolean             // true = open in new tab, false = embed
 *   glossTokens: string[]            // for strategy === 'gloss'
 *   word:        string              // always present, for fingerspelling
 *   label:       string              // human-readable source label
 * }
 */
export function resolveSignStrategy(word, popupData) {
  const base = { word: word || '', glossTokens: resolveGlossTokens(word, popupData) };

  // ── Tier 1: Direct video (backend provided a real ISL sign video) ──────────
  const videoUrl = resolveVideoUrl(popupData);
  if (videoUrl) {
    const isExternal = !videoUrl.startsWith('/') && !videoUrl.includes(window.location.hostname);
    return {
      ...base,
      strategy:   STRATEGY.VIDEO,
      videoUrl,
      isExternal,
      label: 'ISL Sign Video',
    };
  }

  // ── Tier 2: ISL Gloss (animate through gloss tokens with placeholder) ──────
  if (base.glossTokens.length > 0) {
    return {
      ...base,
      strategy:   STRATEGY.GLOSS,
      videoUrl:   null,
      isExternal: false,
      label: 'ISL Gloss Animation',
    };
  }

  // ── Tier 3: Fingerspelling fallback ────────────────────────────────────────
  if (word && word.length >= 1) {
    return {
      ...base,
      strategy:   STRATEGY.SPELL,
      videoUrl:   null,
      isExternal: false,
      label: 'Fingerspelling',
    };
  }

  // ── No data at all ─────────────────────────────────────────────────────────
  return {
    ...base,
    strategy:   STRATEGY.NONE,
    videoUrl:   null,
    isExternal: false,
    label: 'Not available',
  };
}

// ─── Spread the Sign link helper (for "Search online" button) ────────────────
/**
 * Returns an object suitable for rendering a "Find this sign" external link.
 */
export function getExternalSignLink(word) {
  return {
    url:   buildSpreadTheSignUrl(word),
    label: 'Search on Spread the Sign (ISL)',
    note:  'Opens Indian Sign Language dictionary in a new tab',
  };
}