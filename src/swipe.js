// Minimum horizontal travel before a drag counts as a swipe at all.
export const SWIPE_MIN_DISTANCE = 60
// How much more horizontal than vertical the drag must be, so that scrolling
// the page never flips a tab by accident.
export const SWIPE_DIRECTION_RATIO = 1.5
// iOS reserves the screen edges for its own back/forward gesture.
export const SWIPE_EDGE_GUARD = 28

// Pure decision so the awkward part is testable without synthesising touches.
export function swipeDecision({ dx, dy, startX, viewportWidth }) {
  if (startX < SWIPE_EDGE_GUARD) return null
  if (startX > viewportWidth - SWIPE_EDGE_GUARD) return null
  if (Math.abs(dx) < SWIPE_MIN_DISTANCE) return null
  if (Math.abs(dx) < Math.abs(dy) * SWIPE_DIRECTION_RATIO) return null
  return dx < 0 ? 'next' : 'previous'
}

export function nextView(views, current, direction) {
  const index = views.indexOf(current)
  if (index === -1) return current
  const target = direction === 'next' ? index + 1 : index - 1
  // Stop at the ends rather than wrapping, matching the visible tab bar.
  if (target < 0 || target >= views.length) return current
  return views[target]
}

// A swipe that starts on something the user can scroll sideways - the habit
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
