import { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import TTSReader from '../components/education/TTSReader'
import '../components/education/TTSReader.css'

import SignAvatarPlayer from './SignAvatarPlayer';
import { resolveSignStrategy } from './SignAnimationController';

const srOnly = {
  position: 'absolute', width: '1px', height: '1px', padding: 0,
  margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)',
  whiteSpace: 'nowrap', border: 0,
};

const STYLES = `
  :root {
    --sl-bg: #ffffff;
    --sl-surface: #f8fafc;
    --sl-surface2: #e2e8f0;
    --sl-border: #cbd5e1;
    --sl-text: #0f172a;
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
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .sl-skip-link {
    position: absolute; top: -100%; left: 1rem; z-index: 9999;
    padding: 0.5rem 1rem; background: var(--sl-accent); color: #0f172a;
    font-weight: 700; border-radius: var(--sl-radius-sm); text-decoration: none; transition: top 0.2s;
  }
  .sl-skip-link:focus { top: 0.5rem; }

  :focus-visible { outline: 3px solid var(--sl-accent) !important; outline-offset: 3px !important; }
  :focus:not(:focus-visible) { outline: none; }

  .sl-page { font-family: var(--sl-font); background: var(--sl-bg); color: var(--sl-text); min-height: 100vh; line-height: 1.6; }
  .sl-header { background: var(--sl-surface); border-bottom: 1px solid var(--sl-border); padding: 1rem 1.5rem; display: flex; flex-wrap: wrap; gap: 1rem; align-items: center; justify-content: space-between; }
  .sl-header__brand { display: flex; flex-direction: column; gap: 0.15rem; }
  .sl-header__logo  { font-size: 1.35rem; font-weight: 800; color: var(--sl-accent); letter-spacing: -0.02em; }
  .sl-header__tagline { font-size: 0.8rem; color: var(--sl-text-muted); }

  .sl-a11y-bar { background: var(--sl-surface2); border-bottom: 1px solid var(--sl-border); padding: 0.5rem 1.5rem; display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; }
  .sl-a11y-bar__label { font-size: 0.78rem; color: var(--sl-text-muted); margin-right: 0.5rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
  .sl-a11y-btn { background: var(--sl-surface); border: 1px solid var(--sl-border); color: var(--sl-text); border-radius: var(--sl-radius-sm); padding: 0.3rem 0.75rem; font-size: 0.8rem; cursor: pointer; transition: background 0.2s, border-color 0.2s; }
  .sl-a11y-btn:hover, .sl-a11y-btn[aria-pressed="true"] { background: var(--sl-accent); color: #0f172a; border-color: var(--sl-accent); font-weight: 700; }

  .sl-main { padding: 1.5rem; max-width: 72rem; margin: 0 auto; }
  .sl-form-group { display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: flex-end; margin-bottom: 2rem; }
  .sl-field { display: flex; flex-direction: column; gap: 0.35rem; }
  .sl-label { font-size: 0.85rem; font-weight: 600; color: var(--sl-text-muted); }
  .sl-select { background: var(--sl-surface); color: var(--sl-text); border: 2px solid var(--sl-border); border-radius: var(--sl-radius-sm); padding: 0.5rem 0.75rem; font-size: 1rem; min-width: 10rem; cursor: pointer; }
  .sl-select:hover { border-color: var(--sl-accent); }

  .sl-btn { display: inline-flex; align-items: center; gap: 0.4rem; border: 2px solid transparent; border-radius: var(--sl-radius-sm); padding: 0.55rem 1.25rem; font-size: 0.95rem; font-weight: 700; cursor: pointer; transition: background 0.2s, transform 0.1s; white-space: nowrap; }
  .sl-btn:active { transform: scale(0.97); }
  .sl-btn--primary { background: var(--sl-accent); color: #0f172a; }
  .sl-btn--primary:hover { background: #7dd3fc; }
  .sl-btn--primary:disabled { background: var(--sl-border); color: var(--sl-text-muted); cursor: not-allowed; }
  .sl-btn--outline { background: transparent; border-color: var(--sl-border); color: var(--sl-text); }
  .sl-btn--outline:hover { border-color: var(--sl-accent); color: var(--sl-accent); }
  .sl-btn--outline[aria-pressed="true"] { background: var(--sl-accent); color: #0f172a; border-color: var(--sl-accent); }

  .sl-status { background: var(--sl-surface2); border-left: 3px solid var(--sl-accent); padding: 0.6rem 1rem; border-radius: var(--sl-radius-sm); font-size: 0.9rem; margin-bottom: 1rem; }
  .sl-error { background: #450a0a; border-left: 3px solid var(--sl-error); padding: 0.6rem 1rem; border-radius: var(--sl-radius-sm); font-size: 0.9rem; margin-bottom: 1rem; color: #fca5a5; }
  .sl-section-title { font-size: 1.1rem; font-weight: 700; margin-bottom: 1rem; color: var(--sl-text-muted); text-transform: uppercase; letter-spacing: 0.08em; }

  .sl-subjects { margin-bottom: 2rem; }
  .sl-subjects__grid { display: flex; flex-wrap: wrap; gap: 1rem; }
  .sl-subject-card { background: var(--sl-surface); border: 2px solid var(--sl-border); border-radius: var(--sl-radius); padding: 1.1rem 1.5rem; display: flex; align-items: center; gap: 0.75rem; font-size: 1rem; font-weight: 700; cursor: pointer; color: var(--sl-text); transition: border-color 0.2s, background 0.2s; min-width: 10rem; }
  .sl-subject-card:hover { border-color: var(--sl-accent); }
  .sl-subject-card[aria-current="true"] { background: #eff6ff; border-color: var(--sl-accent); color: var(--sl-accent); }

  .sl-units { margin-bottom: 2rem; }
  .sl-units__list { display: flex; flex-direction: column; gap: 0.5rem; }
  .sl-unit-row { background: var(--sl-surface); border: 2px solid var(--sl-border); border-radius: var(--sl-radius-sm); padding: 0.85rem 1.1rem; display: flex; align-items: center; gap: 1rem; cursor: pointer; color: var(--sl-text); font-size: 0.95rem; text-align: left; transition: border-color 0.2s; width: 100%; }
  .sl-unit-row:hover { border-color: var(--sl-accent2); }
  .sl-unit-row[aria-current="true"] { background: #eef2ff; border-color: var(--sl-accent2); }
  .sl-unit-row__num { font-weight: 800; color: var(--sl-accent2); font-size: 0.85rem; white-space: nowrap; }
  .sl-unit-row__title { flex: 1; font-weight: 600; }
  .sl-unit-row__arrow { color: var(--sl-text-muted); }

  .sl-content { background: var(--sl-surface); border: 1px solid var(--sl-border); border-radius: var(--sl-radius); overflow: hidden; }
  .sl-content__header { padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--sl-border); display: flex; flex-wrap: wrap; gap: 1rem; align-items: center; justify-content: space-between; }
  .sl-content__title { font-size: 1.15rem; font-weight: 800; }
  .sl-content__body { padding: 1.5rem; }

  .sl-tabs { display: flex; gap: 0.25rem; background: var(--sl-bg); border-radius: var(--sl-radius-sm); padding: 0.25rem; }
  .sl-tab { padding: 0.45rem 1rem; border-radius: var(--sl-radius-sm); border: 2px solid transparent; background: transparent; color: var(--sl-text-muted); font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: background 0.2s, color 0.2s; }
  .sl-tab:hover { color: var(--sl-text); background: var(--sl-surface2); }
  .sl-tab[aria-selected="true"] { background: var(--sl-surface); color: var(--sl-accent); border-color: var(--sl-accent); }

  .sl-text-content { font-size: 1rem; line-height: 1.8; color: var(--sl-text); }
  .sl-text-content h2, .sl-text-content h3 { margin: 1.2rem 0 0.5rem; color: var(--sl-accent); }
  .sl-text-content p { margin-bottom: 0.75rem; }
  .sl-text-content ul, .sl-text-content ol { padding-left: 1.5rem; margin-bottom: 0.75rem; }

  .sl-clickable-term { cursor: pointer; border-bottom: 2px solid transparent; border-radius: 2px; padding: 0 1px; transition: background 0.15s, border-color 0.15s; }
  .sl-clickable-term:hover { background: #ede9fe; border-bottom-color: var(--sl-accent2); }
  .sl-click-hint { display: inline-flex; align-items: center; gap: 0.35rem; font-size: 0.78rem; color: var(--sl-accent2); background: #ede9fe; border-radius: 999px; padding: 3px 10px; margin-bottom: 0.75rem; }

  .sl-video__toggle { display: flex; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap; }
  .sl-video__frame-wrap { position: relative; width: 100%; padding-top: 56.25%; background: #000; border-radius: var(--sl-radius-sm); overflow: hidden; }
  .sl-video__frame { position: absolute; inset: 0; width: 100%; height: 100%; border: none; }
  .sl-video__placeholder { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.5rem; color: var(--sl-text-muted); font-size: 0.9rem; }
  .sl-video__caption-notice { margin-top: 0.75rem; font-size: 0.82rem; color: var(--sl-text-muted); display: flex; align-items: center; gap: 0.4rem; }

  .sl-quiz__meta { display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.85rem; color: var(--sl-text-muted); font-weight: 600; }
  .sl-quiz__progress { height: 6px; background: var(--sl-border); border-radius: 999px; margin-bottom: 1.25rem; overflow: hidden; }
  .sl-quiz__progress-fill { height: 100%; background: var(--sl-accent); border-radius: 999px; transition: width 0.4s; }
  .sl-quiz__layout { display: grid; grid-template-columns: 1fr; gap: 1.5rem; }
  @media (min-width: 700px) { .sl-quiz__layout { grid-template-columns: 180px 1fr; } }
  .sl-quiz__card { background: var(--sl-bg); border: 1px solid var(--sl-border); border-radius: var(--sl-radius); padding: 1.25rem; }
  .sl-quiz__question { font-size: 1.05rem; font-weight: 700; margin-bottom: 1.1rem; }
  .sl-quiz__options { display: flex; flex-direction: column; gap: 0.6rem; }
  .sl-quiz__option { display: flex; align-items: center; gap: 0.75rem; width: 100%; text-align: left; background: var(--sl-surface); border: 2px solid var(--sl-border); border-radius: var(--sl-radius-sm); padding: 0.7rem 0.9rem; color: var(--sl-text); font-size: 0.95rem; cursor: pointer; transition: border-color 0.2s, background 0.2s; }
  .sl-quiz__option:hover:not(:disabled) { border-color: var(--sl-accent2); background: var(--sl-surface2); }
  .sl-quiz__option:disabled { cursor: default; }
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

  .sl-quiz-done { text-align: center; padding: 2rem 1rem; }
  .sl-quiz-done__score { font-size: 3rem; font-weight: 900; color: var(--sl-accent); margin: 0.5rem 0; }
  .sl-quiz-done__total { font-size: 1.5rem; color: var(--sl-text-muted); }
  .sl-quiz-done__bar { height: 12px; background: var(--sl-border); border-radius: 999px; max-width: 20rem; margin: 1rem auto; overflow: hidden; }
  .sl-quiz-done__bar-fill { height: 100%; background: var(--sl-success); border-radius: 999px; transition: width 0.6s; }
  .sl-quiz-done__msg { margin: 0.75rem 0 1.25rem; font-size: 1rem; }

  .sl-avatar { text-align: center; padding: 1rem; }
  .sl-avatar__face { font-size: 3.5rem; display: block; margin-bottom: 0.5rem; }
  .sl-avatar__msg { font-size: 0.82rem; color: var(--sl-text-muted); font-weight: 600; }

  .sl-loader { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; padding: 3rem; }
  .sl-spinner { width: 2.5rem; height: 2.5rem; border: 3px solid var(--sl-border); border-top-color: var(--sl-accent); border-radius: 50%; animation: sl-spin 0.7s linear infinite; }
  @keyframes sl-spin { to { transform: rotate(360deg); } }

  .sl-welcome { text-align: center; padding: 4rem 1rem; }
  .sl-welcome__icon { font-size: 4rem; display: block; margin-bottom: 1rem; }
  .sl-welcome h2 { font-size: 1.5rem; font-weight: 800; margin-bottom: 0.5rem; }
  .sl-welcome p  { color: var(--sl-text-muted); margin-bottom: 1.5rem; max-width: 30rem; margin-left: auto; margin-right: auto; }
  .sl-welcome__pills { display: flex; flex-wrap: wrap; gap: 0.5rem; justify-content: center; }
  .sl-welcome__pill { background: var(--sl-surface2); border: 1px solid var(--sl-border); border-radius: 999px; padding: 0.35rem 0.9rem; font-size: 0.82rem; color: var(--sl-text-muted); }

  .sl-page.high-contrast {
    --sl-bg: #000; --sl-surface: #111; --sl-surface2: #1a1a1a; --sl-border: #666;
    --sl-text: #fff; --sl-text-muted: #ccc; --sl-accent: #ffff00; --sl-accent2: #00ffff;
    --sl-success: #00ff88; --sl-error: #ff4444;
  }
  .sl-page.large-text { font-size: 1.15rem; }
  .sl-page.large-text .sl-quiz__question { font-size: 1.2rem; }
  .sl-page.large-text .sl-quiz__option   { font-size: 1.1rem; }

  @media (max-width: 480px) {
    .sl-header { flex-direction: column; align-items: flex-start; }
    .sl-tabs   { flex-wrap: wrap; }
    .sl-form-group { flex-direction: column; align-items: stretch; }
    .sl-select { width: 100%; }
  }

  /* ══ POPUP ══════════════════════════════════════════════════════════════════ */
  .sl-word-toast {
    position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
    background: #1e1b4b; color: #fff; padding: 10px 20px; border-radius: 30px;
    font-size: 0.85rem; font-weight: 600; display: flex; align-items: center; gap: 10px;
    z-index: 9998; box-shadow: 0 4px 20px rgba(0,0,0,.3); animation: sl-fadein .2s ease;
  }
  .sl-word-toast .sl-spinner { width: 16px; height: 16px; border-width: 2px; }

  .sl-popup-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,.5); z-index: 9999;
    display: flex; align-items: flex-end; justify-content: center;
    padding: 0 12px 20px; animation: sl-fadein .2s ease;
  }
  .sl-popup {
    background: #1a1a2e; border-radius: 20px;
    border: 1.5px solid var(--sl-popup-accent, #7c3aed);
    width: 100%; max-width: 800px; max-height: 82vh; overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0,0,0,.5); animation: sl-slideup .3s ease;
  }
  .sl-popup__strip { height: 4px; width: 100%; border-radius: 20px 20px 0 0; }
  .sl-popup__header { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px 4px; }
  .sl-popup__badges { display: flex; gap: 8px; }
  .sl-popup__badge { padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: capitalize; }
  .sl-popup__badge--level { background: rgba(255,255,255,.08); color: #aaa; }
  .sl-popup__close { width: 28px; height: 28px; border-radius: 50%; background: rgba(255,255,255,.08); border: none; color: #aaa; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background .15s; }
  .sl-popup__close:hover { background: rgba(255,255,255,.18); color: #fff; }
  .sl-popup__word { font-size: 1.6rem; font-weight: 800; color: #fff; padding: 6px 16px 10px; text-transform: capitalize; margin: 0; }

  .sl-popup__tabs { display: flex; border-bottom: 1px solid rgba(255,255,255,.08); padding: 0 16px; flex-wrap: wrap; }
  .sl-popup__tab { padding: 8px 16px 10px; background: none; border: none; border-bottom: 2px solid transparent; color: #666; font-size: 13px; font-weight: 600; cursor: pointer; transition: all .15s; margin-right: 4px; white-space: nowrap; }
  .sl-popup__tab:hover { color: #aaa; }
  .sl-popup__tab[aria-selected="true"] { color: var(--sl-popup-accent, #7c3aed); border-bottom-color: var(--sl-popup-accent, #7c3aed); }

  .sl-popup__body { padding: 14px 16px 6px; }
  .sl-popup__def-text { font-size: 15px; color: #ccc; line-height: 1.7; margin-bottom: 12px; }
  .sl-popup__example { border-left: 3px solid var(--sl-popup-accent, #7c3aed); padding-left: 12px; margin-bottom: 8px; }
  .sl-popup__example-label { font-size: 10px; color: #666; letter-spacing: .08em; display: block; margin-bottom: 3px; }
  .sl-popup__example-text  { font-size: 14px; color: #9fe1cb; font-style: italic; margin: 0; }
  .sl-popup__media { display: flex; flex-direction: column; align-items: center; gap: 10px; }
  .sl-popup__image { width: 100%; max-height: 220px; object-fit: contain; border-radius: 10px; background: #0d0d0d; }
  .sl-popup__caption { font-size: 12px; color: #555; text-transform: capitalize; }
  .sl-popup__no-media { text-align: center; padding: 20px; color: #555; }
  .sl-popup__no-media span { font-size: 2rem; display: block; margin-bottom: 8px; }
  .sl-popup__watch-btn { background: #FF0000; color: #fff; border: none; border-radius: 10px; padding: 11px 28px; font-size: 15px; font-weight: 700; cursor: pointer; width: 100%; transition: opacity .15s; }
  .sl-popup__watch-btn:hover { opacity: .85; }
  .sl-popup__video-hint { font-size: 11px; color: #444; margin: 0; }
  .sl-popup__hint { font-size: 11px; color: #333; text-align: right; padding: 8px 16px 12px; }

  @keyframes sl-slideup { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  @keyframes sl-fadein  { from { opacity: 0; } to { opacity: 1; } }

  /* ══ SPLIT LAYOUT (Definition / Visual / Video tabs) ══════════════════════ */
  .sl-popup__split { display: flex; flex-direction: row; width: 100%; }
  .sl-popup__avatar-pane {
    width: 40%; border-right: 1px solid rgba(255,255,255,.08);
    display: flex; flex-direction: column; align-items: center;
    padding: 16px; background: rgba(0,0,0,0.2); gap: 10px;
  }
  .sl-popup__content-pane { width: 60%; display: flex; flex-direction: column; }

  /* ══ ISL SIGN TAB — side by side layout ═══════════════════════════════════ */
  .sl-isl-tab {
    display: flex;
    flex-direction: row;
    gap: 0;
    width: 100%;
    min-height: 320px;
  }

  /* Left: avatar pane (reuses existing styles) */
  .sl-isl-tab__avatar {
    width: 42%;
    border-right: 1px solid rgba(255,255,255,.08);
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 16px;
    background: rgba(0,0,0,0.15);
    gap: 10px;
  }

  /* Right: YouTube ISL video pane */
  .sl-isl-tab__video {
    width: 58%;
    display: flex;
    flex-direction: column;
    padding: 16px;
    gap: 10px;
  }

  .sl-isl-tab__video-label {
    font-size: 9px;
    color: #555;
    letter-spacing: 0.08em;
    font-weight: 700;
    text-transform: uppercase;
  }

  .sl-isl-tab__video-frame-wrap {
    position: relative;
    width: 100%;
    padding-top: 56.25%;
    background: #000;
    border-radius: 10px;
    overflow: hidden;
    flex-shrink: 0;
  }

  .sl-isl-tab__video-frame {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border: none;
  }

  .sl-isl-tab__no-video {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: #444;
    font-size: 13px;
    text-align: center;
  }

  .sl-isl-tab__note {
    font-size: 10px;
    color: #444;
    line-height: 1.5;
    margin-top: 4px;
  }

  /* -- Google Images fallback (when no ISL video found) -- */
  .sl-isl-tab__fallback {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
    height: 100%;
  }
  .sl-isl-tab__fallback-frame-wrap {
    position: relative;
    width: 100%;
    flex: 1;
    min-height: 260px;
    border-radius: 10px;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,0.06);
    background: #fff;
  }
  .sl-isl-tab__fallback-frame {
    position: absolute;
    inset: 0;
    width: 109%;
    height: 109%;
    border: none;
    transform: scale(0.92);
    transform-origin: top left;
  }
  .sl-isl-tab__fallback-link {
    font-size: 11px;
    font-weight: 700;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 5px 0;
    opacity: 0.8;
    transition: opacity 0.15s;
  }
  .sl-isl-tab__fallback-link:hover { opacity: 1; }

  /* ══ Avatar component styles ══════════════════════════════════════════════ */
  .sl-avatar-character {
    width: 140px; height: 140px; background: transparent; border: none;
    display: flex; align-items: center; justify-content: center; position: relative; margin-bottom: 12px;
  }
  @keyframes sl-avatar-bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-4px); }
  }
  .sl-avatar-character--animating img { animation: sl-avatar-bounce 0.6s infinite ease-in-out; }
  .sl-avatar-controls { display: flex; flex-direction: column; gap: 8px; width: 100%; margin-top: 10px; }
  .sl-avatar-controls__row { display: flex; gap: 6px; justify-content: center; width: 100%; }
  .sl-avatar-btn {
    background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15);
    color: #fff; border-radius: 6px; padding: 6px 12px; font-size: 0.78rem; font-weight: 700;
    cursor: pointer; display: inline-flex; align-items: center; gap: 4px; transition: background 0.2s, border-color 0.2s;
  }
  .sl-avatar-btn:hover { background: var(--sl-popup-accent, #7c3aed); border-color: var(--sl-popup-accent, #7c3aed); }
  .sl-avatar-gloss-bar { width: 100%; background: rgba(0,0,0,0.4); border-radius: 8px; padding: 8px; margin-top: 12px; text-align: center; border: 1px solid rgba(255,255,255,.05); }
  .sl-avatar-gloss-label { font-size: 9px; color: #666; letter-spacing: .08em; display: block; margin-bottom: 4px; text-transform: uppercase; }
  .sl-avatar-gloss-list { display: flex; flex-wrap: wrap; gap: 4px; justify-content: center; }
  .sl-avatar-gloss-item { font-size: 0.72rem; padding: 2px 6px; border-radius: 4px; color: #888; background: rgba(255,255,255,0.02); font-weight: 700; transition: all 0.2s; }
  .sl-avatar-gloss-item.active { color: #fff; background: var(--sl-popup-accent, #7c3aed); transform: scale(1.05); }

  @media (max-width: 640px) {
    .sl-popup__split, .sl-isl-tab { flex-direction: column; }
    .sl-popup__avatar-pane { width: 100%; border-right: none; border-bottom: 1px solid rgba(255,255,255,.08); padding: 12px; flex-direction: row; flex-wrap: wrap; align-items: center; gap: 12px; }
    .sl-isl-tab__avatar { width: 100%; border-right: none; border-bottom: 1px solid rgba(255,255,255,.08); flex-direction: row; flex-wrap: wrap; }
    .sl-isl-tab__video  { width: 100%; }
    .sl-avatar-character { width: 90px; height: 90px; margin-bottom: 0; flex-shrink: 0; }
    .sl-avatar-controls { flex: 1; margin-top: 0; min-width: 150px; }
    .sl-popup__content-pane { width: 100%; }
  }
`;

