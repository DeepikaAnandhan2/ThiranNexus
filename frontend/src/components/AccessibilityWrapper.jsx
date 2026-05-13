import React, { useEffect } from 'react';

const AccessibilityWrapper = ({ children }) => {
  
  const speak = (text) => {
    // Stop any current speech before starting new speech
    window.speechSynthesis.cancel();
    
    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0; 
    utterance.pitch = 1.0; 
    utterance.lang = 'en-IN'; // Indian English accent for Thirannexus
    
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    const handleMouseOver = (e) => {
      // Find the closest element that has an aria-label, placeholder, or text
      const target = e.target;
      
      // logic: Check aria-label first (best for accessibility), then placeholder, then button text
      const textToSpeak = 
        target.getAttribute('aria-label') || 
        target.placeholder || 
        (target.tagName === 'BUTTON' || target.tagName === 'A' || target.tagName === 'SPAN' ? target.innerText : null);

      if (textToSpeak && textToSpeak.trim().length > 0) {
        speak(textToSpeak);
      }
    };

    window.addEventListener('mouseover', handleMouseOver);
    
    return () => {
      window.removeEventListener('mouseover', handleMouseOver);
      window.speechSynthesis.cancel();
    };
  }, []);

  return <>{children}</>;
};

export default AccessibilityWrapper;