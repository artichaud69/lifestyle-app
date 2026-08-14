import { useState, useEffect, useRef } from 'react'
import HabitsPage from './components/HabitsPage.jsx'
import GoalsPage from './components/GoalsPage.jsx'
import SummaryPage from './components/SummaryPage.jsx'
import JournalPage from './components/JournalPage.jsx'
import NavBar from './components/NavBar.jsx'
import PageWallpaper from './components/PageWallpaper.jsx'
import { loadHabits, saveHabits } from './storage.js'
import { defaultHabits } from './defaultHabits.js'
import { useSync } from './useSync.js'
import { useSwipeNavigation } from './useSwipeNavigation.js'
import { VIEW_ORDER } from './navIcons.js'
import { runViewTransition } from './viewTransition.js'

const WALLPAPERS = {
  habits: 'images/habits-wallpaper.jpg',
  goals: 'images/theme-wallpaper.jpg',
  summary: 'images/theme-wallpaper.jpg',
  journal: 'images/journal-wallpaper.jpg',
}

function App() {
  const [habits, setHabits] = useState(() => loadHabits() ?? defaultHabits)
  const [view, setView] = useState('summary')
  const sync = useSync()
  const appRef = useRef(null)

  // Direction comes from the tab order, so tapping a tab animates the same way
  // as swiping to it.
  function changeView(next) {
    if (next === view) return
    const direction = VIEW_ORDER.indexOf(next) > VIEW_ORDER.indexOf(view) ? 'next' : 'previous'
    runViewTransition(direction, () => {
      setView(next)
      window.scrollTo(0, 0)
    })
  }

  useSwipeNavigation(appRef, { views: VIEW_ORDER, view, onChangeView: changeView })

  useEffect(() => {
    saveHabits(habits)
  }, [habits])

  function addHabit(name, startDate, timesPerWeek) {
    const newHabit = {
      id: crypto.randomUUID(),
      name,
      startDate,
      timesPerWeek,
      doneDates: [],
    }
    setHabits([...habits, newHabit])
  }

  function addHabits(newHabits) {
    setHabits([...habits, ...newHabits])
  }

  function toggleDate(habitId, dateISO) {
    setHabits(
      habits.map((habit) => {
        if (habit.id !== habitId) return habit
        const isDone = habit.doneDates.includes(dateISO)
        const newDoneDates = isDone
          ? habit.doneDates.filter((date) => date !== dateISO)
          : [...habit.doneDates, dateISO]
        return { ...habit, doneDates: newDoneDates }
      }),
    )
  }

  function updateHabit(habitId, updates) {
    setHabits(habits.map((habit) => (habit.id === habitId ? { ...habit, ...updates } : habit)))
  }

  function deleteHabit(habitId) {
    setHabits(habits.filter((habit) => habit.id !== habitId))
  }

  return (
    <div className="app" ref={appRef}>
      <PageWallpaper image={WALLPAPERS[view]} />
      <div className="app-content">
        {view === 'habits' && (
          <HabitsPage
            habits={habits}
            onAddHabit={addHabit}
            onToggleDate={toggleDate}
            onUpdateHabit={updateHabit}
            onDeleteHabit={deleteHabit}
          />
        )}
        {view === 'goals' && <GoalsPage habits={habits} onAddHabits={addHabits} />}
        {view === 'summary' && <SummaryPage habits={habits} onChangeView={changeView} sync={sync} />}
        {view === 'journal' && <JournalPage />}
      </div>
      <NavBar view={view} onChangeView={changeView} />
    </div>
  )
}

export default App
