import { flushSync } from 'react-dom'

// Slides the outgoing page away and the incoming one in, in the direction the
// user swiped. The browser snapshots the old page itself, so nothing has to be
// rendered twice or kept mounted during the animation.
export function runViewTransition(direction, apply) {
  const root = document.documentElement

  const supported =
    typeof document.startViewTransition === 'function' &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (!supported) {
    apply()
    return
  }

  root.dataset.viewDirection = direction
  const transition = document.startViewTransition(() => {
    // The callback must leave the DOM in its final state before it returns,
    // so the state update cannot be left for React to batch later.
    flushSync(apply)
  })

  transition.finished.finally(() => {
    delete root.dataset.viewDirection
  })
}
