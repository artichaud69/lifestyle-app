import { PAGE_ICONS } from '../navIcons.js'

const TABS = [
  { key: 'habits', label: 'Habits', icon: PAGE_ICONS.habits },
  { key: 'goals', label: 'Goals', icon: PAGE_ICONS.goals },
  { key: 'summary', label: 'Summary', icon: PAGE_ICONS.summary },
  { key: 'journal', label: 'Journal', icon: PAGE_ICONS.journal },
]

function NavBar({ view, onChangeView }) {
  return (
    <nav className="nav-bar">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          type="button"
          className={`nav-tab${view === tab.key ? ' active' : ''}`}
          onClick={() => onChangeView(tab.key)}
        >
          <img src={`${import.meta.env.BASE_URL}${tab.icon}`} alt="" className="nav-icon" />
          {tab.label}
        </button>
      ))}
    </nav>
  )
}

export default NavBar
