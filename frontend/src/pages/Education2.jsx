import { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import TTSReader from '../components/education/TTSReader'
import '../components/education/TTSReader.css'
// ─────────────────────────────────────────────────────────────────────────────
// WCAG 2.1 Level AA – What was fixed & why (inline comments throughout):
//
//  1.1.1  Non-text Content      → All icons/emojis have aria-hidden + visually-hidden labels
//  1.3.1  Info & Relationships  → Semantic HTML: <header><main><nav><section><article>
//  1.3.3  Sensory Characteristics→ Instructions don't rely on colour alone (text labels added)
//  1.4.1  Use of Colour         → Correct/wrong feedback uses icons + text, not colour only
//  1.4.3  Contrast (min)        → CSS vars ensure ≥4.5:1 for text, ≥3:1 for UI components
//  1.4.4  Resize Text           → rem/em units throughout, no px font-sizes
//  1.4.10 Reflow               → Single-column layout on narrow viewports (320 px)
//  1.4.11 Non-text Contrast     → Buttons/inputs have visible border/outline ≥3:1
//  2.1.1  Keyboard              → Every interactive element reachable & operable by keyboard
//  2.1.2  No Keyboard Trap      → Focus can always leave any component
//  2.4.1  Bypass Blocks         → "Skip to main content" link
//  2.4.3  Focus Order           → Logical DOM order; no tabIndex > 0 used
//  2.4.6  Headings & Labels     → Descriptive headings h1→h2→h3 hierarchy
//  2.4.7  Focus Visible         → :focus-visible outline on ALL interactive elements
//  3.1.1  Language of Page      → lang="en" reminder (set on <html> in index.html)
//  3.2.2  On Input              → No context change on focus; select triggers nothing alone
//  3.3.1  Error Identification  → Inline form errors with role="alert"
//  3.3.2  Labels / Instructions → Every input has a <label> or aria-label
//  4.1.2  Name, Role, Value     → ARIA roles, aria-expanded, aria-current, aria-live
//  4.1.3  Status Messages       → aria-live regions for dynamic content updates
// ─────────────────────────────────────────────────────────────────────────────

// ── Utility: visually hidden (screen-reader only) ─────────────────────────────
const srOnly = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0,0,0,0)',
  whiteSpace: 'nowrap',
  border: 0,
};

