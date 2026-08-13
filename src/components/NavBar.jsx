const TABS = [
  { key: 'habits', label: 'Habits', icon: 'nav-habits.png' },
  { key: 'goals', label: 'Goals', icon: 'nav-goals.png' },
  { key: 'summary', label: 'Summary', icon: 'nav-summary.png' },
  { key: 'journal', label: 'Journal', icon: 'nav-journal.png' },
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
          <img src={`${import.meta.env.BASE_URL}icons/${tab.icon}`} alt="" className="nav-icon" />
          {tab.label}
        </button>
      ))}
    </nav>
  )
}

export default NavBar
