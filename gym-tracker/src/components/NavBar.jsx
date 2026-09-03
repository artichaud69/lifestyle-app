import { DumbbellIcon, HistoryIcon, ChartIcon, CalendarIcon, BookIcon } from '../lib/icons.jsx'

const TABS = [
  { key: 'train', label: 'Train', Icon: DumbbellIcon },
  { key: 'history', label: 'History', Icon: HistoryIcon },
  { key: 'progress', label: 'Progress', Icon: ChartIcon },
  { key: 'plan', label: 'Plan', Icon: CalendarIcon },
  { key: 'library', label: 'Library', Icon: BookIcon },
]

function NavBar({ view, onChangeView }) {
  return (
    <nav className="nav-bar">
      {TABS.map(({ key, label, Icon }) => (
        <button
          key={key}
          type="button"
          className={`nav-tab${view === key ? ' active' : ''}`}
          onClick={() => onChangeView(key)}
        >
          <Icon size={22} />
          {label}
        </button>
      ))}
    </nav>
  )
}

export default NavBar
