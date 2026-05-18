import React, { createContext, useContext, useState, useEffect } from 'react';

const AccessibilityContext = createContext();

export const AccessibilityProvider = ({ children }) => {
  const [visionProfile, setVisionProfile] = useState(
    localStorage.getItem('vision-profile') || 'standard'
  );

  useEffect(() => {
    // Inject selected profile into document root HTML element node
    if (visionProfile !== 'standard') {
      document.documentElement.setAttribute('data-vision-profile', visionProfile);
    } else {
      document.documentElement.removeAttribute('data-vision-profile');
    }
    localStorage.setItem('vision-profile', visionProfile);
  }, [visionProfile]);

  return (
    <AccessibilityContext.Provider value={{ visionProfile, setVisionProfile }}>
      {children}
      
      {/* Hidden SVG Matrix Filters for color-blind correction rendering updates */}
      <svg style={{ display: 'none' }}>
        <defs>
          <filter id="protanopia-filter">
            <feColorMatrix type="matrix" values="0.567,0.433,0,0,0 0.558,0.442,0,0,0 0,0.242,0.758,0,0 0,0,0,1,0"/>
          </filter>
          <filter id="deuteranopia-filter">
            <feColorMatrix type="matrix" values="0.625,0.375,0,0,0 0.7,0.3,0,0,0 0,0.3,0.7,0,0 0,0,0,1,0"/>
          </filter>
          <filter id="tritanopia-filter">
            <feColorMatrix type="matrix" values="0.95,0.05,0,0,0 0,0.433,0.567,0,0 0,0.475,0.525,0,0 0,0,0,1,0"/>
          </filter>
        </defs>
      </svg>
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => useContext(AccessibilityContext);