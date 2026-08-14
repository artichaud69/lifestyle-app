import { PAGE_ICONS, VIEWS } from '../navIcons.js'

function NavBar({ view, onChangeView }) {
  return (
    <nav className="nav-bar">
      {VIEWS.map((tab) => (
        <button
          key={tab.key}
          type="button"
          className={`nav-tab${view === tab.key ? ' active' : ''}`}
          onClick={() => onChangeView(tab.key)}
        >
          <img src={`${import.meta.env.BASE_URL}${PAGE_ICONS[tab.key]}`} alt="" className="nav-icon" />
          {tab.label}
        </button>
      ))}
    </nav>
  )
}

export default NavBar
