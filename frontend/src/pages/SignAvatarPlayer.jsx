/**
 * SignAvatarPlayer.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * React component — renders the correct sign-language UI based on the
 * SignStrategy resolved by SignAnimationController.
 *
 * Renders one of three modes:
 *   VIDEO  → <video> tag (auto-play, loop) or iframe embed
 *   GLOSS  → placeholder avatar.png + animated gloss highlight bar
 *   SPELL  → placeholder avatar.png + letter-by-letter fingerspelling
 *
 * Props
 * ─────
 *   strategy    {SignStrategy}  - from resolveSignStrategy()
 *   accent      {string}        - CSS color for themed highlights
 *   speed       {number}        - playback speed multiplier (0.5–1.25)
 *   isPlaying   {boolean}
 *   onPlayToggle {Function}
 *   onReplay    {Function}
 *
 * HOW TO REPLACE THE PLACEHOLDER WITH A REAL 3D AVATAR
 * ──────────────────────────────────────────────────────
 * 1. Import your WebGL/Three.js avatar component, e.g.:
 *      import ISLAvatarWebGL from './ISLAvatarWebGL';
 * 2. In the GLOSS and SPELL branches below, replace <PlaceholderAvatar>
 *    with <ISLAvatarWebGL glossTokens={...} currentIndex={...} />.
 * 3. The rest of the UI (controls, gloss bar, speed) stays exactly the same.
 */

import { useState, useEffect, useRef } from 'react';
import {
  STRATEGY,
  FINGERSPELL_DELAY_MS,
  GLOSS_DELAY_MS,
  getExternalSignLink,
} from './SignAnimationController';

// ─── CSS injected once by parent (Education2.jsx already does this) ───────────
// No extra styles needed here — all classes are defined in Education2's STYLES.

// ─── Placeholder avatar (avatar.png) ─────────────────────────────────────────
/**
 * PlaceholderAvatar
 * Renders avatar.png with an optional bounce animation when playing.
 * Replace the inner JSX with your 3D avatar component when ready.
 *
 * Props:
 *   isPlaying      {boolean}
 *   overlayLetter  {string|null}  - shown as fingerspelling overlay
 *   accent         {string}
 */
function PlaceholderAvatar({ isPlaying, overlayLetter, accent }) {
  return (
    <div
      className={`sl-avatar-character ${isPlaying ? 'sl-avatar-character--animating' : ''}`}
      aria-hidden="true"
    >
      {/* ── REPLACE THIS BLOCK with your 3D avatar component ── */}
      <img
        src="/avatar.png"
        alt="Sign language avatar placeholder"
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        onError={e => { e.target.src = 'https://via.placeholder.com/150?text=ISL+Avatar'; }}
      />
      {/* ──────────────────────────────────────────────────────── */}

      {/* Fingerspelling overlay letter */}
      {overlayLetter && (
        <div
          style={{
            position: 'absolute', bottom: 0, right: 0,
            background: accent, color: '#fff', borderRadius: '50%',
            width: 32, height: 32, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 'bold',
            boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
          }}
        >
          {overlayLetter.toUpperCase()}
        </div>
      )}
    </div>
  );
}

// ─── Video player ─────────────────────────────────────────────────────────────
function VideoPlayer({ videoUrl, isExternal, word, accent }) {
  const extLink = getExternalSignLink(word);

  if (isExternal) {
    // External URL: show a "watch" button rather than embedding cross-origin video
    return (
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        {/* Decorative preview card */}
        <div style={{
          width: '100%', background: '#0d0d1a', borderRadius: 12,
          padding: '28px 16px', textAlign: 'center',
          border: `1.5px solid ${accent}33`,
        }}>
          <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: 8 }}>🤟</span>
          <p style={{ color: '#aaa', fontSize: 13, margin: 0 }}>ISL sign video for</p>
          <p style={{ color: '#fff', fontWeight: 800, fontSize: 16, margin: '4px 0 0', textTransform: 'capitalize' }}>
            {word}
          </p>
        </div>

        <button
          className="sl-popup__watch-btn"
          style={{ background: accent }}
          onClick={() => window.open(videoUrl, '_blank', 'noopener,noreferrer')}
          aria-label={`Watch ISL sign for ${word} (opens new tab)`}
        >
          ▶ &nbsp;Watch ISL Sign
        </button>
        <p style={{ fontSize: 11, color: '#555', margin: 0 }}>Opens in a new tab</p>
      </div>
    );
  }

  // Same-origin / proxied MP4: embed directly
  return (
    <video
      key={videoUrl}
      src={videoUrl}
      autoPlay
      loop
      muted
      playsInline
      style={{ width: '100%', maxHeight: 200, borderRadius: 12, background: '#000', objectFit: 'contain' }}
      aria-label={`ISL sign animation for the word: ${word}`}
    />
  );
}

// ─── "Find online" fallback link ──────────────────────────────────────────────
function ExternalSignLink({ word, accent }) {
  const link = getExternalSignLink(word);
  return (
    <div style={{
      marginTop: 10, padding: '8px 10px', borderRadius: 8,
      background: 'rgba(255,255,255,0.03)', border: `1px solid ${accent}33`,
      display: 'flex', flexDirection: 'column', gap: 4,
    }}>
      <span style={{ fontSize: 10, color: '#666', letterSpacing: '0.06em', fontWeight: 700 }}>
        FIND ONLINE
      </span>
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: accent, fontSize: 12, fontWeight: 600 }}
        aria-label={link.label}
      >
        🔗 {link.label}
      </a>
      <span style={{ fontSize: 10, color: '#444' }}>{link.note}</span>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
