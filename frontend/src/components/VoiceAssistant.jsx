// frontend/src/components/VoiceAssistant.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaMicrophone, FaMicrophoneSlash, FaVolumeUp } from 'react-icons/fa';

export default function VoiceAssistant() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // State to track if assistant is active (listening)
  const [isActive, setIsActive] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Voice Navigation Off');
  const [lastHeard, setLastHeard] = useState('');
  const [showToast, setShowToast] = useState(false);

  // Refs to bypass closure scope issues in event handlers
  const isActiveRef = useRef(false);
  const isSpeakingRef = useRef(false);
  const recognitionRef = useRef(null);

  // Evaluate if the logged-in student has visual impairment
  const isVisuallyImpaired = 
    user?.udid?.toUpperCase().startsWith('VIS') || 
    user?.disabilityType?.toLowerCase().includes('visual') ||
    user?.disabilityType?.toLowerCase().includes('blind');

  // Text-To-Speech implementation
  const speakVoice = useCallback((text) => {
    if (!window.speechSynthesis) return;
    
    // Stop ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.05;
    utterance.lang = 'en-IN'; // Indian accent

    // Notify window that speech has started (to pause listening)
    window.dispatchEvent(new CustomEvent('tts-start'));

    utterance.onend = () => {
      window.dispatchEvent(new CustomEvent('tts-end'));
    };

    utterance.onerror = () => {
      window.dispatchEvent(new CustomEvent('tts-end'));
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  // Read current page content helper
  const readCurrentPage = useCallback(() => {
    // Find heading
    const h1Text = document.querySelector('h1')?.innerText;
    const h2Text = document.querySelector('h2')?.innerText;
    const pageTitle = h1Text || h2Text || document.title || 'Dashboard';
    
    // Gather all visible paragraphs, labels and cards, ignoring navigation bars and sidebars
    const elements = Array.from(document.querySelectorAll('h1, h2, h3, p, label, .tn-metric-card, .level-card, .info-row, td'));
    const texts = [`You are on the ${pageTitle} page.`];

    elements.forEach((el) => {
      // Check if element is visible in the viewport
      if (el.offsetWidth > 0 && el.offsetHeight > 0) {
        // Skip sidebar/navbar content to avoid cluttering reading context
        if (el.closest('.sidebar') || el.closest('.topbar') || el.closest('.gov-navbar')) {
          return;
        }
        
        const text = el.innerText?.trim();
        if (text && text.length > 0 && !texts.includes(text) && text.length < 300) {
          texts.push(text);
        }
      }
    });

    const fullContent = texts.join(' . ');
    setStatusMessage('Reading page content...');
    speakVoice(fullContent);
  }, [speakVoice]);

  // Handler for speech commands matching navigation routes
  const handleCommand = useCallback((rawText) => {
    const text = rawText.toLowerCase().trim();
    setLastHeard(rawText);
    setShowToast(true);
    
    // Hide toast after 4 seconds
    setTimeout(() => {
      setShowToast(false);
    }, 4000);

    // Command patterns mapping
    if (text.includes('dashboard') || text.includes('go home') || text.includes('go to home') || text.includes('home page')) {
      speakVoice('Opening Dashboard');
      setStatusMessage('Opening Dashboard...');
      setTimeout(() => navigate('/dashboard'), 800);
      return;
    }

    if (text.includes('education') || text.includes('smart learn') || text.includes('smartlearn') || text.includes('learn')) {
      speakVoice('Opening Education Section');
      setStatusMessage('Opening Education...');
      setTimeout(() => navigate('/education'), 800);
      return;
    }

    if (text.includes('profile') || text.includes('about me')) {
      speakVoice('Opening Profile');
      setStatusMessage('Opening Profile...');
      setTimeout(() => navigate('/profile'), 800);
      return;
    }

    if (text.includes('settings')) {
      speakVoice('Opening Settings');
      setStatusMessage('Opening Profile Settings...');
      setTimeout(() => navigate('/profile'), 800);
      return;
    }

    if (text.includes('games') || text.includes('play')) {
      speakVoice('Opening Games');
      setStatusMessage('Opening Games...');
      setTimeout(() => navigate('/games'), 800);
      return;
    }

    if (text.includes('scribble') || text.includes('draw')) {
      speakVoice('Opening Scribble');
      setStatusMessage('Opening Scribble...');
      setTimeout(() => navigate('/scribble'), 800);
      return;
    }

    if (text.includes('schemes') || text.includes('scheme') || text.includes('scholarship')) {
      speakVoice('Opening Schemes');
      setStatusMessage('Opening Schemes...');
      setTimeout(() => navigate('/schemes'), 800);
      return;
    }

    if (text.includes('support') || text.includes('feedback') || text.includes('help')) {
      speakVoice('Opening Support');
      setStatusMessage('Opening Support...');
      setTimeout(() => navigate('/feedback'), 800);
      return;
    }

    if (text.includes('go back') || text.includes('navigate back') || text === 'back') {
      speakVoice('Going back');
      setStatusMessage('Navigating back...');
      setTimeout(() => navigate(-1), 800);
      return;
    }

    if (text.includes('read current page') || text.includes('read page') || text.includes('read content') || text.includes('describe')) {
      readCurrentPage();
      return;
    }

    // Default if no commands matched
    console.log('Unrecognized voice command: ', text);
  }, [navigate, speakVoice, readCurrentPage]);

  // Safely start recognition wrapper
  const startMic = useCallback(() => {
    if (!recognitionRef.current) return;
    if (isSpeakingRef.current) return; // Wait until TTS finishes
    try {
      recognitionRef.current.start();
      setStatusMessage('Listening for navigation commands...');
    } catch (e) {
      console.warn('Recognition start skipped or failed:', e.message);
    }
  }, []);

  // Safely stop recognition wrapper
  const stopMic = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch (e) {
      console.warn('Recognition stop skipped or failed:', e.message);
    }
  }, []);

  // Initialize Speech Recognition API
  useEffect(() => {
    if (!isVisuallyImpaired) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech recognition is not supported in this browser.');
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = false;
    rec.lang = 'en-IN'; // Indian English support

    rec.onresult = (event) => {
      const resultIndex = event.resultIndex;
      const transcript = event.results[resultIndex][0].transcript;
      if (transcript) {
        handleCommand(transcript);
      }
    };

    rec.onend = () => {
      // Auto-restart if user wanted to keep assistant active and TTS isn't speaking
      if (isActiveRef.current && !isSpeakingRef.current) {
        startMic();
      }
    };

    rec.onerror = (e) => {
      console.error('Speech recognition error:', e.error);
      if (e.error === 'not-allowed') {
        setIsActive(false);
        isActiveRef.current = false;
        setStatusMessage('Microphone access denied');
        speakVoice('Microphone access denied. Please grant permission.');
      }
    };

    recognitionRef.current = rec;

    // TTS Intercept Events
    const handleTTSStart = () => {
      isSpeakingRef.current = true;
      // Temporarily halt recognition to avoid picking up computer speak audio
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
      }
    };

    const handleTTSEnd = () => {
      isSpeakingRef.current = false;
      // Resume recognition after TTS finishes if the assistant is still enabled
      setTimeout(() => {
        if (isActiveRef.current && !isSpeakingRef.current) {
          startMic();
        }
      }, 200);
    };

    window.addEventListener('tts-start', handleTTSStart);
    window.addEventListener('tts-end', handleTTSEnd);

    // Announce assistant availability once on layout mount
    speakVoice('Voice assistant navigation is active. Click the button at the bottom-right corner to toggle navigation commands.');

    return () => {
      isActiveRef.current = false;
      if (rec) {
        rec.onend = null;
        rec.onerror = null;
        rec.onresult = null;
        try {
          rec.abort();
        } catch (_) {}
      }
      window.removeEventListener('tts-start', handleTTSStart);
      window.removeEventListener('tts-end', handleTTSEnd);
      window.speechSynthesis.cancel();
    };
  }, [isVisuallyImpaired, startMic, handleCommand, speakVoice]);

  // Toggle Assistant click handler
  const handleToggle = () => {
    const nextState = !isActive;
    setIsActive(nextState);
    isActiveRef.current = nextState;

    if (nextState) {
      speakVoice('Voice assistant listening active. Say Go to Dashboard, Go to Education, Open Profile, Read current page or Go back.');
      setStatusMessage('Voice navigation listening active...');
      startMic();
    } else {
      speakVoice('Voice navigation deactivated.');
      setStatusMessage('Voice Navigation Off');
      stopMic();
    }
  };

  // Keyboard navigation support (Space / Enter key to toggle)
  const handleKeyDown = (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleToggle();
    }
  };

  if (!isVisuallyImpaired) return null;

  return (
    <>
      <style>{`
        .voice-assistant-fab-container {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 99999;
          display: flex;
          align-items: center;
          gap: 12px;
          font-family: 'Poppins', sans-serif;
        }

        .voice-assistant-fab {
          width: 58px;
          height: 58px;
          border-radius: 50%;
          background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%);
          border: 2px solid rgba(255, 255, 255, 0.25);
          box-shadow: 0 8px 32px rgba(124, 58, 237, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 22px;
          cursor: pointer;
          position: relative;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          outline: none;
        }

        .voice-assistant-fab:hover {
          transform: scale(1.08) translateY(-2px);
          box-shadow: 0 12px 40px rgba(124, 58, 237, 0.5);
          background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
        }

        .voice-assistant-fab:focus-visible {
          outline: 4px solid #34d399;
          outline-offset: 4px;
        }

        .voice-assistant-fab.listening {
          background: linear-gradient(135deg, #ef4444 0%, #ea580c 100%);
          border-color: rgba(255, 255, 255, 0.4);
          box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
          animation: assistantPulse 1.5s infinite linear;
        }

        .voice-assistant-fab.listening:hover {
          background: linear-gradient(135deg, #f87171 0%, #f97316 100%);
        }

        .voice-assistant-status-tooltip {
          background: rgba(15, 23, 42, 0.85);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          padding: 8px 16px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 500;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
          pointer-events: none;
          max-width: 260px;
          white-space: normal;
          line-height: 1.4;
          opacity: 0;
          transform: translateX(10px);
          transition: all 0.3s ease;
        }

        .voice-assistant-fab-container:hover .voice-assistant-status-tooltip,
        .voice-assistant-fab:focus-visible ~ .voice-assistant-status-tooltip,
        .voice-assistant-fab.listening ~ .voice-assistant-status-tooltip {
          opacity: 1;
          transform: translateX(0);
        }

        /* Continuous Toast for voice command preview */
        .voice-assistant-toast {
          position: fixed;
          bottom: 96px;
          right: 24px;
          z-index: 99998;
          background: rgba(30, 27, 75, 0.95);
          backdrop-filter: blur(12px);
          border: 1.5px solid #7c3aed;
          color: white;
          padding: 12px 20px;
          border-radius: 16px;
          box-shadow: 0 12px 36px rgba(0, 0, 0, 0.3);
          display: flex;
          flex-direction: column;
          gap: 4px;
          max-width: 320px;
          animation: assistantFadeIn 0.3s ease;
        }

        .voice-assistant-toast-title {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #a78bfa;
          font-weight: 700;
        }

        .voice-assistant-toast-text {
          font-size: 14px;
          font-weight: 500;
          color: #e2e8f0;
          font-style: italic;
        }

        @keyframes assistantPulse {
          0% {
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7), 0 8px 32px rgba(239, 68, 68, 0.3);
          }
          70% {
            box-shadow: 0 0 0 15px rgba(239, 68, 68, 0), 0 8px 32px rgba(239, 68, 68, 0.3);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0), 0 8px 32px rgba(239, 68, 68, 0.3);
          }
        }

        @keyframes assistantFadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .voice-sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }
      `}</style>

      {showToast && (
        <div className="voice-assistant-toast" role="status" aria-live="polite">
          <span className="voice-assistant-toast-title">Voice Assistant heard</span>
          <span className="voice-assistant-toast-text">"{lastHeard}"</span>
        </div>
      )}

      <div className="voice-assistant-fab-container">
        <button
          type="button"
          className={`voice-assistant-fab ${isActive ? 'listening' : ''}`}
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          aria-label={isActive ? "Disable Voice Navigation Assistant. Currently listening." : "Enable Voice Navigation Assistant."}
          aria-pressed={isActive}
          title={isActive ? "Mute Voice Assistant" : "Activate Voice Assistant"}
        >
          {isActive ? <FaMicrophoneSlash aria-hidden="true" /> : <FaMicrophone aria-hidden="true" />}
          <span className="voice-sr-only">
            {isActive ? "Voice assistant navigation is active and listening for commands." : "Voice assistant navigation is currently off."}
          </span>
        </button>

        <div className="voice-assistant-status-tooltip" aria-hidden="true">
          {statusMessage}
        </div>
      </div>
    </>
  );
}
