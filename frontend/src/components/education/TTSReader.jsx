import React, { useState, useCallback, useRef, useEffect } from 'react';
import './TTSReader.css';
import {
  FaPlay,
  FaPause,
  FaStop,
  FaStepForward,
  FaStepBackward,
  FaVolumeUp,
  FaVolumeMute,
  FaCog
} from 'react-icons/fa';

/**
 * Clean HTML and extract speakable sentences without losing headings or trailing words.
 */
function extractSentences(rawContent) {
  if (!rawContent || typeof rawContent !== 'string') return [];

  // 1. Replace block elements with distinct sentence terminators
  let cleaned = rawContent
    .replace(/<br\s*[\/]?>/gi, '. ')
    .replace(/<\/(h[1-6]|p|li|tr|div|blockquote)>/gi, '. ')
    .replace(/<[^>]+>/g, ' '); // Strip any remaining tags

  // 2. Decode standard HTML entities
  cleaned = cleaned
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, ' and ')
    .replace(/&lt;/gi, ' less than ')
    .replace(/&gt;/gi, ' greater than ')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&mdash;/gi, ' — ')
    .replace(/&ndash;/gi, ' – ');

  // 3. Normalize multiple whitespace and dots
  cleaned = cleaned.replace(/\s+/g, ' ').replace(/\.{2,}/g, '.').trim();

  if (!cleaned) return [];

  // 4. Split by sentence delimiters: period, exclamation, question mark, or semicolon
  const rawParts = cleaned.split(/(?<=[.!?])\s+/);
  const result = [];

  rawParts.forEach((part) => {
    const trimmed = part.trim();
    if (!trimmed) return;

    // If an individual chunk is excessively long (over 180 chars), split by comma or clause
    if (trimmed.length > 200) {
      const subParts = trimmed.split(/(?<=[,;])\s+/);
      subParts.forEach((sub) => {
        const subTrim = sub.trim();
        if (subTrim.length > 2) {
          result.push(subTrim);
        }
      });
    } else if (trimmed.length > 1) {
      result.push(trimmed);
    }
  });

  return result.length > 0 ? result : [cleaned];
}

