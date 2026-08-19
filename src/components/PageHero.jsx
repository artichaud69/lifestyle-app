import { PAGE_ICONS, PAGE_HEROES } from '../navIcons.js'

// The band of artwork each page opens on. The image used to sit behind the
// whole screen, which meant every panel needed a scrim over it and the whole
// app turned one muddy colour; confining it to the top lets the artwork be
// vivid and the content below stay legible.
function PageHero({ view, title, onBack, onSettings, backGlyph = '\u2039', children }) {
  const base = import.meta.env.BASE_URL

  return (
    <header className="page-hero" style={{ backgroundImage: `url(${base}${PAGE_HEROES[view]})` }}>
      <div className="page-hero-veil" />

      {onBack && (
        <button type="button" className="hero-back" onClick={onBack} aria-label="Back to summary">
          {backGlyph}
        </button>
      )}

      {/* Settings is reachable by swiping right, but a gesture nobody can see
          is a gesture nobody finds - so it gets a visible handle too. */}
      {onSettings && (
        <button type="button" className="hero-settings" onClick={onSettings} aria-label="Settings">
          ≡
        </button>
      )}

      <div className="page-hero-bar">
        <div className="page-hero-title">
          <img src={`${base}${PAGE_ICONS[view]}`} alt="" className="page-hero-icon" />
          <h1>{title}</h1>
        </div>
        {children}
      </div>
    </header>
  )
}

export default PageHero