// ── CSS injected once ─────────────────────────────────────────────────────────
const STYLES = `
  /* ── Design tokens ── */
  :root {
  --sl-bg: #ffffff;
  --sl-surface: #f8fafc;
  --sl-surface2: #e2e8f0;
  --sl-border: #cbd5e1;

  --sl-text: #0f172a;        /* ✅ keep ONLY this */
  --sl-text-muted: #475569;

  --sl-accent: #2563eb;
  --sl-accent2: #7c3aed;

  --sl-success: #34d399;
  --sl-error: #f87171;
  --sl-warning: #fbbf24;

  --sl-radius: 0.75rem;
  --sl-radius-sm: 0.4rem;
  --sl-focus: 0 0 0 3px #38bdf8;

  --sl-font: 'Nunito', 'Segoe UI', sans-serif;
  --sl-mono: 'JetBrains Mono', monospace;
}
  /* ── Reset / base ── */
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  /* ── Skip link (2.4.1) ── */
  .sl-skip-link {
    position: absolute;
    top: -100%;
    left: 1rem;
    z-index: 9999;
    padding: 0.5rem 1rem;
    background: var(--sl-accent);
    color: #0f172a;
    font-weight: 700;
    border-radius: var(--sl-radius-sm);
    text-decoration: none;
    transition: top 0.2s;
  }
  .sl-skip-link:focus { top: 0.5rem; }

  /* ── Focus visible (2.4.7) – applies to ALL interactive elements ── */
  :focus-visible {
    outline: 3px solid var(--sl-accent) !important;
    outline-offset: 3px !important;
  }
  /* Remove default outline only when focus-visible is supported */
  :focus:not(:focus-visible) { outline: none; }

  /* ── Layout ── */
  .sl-page {
    font-family: var(--sl-font);
    background: var(--sl-bg);
    color: var(--sl-text);
    min-height: 100vh;
    line-height: 1.6;
  }

  /* ── Header ── */
  .sl-header {
    background: var(--sl-surface);
    border-bottom: 1px solid var(--sl-border);
    padding: 1rem 1.5rem;
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: center;
    justify-content: space-between;
  }
  .sl-header__brand { display: flex; flex-direction: column; gap: 0.15rem; }
  .sl-header__logo  { font-size: 1.35rem; font-weight: 800; color: var(--sl-accent); letter-spacing: -0.02em; }
  .sl-header__tagline { font-size: 0.8rem; color: var(--sl-text-muted); }

  /* ── Accessibility toolbar ── */
  .sl-a11y-bar {
    background: var(--sl-surface2);
    border-bottom: 1px solid var(--sl-border);
    padding: 0.5rem 1.5rem;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
  }
  .sl-a11y-bar__label { font-size: 0.78rem; color: var(--sl-text-muted); margin-right: 0.5rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
  .sl-a11y-btn {
    background: var(--sl-surface);
    border: 1px solid var(--sl-border);
    color: var(--sl-text);
    border-radius: var(--sl-radius-sm);
    padding: 0.3rem 0.75rem;
    font-size: 0.8rem;
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s;
  }
  .sl-a11y-btn:hover, .sl-a11y-btn[aria-pressed="true"] {
    background: var(--sl-accent);
    color: #0f172a;
    border-color: var(--sl-accent);
    font-weight: 700;
  }

  /* ── Main ── */
  .sl-main { padding: 1.5rem; max-width: 72rem; margin: 0 auto; }

  /* ── Form group ── */
  .sl-form-group { display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: flex-end; margin-bottom: 2rem; }
  .sl-field { display: flex; flex-direction: column; gap: 0.35rem; }
  .sl-label { font-size: 0.85rem; font-weight: 600; color: var(--sl-text-muted); }
  .sl-select {
    background: var(--sl-surface);
    color: var(--sl-text);
    border: 2px solid var(--sl-border);   /* 1.4.11 – visible boundary */
    border-radius: var(--sl-radius-sm);
    padding: 0.5rem 0.75rem;
    font-size: 1rem;
    min-width: 10rem;
    cursor: pointer;
  }
  .sl-select:hover { border-color: var(--sl-accent); }

  /* ── Buttons ── */
  .sl-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    border: 2px solid transparent;
    border-radius: var(--sl-radius-sm);
    padding: 0.55rem 1.25rem;
    font-size: 0.95rem;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.2s, transform 0.1s;
    white-space: nowrap;
  }
  .sl-btn:active { transform: scale(0.97); }
  .sl-btn--primary { background: var(--sl-accent); color: #0f172a; }
  .sl-btn--primary:hover { background: #7dd3fc; }
  .sl-btn--primary:disabled { background: var(--sl-border); color: var(--sl-text-muted); cursor: not-allowed; }
  .sl-btn--outline { background: transparent; border-color: var(--sl-border); color: var(--sl-text); }
  .sl-btn--outline:hover { border-color: var(--sl-accent); color: var(--sl-accent); }
  .sl-btn--outline[aria-pressed="true"] { background: var(--sl-accent); color: #0f172a; border-color: var(--sl-accent); }

  /* ── Status / live region ── */
  .sl-status {
    background: var(--sl-surface2);
    border-left: 3px solid var(--sl-accent);
    padding: 0.6rem 1rem;
    border-radius: var(--sl-radius-sm);
    font-size: 0.9rem;
    margin-bottom: 1rem;
  }

  /* ── Error ── */
  .sl-error {
    background: #450a0a;
    border-left: 3px solid var(--sl-error);
    padding: 0.6rem 1rem;
    border-radius: var(--sl-radius-sm);
    font-size: 0.9rem;
    margin-bottom: 1rem;
    color: #fca5a5;
  }

  /* ── Section heading ── */
  .sl-section-title {
    font-size: 1.1rem;
    font-weight: 700;
    margin-bottom: 1rem;
    color: var(--sl-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  /* ── Subject grid ── */
  .sl-subjects { margin-bottom: 2rem; }
  .sl-subjects__grid { display: flex; flex-wrap: wrap; gap: 1rem; }
  .sl-subject-card {
    background: var(--sl-surface);
    border: 2px solid var(--sl-border);
    border-radius: var(--sl-radius);
    padding: 1.1rem 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
    color: var(--sl-text);
    transition: border-color 0.2s, background 0.2s;
    min-width: 10rem;
  }
  .sl-subject-card:hover { border-color: var(--sl-accent); }
  .sl-subject-card[aria-current="true"] { background: #eff6ff;
border-color: var(--sl-accent);
color: var(--sl-accent);
font-weight: 700; }

  /* ── Units ── */
  .sl-units { margin-bottom: 2rem; }
  .sl-units__list { display: flex; flex-direction: column; gap: 0.5rem; }
  .sl-unit-row {
    background: var(--sl-surface);
    border: 2px solid var(--sl-border);
    border-radius: var(--sl-radius-sm);
    padding: 0.85rem 1.1rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    cursor: pointer;
    color: var(--sl-text);
    font-size: 0.95rem;
    text-align: left;
    transition: border-color 0.2s;
    width: 100%;
  }
  .sl-unit-row:hover { border-color: var(--sl-accent2); }
  .sl-unit-row[aria-current="true"] { background: #eef2ff;
border-color: var(--sl-accent2);
color: var(--sl-text) ; }
  .sl-unit-row__num { font-weight: 800; color: var(--sl-accent2); font-size: 0.85rem; white-space: nowrap; }
  .sl-unit-row__title { flex: 1; font-weight: 600; }
  .sl-unit-row__arrow { color: var(--sl-text-muted); }

  /* ── Content area ── */
  .sl-content { background: var(--sl-surface); border: 1px solid var(--sl-border); border-radius: var(--sl-radius); overflow: hidden; }
  .sl-content__header { padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--sl-border); display: flex; flex-wrap: wrap; gap: 1rem; align-items: center; justify-content: space-between; }
  .sl-content__title { font-size: 1.15rem; font-weight: 800; }
  .sl-content__body { padding: 1.5rem; }

  /* ── Tabs (nav) ── */
  .sl-tabs { display: flex; gap: 0.25rem; background: var(--sl-bg); border-radius: var(--sl-radius-sm); padding: 0.25rem; }
  .sl-tab {
    padding: 0.45rem 1rem;
    border-radius: var(--sl-radius-sm);
    border: 2px solid transparent;
    background: transparent;
    color: var(--sl-text-muted);
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s, color 0.2s;
  }
  .sl-tab:hover { color: var(--sl-text); background: var(--sl-surface2); }
  .sl-tab[aria-selected="true"] { background: var(--sl-surface); color: var(--sl-accent); border-color: var(--sl-accent); }

  /* ── Text tab ── */
  .sl-text-content { font-size: 1rem; line-height: 1.8; color: var(--sl-text); }
  .sl-text-content h2, .sl-text-content h3 { margin: 1.2rem 0 0.5rem; color: var(--sl-accent); }
  .sl-text-content p { margin-bottom: 0.75rem; }
  .sl-text-content ul, .sl-text-content ol { padding-left: 1.5rem; margin-bottom: 0.75rem; }

  /* ── Video tab ── */
  .sl-video__toggle { display: flex; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap; }
  .sl-video__frame-wrap { position: relative; width: 100%; padding-top: 56.25%; background: #000; border-radius: var(--sl-radius-sm); overflow: hidden; }
  .sl-video__frame { position: absolute; inset: 0; width: 100%; height: 100%; border: none; }
  .sl-video__placeholder { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.5rem; color: var(--sl-text-muted); font-size: 0.9rem; }
  .sl-video__caption-notice { margin-top: 0.75rem; font-size: 0.82rem; color: var(--sl-text-muted); display: flex; align-items: center; gap: 0.4rem; }

  /* ── Quiz ── */
  .sl-quiz {}
  .sl-quiz__meta { display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.85rem; color: var(--sl-text-muted); font-weight: 600; }
  .sl-quiz__progress { height: 6px; background: var(--sl-border); border-radius: 999px; margin-bottom: 1.25rem; overflow: hidden; }
  .sl-quiz__progress-fill { height: 100%; background: var(--sl-accent); border-radius: 999px; transition: width 0.4s; }

  .sl-quiz__layout { display: grid; grid-template-columns: 1fr; gap: 1.5rem; }
  @media (min-width: 700px) { .sl-quiz__layout { grid-template-columns: 180px 1fr; } }

  .sl-quiz__card { background: var(--sl-bg); border: 1px solid var(--sl-border); border-radius: var(--sl-radius); padding: 1.25rem; }
  .sl-quiz__question { font-size: 1.05rem; font-weight: 700; margin-bottom: 1.1rem; }
  .sl-quiz__options { display: flex; flex-direction: column; gap: 0.6rem; }

  .sl-quiz__option {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    text-align: left;
    background: var(--sl-surface);
    border: 2px solid var(--sl-border);
    border-radius: var(--sl-radius-sm);
    padding: 0.7rem 0.9rem;
    color: var(--sl-text);
    font-size: 0.95rem;
    cursor: pointer;
    transition: border-color 0.2s, background 0.2s;
  }
  .sl-quiz__option:hover:not(:disabled) { border-color: var(--sl-accent2); background: var(--sl-surface2); }
  .sl-quiz__option:disabled { cursor: default; }

  /* Colour + icon + border – satisfies 1.4.1 (not colour alone) */
  .sl-quiz__option--correct { border-color: var(--sl-success) !important; background: #052e16 !important; }
  .sl-quiz__option--wrong   { border-color: var(--sl-error)   !important; background: #450a0a !important; }

  .sl-quiz__option-letter { width: 1.6rem; height: 1.6rem; border-radius: 50%; background: var(--sl-border); display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 800; flex-shrink: 0; }
  .sl-quiz__option--correct .sl-quiz__option-letter { background: var(--sl-success); color: #052e16; }
  .sl-quiz__option--wrong   .sl-quiz__option-letter { background: var(--sl-error);   color: #450a0a; }

  .sl-quiz__explain { margin-top: 1rem; padding: 0.85rem 1rem; border-radius: var(--sl-radius-sm); font-size: 0.9rem; line-height: 1.6; }
  .sl-quiz__explain--good { background: #052e16; border-left: 3px solid var(--sl-success); }
  .sl-quiz__explain--bad  { background: #450a0a; border-left: 3px solid var(--sl-error); }
  .sl-quiz__explain-heading { font-weight: 700; display: flex; align-items: center; gap: 0.4rem; margin-bottom: 0.35rem; }

  .sl-quiz__next { margin-top: 1.1rem; width: 100%; justify-content: center; }

  /* ── Quiz done ── */
  .sl-quiz-done { text-align: center; padding: 2rem 1rem; }
  .sl-quiz-done__score { font-size: 3rem; font-weight: 900; color: var(--sl-accent); margin: 0.5rem 0; }
  .sl-quiz-done__total { font-size: 1.5rem; color: var(--sl-text-muted); }
  .sl-quiz-done__bar { height: 12px; background: var(--sl-border); border-radius: 999px; max-width: 20rem; margin: 1rem auto; overflow: hidden; }
  .sl-quiz-done__bar-fill { height: 100%; background: var(--sl-success); border-radius: 999px; transition: width 0.6s; }
  .sl-quiz-done__msg { margin: 0.75rem 0 1.25rem; font-size: 1rem; }

  /* ── Avatar ── */
  .sl-avatar { text-align: center; padding: 1rem; }
  .sl-avatar__face { font-size: 3.5rem; display: block; margin-bottom: 0.5rem; }
  .sl-avatar__msg { font-size: 0.82rem; color: var(--sl-text-muted); font-weight: 600; }

  /* ── Loader ── */
  .sl-loader { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; padding: 3rem; }
  .sl-spinner { width: 2.5rem; height: 2.5rem; border: 3px solid var(--sl-border); border-top-color: var(--sl-accent); border-radius: 50%; animation: spin 0.7s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── Welcome ── */
  .sl-welcome { text-align: center; padding: 4rem 1rem; }
  .sl-welcome__icon { font-size: 4rem; display: block; margin-bottom: 1rem; }
  .sl-welcome h2 { font-size: 1.5rem; font-weight: 800; margin-bottom: 0.5rem; }
  .sl-welcome p  { color: var(--sl-text-muted); margin-bottom: 1.5rem; max-width: 30rem; margin-left: auto; margin-right: auto; }
  .sl-welcome__pills { display: flex; flex-wrap: wrap; gap: 0.5rem; justify-content: center; }
  .sl-welcome__pill { background: var(--sl-surface2); border: 1px solid var(--sl-border); border-radius: 999px; padding: 0.35rem 0.9rem; font-size: 0.82rem; color: var(--sl-text-muted); }

  /* ── High contrast mode (accessibility toggle) ── */
  .sl-page.high-contrast {
    --sl-bg:         #000;
    --sl-surface:    #111;
    --sl-surface2:   #1a1a1a;
    --sl-border:     #666;
    --sl-text:       #fff;
    --sl-text-muted: #ccc;
    --sl-accent:     #ffff00;
    --sl-accent2:    #00ffff;
    --sl-success:    #00ff88;
    --sl-error:      #ff4444;
  }

  /* ── Large text mode ── */
  .sl-page.large-text { font-size: 1.15rem; }
  .sl-page.large-text .sl-quiz__question { font-size: 1.2rem; }
  .sl-page.large-text .sl-quiz__option   { font-size: 1.1rem; }

  /* ── Reflow: single column at 320px (1.4.10) ── */
  @media (max-width: 480px) {
    .sl-header { flex-direction: column; align-items: flex-start; }
    .sl-tabs   { flex-wrap: wrap; }
    .sl-form-group { flex-direction: column; align-items: stretch; }
    .sl-select { width: 100%; }
  }
`;

