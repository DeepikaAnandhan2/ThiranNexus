// ─── Text-to-Speech ──────────────────────────────────────────────────────────
let currentUtterance = null;

export function speak(text, { rate = 0.9, pitch = 1, volume = 1, onEnd } = {}) {
  return new Promise((resolve) => {
    if (!window.speechSynthesis) {
      console.warn('Speech synthesis not supported');
      resolve();
      return;
    }
    window.speechSynthesis.cancel();

    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = rate;
    utter.pitch = pitch;
    utter.volume = volume;
    utter.lang = 'en-US';

    utter.onend = () => {
      currentUtterance = null;
      if (onEnd) onEnd();
      resolve();
    };
    utter.onerror = () => {
      currentUtterance = null;
      resolve();
    };

    currentUtterance = utter;
    window.speechSynthesis.speak(utter);
  });
}

export function stopSpeaking() {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
    currentUtterance = null;
  }
}

export function isSpeaking() {
  return window.speechSynthesis?.speaking || false;
}

// ─── Speech Recognition ──────────────────────────────────────────────────────
export function createRecognition({
  onResult,
  onEnd,
  onError,
  continuous = false,
  interimResults = false,
} = {}) {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    console.warn('Speech recognition not supported');
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.continuous = continuous;
  recognition.interimResults = interimResults;

  recognition.onresult = (event) => {
    const transcript = Array.from(event.results)
      .map((r) => r[0].transcript)
      .join(' ')
      .trim();
    if (onResult) onResult(transcript);
  };

  recognition.onend = () => {
    if (onEnd) onEnd();
  };

  recognition.onerror = (event) => {
    if (onError) onError(event.error);
  };

  return recognition;
}

// ─── Listen helper (returns promise with transcript) ─────────────────────────
export function listenOnce({ timeout = 8000 } = {}) {
  return new Promise((resolve, reject) => {
    const rec = createRecognition({
      onResult: (text) => {
        clearTimeout(timer);
        rec.stop();
        resolve(text);
      },
      onEnd: () => {
        clearTimeout(timer);
        resolve('');
      },
      onError: (err) => {
        clearTimeout(timer);
        reject(new Error(err));
      },
    });

    if (!rec) {
      reject(new Error('Speech recognition not available'));
      return;
    }

    rec.start();
    const timer = setTimeout(() => {
      rec.stop();
      resolve('');
    }, timeout);
  });
}

// ─── Announce helper (speak + listen) ────────────────────────────────────────
export async function announceAndListen(text, opts = {}) {
  await speak(text, opts);
  return listenOnce(opts);
}