/**
 * SignAvatarPlayer
 *
 * Pure renderer — receives strategy from parent, displays the correct UI.
 * All animation state (current gloss index, spell index) is managed here.
 */
export default function SignAvatarPlayer({ strategy, accent = '#7c3aed', speed = 1.0 }) {
  const [isPlaying,         setIsPlaying]         = useState(true);
  const [currentGlossIndex, setCurrentGlossIndex] = useState(0);
  const [spellingIndex,     setSpellingIndex]      = useState(0);

  // Reset playback when strategy changes (new word tapped)
  useEffect(() => {
    setIsPlaying(true);
    setCurrentGlossIndex(0);
    setSpellingIndex(0);
  }, [strategy?.word, strategy?.strategy]);

  // ── Playback timer (GLOSS / SPELL modes) ─────────────────────────────────
  useEffect(() => {
    if (!isPlaying) return;
    if (strategy?.strategy === STRATEGY.VIDEO) return;
    if (strategy?.strategy === STRATEGY.NONE)  return;

    const isSpell    = strategy?.strategy === STRATEGY.SPELL;
    const delay      = isSpell
      ? FINGERSPELL_DELAY_MS / speed
      : GLOSS_DELAY_MS / speed;

    const tokens = isSpell
      ? (strategy.word || '').split('')
      : (strategy.glossTokens || []);

    const currentIdx = isSpell ? spellingIndex : currentGlossIndex;

    const timer = setTimeout(() => {
      const next = (currentIdx + 1) % Math.max(tokens.length, 1);
      if (isSpell) setSpellingIndex(next);
      else         setCurrentGlossIndex(next);
    }, delay);

    return () => clearTimeout(timer);
  }, [isPlaying, strategy, speed, currentGlossIndex, spellingIndex]);

  if (!strategy) return null;

  const { strategy: mode, videoUrl, isExternal, word, glossTokens, label } = strategy;
  const isSpell    = mode === STRATEGY.SPELL;
  const tokens     = isSpell ? (word || '').split('') : (glossTokens || []);
  const activeIdx  = isSpell ? spellingIndex : currentGlossIndex;
  const overlayLetter = isSpell ? (word?.[spellingIndex] ?? null) : null;

  // ── STRATEGY: NONE ────────────────────────────────────────────────────────
  if (mode === STRATEGY.NONE) {
    return (
      <div className="sl-popup__avatar-pane" style={{ '--sl-popup-accent': accent }}>
        <div className="sl-avatar-character" aria-hidden="true">
          <img src="/avatar.png" alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'contain', opacity: 0.35 }} />
        </div>
        <p style={{ color: '#555', fontSize: 12, textAlign: 'center', marginTop: 8 }}>
          Sign language not available for this word.
        </p>
        <ExternalSignLink word={word} accent={accent} />
      </div>
    );
  }

  // ── STRATEGY: VIDEO ───────────────────────────────────────────────────────
  if (mode === STRATEGY.VIDEO) {
    return (
      <div className="sl-popup__avatar-pane" style={{ '--sl-popup-accent': accent }}>
        {/* Strategy label badge */}
        <span style={{ fontSize: 9, color: '#555', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 6 }}>
          ISL SIGN VIDEO
        </span>

        <VideoPlayer videoUrl={videoUrl} isExternal={isExternal} word={word} accent={accent} />

        {/* Always show "find online" as supplement */}
        <ExternalSignLink word={word} accent={accent} />
      </div>
    );
  }

  // ── STRATEGY: GLOSS or SPELL ──────────────────────────────────────────────
  return (
    <div className="sl-popup__avatar-pane" style={{ '--sl-popup-accent': accent }}>
      {/* Strategy label */}
      <span style={{ fontSize: 9, color: '#555', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 4 }}>
        {isSpell ? 'FINGERSPELLING' : 'ISL GLOSS TRACK'}
      </span>

      {/* Avatar */}
      <PlaceholderAvatar
        isPlaying={isPlaying}
        overlayLetter={overlayLetter}
        accent={accent}
      />

      {/* Playback controls */}
      <div className="sl-avatar-controls">
        <div className="sl-avatar-controls__row">
          <button
            className="sl-avatar-btn"
            onClick={() => setIsPlaying(p => !p)}
            aria-label={isPlaying ? 'Pause sign animation' : 'Play sign animation'}
          >
            {isPlaying ? '⏸ Pause' : '▶ Play'}
          </button>
          <button
            className="sl-avatar-btn"
            onClick={() => { setCurrentGlossIndex(0); setSpellingIndex(0); setIsPlaying(true); }}
            aria-label="Replay sign animation"
          >
            🔄 Replay
          </button>
        </div>
      </div>

      {/* Gloss / spelling highlight bar */}
      <div className="sl-avatar-gloss-bar">
        <span className="sl-avatar-gloss-label">
          {isSpell ? 'Fingerspelling' : 'ISL Gloss'}
        </span>
        <div className="sl-avatar-gloss-list" aria-hidden="true">
          {tokens.map((token, idx) => (
            <span
              key={idx}
              className={`sl-avatar-gloss-item ${idx === activeIdx ? 'active' : ''}`}
            >
              {token.toUpperCase()}
            </span>
          ))}
        </div>
      </div>

      {/* "Find real sign online" supplement */}
      <ExternalSignLink word={word} accent={accent} />
    </div>
  );
}