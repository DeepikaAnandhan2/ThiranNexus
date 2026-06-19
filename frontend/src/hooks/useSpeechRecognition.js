// frontend/src/hooks/useSpeechRecognition.js
import { useState, useRef, useCallback, useEffect } from 'react';
import { parseSpokenChunk, buildEchoMessage } from '../utils/speechParser';

// Patch window.speechSynthesis to emit custom events for TTS
if (typeof window !== 'undefined' && window.speechSynthesis && !window.speechSynthesis._patched) {
  window.speechSynthesis._patched = true;
  const originalSpeak = window.speechSynthesis.speak;
  const originalCancel = window.speechSynthesis.cancel;

  window.speechSynthesis.speak = function (utterance) {
    // Dispatch tts-start when speak is called
    window.dispatchEvent(new CustomEvent('tts-start'));

    const originalOnEnd = utterance.onend;
    utterance.onend = function (e) {
      if (originalOnEnd) {
        try { originalOnEnd.call(this, e); } catch (err) { console.error(err); }
      }
      window.dispatchEvent(new CustomEvent('tts-end'));
    };

    const originalOnError = utterance.onerror;
    utterance.onerror = function (e) {
      if (originalOnError) {
        try { originalOnError.call(this, e); } catch (err) { console.error(err); }
      }
      window.dispatchEvent(new CustomEvent('tts-end'));
    };

    originalSpeak.call(window.speechSynthesis, utterance);
  };

  window.speechSynthesis.cancel = function () {
    originalCancel.call(window.speechSynthesis);
    window.dispatchEvent(new CustomEvent('tts-end'));
  };
}

