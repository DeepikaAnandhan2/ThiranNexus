// ─── Gesture Engine for ThiranNexus ──────────────────────────────────────────
// Supports: swipe left/right, swipe up/down, double tap, long press
// Every gesture fires a voice announcement via speak()

import { speak } from './speech'

const SWIPE_THRESHOLD   = 60   // px minimum swipe distance
const SWIPE_MAX_DURATION = 500 // ms max time for a swipe
const LONG_PRESS_DELAY  = 600  // ms hold for long press
const DOUBLE_TAP_GAP    = 300  // ms between taps for double tap

export function createGestureHandler(element, callbacks = {}) {
  // callbacks:
  //   onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown
  //   onDoubleTap, onLongPress

  let touchStartX    = 0
  let touchStartY    = 0
  let touchStartTime = 0
  let lastTapTime    = 0
  let longPressTimer = null
  let isSwiping      = false

  function onTouchStart(e) {
    const t        = e.touches[0]
    touchStartX    = t.clientX
    touchStartY    = t.clientY
    touchStartTime = Date.now()
    isSwiping      = false

    // Start long press timer
    longPressTimer = setTimeout(async () => {
      isSwiping = true // prevent tap from firing after long press
      await speak('Long press detected. Help mode.')
      if (callbacks.onLongPress) callbacks.onLongPress()
    }, LONG_PRESS_DELAY)
  }

  function onTouchMove(e) {
    const t    = e.touches[0]
    const dx   = Math.abs(t.clientX - touchStartX)
    const dy   = Math.abs(t.clientY - touchStartY)
    if (dx > 10 || dy > 10) {
      clearTimeout(longPressTimer) // cancel long press if moving
      isSwiping = true
    }
  }

  async function onTouchEnd(e) {
    clearTimeout(longPressTimer)
    const t          = e.changedTouches[0]
    const dx         = t.clientX - touchStartX
    const dy         = t.clientY - touchStartY
    const absDx      = Math.abs(dx)
    const absDy      = Math.abs(dy)
    const duration   = Date.now() - touchStartTime

    // ── Swipe detection ──────────────────────────────────────
    if (duration < SWIPE_MAX_DURATION) {
      if (absDx > SWIPE_THRESHOLD && absDx > absDy * 1.5) {
        if (dx < 0) {
          await speak('Swiped left.')
          if (callbacks.onSwipeLeft) callbacks.onSwipeLeft()
        } else {
          await speak('Swiped right.')
          if (callbacks.onSwipeRight) callbacks.onSwipeRight()
        }
        return
      }
      if (absDy > SWIPE_THRESHOLD && absDy > absDx * 1.5) {
        if (dy < 0) {
          await speak('Swiped up.')
          if (callbacks.onSwipeUp) callbacks.onSwipeUp()
        } else {
          await speak('Swiped down.')
          if (callbacks.onSwipeDown) callbacks.onSwipeDown()
        }
        return
      }
    }

    // ── Double tap detection ─────────────────────────────────
    if (!isSwiping && absDx < 15 && absDy < 15) {
      const now = Date.now()
      if (now - lastTapTime < DOUBLE_TAP_GAP) {
        lastTapTime = 0
        await speak('Double tap detected.')
        if (callbacks.onDoubleTap) callbacks.onDoubleTap(e)
      } else {
        lastTapTime = now
      }
    }
  }

  element.addEventListener('touchstart', onTouchStart, { passive: true })
  element.addEventListener('touchmove',  onTouchMove,  { passive: true })
  element.addEventListener('touchend',   onTouchEnd,   { passive: true })

  // Cleanup function
  return () => {
    clearTimeout(longPressTimer)
    element.removeEventListener('touchstart', onTouchStart)
    element.removeEventListener('touchmove',  onTouchMove)
    element.removeEventListener('touchend',   onTouchEnd)
  }
}