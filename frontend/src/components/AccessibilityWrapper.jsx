import React, { useEffect } from 'react';

const AccessibilityWrapper = ({ children }) => {
  
  const speak = (text) => {
    // If a dedicated TTS reader (like SmartLearn's lesson audio) is actively playing,
    // do NOT interrupt or cancel it with mouse hover.
    if (window._isTTSActive) {
      return;
    }

    if (!window.speechSynthesis) return;

    // Stop any current hover speech before starting new speech
    window.speechSynthesis.cancel();
    
    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0; 
    utterance.pitch = 1.0; 
    utterance.lang = 'en-IN'; // Indian English accent for Thirannexus
    
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    let lastSpokenText = '';
    let debounceTimer = null;

    const handleMouseOver = (e) => {
      // If student is currently listening to lesson TTS, ignore hover speaking
      if (window._isTTSActive) return;

      const target = e.target;
      if (!target) return;

      // Do not trigger hover speech if target is inside the lesson reader or word lookup area
      if (target.closest && target.closest('.tts-wrap, .sl-reader, .sl-text-content, .sl-content, .sl-popup, [data-no-tts="true"]')) {
        return;
      }
      
      // logic: Check aria-label first (best for accessibility), then placeholder, then button text
      const textToSpeak = 
        target.getAttribute('aria-label') || 
        target.placeholder || 
        (target.tagName === 'BUTTON' || target.tagName === 'A' || target.tagName === 'SPAN' ? target.innerText : null);

      if (textToSpeak && textToSpeak.trim().length > 0 && textToSpeak.trim().length < 200) {
        const clean = textToSpeak.trim();
        if (clean === lastSpokenText) return;
        
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          lastSpokenText = clean;
          speak(clean);
        }, 150);
      }
    };

    window.addEventListener('mouseover', handleMouseOver);
    
    return () => {
      window.removeEventListener('mouseover', handleMouseOver);
      clearTimeout(debounceTimer);
      if (!window._isTTSActive && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return <>{children}</>;
};

export default AccessibilityWrapper;