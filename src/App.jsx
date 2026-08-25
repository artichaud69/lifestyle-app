import { useState, useEffect } from 'react'
import HabitsPage from './components/HabitsPage.jsx'
import GoalsPage from './components/GoalsPage.jsx'
import SummaryPage from './components/SummaryPage.jsx'
import JournalPage from './components/JournalPage.jsx'
import HealthPage from './components/HealthPage.jsx'
import OraisonPage from './components/OraisonPage.jsx'
import GratitudePage from './components/GratitudePage.jsx'
import SettingsPage from './components/SettingsPage.jsx'
import { loadHabits, saveHabits } from './storage.js'
import { defaultHabits } from './defaultHabits.js'
import { useSync } from './useSync.js'
import { usePageDrag } from './usePageDrag.js'
import { consumeOuraCallback } from './oura.js'
import { ALL_VIEWS, HUB_VIEW, SETTINGS_VIEW } from './navIcons.js'

// Where the preview page sits before the drag has positioned it for real.
// Without this it would render at rest - fully on screen - for one frame,
// since usePageDrag can't apply a transform until after this first commit.
function previewStartTransform(direction) {
  return direction === 'next' ? 'translateX(100%)' : 'translateX(-100%)'
}

function App() {
  const [habits, setHabits] = useState(() => loadHabits() ?? defaultHabits)
  const [view, setView] = useState(HUB_VIEW)
  const [ouraMessage, setOuraMessage] = useState(null)
  const sync = useSync()

  function changeView(next) {
    if (next === view) return
    setView(next)
    window.scrollTo(0, 0)
  }

  // Oura sends the browser straight back to the app's own URL with a ?code=
  // in it, so any page load might be that redirect landing.
  useEffect(() => {
    consumeOuraCallback().then((result) => {
      if (!result) return
      setOuraMessage(result.ok ? null : result.message)
      setView('health')
    })
  }, [])

  const { rootRef, currentContentRef, previewContentRef, preview, navigateTo } = usePageDrag({
    views: ALL_VIEWS,
    view,
    onCommit: changeView,
  })

  // Tapping animates in the same direction the equivalent swipe would, so
  // going in and coming back are one movement and its reverse.
  function openSpoke(next) {
    navigateTo(next, 'next')
  }

  function goToHub() {
    navigateTo(HUB_VIEW, 'previous')
  }

  function openSettings() {
    navigateTo(SETTINGS_VIEW, 'previous')
  }

  // Settings sits to the left of the hub, so leaving it travels forward -
  // the hub slides back in from the right, undoing the way it opened.
  function closeSettings() {
    navigateTo(HUB_VIEW, 'next')
  }

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

  function renderPage(pageView) {
    if (pageView === 'habits') {
      return (
        <HabitsPage
          habits={habits}
          onAddHabit={addHabit}
          onToggleDate={toggleDate}
          onUpdateHabit={updateHabit}
          onDeleteHabit={deleteHabit}
          onBack={goToHub}
        />
      )
    }
    if (pageView === 'goals') return <GoalsPage habits={habits} onAddHabits={addHabits} onBack={goToHub} />
    if (pageView === 'summary') {
      return <SummaryPage habits={habits} onChangeView={openSpoke} onOpenSettings={openSettings} />
    }
    if (pageView === SETTINGS_VIEW) return <SettingsPage sync={sync} onBack={closeSettings} />
    if (pageView === 'journal') return <JournalPage onBack={goToHub} />
    if (pageView === 'health') {
      return (
        <HealthPage
          session={sync.session}
          initialMessage={ouraMessage}
          onBack={goToHub}
          onOpenSettings={openSettings}
        />
      )
    }
    if (pageView === 'oraison') return <OraisonPage onBack={goToHub} />
    if (pageView === 'gratitude') return <GratitudePage onBack={goToHub} />
    return null
  }

  return (
    <div className="app" ref={rootRef}>
      <div className="app-content" ref={currentContentRef}>
        {renderPage(view)}
      </div>

      {preview && (
        <div
          className="app-content swipe-preview-content"
          ref={previewContentRef}
          style={{ transform: previewStartTransform(preview.direction) }}
        >
          {renderPage(preview.view)}
        </div>
      )}
    </div>
  )
}

export default App
