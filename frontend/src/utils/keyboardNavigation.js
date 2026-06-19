// src/utils/keyboardNavigation.js

/**
 * Keyboard Navigation Utility for WCAG Compliance
 * Provides enhanced keyboard navigation for visually and hearing impaired users
 * Includes focus management, keyboard shortcuts, and navigation aids
 */

class KeyboardNavigation {
  constructor() {
    this.focusableElements = [];
    this.currentFocusIndex = -1;
    this.shortcuts = new Map();
    this.isNavigationMode = false;
  }

  /**
   * Initialize keyboard navigation for the entire app
   */
  init() {
    this.collectFocusableElements();
    this.setupEventListeners();
    this.setupShortcuts();
    console.log('Keyboard navigation initialized');
  }

  /**
   * Collect all focusable elements in the app
   */
  collectFocusableElements() {
    const selectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[role="button"]',
      '[role="link"]',
      '[role="menuitem"]',
      '[role="tab"]'
    ];

    this.focusableElements = Array.from(
      document.querySelectorAll(selectors.join(', '))
    ).filter(el => {
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0; // visible elements
    });
  }

  /**
   * Setup global keyboard event listeners
   */
  setupEventListeners() {
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    document.addEventListener('focusin', this.handleFocusIn.bind(this));
  }

  /**
   * Handle keyboard events
   */
  handleKeyDown(e) {
    // Handle shortcuts
    if (this.handleShortcut(e)) return;

    // Handle navigation mode
    if (e.key === 'F2' || e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      this.toggleNavigationMode();
      return;
    }

    if (this.isNavigationMode) {
      this.handleNavigationKeys(e);
    }

    // Ensure proper focus management
    this.ensureFocusVisibility(e.target);
  }

  /**
   * Handle keyboard shortcuts
   */

  /**
   * Handle keyboard shortcuts
   */
  handleShortcut(e) {
    // 🛡️ Guard Clause: Ensure e.key exists and is a valid string
    if (!e || typeof e.key !== 'string') return false;

    const key = e.key.toLowerCase();
    const ctrl = e.ctrlKey;
    const alt = e.altKey;
    const shift = e.shiftKey;

    // Common shortcuts
    if (ctrl && key === 'h') {
      e.preventDefault();
      this.navigateToSection('home');
      return true;
    }
    if (ctrl && key === 'd') {
      e.preventDefault();
      this.navigateToSection('dashboard');
      return true;
    }
    if (ctrl && key === 'e') {
      e.preventDefault();
      this.navigateToSection('education');
      return true;
    }
    if (ctrl && key === 'g') {
      e.preventDefault();
      this.navigateToSection('games');
      return true;
    }
    if (ctrl && key === 'f') {
      e.preventDefault();
      this.navigateToSection('feedback');
      return true;
    }

    return false;
  }

  /**
   * Toggle navigation mode for enhanced navigation
   */
  toggleNavigationMode() {
    this.isNavigationMode = !this.isNavigationMode;
    if (this.isNavigationMode) {
      this.announce('Navigation mode enabled. Use arrow keys to navigate.');
      this.collectFocusableElements();
      this.currentFocusIndex = 0;
      this.focusElement(this.focusableElements[0]);
    } else {
      this.announce('Navigation mode disabled.');
    }
  }

  /**
   * Handle navigation keys in navigation mode
   */
  handleNavigationKeys(e) {
    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        e.preventDefault();
        this.moveFocus(1);
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        e.preventDefault();
        this.moveFocus(-1);
        break;
      case 'Home':
        e.preventDefault();
        this.currentFocusIndex = 0;
        this.focusElement(this.focusableElements[0]);
        break;
      case 'End':
        e.preventDefault();
        this.currentFocusIndex = this.focusableElements.length - 1;
        this.focusElement(this.focusableElements[this.currentFocusIndex]);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        this.activateCurrentElement();
        break;
      case 'Escape':
        this.toggleNavigationMode();
        break;
    }
  }

  /**
   * Move focus to next/previous element
   */
  moveFocus(direction) {
    if (this.focusableElements.length === 0) return;

    this.currentFocusIndex += direction;
    if (this.currentFocusIndex < 0) {
      this.currentFocusIndex = this.focusableElements.length - 1;
    } else if (this.currentFocusIndex >= this.focusableElements.length) {
      this.currentFocusIndex = 0;
    }

    this.focusElement(this.focusableElements[this.currentFocusIndex]);
  }

  /**
   * Focus an element and announce it
   */
  focusElement(element) {
    if (element) {
      element.focus();
      this.announceElement(element);
    }
  }

  /**
   * Activate the current focused element
   */
  activateCurrentElement() {
    const element = this.focusableElements[this.currentFocusIndex];
    if (element) {
      if (element.tagName === 'BUTTON' || element.type === 'submit') {
        element.click();
      } else if (element.tagName === 'A') {
        element.click();
      } else if (element.type === 'checkbox' || element.type === 'radio') {
        element.click();
      } else {
        element.click(); // generic activation
      }
    }
  }

  /**
   * Navigate to a specific section of the app
   */
  navigateToSection(section) {
    // This would need to be customized based on your app's routing
    const sectionMap = {
      home: '/',
      dashboard: '/dashboard',
      education: '/education',
      games: '/games',
      feedback: '/feedback'
    };

    const path = sectionMap[section];
    if (path) {
      // Assuming you have a router, e.g., React Router
      window.location.href = path; // or use router.push
      this.announce(`Navigated to ${section}`);
    }
  }

  /**
   * Handle focus in events
   */
  handleFocusIn(e) {
    // Update current focus index
    const index = this.focusableElements.indexOf(e.target);
    if (index !== -1) {
      this.currentFocusIndex = index;
    }
  }

  /**
   * Ensure focused element is visible
   */
  ensureFocusVisibility(element) {
    if (element && element.scrollIntoView) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  /**
   * Announce element for screen readers
   */
  announceElement(element) {
    let label = '';
    if (element.ariaLabel) {
      label = element.ariaLabel;
    } else if (element.textContent) {
      label = element.textContent.trim();
    } else if (element.placeholder) {
      label = element.placeholder;
    } else {
      label = element.tagName.toLowerCase();
    }

    this.announce(`Focused: ${label}`);
  }

  /**
   * Announce message for screen readers
   */
  announce(message) {
    // Create a live region for announcements
    let liveRegion = document.getElementById('accessibility-announcements');
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.id = 'accessibility-announcements';
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.style.position = 'absolute';
      liveRegion.style.left = '-10000px';
      liveRegion.style.width = '1px';
      liveRegion.style.height = '1px';
      liveRegion.style.overflow = 'hidden';
      document.body.appendChild(liveRegion);
    }
    liveRegion.textContent = message;
  }

  /**
   * Setup keyboard shortcuts
   */
  setupShortcuts() {
    // Additional shortcuts can be added here
    this.shortcuts.set('?', () => this.showHelp());
  }

  /**
   * Show help for keyboard navigation
   */
  showHelp() {
    const help = `
Keyboard Navigation Help:
- Ctrl+H: Go to Home
- Ctrl+D: Go to Dashboard
- Ctrl+E: Go to Education
- Ctrl+G: Go to Games
- Ctrl+F: Go to Feedback
- F2 or Ctrl+Enter: Toggle navigation mode
- In navigation mode: Arrow keys to navigate, Enter/Space to activate, Escape to exit
- ?: Show this help
    `;
    alert(help); // In a real app, use a modal
  }

  /**
   * Cleanup event listeners
   */
  destroy() {
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('focusin', this.handleFocusIn);
  }
}

// Export singleton instance
const keyboardNav = new KeyboardNavigation();

export default keyboardNav;

// Export individual functions if needed
export { KeyboardNavigation };