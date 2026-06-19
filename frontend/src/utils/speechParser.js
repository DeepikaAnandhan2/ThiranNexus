// frontend/src/utils/speechParser.js

/**
 * Symbol words → actual characters
 */
const SYMBOL_MAP = {
  'at': '@', 'at sign': '@',
  'dot': '.', 'period': '.', 'full stop': '.',
  'underscore': '_', 'under score': '_',
  'dash': '-', 'hyphen': '-', 'minus': '-',
  'star': '*', 'asterisk': '*',
  'hash': '#', 'hashtag': '#',
  'exclamation': '!', 'exclamation mark': '!',
  'plus': '+',
  'equals': '=', 'equal': '=',
  'percent': '%',
  'dollar': '$', 'dollar sign': '$',
  'space': ' ',
  'zero': '0', 'oh': '0',
  'one': '1',
  'two': '2', 'to': '2', 'too': '2',
  'three': '3',
  'four': '4', 'for': '4',
  'five': '5',
  'six': '6',
  'seven': '7',
  'eight': '8',
  'nine': '9',
};

/**
 * Parse one spoken result into { char, command }.
 *
 * Called once per SpeechRecognition final result.
 * Since continuous=true, interimResults=false, each result
 * is one word/letter the user said before a brief pause.
 */
export const parseSpokenChunk = (raw, fieldType = 'text') => {
  const trimmed = raw.trim();
  const lower = trimmed.toLowerCase();

  // ── Commands ────────────────────────────────────────────────────────────
  if (['next', 'next field', 'skip'].includes(lower))
    return { char: null, command: 'next' };
  if (['clear', 'clear field', 'erase', 'reset'].includes(lower))
    return { char: null, command: 'clear' };
  if (['submit', 'submit form', 'login', 'sign in', 'done', 'finish'].includes(lower))
    return { char: null, command: 'submit' };
  if (['delete', 'backspace', 'remove last'].includes(lower))
    return { char: null, command: 'delete' };

  // ── "capital X" → uppercase ─────────────────────────────────────────────
  const capMatch = lower.match(/^capital\s+([a-z])$/);
  if (capMatch) {
    return { char: capMatch[1].toUpperCase(), command: null };
  }

  // ── Exact symbol word ────────────────────────────────────────────────────
  if (SYMBOL_MAP[lower] !== undefined) {
    return { char: SYMBOL_MAP[lower], command: null };
  }

  // ── Single letter/digit/char ─────────────────────────────────────────────
  if (trimmed.length === 1) {
    let ch = trimmed;
    if (fieldType === 'email') ch = ch.toLowerCase();
    if (fieldType === 'udid') ch = ch.toUpperCase();
    return { char: ch, command: null };
  }

  // ── Multi-word: apply substitutions then strip spaces for structured fields
  let processed = trimmed
    .replace(/\bcapital\s+([a-z])\b/gi, (_, p1) => p1.toUpperCase())
    .replace(/\bat\b/gi, '@')
    .replace(/\bdot\b/gi, '.')
    .replace(/\bunderscore\b/gi, '_')
    .replace(/\bdash\b/gi, '-')
    .replace(/\bhyphen\b/gi, '-')
    .replace(/\bstar\b/gi, '*')
    .replace(/\bspace\b/gi, ' ');

  if (['email', 'password', 'username', 'udid'].includes(fieldType)) {
    processed = processed.replace(/\s+/g, '');
    if (fieldType === 'email') processed = processed.toLowerCase();
    if (fieldType === 'udid') processed = processed.toUpperCase();
  }

  return { char: processed || null, command: null };
};

/**
 * What to speak back after a character is entered.
 * Password fields only say "Got it" — never reveal the character.
 */
export const buildEchoMessage = (char, fieldType) => {
  if (!char) return null;
  if (fieldType === 'password') return 'Got it';

  // Named symbol feedback
  if (char === '@') return 'at';
  if (char === '.') return 'dot';
  if (char === '_') return 'underscore';
  if (char === '-') return 'dash';
  if (char === '*') return 'star';
  if (char === ' ') return 'space';
  if (char === '#') return 'hash';
  if (char === '!') return 'exclamation';

  // Single character: just say it
  if (char.length === 1) {
    if (char >= 'A' && char <= 'Z') {
      return `capital ${char}`;
    }
    return char;
  }

  // Multi-char word: say the whole word
  return char;
};