export const useSpeechRecognition = () => {
  const [listeningField, setListeningField] = useState(null);
  const [isSupported] = useState(() =>
    !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  );

  const recognitionRef  = useRef(null);
  const isListeningRef  = useRef(false);
  const sessionRef      = useRef(null);
  const cooldownRef     = useRef(false);
  const retryRef        = useRef(0);
  const echoingRef      = useRef(false); // true while mic is muted for echo
  const buildRecognitionObjRef = useRef(null);
  const wasListeningBeforeTTSRef = useRef(false);

  // ── Web Audio context ────────────────────────────────────────────────────
  const audioCtxRef = useRef(null);
  const getAudioCtx = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  // ── Instant beep — Web Audio, fires in < 5 ms ────────────────────────────
  const beep = useCallback((freq = 880, duration = 70) => {
    try {
      const ctx  = getAudioCtx();
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration / 1000);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration / 1000);
    } catch (_) {}
  }, []);

  // ── TTS that returns a Promise resolving on onend ────────────────────────
  const speakPromise = useCallback((msg, rate = 1.2, pitch = 1.05) => {
    return new Promise((resolve) => {
      if (!window.speechSynthesis) { resolve(); return; }
      window.speechSynthesis.cancel();
      const utt   = new SpeechSynthesisUtterance(msg);
      utt.rate    = rate;
      utt.pitch   = pitch;
      utt.onend   = () => resolve();
      utt.onerror = () => resolve();
      window.speechSynthesis.speak(utt);
    });
  }, []);

  // Fire-and-forget speak for command feedback (cleared, deleted, etc.)
  const speakPrompt = useCallback((msg) => { speakPromise(msg); }, [speakPromise]);

  // ── Hard stop mic (nulls all handlers, aborts recognition) ──────────────
  const hardStop = useCallback(() => {
    isListeningRef.current = false;
    if (recognitionRef.current) {
      recognitionRef.current.onresult = null;
      recognitionRef.current.onerror  = null;
      recognitionRef.current.onend    = null;
      try { recognitionRef.current.abort(); } catch (_) {}
      recognitionRef.current = null;
    }
    retryRef.current = 0;
    sessionRef.current = null;
    setListeningField(null);
  }, []);

  // ── Safe Mic Starter ────────────────────────────────────────────────────
  const startMicIfSafe = useCallback((sess, playBeep = false) => {
    if (!isListeningRef.current) return;
    if (window.speechSynthesis && window.speechSynthesis.speaking) {
      wasListeningBeforeTTSRef.current = true;
      return;
    }
    if (buildRecognitionObjRef.current) {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (_) {}
      }
      const rec = buildRecognitionObjRef.current(sess);
      try {
        rec.start();
        recognitionRef.current = rec;
        retryRef.current = 0;
        if (playBeep) {
          beep(880, 80);
        }
      } catch (e) {
        console.error('Could not start recognition:', e);
        speakPrompt('Could not start voice input. Please try again.');
        hardStop();
      }
    }
  }, [beep, hardStop, speakPrompt]);

  // ── Global TTS Event Subscriptions ──────────────────────────────────────
  useEffect(() => {
    const handleTTSStart = () => {
      // If mic is active, abort it and mark that we were listening
      if (recognitionRef.current) {
        wasListeningBeforeTTSRef.current = true;
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror  = null;
        recognitionRef.current.onend    = null;
        try {
          recognitionRef.current.abort();
        } catch (_) {}
        recognitionRef.current = null;
      }
    };

    const handleTTSEnd = () => {
      // Small timeout to allow the browser's speechSynthesis.speaking state to update
      setTimeout(() => {
        if (wasListeningBeforeTTSRef.current) {
          wasListeningBeforeTTSRef.current = false;
          if (isListeningRef.current && sessionRef.current) {
            startMicIfSafe(sessionRef.current, false);
          }
        }
      }, 100);
    };

    window.addEventListener('tts-start', handleTTSStart);
    window.addEventListener('tts-end', handleTTSEnd);
    return () => {
      window.removeEventListener('tts-start', handleTTSStart);
      window.removeEventListener('tts-end', handleTTSEnd);
    };
  }, [startMicIfSafe]);

  // ── Echo: beep NOW + mute mic + speak letter + unmute mic ───────────────
  // This is the core fix: mic is always OFF when TTS speaks the letter.
  const echoAndResume = useCallback(async (echoMsg, sess) => {
    if (echoingRef.current) return; // don't stack echoes
    echoingRef.current = true;

    // 1. Instant beep — fires before anything else
    beep(880, 70);

    // 2. Silence the mic: detach handlers + abort (but keep isListeningRef=true
    //    so we know to restart after echo)
    if (recognitionRef.current) {
      recognitionRef.current.onresult = null;
      recognitionRef.current.onerror  = null;
      recognitionRef.current.onend    = null;
      try { recognitionRef.current.abort(); } catch (_) {}
      recognitionRef.current = null;
    }

    // 3. Speak the letter and WAIT for it to finish
    await speakPromise(echoMsg, 1.4, 1.1);

    // 4. Restart the mic — echo is done, it's safe now
    echoingRef.current = false;
    startMicIfSafe(sess, false);
  }, [beep, speakPromise, startMicIfSafe]);

  // ── Build a recognition object for a session ────────────────────────────
  // Extracted so both startListening and echoAndResume can call it.
  const buildRecognitionObj = useCallback((sess) => {
    const SR  = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.continuous      = false;
    rec.interimResults  = false;
    rec.lang            = 'en-US';
    rec.maxAlternatives = 1;

    rec.onresult = (event) => {
      if (!isListeningRef.current) return;
      if (echoingRef.current) return; // mic is "muted" — ignore stale results

      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (!event.results[i].isFinal) continue;
        const transcript = event.results[i]?.[0]?.transcript;
        if (!transcript?.trim()) continue;

        retryRef.current = 0;
        const raw = transcript.trim();
        const { char, command } = parseSpokenChunk(raw, sess.fieldType);

        if (command === 'next') {
          hardStop();
          cooldownRef.current = true;
          setTimeout(() => { cooldownRef.current = false; }, 700);
          speakPrompt('Next field');
          setTimeout(() => sess.nextRef?.current?.focus(), 300);
          return;
        }
        if (command === 'clear') {
          sess.setValue('');
          speakPrompt('Cleared');
          continue;
        }
        if (command === 'delete') {
          sess.setValue(sess.getValue().slice(0, -1));
          speakPrompt('Deleted');
          continue;
        }
        if (command === 'submit') {
          hardStop();
          speakPrompt('Submitting');
          if (sess.onSubmit) sess.onSubmit();
          else sess.nextRef?.current?.click();
          return;
        }

        if (char) {
          sess.setValue(sess.getValue() + char);
          const echo = buildEchoMessage(char, sess.fieldType);
          if (echo) {
            // Hand off to echoAndResume — it mutes mic, speaks, restarts
            echoAndResume(echo, sess);
          }
        }
      }
    };

    rec.onerror = (e) => {
      if (e.error === 'no-speech') return;
      if (e.error === 'aborted')   return; // expected during echo mute cycle
      if (e.error === 'network') {
        retryRef.current += 1;
        if (retryRef.current <= 3) return;
        speakPrompt('Network error. Please check connection.');
        hardStop();
        return;
      }
      if (e.error === 'not-allowed') speakPrompt('Microphone access denied.');
      else console.error('Speech error:', e.error);
      hardStop();
    };

    rec.onend = () => {
      // Only auto-restart if we're NOT in an echo cycle
      // (echo cycle manages its own restart)
      if (!isListeningRef.current || !recognitionRef.current) return;
      if (echoingRef.current) return;
      try { recognitionRef.current.start(); } catch (_) {}
    };

    return rec;
  }, [hardStop, speakPrompt, echoAndResume]);

  // Keep ref up to date on each render
  buildRecognitionObjRef.current = buildRecognitionObj;

  // ── stopListening ────────────────────────────────────────────────────────
  const stopListening = useCallback((autoNextRef = null) => {
    hardStop();
    echoingRef.current = false;
    cooldownRef.current = true;
    setTimeout(() => { cooldownRef.current = false; }, 700);
    speakPrompt('Stopped');
    if (autoNextRef?.current) {
      setTimeout(() => { autoNextRef.current?.focus(); }, 400);
    }
  }, [hardStop, speakPrompt]);

  // ── startListening ───────────────────────────────────────────────────────
  const startListening = useCallback(async (
    fieldLabel, fieldType, currentValue, onUpdate, nextRef, onSubmit
  ) => {
    if (cooldownRef.current) return;
    if (!isSupported) {
      await speakPromise('Voice input not supported. Please use Chrome.');
      return;
    }

    hardStop();
    isListeningRef.current = true;
    echoingRef.current = false;
    setListeningField(fieldLabel);

    const sess = {
      fieldLabel, fieldType, onUpdate, nextRef, onSubmit,
      _value: currentValue,
      getValue() { return this._value; },
      setValue(v) { this._value = v; onUpdate(v); },
    };
    sessionRef.current = sess;

    // 1️⃣  Speak prompt, wait for onend — mic never opens during this
    const prompt = fieldType === 'password'
      ? `${fieldLabel}. Spell your password now.`
      : `${fieldLabel}. Say each letter now.`;

    await speakPromise(prompt);

    // 2️⃣  Guard: bail if user cancelled while prompt played
    if (!isListeningRef.current || sessionRef.current !== sess) return;

    // 3️⃣  Start mic — prompt is 100% done
    startMicIfSafe(sess, true);
  }, [hardStop, isSupported, speakPromise, startMicIfSafe]);

  return { listeningField, isSupported, startListening, stopListening };
};