function PageHeader({ title, icon, onBack, children }) {
  return (
    <header className="app-header">
      <div className="page-title">
        {onBack && (
          <button type="button" className="back-button" onClick={onBack} aria-label="Back to summary">
            ‹
          </button>
        )}
        <img src={`${import.meta.env.BASE_URL}${icon}`} alt="" className="page-logo" />
        <h1>{title}</h1>
      </div>
      {children}
    </header>
  )
}

export default PageHeader
