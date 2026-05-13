// src/hooks/useListNavigation.js

import { useEffect, useRef, useState } from 'react';

/**
 * Hook for keyboard navigation within lists or menus
 * Provides arrow key navigation for a list of items
 * @param {Array} items - Array of items to navigate
 * @param {Function} onSelect - Callback when an item is selected (Enter/Space)
 * @param {Object} options - Additional options
 * @param {boolean} options.loop - Whether to loop navigation (default: true)
 * @param {boolean} options.autoFocus - Whether to auto-focus first item (default: false)
 * @param {string} options.orientation - 'vertical' or 'horizontal' (default: 'vertical')
 */
export function useListNavigation(items, onSelect, options = {}) {
  const {
    loop = true,
    autoFocus = false,
    orientation = 'vertical'
  } = options;

  const [currentIndex, setCurrentIndex] = useState(-1);
  const listRef = useRef(null);
  const itemRefs = useRef([]);

  // Initialize refs array
  useEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, items.length);
  }, [items]);

  // Auto-focus first item if enabled
  useEffect(() => {
    if (autoFocus && items.length > 0 && itemRefs.current[0]) {
      itemRefs.current[0].focus();
      setCurrentIndex(0);
    }
  }, [autoFocus, items]);

  // Keyboard event handler
  const handleKeyDown = (e) => {
    if (!items.length) return;

    let newIndex = currentIndex;

    switch (e.key) {
      case 'ArrowDown':
        if (orientation === 'vertical') {
          e.preventDefault();
          newIndex = loop ? (currentIndex + 1) % items.length : Math.min(currentIndex + 1, items.length - 1);
        }
        break;
      case 'ArrowUp':
        if (orientation === 'vertical') {
          e.preventDefault();
          newIndex = loop ? (currentIndex - 1 + items.length) % items.length : Math.max(currentIndex - 1, 0);
        }
        break;
      case 'ArrowRight':
        if (orientation === 'horizontal') {
          e.preventDefault();
          newIndex = loop ? (currentIndex + 1) % items.length : Math.min(currentIndex + 1, items.length - 1);
        }
        break;
      case 'ArrowLeft':
        if (orientation === 'horizontal') {
          e.preventDefault();
          newIndex = loop ? (currentIndex - 1 + items.length) % items.length : Math.max(currentIndex - 1, 0);
        }
        break;
      case 'Home':
        e.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        newIndex = items.length - 1;
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (currentIndex >= 0 && onSelect) {
          onSelect(items[currentIndex], currentIndex);
        }
        return;
      default:
        return; // Don't change index for other keys
    }

    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
      if (itemRefs.current[newIndex]) {
        itemRefs.current[newIndex].focus();
        // Announce for screen readers
        announceItem(items[newIndex]);
      }
    }
  };

  // Focus handler
  const handleFocus = (index) => {
    setCurrentIndex(index);
  };

  // Get props for the list container
  const getListProps = () => ({
    ref: listRef,
    onKeyDown: handleKeyDown,
    role: orientation === 'horizontal' ? 'menubar' : 'menu',
    'aria-orientation': orientation
  });

  // Get props for each item
  const getItemProps = (index) => ({
    ref: (el) => itemRefs.current[index] = el,
    onFocus: () => handleFocus(index),
    role: orientation === 'horizontal' ? 'menuitem' : 'menuitem',
    tabIndex: index === 0 ? 0 : -1, // First item focusable, others not
    'aria-selected': currentIndex === index
  });

  // Announce current item for screen readers
  const announceItem = (item) => {
    const message = typeof item === 'string' ? item : item.label || item.name || `Item ${currentIndex + 1}`;
    // Use the global announcer if available
    if (window.keyboardNavigation && window.keyboardNavigation.announce) {
      window.keyboardNavigation.announce(`Navigating to: ${message}`);
    }
  };

  return {
    currentIndex,
    getListProps,
    getItemProps,
    setCurrentIndex
  };
}

export default useListNavigation;