export default function TTSReader({ text, title, language }) {
  const [isSupported, setIsSupported] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [rate, setRate] = useState(0.95);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [sentences, setSentences] = useState([]);

  const isPlayingRef = useRef(false);
  const currentIndexRef = useRef(0);
  const sentencesRef = useRef([]);
  const isCanceledByUserRef = useRef(false);

  // Check speech synthesis support on mount
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setIsSupported(false);
    }
  }, []);

  // Prepare sentences whenever text changes
  useEffect(() => {
    const parsed = extractSentences(text);
    setSentences(parsed);
    sentencesRef.current = parsed;
    currentIndexRef.current = 0;
    setCurrentSentenceIndex(0);

    // Stop ongoing speech if text changes
    if (playing) {
      stopSpeech();
    }
  }, [text]);

  // Load and manage available voices
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const synth = window.speechSynthesis;

    const updateVoices = () => {
      const allVoices = synth.getVoices() || [];
      if (allVoices.length === 0) return;

      setVoices(allVoices);

      // Auto-detect Tamil or preferred English voices
      const isTamilText = /[\u0B80-\u0BFF]/.test(text || '');
      if (isTamilText) {
        const tamilVoice = allVoices.find((v) => v.lang.includes('ta') || v.name.toLowerCase().includes('tamil'));
        if (tamilVoice) {
          setSelectedVoice(tamilVoice);
          return;
        }
      }

      // Try Indian English first, then friendly natural voices
      const indianVoice = allVoices.find((v) => v.lang === 'en-IN' || v.name.toLowerCase().includes('india'));
      const naturalVoice = allVoices.find(
        (v) =>
          v.name.toLowerCase().includes('natural') ||
          v.name.toLowerCase().includes('zira') ||
          v.name.toLowerCase().includes('google uk') ||
          v.name.toLowerCase().includes('samantha')
      );
      const defaultVoice = indianVoice || naturalVoice || allVoices[0];

      setSelectedVoice((prev) => (prev ? prev : defaultVoice));
    };

    updateVoices();
    synth.addEventListener('voiceschanged', updateVoices);

    return () => {
      synth.removeEventListener('voiceschanged', updateVoices);
    };
  }, [text]);

  // Clean unmount helper
  const stopSpeech = useCallback(() => {
    isCanceledByUserRef.current = true;
    isPlayingRef.current = false;
    window._isTTSActive = false;

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      window.dispatchEvent(new CustomEvent('tts-end'));
    }

    setPlaying(false);
    setPaused(false);
  }, []);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, [stopSpeech]);

  // Speak a single sentence by index
  const speakSentence = useCallback(
    (index) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) return;
      const synth = window.speechSynthesis;

      const list = sentencesRef.current;
      if (!list || index >= list.length || index < 0) {
        // Finished all sentences
        stopSpeech();
        setCurrentSentenceIndex(0);
        currentIndexRef.current = 0;
        return;
      }

      currentIndexRef.current = index;
      setCurrentSentenceIndex(index);
      isCanceledByUserRef.current = false;
      isPlayingRef.current = true;
      window._isTTSActive = true;

      // Announce TTS started to VoiceAssistant and other modules
      window.dispatchEvent(new CustomEvent('tts-start'));

      const sentenceText = list[index];
      const utterance = new SpeechSynthesisUtterance(sentenceText);

      // Language detection
      const isTamil = /[\u0B80-\u0BFF]/.test(sentenceText);
      utterance.lang = isTamil ? 'ta-IN' : language || 'en-IN';
      utterance.rate = rate;
      utterance.pitch = 1.0;

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.onstart = () => {
        setPlaying(true);
        setPaused(false);
      };

      utterance.onend = () => {
        if (!isPlayingRef.current || isCanceledByUserRef.current) return;
        const nextIndex = currentIndexRef.current + 1;
        if (nextIndex < sentencesRef.current.length) {
          // Slight natural pause between sentences
          setTimeout(() => {
            if (isPlayingRef.current && !isCanceledByUserRef.current) {
              speakSentence(nextIndex);
            }
          }, 120);
        } else {
          stopSpeech();
          setCurrentSentenceIndex(0);
          currentIndexRef.current = 0;
        }
      };

      utterance.onerror = (e) => {
        // Ignore deliberate cancellations by user
        if (e.error === 'canceled' || e.error === 'interrupted') {
          return;
        }
        console.warn('TTS utterance error:', e.error);
        stopSpeech();
      };

      // Keep utterance in window memory to prevent Chromium garbage collection pause bug
      window._currentTTSUtterance = utterance;

      synth.cancel(); // Clear any lingering speech
      synth.speak(utterance);
    },
    [language, rate, selectedVoice, stopSpeech]
  );

  // Play button handler
  const handlePlay = () => {
    if (!sentences.length) return;

    if (paused) {
      // Resume from saved index
      setPaused(false);
      setPlaying(true);
      speakSentence(currentIndexRef.current);
    } else {
      // Start from beginning or current sentence
      speakSentence(currentIndexRef.current || 0);
    }
  };

  // Pause button handler
  const handlePause = () => {
    if (!playing) return;
    isCanceledByUserRef.current = true;
    isPlayingRef.current = false;
    window._isTTSActive = false;

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      window.dispatchEvent(new CustomEvent('tts-end'));
    }

    setPlaying(false);
    setPaused(true);
  };

  // Stop button handler
  const handleStop = () => {
    stopSpeech();
    currentIndexRef.current = 0;
    setCurrentSentenceIndex(0);
  };

  // Next sentence button
  const handleNext = () => {
    const nextIdx = Math.min(currentIndexRef.current + 1, sentences.length - 1);
    currentIndexRef.current = nextIdx;
    setCurrentSentenceIndex(nextIdx);
    if (playing) {
      speakSentence(nextIdx);
    }
  };

  // Prev sentence button
  const handlePrev = () => {
    const prevIdx = Math.max(currentIndexRef.current - 1, 0);
    currentIndexRef.current = prevIdx;
    setCurrentSentenceIndex(prevIdx);
    if (playing) {
      speakSentence(prevIdx);
    }
  };

  if (!isSupported) {
    return (
      <div className="tts-wrap tts-unsupported" role="note">
        <p className="tts-note">
          <FaVolumeMute aria-hidden="true" /> Audio read-aloud is not supported on this browser.
        </p>
      </div>
    );
  }

  const currentText = sentences[currentSentenceIndex] || sentences[0] || 'Select lesson to listen.';
  const totalCount = sentences.length || 1;
  const progressPercent = Math.round(((currentSentenceIndex + 1) / totalCount) * 100);

  return (
    <div className="tts-wrap" role="region" aria-label="Lesson Audio Read Aloud Controller">
      {/* Top Header Bar */}
      <div className="tts-header">
        <div className="tts-title-group">
          <span className={`tts-audio-icon ${playing ? 'playing' : ''}`} aria-hidden="true">
            <FaVolumeUp />
          </span>
          <div>
            <h4 className="tts-heading">Read Aloud Reader</h4>
            <span className="tts-status">
              {playing ? '🔊 Speaking...' : paused ? '⏸️ Paused' : 'Ready to read'} · Sentence {currentSentenceIndex + 1} of {totalCount}
            </span>
          </div>
        </div>

        {/* Quick controls and settings toggle */}
        <div className="tts-header-actions">
          <button
            type="button"
            className={`tts-icon-btn ${showSettings ? 'active' : ''}`}
            onClick={() => setShowSettings(!showSettings)}
            aria-label="Audio Reader Settings"
            title="Audio settings"
          >
            <FaCog aria-hidden="true" />
            <span className="tts-btn-label">Voices & Speed</span>
          </button>
        </div>
      </div>

      {/* Live Sentence Highlight Display */}
      <div className="tts-preview-box" role="status" aria-live="polite">
        <div className="tts-progress-track" aria-hidden="true">
          <div className="tts-progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>
        <div className="tts-sentence-text">
          <span className="tts-quote-mark">“</span>
          <span className="tts-highlighted-text">{currentText}</span>
          <span className="tts-quote-mark">”</span>
        </div>
      </div>

      {/* Main Playback Control Bar */}
      <div className="tts-controls" role="group" aria-label="Speech playback controls">
        <div className="tts-main-btns">
          <button
            type="button"
            className="tts-btn tts-btn--step"
            onClick={handlePrev}
            disabled={currentSentenceIndex <= 0}
            aria-label="Previous sentence"
            title="Previous sentence"
          >
            <FaStepBackward aria-hidden="true" />
          </button>

          {!playing ? (
            <button
              type="button"
              className="tts-btn tts-btn--play"
              onClick={handlePlay}
              aria-label={paused ? 'Resume Reading' : 'Start Reading Aloud'}
            >
              <FaPlay aria-hidden="true" />
              <span>{paused ? 'Resume' : 'Play'}</span>
            </button>
          ) : (
            <button
              type="button"
              className="tts-btn tts-btn--pause"
              onClick={handlePause}
              aria-label="Pause Reading"
            >
              <FaPause aria-hidden="true" />
              <span>Pause</span>
            </button>
          )}

          <button
            type="button"
            className="tts-btn tts-btn--stop"
            onClick={handleStop}
            disabled={!playing && !paused}
            aria-label="Stop Reading"
          >
            <FaStop aria-hidden="true" />
            <span>Stop</span>
          </button>

          <button
            type="button"
            className="tts-btn tts-btn--step"
            onClick={handleNext}
            disabled={currentSentenceIndex >= totalCount - 1}
            aria-label="Next sentence"
            title="Next sentence"
          >
            <FaStepForward aria-hidden="true" />
          </button>
        </div>

        {/* Speed presets */}
        <div className="tts-speed-group" role="group" aria-label="Playback speed">
          <span className="tts-speed-label" aria-hidden="true">Speed:</span>
          {[0.8, 0.95, 1.1, 1.25].map((s) => (
            <button
              key={s}
              type="button"
              className={`tts-speed-btn ${rate === s ? 'active' : ''}`}
              onClick={() => setRate(s)}
              aria-pressed={rate === s}
              aria-label={`Speed ${s === 0.8 ? 'Slow 0.8x' : s === 0.95 ? 'Normal 1x' : s === 1.1 ? 'Fast 1.1x' : 'Very Fast 1.25x'}`}
            >
              {s === 0.8 ? '0.8x' : s === 0.95 ? '1x' : s === 1.1 ? '1.1x' : '1.25x'}
            </button>
          ))}
        </div>
      </div>

      {/* Expandable Settings Drawer */}
      {showSettings && (
        <div className="tts-drawer" role="region" aria-label="Voice options">
          <div className="tts-drawer-field">
            <label htmlFor="ttsVoiceSelect" className="tts-drawer-label">
              Choose Voice Accent:
            </label>
            <select
              id="ttsVoiceSelect"
              className="tts-voice-dropdown"
              value={selectedVoice?.name || ''}
              onChange={(e) => {
                const found = voices.find((v) => v.name === e.target.value);
                setSelectedVoice(found);
                if (playing) {
                  // Restart current sentence with the newly picked voice
                  speakSentence(currentIndexRef.current);
                }
              }}
            >
              {voices.map((v) => (
                <option key={v.name} value={v.name}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </div>
          <p className="tts-drawer-hint">
            💡 Tip: If studying Tamil lessons, selecting a Tamil language voice (ta-IN) provides optimal pronunciation.
          </p>
        </div>
      )}
    </div>
  );
}