function useGlobalStyle(css) {
  useEffect(() => {
    const tag = document.createElement('style');
    tag.textContent = css;
    document.head.appendChild(tag);
    return () => document.head.removeChild(tag);
  }, []);
}

// ══════════════════════════════════════════════════════════════
// ISL SIGN TAB — avatar (left) + YouTube ISL video (right)
// ══════════════════════════════════════════════════════════════
function ISLSignTab({ data, accent }) {
  const strategy = resolveSignStrategy(data.word, data);

  return (
    <div className="sl-isl-tab">

      {/* ── LEFT: Avatar with gloss track ── */}
      <div className="sl-isl-tab__avatar" style={{ '--sl-popup-accent': accent }}>
        <span style={{ fontSize: 9, color: '#555', letterSpacing: '0.08em', fontWeight: 700 }}>
          ISL GLOSS TRACK
        </span>
        <SignAvatarPlayer
          strategy={strategy}
          accent={accent}
          speed={1.0}
        />
      </div>

      {/* ── RIGHT: YouTube ISL video ── */}
      <div className="sl-isl-tab__video">
        <span className="sl-isl-tab__video-label">ISL SIGN VIDEO</span>

        {data.islSignVideoUrl ? (
          <>
            <div className="sl-isl-tab__video-frame-wrap">
              <iframe
                key={data.islSignVideoUrl}
                src={data.islSignVideoUrl}
                title={`ISL sign language video for: ${data.word}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="sl-isl-tab__video-frame"
              />
            </div>
            <p className="sl-isl-tab__note">
              Indian Sign Language video for "{data.word}" via YouTube
            </p>
          </>
        ) : (
          /* ── Fallback: Google Images ISL sign search ── */
          <div className="sl-isl-tab__fallback">
            {/* Label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <span style={{ fontSize: 9, color: '#555', letterSpacing: '0.08em', fontWeight: 700 }}>
                ISL SIGN IMAGE — GOOGLE SEARCH
              </span>
              <span style={{ fontSize: 10, color: '#444', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: 4 }}>
                No video found · showing image results
              </span>
            </div>

            {/* Google Images iframe — searches "word Indian sign language" */}
            <div className="sl-isl-tab__fallback-frame-wrap">
              <iframe
                key={data.word}
                src={`https://www.google.com/search?q=${encodeURIComponent(data.word + ' Indian sign language ISL')}&tbm=isch&igu=1`}
                title={`Google Images: ${data.word} Indian sign language`}
                className="sl-isl-tab__fallback-frame"
                sandbox="allow-scripts allow-same-origin allow-popups"
                aria-label={`Image search results for ${data.word} ISL sign`}
              />
            </div>

            {/* Open in new tab link — in case iframe is blocked */}
            <a
              href={`https://www.google.com/search?q=${encodeURIComponent(data.word + ' Indian sign language ISL')}&tbm=isch`}
              target="_blank"
              rel="noopener noreferrer"
              className="sl-isl-tab__fallback-link"
              style={{ color: accent }}
              aria-label={`Open Google Images search for ${data.word} ISL sign in new tab`}
            >
              🔍 Open in Google Images →
            </a>
          </div>
        )}
      </div>

    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// SIGN LANGUAGE AVATAR (wrapper for non-ISL-tab usage)
// ══════════════════════════════════════════════════════════════
function SignLanguageAvatar({ word, popupData, accent = '#7c3aed' }) {
  const strategy = resolveSignStrategy(word, popupData);
  return <SignAvatarPlayer strategy={strategy} accent={accent} speed={1.0} />;
}

// ══════════════════════════════════════════════════════════════
// WORD EXPLANATION POPUP
// ══════════════════════════════════════════════════════════════
function ExplanationPopup({ data, onDismiss }) {
  const [activeTab, setActiveTab] = useState('definition');
  const [imgError,  setImgError]  = useState(false);
  const timerRef  = useRef(null);
  const closeRef  = useRef(null);
  const prevFocus = useRef(null);

  useEffect(() => {
    if (!data) return;
    setActiveTab('definition');
    setImgError(false);
    prevFocus.current = document.activeElement;
    setTimeout(() => closeRef.current?.focus(), 50);
    timerRef.current = setTimeout(handleDismiss, 20000);
    return () => clearTimeout(timerRef.current);
  }, [data]);

  function handleDismiss() {
    clearTimeout(timerRef.current);
    prevFocus.current?.focus();
    onDismiss();
  }

  function handleKeyDown(e) { if (e.key === 'Escape') handleDismiss(); }

  if (!data) return null;

  const accent = data.color || '#7c3aed';
  const levelLabel = { easy: 'Basic', medium: 'Intermediate', hard: 'Advanced' }[data.level] || 'Intermediate';

  // ── Tabs: Definition, Visual, Video (if exists), ISL Sign (always shown) ──
  const tabs = [
    { key: 'definition', label: '📖 Definition' },
    { key: 'diagram',    label: '✨ Visual'     },
    data.videoUrl ? { key: 'video', label: '🎬 Video' } : null,
    { key: 'isl',        label: '🤟 ISL Sign'  },   // ← NEW TAB
  ].filter(Boolean);

  return (
    <div className="sl-popup-overlay" onClick={handleDismiss} role="presentation">
      <div
        className="sl-popup"
        style={{ '--sl-popup-accent': accent }}
        role="dialog" aria-modal="true"
        aria-label={`Word explanation: ${data.word}`}
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="sl-popup__strip" style={{ background: accent }} aria-hidden="true" />

        <div className="sl-popup__header">
          <div className="sl-popup__badges" aria-hidden="true">
            <span className="sl-popup__badge" style={{ background: accent + '25', color: accent }}>
              {data.subject || 'general'}
            </span>
            <span className="sl-popup__badge sl-popup__badge--level">{levelLabel}</span>
          </div>
          <button ref={closeRef} className="sl-popup__close" onClick={handleDismiss} aria-label="Close word explanation">✕</button>
        </div>

        <h2 className="sl-popup__word">{data.word}</h2>

        {/* ── Tab bar ── */}
        <div className="sl-popup__tabs" role="tablist" aria-label="Explanation sections">
          {tabs.map((t, i) => (
            <button
              key={t.key} className="sl-popup__tab"
              role="tab" aria-selected={activeTab === t.key}
              aria-controls={`popup-panel-${t.key}`}
              id={`popup-tab-${t.key}`}
              onClick={() => setActiveTab(t.key)}
              onKeyDown={e => {
                if (e.key === 'ArrowRight') setActiveTab(tabs[(i + 1) % tabs.length].key);
                if (e.key === 'ArrowLeft')  setActiveTab(tabs[(i - 1 + tabs.length) % tabs.length].key);
              }}
              tabIndex={activeTab === t.key ? 0 : -1}
            >{t.label}</button>
          ))}
        </div>

        {/* ══ ISL Sign tab — full-width, no inner split needed (has its own layout) ══ */}
        {activeTab === 'isl' && (
          <div id="popup-panel-isl" role="tabpanel" aria-labelledby="popup-tab-isl">
            <ISLSignTab data={data} accent={accent} />
          </div>
        )}

        {/* ══ All other tabs use the split layout (avatar left, content right) ══ */}
        {activeTab !== 'isl' && (
          <div className="sl-popup__split">

            {/* Left: avatar with gloss track */}
            <SignLanguageAvatar word={data.word} popupData={data} accent={accent} />

            {/* Right: tab content */}
            <div className="sl-popup__content-pane">
              <div className="sl-popup__body">

                {/* Definition */}
                <div id="popup-panel-definition" role="tabpanel" aria-labelledby="popup-tab-definition" hidden={activeTab !== 'definition'}>
                  {data.simplifiedDefinition && (
                    <div style={{ marginBottom: 14, background: 'rgba(255,255,255,0.03)', padding: '10px 12px', borderRadius: 8, borderLeft: `3px solid ${accent}` }}>
                      <span style={{ fontSize: 10, color: '#888', letterSpacing: '0.05em', fontWeight: 700, display: 'block', marginBottom: 3 }}>SIMPLE ISL TEXT</span>
                      <p className="sl-popup__def-text" style={{ fontSize: 15, color: '#fff', fontWeight: 600, margin: 0, lineHeight: 1.5 }}>{data.simplifiedDefinition}</p>
                    </div>
                  )}
                  <span style={{ fontSize: 10, color: '#666', letterSpacing: '0.05em', fontWeight: 700, display: 'block', marginBottom: 6 }}>FULL DICTIONARY DEFINITION</span>
                  <p className="sl-popup__def-text">{data.definition}</p>
                  {data.example && (
                    <div className="sl-popup__example">
                      <span className="sl-popup__example-label">EXAMPLE</span>
                      <p className="sl-popup__example-text">"{data.example}"</p>
                    </div>
                  )}
                </div>

                {/* Visual */}
                <div id="popup-panel-diagram" role="tabpanel" aria-labelledby="popup-tab-diagram" hidden={activeTab !== 'diagram'}>
                  <div className="sl-popup__media">
                    {data.animationUrl && !imgError
                      ? <>
                          <img src={data.animationUrl} alt={`Visual representation of ${data.word}`} className="sl-popup__image" onError={() => setImgError(true)} />
                          <p className="sl-popup__caption">Visual: {data.word}</p>
                        </>
                      : <div className="sl-popup__no-media" role="status">
                          <span aria-hidden="true">🔬</span>
                          <p>No visual available yet.</p>
                        </div>
                    }
                  </div>
                </div>

                {/* Video */}
                {data.videoUrl && (
                  <div id="popup-panel-video" role="tabpanel" aria-labelledby="popup-tab-video" hidden={activeTab !== 'video'}>
                    <div className="sl-popup__media">
                      <div style={{ width: '100%', background: '#0d0d0d', borderRadius: 12, padding: 24, textAlign: 'center', border: '1px solid rgba(255,0,0,.25)' }} aria-hidden="true">
                        <span style={{ fontSize: '2rem', color: '#FF0000' }}>▶</span>
                        <p style={{ color: '#aaa', fontSize: 13, textTransform: 'capitalize', margin: '6px 0 0' }}>{data.word} — video explanation</p>
                      </div>
                      <p style={{ color: '#666', fontSize: 13, textAlign: 'center', margin: 0 }}>A short educational video explaining "{data.word}".</p>
                      <button className="sl-popup__watch-btn" onClick={() => window.open(data.videoUrl, '_blank', 'noopener,noreferrer')} aria-label={`Watch ${data.word} on YouTube`}>
                        ▶ &nbsp;Open in YouTube
                      </button>
                      <p className="sl-popup__video-hint">Opens in a new tab</p>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        )}

        <p className="sl-popup__hint" aria-hidden="true">Auto-closes in 20s · Esc to close</p>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// WORD CLICKABLE TEXT
// ══════════════════════════════════════════════════════════════
function WordClickableText({ html, onWordClick }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.innerHTML = html || '<p>Content coming soon.</p>';
    const STOP_WORDS = new Set(['the','and','is','was','of','to','a','in','on','for','it','with','as','by','that','this','an','are','at','be','from','or','which','you','your','can','not','will','has','have','but','all','any','we','they','their']);
    const cleanup = [];
    function processNode(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.nodeValue;
        if (!/[a-zA-Z]/.test(text)) return;
        const fragment = document.createDocumentFragment();
        const tokens = text.split(/([a-zA-Z]+)/);
        let hasWord = false;
        tokens.forEach(token => {
          if (/^[a-zA-Z]+$/.test(token)) {
            hasWord = true;
            const cleanWord = token.toLowerCase();
            if (!STOP_WORDS.has(cleanWord) && cleanWord.length > 2) {
              const span = document.createElement('span');
              span.textContent = token;
              span.className = 'sl-clickable-term';
              span.setAttribute('role', 'button');
              span.setAttribute('tabIndex', '0');
              span.setAttribute('title', 'Click to learn more');
              const handler = (e) => { e.stopPropagation(); onWordClick(cleanWord); };
              const keyHandler = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handler(e); } };
              span.addEventListener('click', handler);
              span.addEventListener('keydown', keyHandler);
              cleanup.push(() => { span.removeEventListener('click', handler); span.removeEventListener('keydown', keyHandler); });
              fragment.appendChild(span);
            } else { fragment.appendChild(document.createTextNode(token)); }
          } else { fragment.appendChild(document.createTextNode(token)); }
        });
        if (hasWord) node.parentNode.replaceChild(fragment, node);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.nodeName !== 'SCRIPT' && node.nodeName !== 'STYLE') Array.from(node.childNodes).forEach(processNode);
      }
    }
    Array.from(el.childNodes).forEach(processNode);
    return () => cleanup.forEach(fn => fn());
  }, [html, onWordClick]);
  return <article ref={ref} className="sl-text-content" aria-label="Lesson text content" dangerouslySetInnerHTML={{ __html: html || '<p>Content coming soon.</p>' }} />;
}

// ══════════════════════════════════════════════════════════════
// AVATAR (quiz state — unchanged)
// ══════════════════════════════════════════════════════════════
function Avatar({ state }) {
  const map = { idle: { emoji: '😊', msg: 'Ready to start!' }, correct: { emoji: '🎉', msg: 'Amazing! Keep it up!' }, wrong: { emoji: '💪', msg: "Don't give up!" }, thinking: { emoji: '🤔', msg: 'Good thinking…' } };
  const { emoji, msg } = map[state] || map.idle;
  return <div className="sl-avatar" aria-hidden="true"><span className="sl-avatar__face" role="img" aria-label={msg}>{emoji}</span><p className="sl-avatar__msg">{msg}</p></div>;
}

// ══════════════════════════════════════════════════════════════
// QUIZ TAB (unchanged)
// ══════════════════════════════════════════════════════════════
function QuizTab({ quiz }) {
  const [current, setCurrent] = useState(0); const [selected, setSelected] = useState(null); const [score, setScore] = useState(0); const [done, setDone] = useState(false); const [avatarState, setAvatar] = useState('idle'); const [showExplain, setExplain] = useState(false);
  const liveRef = useRef(null); const nextRef = useRef(null);
  const q = quiz[current];
  function announce(msg) { if (liveRef.current) liveRef.current.textContent = msg; }
  function handleAnswer(idx) {
    if (selected !== null) return;
    setSelected(idx); setAvatar('thinking');
    setTimeout(() => {
      const correct = idx === q.correctAnswer;
      correct ? (setScore(s => s + 1), setAvatar('correct')) : setAvatar('wrong');
      setExplain(true);
      announce(correct ? 'Correct answer!' : `Incorrect. Correct answer is ${q.options[q.correctAnswer]}.`);
      setTimeout(() => nextRef.current?.focus(), 100);
    }, 600);
  }
  function handleNext() {
    if (current + 1 < quiz.length) { setCurrent(c => c + 1); setSelected(null); setAvatar('idle'); setExplain(false); announce(`Question ${current + 2} of ${quiz.length}`); }
    else { setDone(true); announce(`Quiz complete. Score: ${score} of ${quiz.length}.`); }
  }
  function handleRestart() { setCurrent(0); setSelected(null); setScore(0); setDone(false); setAvatar('idle'); setExplain(false); announce('Quiz restarted. Question 1.'); }
  if (!quiz.length) return <p style={{ color: 'var(--sl-text-muted)' }}>No quiz questions available.</p>;
  if (done) {
    const pct = Math.round((score / quiz.length) * 100);
    const msg = pct === 100 ? '🏆 Perfect score!' : pct >= 80 ? '⭐ Excellent!' : pct >= 60 ? '👍 Good job!' : '📚 Keep practising!';
    return <div className="sl-quiz-done" role="region" aria-label="Quiz results"><div ref={liveRef} role="status" aria-live="polite" style={srOnly} /><Avatar state={pct >= 60 ? 'correct' : 'wrong'} /><h3>Quiz Complete!</h3><div className="sl-quiz-done__score" aria-label={`Score: ${score} out of ${quiz.length}`}><span>{score}</span><span className="sl-quiz-done__total"> / {quiz.length}</span></div><div className="sl-quiz-done__bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}><div className="sl-quiz-done__bar-fill" style={{ width: `${pct}%` }} /></div><p className="sl-quiz-done__msg">{msg}</p><button className="sl-btn sl-btn--primary" onClick={handleRestart}>Try Again</button></div>;
  }
  const pct = Math.round((current / quiz.length) * 100);
  return <div className="sl-quiz" role="form" aria-label="Quiz"><div ref={liveRef} role="status" aria-live="polite" aria-atomic="true" style={srOnly} /><div className="sl-quiz__meta"><span>Question {current + 1} / {quiz.length}</span><span>Score: {score}</span></div><div className="sl-quiz__progress" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}><div className="sl-quiz__progress-fill" style={{ width: `${pct}%` }} /></div><div className="sl-quiz__layout"><div aria-hidden="true"><Avatar state={avatarState} /></div><div className="sl-quiz__card"><p className="sl-quiz__question" id={`quiz-q-${current}`}>{q.question}</p><div className="sl-quiz__options" role="group" aria-labelledby={`quiz-q-${current}`}>{q.options.map((opt, idx) => { const letter = ['A','B','C','D'][idx]; const isCorrect = idx === q.correctAnswer; const isSelected = idx === selected; let cls = 'sl-quiz__option'; if (selected !== null) { if (isCorrect) cls += ' sl-quiz__option--correct'; else if (isSelected) cls += ' sl-quiz__option--wrong'; } return <button key={idx} className={cls} onClick={() => handleAnswer(idx)} disabled={selected !== null} aria-label={`Option ${letter}: ${opt}`}><span className="sl-quiz__option-letter" aria-hidden="true">{letter}</span><span>{opt}{selected !== null && isCorrect && <span aria-hidden="true"> ✔</span>}{selected !== null && isSelected && !isCorrect && <span aria-hidden="true"> ✘</span>}</span></button>; })}</div>{showExplain && q.explanation && <div className={`sl-quiz__explain sl-quiz__explain--${selected === q.correctAnswer ? 'good' : 'bad'}`} role="alert"><p className="sl-quiz__explain-heading"><span aria-hidden="true">{selected === q.correctAnswer ? '✅' : '❌'}</span>{selected === q.correctAnswer ? ' Correct!' : ' Incorrect!'}</p><p>{q.explanation}</p></div>}{selected !== null && <button ref={nextRef} className="sl-btn sl-btn--primary sl-quiz__next" onClick={handleNext}>{current + 1 < quiz.length ? 'Next Question →' : 'See Results 🎯'}</button>}</div></div></div>;
}

