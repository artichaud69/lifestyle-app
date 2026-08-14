import { useEffect, useRef } from 'react'
import { swipeDecision, nextView, startsInHorizontalScroller } from './swipe.js'

const IGNORED_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT'])

export function useSwipeNavigation(ref, { views, view, onChangeView, enabled = true }) {
  // Kept in a ref so the listeners can stay attached across view changes.
  const latest = useRef({ views, view, onChangeView, enabled })
  latest.current = { views, view, onChangeView, enabled }

  useEffect(() => {
    const root = ref.current
    if (!root) return

    let start = null

    function handleTouchStart(event) {
      if (!latest.current.enabled) return
      if (event.touches.length !== 1) return

      const touch = event.touches[0]
      const target = event.target

      if (IGNORED_TAGS.has(target.tagName)) return
      // A modal owns the screen while it is open.
      if (target.closest?.('.modal-overlay')) return
      if (startsInHorizontalScroller(target, root)) return

      start = { x: touch.clientX, y: touch.clientY }
    }

    function handleTouchEnd(event) {
      if (!start) return
      const touch = event.changedTouches[0]
      const decision = swipeDecision({
        dx: touch.clientX - start.x,
        dy: touch.clientY - start.y,
        startX: start.x,
        viewportWidth: window.innerWidth,
      })
      start = null
      if (!decision) return

      const { views: currentViews, view: currentView, onChangeView } = latest.current
      const target = nextView(currentViews, currentView, decision)
      if (target !== currentView) onChangeView(target)
    }

    function handleTouchCancel() {
      start = null
    }

    root.addEventListener('touchstart', handleTouchStart, { passive: true })
    root.addEventListener('touchend', handleTouchEnd, { passive: true })
    root.addEventListener('touchcancel', handleTouchCancel, { passive: true })

    return () => {
      root.removeEventListener('touchstart', handleTouchStart)
      root.removeEventListener('touchend', handleTouchEnd)
      root.removeEventListener('touchcancel', handleTouchCancel)
    }
  }, [ref])
}
