import { useState, useRef, useEffect, useCallback } from 'react';
import { parseSpeech } from '../utils/speechParser';

export const useSpeechRecognition = () => {
  const [listeningField, setListeningField] = useState(null);
  const recognitionRef = useRef(null);
  const currentHandlerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch(e) {}
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speak = (message) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(message);
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopListening = useCallback((autoNextRef = null) => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch(e) {}
    }
    setListeningField(null);
    speak("Listening stopped");
    
    if (autoNextRef && autoNextRef.current) {
      setTimeout(() => {
        speak("Moved to next field");
        autoNextRef.current.focus();
      }, 800);
    }
  }, []);

  const startListening = useCallback((fieldName, fieldType, currentValue, onUpdate, nextRef, onSubmit) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      speak("Your browser does not support Speech Recognition.");
      alert("Your browser does not support Speech Recognition.");
      return;
    }

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch(e) {}
    }
    
    speak(`${fieldName} field activated. Speak your ${fieldName} now. Say next to move to the next field.`);

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;

    currentHandlerRef.current = { currentValue, onUpdate, fieldType, nextRef, onSubmit };

    recognition.onresult = (event) => {
      const { currentValue, onUpdate, fieldType, nextRef, onSubmit } = currentHandlerRef.current;
      
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          const rawTranscript = event.results[i][0].transcript;
          const { text, command } = parseSpeech(rawTranscript, fieldType);

          if (command === 'next') {
            if (recognitionRef.current) {
              try { recognitionRef.current.stop(); } catch(e) {}
            }
            setListeningField(null);
            if (nextRef && nextRef.current) {
              speak("Moved to next field");
              nextRef.current.focus();
            } else {
               speak("Listening stopped");
            }
            return;
          }

          if (command === 'clear') {
            onUpdate("");
            currentHandlerRef.current.currentValue = "";
            speak("Field cleared");
            continue;
          }
          
          if (command === 'submit') {
            if (recognitionRef.current) {
              try { recognitionRef.current.stop(); } catch(e) {}
            }
            setListeningField(null);
            speak("Submitting form");
            if (onSubmit) {
               onSubmit();
            } else if (nextRef && nextRef.current) {
               nextRef.current.click();
            }
            return;
          }

          if (text) {
            const currentVal = currentHandlerRef.current.currentValue;
            const newText = currentVal + text;
            onUpdate(newText);
            currentHandlerRef.current.currentValue = newText;
            
            // Instant real-time character feedback
            if (fieldType === 'password') {
              speak("character entered");
            } else {
              speak(`${text} entered`);
            }
          }
        }
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      if (event.error === 'not-allowed') {
         speak("Microphone permission denied");
      }
      setListeningField(null);
    };

    recognition.onend = () => {
      setListeningField((prev) => {
         if (prev === fieldName) return null;
         return prev;
      });
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
      setListeningField(fieldName);
    } catch (e) {
      console.error("Failed to start recognition:", e);
    }
  }, [stopListening]);

  return {
    listeningField,
    startListening,
    stopListening
  };
};
