const TABS = [
  { key: 'habits', label: 'Habits' },
  { key: 'goals', label: 'Goals' },
  { key: 'summary', label: 'Summary' },
  { key: 'journal', label: 'Journal' },
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
          {tab.label}
        </button>
      ))}
    </nav>
  )
}

export default NavBar
