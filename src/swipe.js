import { HUB_VIEW } from './navIcons.js'

// Minimum drag before a gesture means anything at all - below this it could
// just be a stationary tap.
export const DIRECTION_LOCK_DISTANCE = 10
// How much more horizontal than vertical a drag must be before it is treated
// as a page swipe rather than the page scrolling.
export const SWIPE_DIRECTION_RATIO = 1.3
// iOS reserves the screen edges for its own back/forward gesture.
export const SWIPE_EDGE_GUARD = 28
// Fraction of the screen width a released drag must have travelled to commit
// to the next page, if it wasn't a fast flick.
export const COMMIT_DISTANCE_RATIO = 0.35
// A flick faster than this (px/ms) commits even if released early.
export const COMMIT_VELOCITY_PX_MS = 0.5
// A flick still needs at least this much travel, so a fast tap can't
// register as a commit.
export const COMMIT_MIN_FLICK_RATIO = 0.08

// Once movement is big enough to mean something, decide whether this drag is
// a horizontal page-swipe, or belongs to vertical scrolling instead.
export function lockDirection(dx, dy) {
  if (Math.abs(dx) < DIRECTION_LOCK_DISTANCE && Math.abs(dy) < DIRECTION_LOCK_DISTANCE) return null
  if (Math.abs(dx) < Math.abs(dy) * SWIPE_DIRECTION_RATIO) return 'vertical'
  return dx < 0 ? 'next' : 'previous'
}

// Keeps the drag from revealing more than one full page, and from reversing
// past the resting position once a direction is locked in.
export function clampDragOffset(dx, direction, viewportWidth) {
  if (direction === 'next') return Math.min(0, Math.max(dx, -viewportWidth))
  return Math.max(0, Math.min(dx, viewportWidth))
}

// Whether a released drag should complete the navigation or spring back.
export function shouldCommitDrag({ offset, direction, viewportWidth, velocity }) {
  if (viewportWidth <= 0) return false
  const distanceRatio = Math.abs(offset) / viewportWidth
  if (distanceRatio >= COMMIT_DISTANCE_RATIO) return true
  const flickedTheRightWay = direction === 'next' ? velocity < 0 : velocity > 0
  return (
    flickedTheRightWay &&
    Math.abs(velocity) >= COMMIT_VELOCITY_PX_MS &&
    distanceRatio >= COMMIT_MIN_FLICK_RATIO
  )
}

// Hub and spoke: a backward swipe from any spoke returns to the hub, the way
// a back gesture does, and there is nothing to swipe forward to. Returning
// `current` means "nothing to reveal", which the drag hook reads as a signal
// to hand the gesture back rather than start a page drag.
export function nextView(views, current, direction, hub = HUB_VIEW) {
  if (!views.includes(current)) return current
  if (direction !== 'previous') return current
  return current === hub ? current : hub
}

// A drag that starts on something the user can scroll sideways - the habit
// tick strips - belongs to that element, not to tab navigation.
export function startsInHorizontalScroller(target, root) {
  let node = target
  while (node && node !== root && node.nodeType === 1) {
    const style = window.getComputedStyle(node)
    const scrolls = style.overflowX === 'auto' || style.overflowX === 'scroll'
    if (scrolls && node.scrollWidth > node.clientWidth + 1) return true
    node = node.parentElement
  }
  return false
}
