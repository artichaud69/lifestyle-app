import { ChevronLeft, X, Menu } from 'lucide-react'
import { PAGE_ICONS, PAGE_HEROES } from '../navIcons.js'

// The band of artwork every page opens on. One geometry for all of them: the
// image fills the band and fades into the app background, so it reads as part
// of the environment rather than as a picture pasted at the top of a document.
function PageHero({ view, title, subtitle, onBack, onSettings, closeIcon = false, children }) {
  const base = import.meta.env.BASE_URL
  const BackIcon = closeIcon ? X : ChevronLeft

  return (
    <header className="page-hero" style={{ backgroundImage: `url(${base}${PAGE_HEROES[view]})` }}>
      <div className="page-hero-veil" />

      {onBack && (
        <button
          type="button"
          className="hero-corner is-start"
          onClick={onBack}
          aria-label={closeIcon ? 'Close' : 'Back to summary'}
        >
          <BackIcon size={22} strokeWidth={2} aria-hidden="true" />
        </button>
      )}

      {/* Settings is reachable by swiping right, but a gesture nobody can see
          is a gesture nobody finds - so it gets a visible handle too. */}
      {onSettings && (
        <button type="button" className="hero-corner is-end" onClick={onSettings} aria-label="Settings">
          <Menu size={20} strokeWidth={2} aria-hidden="true" />
        </button>
      )}

      <div className="page-hero-bar">
        <div className="page-hero-title">
          <img src={`${base}${PAGE_ICONS[view]}`} alt="" className="page-hero-icon" />
          <div className="page-hero-heading">
            <h1 className="display-lg">{title}</h1>
            {subtitle && <p className="page-hero-subtitle">{subtitle}</p>}
          </div>
        </div>
        {children}
      </div>
    </header>
  )
}

export default PageHero
