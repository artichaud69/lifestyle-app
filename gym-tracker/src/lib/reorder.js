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
