import { useRef, useState } from 'react'

// Swipe-to-dismiss is scoped to the handle bar, not the whole sheet — the
// sheet body scrolls (long exercise guides, long lists), and grabbing
// anywhere to drag-close would fight with that scroll. The handle sits at
// the very top of that same scrollable area, so it's only reachable once
// scrolled to the top anyway, which is exactly when "drag down to close"
// reads as safe rather than accidental.
const DISMISS_THRESHOLD_PX = 90

function Sheet({ title, onClose, children, footer }) {
  const [dragY, setDragY] = useState(0)
  const draggingRef = useRef(false)
  const startYRef = useRef(0)

  function handlePointerDown(e) {
    draggingRef.current = true
    startYRef.current = e.clientY
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function handlePointerMove(e) {
    if (!draggingRef.current) return
    const delta = e.clientY - startYRef.current
    if (delta > 0) setDragY(delta)
  }

  function handlePointerUp() {
    if (!draggingRef.current) return
    draggingRef.current = false
    if (dragY > DISMISS_THRESHOLD_PX) {
      onClose()
    } else {
      setDragY(0)
    }
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div
        className="sheet"
        onClick={(e) => e.stopPropagation()}
        style={dragY ? { transform: `translateY(${dragY}px)`, transition: 'none' } : undefined}
      >
        <div
          className="sheet-handle-grip"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <div className="sheet-handle" />
        </div>
        {title && (
          <div className="sheet-header">
            <h2>{title}</h2>
            <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
              ×
            </button>
          </div>
        )}
        {children}
        {footer && <div style={{ marginTop: 'var(--space-4)' }}>{footer}</div>}
      </div>
    </div>
  )
}

export default Sheet
