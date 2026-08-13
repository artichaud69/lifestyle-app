// Tiny pub/sub so the storage modules can tell the sync layer that something
// changed, without either side importing the other's implementation.
const listeners = new Set()

export function onDataChanged(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function notifyDataChanged() {
  for (const listener of listeners) listener()
}
