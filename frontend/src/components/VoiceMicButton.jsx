// frontend/src/components/VoiceMicButton.jsx
import React, { useEffect, useRef } from 'react';

/**
 * VoiceMicButton
 * 
 * A microphone button that shows:
 * - Idle state: grey mic icon
 * - Listening state: red pulsing mic with animated ring
 * 
 * Fully accessible: keyboard, screen reader, touch.
 */
export default function VoiceMicButton({ isListening, onClick, label }) {
  const btnRef = useRef(null);

  return (
    <>
      <style>{`
        @keyframes voicePulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.5), 0 0 0 0 rgba(239, 68, 68, 0.3); }
          50% { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0.2), 0 0 0 12px rgba(239, 68, 68, 0.05); }
        }
        @keyframes voiceBounce {
          0%, 100% { transform: translateY(-50%) scale(1); }
          50% { transform: translateY(-50%) scale(1.15); }
        }
        .voice-mic-btn {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          background: transparent;
          border: none;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 15px;
          transition: all 0.25s ease;
          z-index: 10;
          outline: none;
          flex-shrink: 0;
        }
        .voice-mic-btn:focus-visible {
          outline: 2px solid #7c3aed;
          outline-offset: 2px;
        }
        .voice-mic-btn.idle {
          color: #9ca3af;
        }
        .voice-mic-btn.idle:hover {
          color: #7c3aed;
          background: rgba(124, 58, 237, 0.08);
        }
        .voice-mic-btn.listening {
          color: #ef4444;
          background: rgba(239, 68, 68, 0.12);
          animation: voicePulse 1.2s ease-in-out infinite, voiceBounce 1.2s ease-in-out infinite;
        }
        .voice-mic-btn.listening:hover {
          background: rgba(239, 68, 68, 0.2);
        }
        /* Screen reader live region */
        .voice-sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0,0,0,0);
          border: 0;
        }
      `}</style>
      <button
        ref={btnRef}
        type="button"
        className={`voice-mic-btn ${isListening ? 'listening' : 'idle'}`}
        onClick={onClick}
        title={isListening ? 'Stop listening (click to stop)' : 'Start voice input (click to speak)'}
        aria-label={label ? `${label}${isListening ? ', currently listening, click to stop' : ', click to start'}` : (isListening ? 'Stop voice input' : 'Start voice input')}
        aria-pressed={isListening}
        aria-live="polite"
      >
        <i className={`fa-solid ${isListening ? 'fa-microphone-slash' : 'fa-microphone'}`} aria-hidden="true" />
        {/* Screen-reader status */}
        <span className="voice-sr-only" aria-live="assertive">
          {isListening ? 'Listening. Speak now.' : ''}
        </span>
      </button>
    </>
  );
}