// ══════════════════════════════════════════════════════════════
// VIDEO TAB (unchanged)
// ══════════════════════════════════════════════════════════════
function VideoTab({ videoUrl, signUrl }) {
  const [mode, setMode] = useState('standard');
  const url = mode === 'sign' ? signUrl : videoUrl;
  return <div className="sl-video" role="region" aria-label="Lesson video"><div className="sl-video__toggle" role="group" aria-label="Video mode"><button className="sl-btn sl-btn--outline" aria-pressed={mode === 'standard'} onClick={() => setMode('standard')}><span aria-hidden="true">🎬</span> Standard Video</button><button className="sl-btn sl-btn--outline" aria-pressed={mode === 'sign'} onClick={() => setMode('sign')}><span aria-hidden="true">🤟</span> Sign Language</button></div><div className="sl-video__frame-wrap">{url ? <iframe key={url} src={url} title={mode === 'sign' ? 'Sign language lesson video' : 'Lesson video'} allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" className="sl-video__frame" /> : <div className="sl-video__placeholder" role="status"><span aria-hidden="true">🎥</span><p>Video not available.</p></div>}</div><p className="sl-video__caption-notice"><span aria-hidden="true">ℹ️</span>Closed captions available — use player controls or <kbd>C</kbd> to toggle.</p></div>;
}

// ══════════════════════════════════════════════════════════════
// ACCESSIBILITY TOOLBAR (unchanged)
// ══════════════════════════════════════════════════════════════
function A11yToolbar({ highContrast, setHighContrast, largeText, setLargeText }) {
  return <div className="sl-a11y-bar" role="toolbar" aria-label="Accessibility options"><span className="sl-a11y-bar__label" aria-hidden="true">Accessibility</span><button className="sl-a11y-btn" aria-pressed={highContrast} onClick={() => setHighContrast(v => !v)}><span aria-hidden="true">◑</span> High Contrast</button><button className="sl-a11y-btn" aria-pressed={largeText} onClick={() => setLargeText(v => !v)}><span aria-hidden="true">A+</span> Large Text</button></div>;
}

const SUBJECT_META = { Biology: { emoji: '🧬', label: 'Biology' }, Tamil: { emoji: '📜', label: 'Tamil' } };
const API  = 'https://thirannexus.onrender.com/api/education2';
const WAPI = 'https://thirannexus.onrender.com/api/word';
const TABS = [{ id: 'text', label: 'Text', icon: '📖' }, { id: 'video', label: 'Video', icon: '🎥' }, { id: 'quiz', label: 'Quiz', icon: '🧩' }];

// ══════════════════════════════════════════════════════════════
// MAIN COMPONENT (unchanged)
// ══════════════════════════════════════════════════════════════
export default function Education2() {
  useGlobalStyle(STYLES);
  const [highContrast, setHighContrast] = useState(false); const [largeText, setLargeText] = useState(false);
  const [selectedClass, setSelectedClass] = useState(''); const [classError, setClassError] = useState(''); const [fetched, setFetched] = useState(false); const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState([]); const [activeSubject, setActiveSubject] = useState(null); const [units, setUnits] = useState([]); const [activeUnit, setActiveUnit] = useState(null); const [unitData, setUnitData] = useState(null); const [unitLoading, setUnitLoading] = useState(false); const [activeTab, setActiveTab] = useState('text'); const [fetchError, setFetchError] = useState('');
  const [popupData, setPopupData] = useState(null); const [popupLoading, setPopupLoading] = useState(false);
  const subjectsRef = useRef(null); const contentRef = useRef(null); const statusRef = useRef(null);
  function announce(msg) { if (statusRef.current) statusRef.current.textContent = msg; }

  const handleWordClick = useCallback(async (word) => {
    if (!word || popupLoading) return;
    if (!/^[a-zA-Z]+$/.test(word) || word.length < 3) return;
    setPopupLoading(true); announce(`Looking up: ${word}`);
    try {
      const { data } = await axios.get(`${WAPI}/${encodeURIComponent(word.toLowerCase())}?subject=${encodeURIComponent(activeSubject || 'general')}`);
      setPopupData(data);
    } catch (e) { console.error('Word lookup failed:', e); announce('Could not load word explanation.'); }
    finally { setPopupLoading(false); }
  }, [popupLoading, activeSubject]);

  async function handleFetch() {
    if (!selectedClass) { setClassError('Please select a class before fetching contents.'); return; }
    setClassError(''); setLoading(true); setFetchError('');
    try {
      const { data } = await axios.get(`${API}/subjects`, { params: { className: selectedClass } });
      setSubjects(data.subjects || []); setFetched(true); setActiveSubject(null); setUnits([]); setActiveUnit(null); setUnitData(null);
      announce(`${data.subjects?.length || 0} subjects loaded.`);
      setTimeout(() => subjectsRef.current?.focus(), 150);
    } catch { setFetchError('Failed to load subjects. Check your connection and try again.'); announce('Error loading subjects.'); }
    finally { setLoading(false); }
  }

  async function handleSubject(subj) {
    setActiveSubject(subj); setActiveUnit(null); setUnitData(null);
    try {
      const { data } = await axios.get(`${API}/units`, { params: { className: selectedClass, subjectName: subj } });
      setUnits(data.units || []); announce(`${data.units?.length || 0} units loaded for ${subj}.`);
    } catch { setFetchError('Failed to load units.'); }
  }

  async function handleUnit(unit) {
    setActiveUnit(unit._id); setActiveTab('text'); setUnitLoading(true); setFetchError('');
    try {
      const { data } = await axios.get(`${API}/content/${unit._id}`);
      setUnitData(data); announce(`Unit ${data.unitNumber}: ${data.unitTitle} loaded.`);
      setTimeout(() => contentRef.current?.focus(), 150);
    } catch { setFetchError('Failed to load unit content. Please try again.'); }
    finally { setUnitLoading(false); }
  }

  const meta = activeSubject ? (SUBJECT_META[activeSubject] || { emoji: '📘', label: activeSubject }) : null;
  const pageClasses = ['sl-page', highContrast ? 'high-contrast' : '', largeText ? 'large-text' : ''].filter(Boolean).join(' ');

  return (
    <div className={pageClasses}>
      <a href="#sl-main" className="sl-skip-link">Skip to main content</a>
      <div ref={statusRef} role="status" aria-live="polite" aria-atomic="true" style={srOnly} />
      {popupLoading && <div className="sl-word-toast" role="status" aria-live="polite"><div className="sl-spinner" aria-hidden="true" />Looking up word…</div>}
      {popupData && <ExplanationPopup data={popupData} onDismiss={() => setPopupData(null)} />}

      <header className="sl-header" role="banner">
        <div className="sl-header__brand"><h1 className="sl-header__logo">SmartLearn</h1><p className="sl-header__tagline">Inclusive · Intelligent · Impactful</p></div>
        <div className="sl-form-group" role="search" aria-label="Class selection">
          <div className="sl-field">
            <label className="sl-label" htmlFor="classSelect">Select Class</label>
            <select id="classSelect" className="sl-select" value={selectedClass} aria-describedby={classError ? 'class-error' : undefined} aria-invalid={!!classError} onChange={e => { setSelectedClass(e.target.value); setFetched(false); setSubjects([]); setClassError(''); }}>
              <option value="">— Choose a class —</option><option value="Class 12">Class 12</option>
            </select>
            {classError && <span id="class-error" role="alert" style={{ color: 'var(--sl-error)', fontSize: '0.82rem', marginTop: '0.25rem' }}>{classError}</span>}
          </div>
          <button className="sl-btn sl-btn--primary" onClick={handleFetch} disabled={loading} aria-busy={loading}>{loading ? 'Loading…' : 'Fetch Contents'}</button>
        </div>
      </header>

      <A11yToolbar highContrast={highContrast} setHighContrast={setHighContrast} largeText={largeText} setLargeText={setLargeText} />

      <main id="sl-main" className="sl-main" tabIndex={-1}>
        {fetchError && <div className="sl-error" role="alert" aria-live="assertive"><strong>Error:</strong> {fetchError}</div>}

        {fetched && subjects.length > 0 && (
          <section className="sl-subjects" aria-label="Available subjects" tabIndex={-1} ref={subjectsRef}>
            <h2 className="sl-section-title">Choose a Subject</h2>
            <div className="sl-subjects__grid" role="list">
              {subjects.map(subj => { const m = SUBJECT_META[subj] || { emoji: '📘', label: subj }; return <button key={subj} className="sl-subject-card" role="listitem" aria-current={activeSubject === subj ? 'true' : undefined} onClick={() => handleSubject(subj)}><span aria-hidden="true">{m.emoji}</span><span>{m.label}</span></button>; })}
            </div>
          </section>
        )}

        {activeSubject && units.length > 0 && (
          <section className="sl-units" aria-label={`Units in ${activeSubject}`}>
            <h2 className="sl-section-title"><span aria-hidden="true">{meta.emoji} </span>{activeSubject} — Units</h2>
            <div className="sl-units__list" role="list">
              {units.map(unit => <button key={unit._id} className="sl-unit-row" role="listitem" aria-current={activeUnit === unit._id ? 'true' : undefined} onClick={() => handleUnit(unit)}><span className="sl-unit-row__num">Unit {unit.unitNumber}</span><span className="sl-unit-row__title">{unit.unitTitle}</span><span className="sl-unit-row__arrow" aria-hidden="true">›</span></button>)}
            </div>
          </section>
        )}

        {unitLoading && <div className="sl-loader" role="status" aria-live="polite" aria-label="Loading unit content"><div className="sl-spinner" aria-hidden="true" /><p>Loading unit content…</p></div>}

        {unitData && !unitLoading && (
          <section className="sl-content" aria-label={`Unit ${unitData.unitNumber}: ${unitData.unitTitle}`}>
            <div className="sl-content__header">
              <h2 className="sl-content__title" tabIndex={-1} ref={contentRef}><span aria-hidden="true">{meta.emoji} </span>Unit {unitData.unitNumber}: {unitData.unitTitle}</h2>
              <div className="sl-tabs" role="tablist" aria-label="Content format">
                {TABS.map((tab, i) => <button key={tab.id} id={`tab-${tab.id}`} className="sl-tab" role="tab" aria-selected={activeTab === tab.id} aria-controls={`panel-${tab.id}`} onClick={() => setActiveTab(tab.id)} onKeyDown={e => { if (e.key === 'ArrowRight') { const next = TABS[(i+1)%TABS.length].id; setActiveTab(next); document.getElementById(`tab-${next}`)?.focus(); } if (e.key === 'ArrowLeft') { const prev = TABS[(i-1+TABS.length)%TABS.length].id; setActiveTab(prev); document.getElementById(`tab-${prev}`)?.focus(); } }} tabIndex={activeTab === tab.id ? 0 : -1}><span aria-hidden="true">{tab.icon} </span>{tab.label}</button>)}
              </div>
            </div>
            <div className="sl-content__body">
              {TABS.map(tab => (
                <div key={tab.id} id={`panel-${tab.id}`} role="tabpanel" aria-labelledby={`tab-${tab.id}`} hidden={activeTab !== tab.id} tabIndex={0}>
                  {activeTab === tab.id && (
                    <>
                      {tab.id === 'text' && <div><p className="sl-click-hint" aria-live="polite"><span aria-hidden="true">💡</span>Click any word to explore its meaning + see the ISL sign</p><TTSReader text={unitData?.content?.text ? unitData.content.text.replace(/<[^>]+>/g, '') : 'No content available'} /><WordClickableText html={unitData.content?.text} onWordClick={handleWordClick} /></div>}
                      {tab.id === 'video' && <VideoTab videoUrl={unitData.content?.videoUrl} signUrl={unitData.content?.signLanguageVideoUrl} />}
                      {tab.id === 'quiz'  && <QuizTab  quiz={unitData.content?.quiz || []} />}
                    </>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {!fetched && !loading && (
          <div className="sl-welcome" role="region" aria-label="Welcome">
            <span className="sl-welcome__icon" aria-hidden="true">🎓</span>
            <h2>Welcome to SmartLearn!</h2>
            <p>Select a class above and click <strong>Fetch Contents</strong> to begin your learning journey.</p>
            <div className="sl-welcome__pills" aria-label="Features">
              <span className="sl-welcome__pill">🤟 ISL Sign Videos</span>
              <span className="sl-welcome__pill">📖 Text Explanations</span>
              <span className="sl-welcome__pill">🧩 Interactive Quizzes</span>
              <span className="sl-welcome__pill">💡 Tap-to-Learn Words</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}