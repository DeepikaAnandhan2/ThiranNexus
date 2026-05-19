import React from 'react';

export default function VoiceMicButton({ isListening, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        position: 'absolute',
        right: '10px',
        top: '50%',
        transform: 'translateY(-50%)',
        background: isListening ? '#fee2e2' : 'transparent',
        border: 'none',
        borderRadius: '50%',
        width: '34px',
        height: '34px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        fontSize: '16px',
        color: isListening ? '#ef4444' : '#6b7280',
        boxShadow: isListening ? '0 0 12px rgba(239, 68, 68, 0.5)' : 'none',
        transition: 'all 0.3s ease',
        zIndex: 10
      }}
      title={isListening ? "Stop listening" : "Start listening"}
      aria-label={label || (isListening ? "Stop voice input" : "Start voice input")}
      aria-pressed={isListening}
    >
      <i className={`fa-solid ${isListening ? 'fa-microphone-slash fa-beat-fade' : 'fa-microphone'}`}></i>
    </button>
  );
}
