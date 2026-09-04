// Swaps the item at `index` with its neighbor in `direction`. A no-op
// (returns the same array reference) at either end of the list, so callers
// can wire it straight to an always-rendered button without checking
// bounds themselves first — though they still need the bounds to know
// whether to disable/hide the button.
export function moveItem(array, index, direction) {
  const delta = direction === 'up' ? -1 : 1
  const target = index + delta
  if (target < 0 || target >= array.length) return array
  const copy = [...array]
  ;[copy[index], copy[target]] = [copy[target], copy[index]]
  return copy
}

// Same swap, but looks up the item's *current* position by a stable id
// instead of trusting a numeric index handed in from outside. That
// distinction matters for a reorder button: its onClick closure captures
// whatever index was true at the render that created it, and two clicks
// landing before React re-renders (a real double-tap, or a laggy repaint
// tempting a second tap) would both fire with that same stale index —
// swapping the same two slots twice cancels itself back to the start.
// Resolving the index fresh from `array` on every call, keyed by identity
// rather than position, makes two rapid clicks compound correctly (moves
// two spots) instead of undoing each other.
export function moveItemById(array, id, direction, getId = (item) => item.id) {
  const index = array.findIndex((item) => getId(item) === id)
  if (index === -1) return array
  return moveItem(array, index, direction)
}
