import { useCallback, useEffect, useRef, useState } from 'react'
import {
  SWIPE_EDGE_GUARD,
  startsInHorizontalScroller,
  lockDirection,
  clampDragOffset,
  shouldCommitDrag,
  nextView,
} from './swipe.js'

const IGNORED_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT'])
const SETTLE_MS = 260
const EASING = 'cubic-bezier(0.22, 1, 0.36, 1)'

// Drives a finger-tracked slide between adjacent tabs: while a finger is
// down, the current page follows it 1:1 and the neighbour being revealed
// tracks alongside, like pulling a card aside to see what is underneath.
// Only on release does it either finish into a real navigation or spring
// back - nothing here plays a canned animation.
export function usePageDrag({ views, view, onCommit }) {
  const rootRef = useRef(null)
  const currentContentRef = useRef(null)
  const previewContentRef = useRef(null)
  // The neighbouring view being revealed, or null. Carries its direction too,
  // so its very first render can already place it off-screen on the right
  // side - otherwise it would mount at rest (fully on screen, since that is
  // this element's un-transformed position) and only jump out of the way once
  // the *next* touchmove got a chance to position it imperatively, which
  // showed up as a one-frame flash of the incoming page.
  const [preview, setPreview] = useState(null)

  const gestureRef = useRef(null)
  const pendingRef = useRef(null)
  const latest = useRef({ views, view, onCommit })
  latest.current = { views, view, onCommit }

  const position = useCallback((offset, direction) => {
    if (currentContentRef.current) currentContentRef.current.style.transform = `translateX(${offset}px)`
    if (previewContentRef.current) {
      const base = direction === 'next' ? window.innerWidth : -window.innerWidth
      previewContentRef.current.style.transform = `translateX(${base + offset}px)`
    }
  }, [])

  const setTransition = useCallback((on) => {
    const value = on ? `transform ${SETTLE_MS}ms ${EASING}` : ''
    for (const ref of [currentContentRef, previewContentRef]) {
      if (ref.current) ref.current.style.transition = value
    }
  }, [])

  const clear = useCallback(() => {
    setTransition(false)
    for (const ref of [currentContentRef, previewContentRef]) {
      if (ref.current) ref.current.style.transform = ''
    }
    gestureRef.current = null
    setPreview(null)
  }, [setTransition])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    function handleTouchStart(event) {
      if (event.touches.length !== 1) return
      const touch = event.touches[0]
      const target = event.target
      if (IGNORED_TAGS.has(target.tagName)) return
      // A modal owns the screen while it is open.
      if (target.closest?.('.modal-overlay')) return
      if (startsInHorizontalScroller(target, root)) return
      if (touch.clientX < SWIPE_EDGE_GUARD || touch.clientX > window.innerWidth - SWIPE_EDGE_GUARD) return

      gestureRef.current = {
        startX: touch.clientX,
        startY: touch.clientY,
        direction: null,
        lastX: touch.clientX,
        lastT: performance.now(),
        velocity: 0,
        offset: 0,
      }
    }

    function handleTouchMove(event) {
      const gesture = gestureRef.current
      if (!gesture || event.touches.length !== 1) return
      const touch = event.touches[0]
      const dx = touch.clientX - gesture.startX
      const dy = touch.clientY - gesture.startY

      if (!gesture.direction) {
        const locked = lockDirection(dx, dy)
        if (!locked) return
        if (locked === 'vertical') {
          // Hand this gesture back to native scrolling.
          gestureRef.current = null
          return
        }
        const { views: currentViews, view: currentView } = latest.current
        const target = nextView(currentViews, currentView, locked)
        if (target === currentView) {
          // At the end of the tab bar - nothing to reveal.
          gestureRef.current = null
          return
        }
        gesture.direction = locked
        setPreview({ view: target, direction: locked })
      }

      // Only claim the gesture once it is a confirmed horizontal swipe, so
      // scrolling and taps are never interfered with beforehand.
      event.preventDefault()
      const now = performance.now()
      const dt = now - gesture.lastT
      if (dt > 0) gesture.velocity = (touch.clientX - gesture.lastX) / dt
      gesture.lastX = touch.clientX
      gesture.lastT = now
      gesture.offset = clampDragOffset(dx, gesture.direction, window.innerWidth)
      position(gesture.offset, gesture.direction)
    }

    function handleTouchEnd() {
      const gesture = gestureRef.current
      if (!gesture || !gesture.direction) {
        gestureRef.current = null
        return
      }

      const commit = shouldCommitDrag({
        offset: gesture.offset,
        direction: gesture.direction,
        viewportWidth: window.innerWidth,
        velocity: gesture.velocity,
      })
      const { views: currentViews, view: currentView } = latest.current
      const target = commit ? nextView(currentViews, currentView, gesture.direction) : currentView
      const finalOffset = commit
        ? gesture.direction === 'next'
          ? -window.innerWidth
          : window.innerWidth
        : 0

      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (!reduceMotion) setTransition(true)
      position(finalOffset, gesture.direction)

      function finish() {
        clear()
        if (commit) latest.current.onCommit(target)
      }

      if (reduceMotion) {
        finish()
        return
      }

      const node = currentContentRef.current
      let done = false
      let timeoutId
      function onSettled() {
        if (done) return
        done = true
        clearTimeout(timeoutId)
        node?.removeEventListener('transitionend', onSettled)
        finish()
      }
      if (node) node.addEventListener('transitionend', onSettled)
      // A safety net in case transitionend never fires (e.g. a zero-distance settle).
      timeoutId = setTimeout(onSettled, SETTLE_MS + 60)
    }

    root.addEventListener('touchstart', handleTouchStart, { passive: true })
    root.addEventListener('touchmove', handleTouchMove, { passive: false })
    root.addEventListener('touchend', handleTouchEnd, { passive: true })
    root.addEventListener('touchcancel', clear, { passive: true })

    return () => {
      root.removeEventListener('touchstart', handleTouchStart)
      root.removeEventListener('touchmove', handleTouchMove)
      root.removeEventListener('touchend', handleTouchEnd)
      root.removeEventListener('touchcancel', clear)
    }
  }, [])

  // A tap navigates with the same motion a swipe would, so tapping into a
  // page and swiping back are the same movement in reverse rather than a
  // silent jump one way and an animation the other.
  const navigateTo = useCallback(
    (target, direction = 'next') => {
      if (pendingRef.current || target === latest.current.view) return
      pendingRef.current = { target, direction }
      setPreview({ view: target, direction })
    },
    [],
  )

  // Runs once the tapped page has actually mounted off-screen, which is the
  // earliest its transform can be animated from.
  useEffect(() => {
    const pending = pendingRef.current
    if (!pending || preview?.view !== pending.target) return
    const node = previewContentRef.current
    if (!node) return

    function finish() {
      pendingRef.current = null
      clear()
      latest.current.onCommit(pending.target)
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      finish()
      return
    }

    position(0, pending.direction)
    // Flush that starting position, or the browser coalesces both transforms
    // into one and the page simply appears where it was going.
    void node.offsetWidth
    setTransition(true)
    position(pending.direction === 'next' ? -window.innerWidth : window.innerWidth, pending.direction)

    let done = false
    function onSettled() {
      if (done) return
      done = true
      clearTimeout(timeoutId)
      node.removeEventListener('transitionend', onSettled)
      finish()
    }
    node.addEventListener('transitionend', onSettled)
    const timeoutId = setTimeout(onSettled, SETTLE_MS + 60)

    return () => {
      clearTimeout(timeoutId)
      node.removeEventListener('transitionend', onSettled)
    }
  }, [preview, position, setTransition, clear])

  return { rootRef, currentContentRef, previewContentRef, preview, navigateTo }
}
