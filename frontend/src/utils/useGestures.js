// ─── React hook wrapping the gesture engine ──────────────────────────────────
import { useEffect, useRef } from 'react'
import { createGestureHandler } from './gestures'

/**
 * useGestures(callbacks, deps)
 *
 * Attaches gesture listeners to the entire document body.
 * callbacks = {
 *   onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown,
 *   onDoubleTap, onLongPress
 * }
 * deps: re-attach when these change (e.g. [phase, screen])
 */
export function useGestures(callbacks, deps = []) {
  const callbacksRef = useRef(callbacks)

  // Keep ref fresh so gesture handler always calls latest callbacks
  useEffect(() => {
    callbacksRef.current = callbacks
  })

  useEffect(() => {
    const proxy = {
      onSwipeLeft:  (...a) => callbacksRef.current.onSwipeLeft?.(...a),
      onSwipeRight: (...a) => callbacksRef.current.onSwipeRight?.(...a),
      onSwipeUp:    (...a) => callbacksRef.current.onSwipeUp?.(...a),
      onSwipeDown:  (...a) => callbacksRef.current.onSwipeDown?.(...a),
      onDoubleTap:  (...a) => callbacksRef.current.onDoubleTap?.(...a),
      onLongPress:  (...a) => callbacksRef.current.onLongPress?.(...a),
    }
    const cleanup = createGestureHandler(document.body, proxy)
    return cleanup
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}