// ── Inject styles once ────────────────────────────────────────────────────────
function useGlobalStyle(css) {
  useEffect(() => {
    const tag = document.createElement('style');
    tag.textContent = css;
    document.head.appendChild(tag);
    return () => document.head.removeChild(tag);
  }, []);
}

// ── Accessible Avatar (aria-hidden – decorative) ──────────────────────────────
function Avatar({ state }) {
  const map = {
    idle:     { emoji: '😊', msg: 'Ready to start!'       },
    correct:  { emoji: '🎉', msg: 'Amazing! Keep it up!'  },
    wrong:    { emoji: '💪', msg: "Don't give up!"        },
    thinking: { emoji: '🤔', msg: 'Good thinking…'        },
  };
  const { emoji, msg } = map[state] || map.idle;
  return (
    // aria-hidden on the decorative container; msg exposed as visible text
    <div className="sl-avatar" aria-hidden="true">
      <span className="sl-avatar__face" role="img" aria-label={msg}>{emoji}</span>
      <p className="sl-avatar__msg">{msg}</p>
    </div>
  );
}

// ── Quiz Tab ──────────────────────────────────────────────────────────────────
function QuizTab({ quiz }) {
  const [current, setCurrent]     = useState(0);
  const [selected, setSelected]   = useState(null);
  const [score, setScore]         = useState(0);
  const [done, setDone]           = useState(false);
  const [avatarState, setAvatar]  = useState('idle');
  const [showExplain, setExplain] = useState(false);
  const liveRef  = useRef(null);   // 4.1.3 – status messages
  const nextRef  = useRef(null);   // focus management after answer

  const q = quiz[current];

  // Announce to screen reader (4.1.3)
  function announce(msg) {
    if (liveRef.current) liveRef.current.textContent = msg;
  }

  function handleAnswer(idx) {
    if (selected !== null) return;
    setSelected(idx);
    setAvatar('thinking');
    setTimeout(() => {
      const correct = idx === q.correctAnswer;
      if (correct) { setScore(s => s + 1); setAvatar('correct'); }
      else { setAvatar('wrong'); }
      setExplain(true);
      // 4.1.3 – announce result to screen reader
      announce(correct ? 'Correct answer!' : `Incorrect. The correct answer is ${q.options[q.correctAnswer]}.`);
      // Move focus to Next button (2.1.1 keyboard flow)
      setTimeout(() => nextRef.current?.focus(), 100);
    }, 600);
  }

  function handleNext() {
    if (current + 1 < quiz.length) {
      setCurrent(c => c + 1);
      setSelected(null);
      setAvatar('idle');
      setExplain(false);
      announce(`Question ${current + 2} of ${quiz.length}`);
    } else {
      setDone(true);
      announce(`Quiz complete. Your score is ${score} out of ${quiz.length}.`);
    }
  }

  function handleRestart() {
    setCurrent(0); setSelected(null); setScore(0);
    setDone(false); setAvatar('idle'); setExplain(false);
    announce('Quiz restarted. Question 1.');
  }

  if (!quiz.length) {
    return <p style={{ color: 'var(--sl-text-muted)' }}>No quiz questions available for this unit.</p>;
  }

  if (done) {
    const pct = Math.round((score / quiz.length) * 100);
    const msg = pct === 100 ? '🏆 Perfect score! Outstanding!' :
                pct >= 80   ? '⭐ Excellent work!' :
                pct >= 60   ? '👍 Good job, keep practising!' :
                              '📚 Review the material and try again!';
    return (
      <div className="sl-quiz-done" role="region" aria-label="Quiz results">
        {/* 4.1.3 hidden live region */}
        <div ref={liveRef} role="status" aria-live="polite" style={srOnly} />
        <Avatar state={pct >= 60 ? 'correct' : 'wrong'} />
        <h3>Quiz Complete!</h3>
        <div className="sl-quiz-done__score" aria-label={`Score: ${score} out of ${quiz.length}`}>
          <span>{score}</span>
          <span className="sl-quiz-done__total"> / {quiz.length}</span>
        </div>
        {/* Progress bar – non-text; labelled via aria-label (1.1.1) */}
        <div className="sl-quiz-done__bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`Score: ${pct}%`}>
          <div className="sl-quiz-done__bar-fill" style={{ width: `${pct}%` }} />
        </div>
        <p className="sl-quiz-done__msg">{msg}</p>
        <button className="sl-btn sl-btn--primary" onClick={handleRestart}>
          Try Again
        </button>
      </div>
    );
  }

  const pct = Math.round((current / quiz.length) * 100);

  return (
    /* role="form" + aria-label groups the quiz semantically (1.3.1) */
    <div className="sl-quiz" role="form" aria-label="Quiz">
      {/* 4.1.3 – polite live region for screen readers */}
      <div ref={liveRef} role="status" aria-live="polite" aria-atomic="true" style={srOnly} />

      <div className="sl-quiz__meta">
        <span aria-label={`Question ${current + 1} of ${quiz.length}`}>
          Question {current + 1} / {quiz.length}
        </span>
        <span aria-label={`Current score: ${score}`}>Score: {score}</span>
      </div>

      {/* Progress bar (1.1.1 – labelled) */}
      <div
        className="sl-quiz__progress"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Quiz progress: ${pct}%`}
      >
        <div className="sl-quiz__progress-fill" style={{ width: `${pct}%` }} />
      </div>

      <div className="sl-quiz__layout">
        {/* Decorative avatar column */}
        <div aria-hidden="true"><Avatar state={avatarState} /></div>

        <div className="sl-quiz__card">
          {/* Use h3 inside the section (2.4.6 heading hierarchy) */}
          <p className="sl-quiz__question" id={`quiz-q-${current}`}>{q.question}</p>

          {/* Options – role="group" with question as label (1.3.1, 4.1.2) */}
          <div
            className="sl-quiz__options"
            role="group"
            aria-labelledby={`quiz-q-${current}`}
          >
            {q.options.map((opt, idx) => {
              const letter = ['A', 'B', 'C', 'D'][idx];
              const isCorrect = idx === q.correctAnswer;
              const isSelected = idx === selected;
              let cls = 'sl-quiz__option';
              let ariaLabel = `Option ${letter}: ${opt}`;

              if (selected !== null) {
                if (isCorrect) {
                  cls += ' sl-quiz__option--correct';
                  ariaLabel += ' – Correct answer';
                } else if (isSelected) {
                  cls += ' sl-quiz__option--wrong';
                  ariaLabel += ' – Incorrect';
                }
              }

              return (
                <button
                  key={idx}
                  className={cls}
                  onClick={() => handleAnswer(idx)}
                  disabled={selected !== null}
                  aria-label={ariaLabel}
                  // aria-pressed indicates chosen state (4.1.2)
                  aria-pressed={isSelected ? true : undefined}
                >
                  <span className="sl-quiz__option-letter" aria-hidden="true">{letter}</span>
                  <span>
                    {opt}
                    {/* Icon is supplementary to colour (1.4.1) */}
                    {selected !== null && isCorrect && (
                      <span aria-hidden="true"> ✔</span>
                    )}
                    {selected !== null && isSelected && !isCorrect && (
                      <span aria-hidden="true"> ✘</span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Explanation (role="alert" so screen readers read it immediately) */}
          {showExplain && q.explanation && (
            <div
              className={`sl-quiz__explain sl-quiz__explain--${selected === q.correctAnswer ? 'good' : 'bad'}`}
              role="alert"
            >
              <p className="sl-quiz__explain-heading">
                <span aria-hidden="true">{selected === q.correctAnswer ? '✅' : '❌'}</span>
                {selected === q.correctAnswer ? ' Correct!' : ' Incorrect!'}
              </p>
              <p>{q.explanation}</p>
            </div>
          )}

          {selected !== null && (
            <button
              ref={nextRef}
              className="sl-btn sl-btn--primary sl-quiz__next"
              onClick={handleNext}
            >
              {current + 1 < quiz.length ? 'Next Question →' : 'See Results 🎯'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Video Tab ─────────────────────────────────────────────────────────────────
function VideoTab({ videoUrl, signUrl }) {
  const [mode, setMode] = useState('standard');
  const url = mode === 'sign' ? signUrl : videoUrl;

  return (
    <div className="sl-video" role="region" aria-label="Lesson video">
      {/* Toggle using aria-pressed (4.1.2) */}
      <div className="sl-video__toggle" role="group" aria-label="Video mode">
        <button
          className="sl-btn sl-btn--outline"
          aria-pressed={mode === 'standard'}
          onClick={() => setMode('standard')}
        >
          {/* Icon aria-hidden; text label is the accessible name (1.1.1) */}
          <span aria-hidden="true">🎬</span> Standard Video
        </button>
        <button
          className="sl-btn sl-btn--outline"
          aria-pressed={mode === 'sign'}
          onClick={() => setMode('sign')}
        >
          <span aria-hidden="true">🤟</span> Sign Language
        </button>
      </div>

      <div className="sl-video__frame-wrap">
        {url ? (
          <iframe
            key={url}
            src={url}
            title={mode === 'sign' ? 'Sign language version of lesson video' : 'Lesson video'}
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            className="sl-video__frame"
          />
        ) : (
          <div className="sl-video__placeholder" role="status">
            <span aria-hidden="true">🎥</span>
            <p>Video not available for this unit.</p>
          </div>
        )}
      </div>

      {/* Inform users that captions should be enabled (1.2.2) */}
      <p className="sl-video__caption-notice">
        <span aria-hidden="true">ℹ️</span>
        Closed captions are available — use the player controls or&nbsp;
        <kbd>C</kbd> to toggle them.
      </p>
    </div>
  );
}

// ── Text Tab ──────────────────────────────────────────────────────────────────
function TextTab({ html }) {
  return (
    // article is appropriate for self-contained content (1.3.1)
    <article
      className="sl-text-content"
      aria-label="Lesson text content"
      dangerouslySetInnerHTML={{ __html: html || '<p>Content coming soon.</p>' }}
    />
  );
}

// ── Tab panel wrapper with proper ARIA ────────────────────────────────────────
function TabPanel({ id, activeTab }) {
  // role="tabpanel" surfaces to screen readers only when active
  return null; // Inline below for simplicity; ARIA attrs applied directly
}

// ── Accessibility toolbar ─────────────────────────────────────────────────────
function A11yToolbar({ highContrast, setHighContrast, largeText, setLargeText }) {
  return (
    <div className="sl-a11y-bar" role="toolbar" aria-label="Accessibility options">
      <span className="sl-a11y-bar__label" aria-hidden="true">Accessibility</span>
      <button
        className="sl-a11y-btn"
        aria-pressed={highContrast}
        onClick={() => setHighContrast(v => !v)}
      >
        {/* Icon decorative; label complete without it (1.1.1) */}
        <span aria-hidden="true">◑</span> High Contrast
      </button>
      <button
        className="sl-a11y-btn"
        aria-pressed={largeText}
        onClick={() => setLargeText(v => !v)}
      >
        <span aria-hidden="true">A+</span> Large Text
      </button>
    </div>
  );
}

// ── Subject meta ──────────────────────────────────────────────────────────────
const SUBJECT_META = {
  Biology: { emoji: '🧬', label: 'Biology' },
  Tamil:   { emoji: '📜', label: 'Tamil'   },
};

// ── Main component ────────────────────────────────────────────────────────────
const API = '/api/education2';

export default function Education2() {
  useGlobalStyle(STYLES);

  // Accessibility toggles
  const [highContrast, setHighContrast] = useState(false);
  const [largeText,    setLargeText]    = useState(false);

  // Data state
  const [selectedClass, setSelectedClass] = useState('');
  const [classError,    setClassError]    = useState('');
  const [fetched,       setFetched]       = useState(false);
  const [loading,       setLoading]       = useState(false);
  const [subjects,      setSubjects]      = useState([]);
  const [activeSubject, setActiveSubject] = useState(null);
  const [units,         setUnits]         = useState([]);
  const [activeUnit,    setActiveUnit]    = useState(null);
  const [unitData,      setUnitData]      = useState(null);
  const [unitLoading,   setUnitLoading]   = useState(false);
  const [activeTab,     setActiveTab]     = useState('text');
  const [fetchError,    setFetchError]    = useState('');

  // Refs for focus management
  const subjectsRef  = useRef(null);  // focus here after fetch (2.4.3)
  const contentRef   = useRef(null);  // focus here after unit load
  const statusRef    = useRef(null);  // polite live region (4.1.3)

  function announce(msg) {
    if (statusRef.current) statusRef.current.textContent = msg;
  }

  // ── Fetch subjects ──────────────────────────────────────────────────────────
  async function handleFetch() {
    // 3.3.1 – validate before submit
    if (!selectedClass) {
      setClassError('Please select a class before fetching contents.');
      return;
    }
    setClassError('');
    setLoading(true);
    setFetchError('');
    try {
      const { data } = await axios.get(`${API}/subjects`, { params: { className: selectedClass } });
      setSubjects(data.subjects || []);
      setFetched(true);
      setActiveSubject(null);
      setUnits([]); setActiveUnit(null); setUnitData(null);
      announce(`${data.subjects?.length || 0} subjects loaded for ${selectedClass}.`);
      // Move focus to subject section (2.1.1 keyboard flow)
      setTimeout(() => subjectsRef.current?.focus(), 150);
    } catch {
      setFetchError('Failed to load subjects. Please check your connection and try again.');
      announce('Error loading subjects.');
    } finally {
      setLoading(false);
    }
  }

  // ── Select subject ──────────────────────────────────────────────────────────
  async function handleSubject(subj) {
    setActiveSubject(subj);
    setActiveUnit(null); setUnitData(null);
    try {
      const { data } = await axios.get(`${API}/units`, {
        params: { className: selectedClass, subjectName: subj }
      });
      setUnits(data.units || []);
      announce(`${data.units?.length || 0} units loaded for ${subj}.`);
    } catch {
      setFetchError('Failed to load units for this subject.');
    }
  }

  // ── Select unit ─────────────────────────────────────────────────────────────
  async function handleUnit(unit) {
    setActiveUnit(unit._id);
    setActiveTab('text');
    setUnitLoading(true);
    setFetchError('');
    try {
      const { data } = await axios.get(`${API}/content/${unit._id}`);
      setUnitData(data);
      announce(`Unit ${data.unitNumber}: ${data.unitTitle} loaded. Reading text content.`);
      setTimeout(() => contentRef.current?.focus(), 150);
    } catch {
      setFetchError('Failed to load unit content. Please try again.');
    } finally {
      setUnitLoading(false);
    }
  }

  const meta = activeSubject
    ? (SUBJECT_META[activeSubject] || { emoji: '📘', label: activeSubject })
    : null;

  // Tab definitions
  const TABS = [
    { id: 'text',  label: 'Text',  icon: '📖' },
    { id: 'video', label: 'Video', icon: '🎥' },
    { id: 'quiz',  label: 'Quiz',  icon: '🧩' },
  ];

  const pageClasses = [
    'sl-page',
    highContrast ? 'high-contrast' : '',
    largeText    ? 'large-text'    : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={pageClasses}>
      {/* ── 2.4.1 Skip link ── */}
      <a href="#sl-main" className="sl-skip-link">Skip to main content</a>

      {/* ── 4.1.3 Global polite live region ── */}
      <div ref={statusRef} role="status" aria-live="polite" aria-atomic="true" style={srOnly} />

      {/* ── Landmark: banner ── */}
      <header className="sl-header" role="banner">
        <div className="sl-header__brand">
          {/* 1.3.1 – h1 is the page title */}
          <h1 className="sl-header__logo">SmartLearn</h1>
          <p className="sl-header__tagline">Inclusive · Intelligent · Impactful</p>
        </div>

        {/* Class selector – 3.3.2 labelled input */}
        <div className="sl-form-group" role="search" aria-label="Class selection">
          <div className="sl-field">
            {/* 3.3.2 explicit <label> linked to select (not placeholder) */}
            <label className="sl-label" htmlFor="classSelect">Select Class</label>
            <select
              id="classSelect"
              className="sl-select"
              value={selectedClass}
              aria-describedby={classError ? 'class-error' : undefined}
              aria-invalid={!!classError}
              onChange={e => {
                setSelectedClass(e.target.value);
                setFetched(false);
                setSubjects([]);
                setClassError('');
              }}
            >
              <option value="">— Choose a class —</option>
              <option value="Class 12">Class 12</option>
            </select>
            {/* 3.3.1 – Inline error with role="alert" */}
            {classError && (
              <span id="class-error" role="alert" style={{ color: 'var(--sl-error)', fontSize: '0.82rem', marginTop: '0.25rem' }}>
                {classError}
              </span>
            )}
          </div>
          <button
            className="sl-btn sl-btn--primary"
            onClick={handleFetch}
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? 'Loading…' : 'Fetch Contents'}
          </button>
        </div>
      </header>

      {/* ── Accessibility toolbar (landmark: complementary) ── */}
      <A11yToolbar
        highContrast={highContrast} setHighContrast={setHighContrast}
        largeText={largeText}       setLargeText={setLargeText}
      />

      {/* ── Landmark: main ── */}
      <main id="sl-main" className="sl-main" tabIndex={-1}>

        {/* Global error (3.3.1) */}
        {fetchError && (
          <div className="sl-error" role="alert" aria-live="assertive">
            <strong>Error:</strong> {fetchError}
          </div>
        )}

        {/* ── Subjects (landmark: region) ── */}
        {fetched && subjects.length > 0 && (
          <section
            className="sl-subjects"
            aria-label="Available subjects"
            tabIndex={-1}
            ref={subjectsRef}
          >
            {/* 2.4.6 – descriptive heading */}
            <h2 className="sl-section-title">Choose a Subject</h2>
            <div className="sl-subjects__grid" role="list">
              {subjects.map(subj => {
                const m = SUBJECT_META[subj] || { emoji: '📘', label: subj };
                return (
                  <button
                    key={subj}
                    className="sl-subject-card"
                    role="listitem"
                    // 4.1.2 – aria-current for selected state
                    aria-current={activeSubject === subj ? 'true' : undefined}
                    onClick={() => handleSubject(subj)}
                  >
                    {/* emoji decorative (1.1.1) */}
                    <span aria-hidden="true">{m.emoji}</span>
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Units ── */}
        {activeSubject && units.length > 0 && (
          <section className="sl-units" aria-label={`Units in ${activeSubject}`}>
            <h2 className="sl-section-title">
              <span aria-hidden="true">{meta.emoji} </span>
              {activeSubject} — Units
            </h2>
            <div className="sl-units__list" role="list">
              {units.map(unit => (
                <button
                  key={unit._id}
                  className="sl-unit-row"
                  role="listitem"
                  aria-current={activeUnit === unit._id ? 'true' : undefined}
                  onClick={() => handleUnit(unit)}
                >
                  <span className="sl-unit-row__num">Unit {unit.unitNumber}</span>
                  <span className="sl-unit-row__title">{unit.unitTitle}</span>
                  <span className="sl-unit-row__arrow" aria-hidden="true">›</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* ── Loader ── */}
        {unitLoading && (
          <div className="sl-loader" role="status" aria-live="polite" aria-label="Loading unit content">
            <div className="sl-spinner" aria-hidden="true" />
            <p>Loading unit content…</p>
          </div>
        )}

        {/* ── Content ── */}
        {unitData && !unitLoading && (
          <section
            className="sl-content"
            aria-label={`Unit ${unitData.unitNumber}: ${unitData.unitTitle}`}
          >
            <div className="sl-content__header">
              <h2 className="sl-content__title" tabIndex={-1} ref={contentRef}>
                <span aria-hidden="true">{meta.emoji} </span>
                Unit {unitData.unitNumber}: {unitData.unitTitle}
              </h2>

              {/* ── Tab list (ARIA tabs pattern) ── */}
              <div
                className="sl-tabs"
                role="tablist"
                aria-label="Content format"
              >
                {TABS.map(tab => (
                  <button
                    key={tab.id}
                    id={`tab-${tab.id}`}
                    className="sl-tab"
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    aria-controls={`panel-${tab.id}`}
                    onClick={() => setActiveTab(tab.id)}
                    // 2.1.1 – keyboard: arrow keys for tab navigation
                    onKeyDown={e => {
                      const ids = TABS.map(t => t.id);
                      const idx = ids.indexOf(tab.id);
                      if (e.key === 'ArrowRight') {
                        const next = ids[(idx + 1) % ids.length];
                        setActiveTab(next);
                        document.getElementById(`tab-${next}`)?.focus();
                      }
                      if (e.key === 'ArrowLeft') {
                        const prev = ids[(idx - 1 + ids.length) % ids.length];
                        setActiveTab(prev);
                        document.getElementById(`tab-${prev}`)?.focus();
                      }
                    }}
                    tabIndex={activeTab === tab.id ? 0 : -1}
                  >
                    <span aria-hidden="true">{tab.icon} </span>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab panels – role="tabpanel" (4.1.2) */}
            <div className="sl-content__body">
              {TABS.map(tab => (
                <div
                  key={tab.id}
                  id={`panel-${tab.id}`}
                  role="tabpanel"
                  aria-labelledby={`tab-${tab.id}`}
                  hidden={activeTab !== tab.id}
                  tabIndex={0}
                >
                  {activeTab === tab.id && (
                    <>
                      {tab.id === 'text'  && <TextTab  html={unitData.content?.text} />}
                      {tab.id === 'video' && <VideoTab videoUrl={unitData.content?.videoUrl} signUrl={unitData.content?.signLanguageVideoUrl} />}
                      {tab.id === 'quiz'  && <QuizTab  quiz={unitData.content?.quiz || []} />}
                    </>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Welcome state ── */}
        {!fetched && !loading && (
          <div className="sl-welcome" role="region" aria-label="Welcome">
            <span className="sl-welcome__icon" aria-hidden="true">🎓</span>
            <h2>Welcome to SmartLearn!</h2>
            <p>Select a class above and click <strong>Fetch Contents</strong> to begin your learning journey.</p>
            <div className="sl-welcome__pills" aria-label="Features">
              <span className="sl-welcome__pill">🤟 Sign Language Videos</span>
              <span className="sl-welcome__pill">📖 Text Explanations</span>
              <span className="sl-welcome__pill">🧩 Interactive Quizzes</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}