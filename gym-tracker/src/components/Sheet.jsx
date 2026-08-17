function Sheet({ title, onClose, children, footer }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />
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
