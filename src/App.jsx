import { useState, useEffect } from 'react'
import HabitsPage from './components/HabitsPage.jsx'
import GoalsPage from './components/GoalsPage.jsx'
import SummaryPage from './components/SummaryPage.jsx'
import JournalPage from './components/JournalPage.jsx'
import NavBar from './components/NavBar.jsx'
import PageWallpaper from './components/PageWallpaper.jsx'
import { loadHabits, saveHabits } from './storage.js'
import { defaultHabits } from './defaultHabits.js'
import { useSync } from './useSync.js'
import { usePageDrag } from './usePageDrag.js'
import { VIEW_ORDER } from './navIcons.js'

const WALLPAPERS = {
  habits: 'images/habits-wallpaper.jpg',
  goals: 'images/theme-wallpaper.jpg',
  summary: 'images/theme-wallpaper.jpg',
  journal: 'images/journal-wallpaper.jpg',
}

// Where the preview page sits before the drag has positioned it for real.
// Without this it would render at rest - fully on screen - for one frame,
// since usePageDrag can't apply a transform until after this first commit.
function previewStartTransform(direction) {
  return direction === 'next' ? 'translateX(100%)' : 'translateX(-100%)'
}

function App() {
  const [habits, setHabits] = useState(() => loadHabits() ?? defaultHabits)
  const [view, setView] = useState('summary')
  const sync = useSync()

  function changeView(next) {
    if (next === view) return
    setView(next)
    window.scrollTo(0, 0)
  }

  const {
    rootRef,
    currentContentRef,
    currentWallpaperRef,
    previewContentRef,
    previewWallpaperRef,
    preview,
  } = usePageDrag({ views: VIEW_ORDER, view, onCommit: changeView })

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
        />
      )
    }
    if (pageView === 'goals') return <GoalsPage habits={habits} onAddHabits={addHabits} />
    if (pageView === 'summary') return <SummaryPage habits={habits} onChangeView={changeView} sync={sync} />
    if (pageView === 'journal') return <JournalPage />
    return null
  }

  return (
    <div className="app" ref={rootRef}>
      <PageWallpaper image={WALLPAPERS[view]} domRef={currentWallpaperRef} />
      <div className="app-content" ref={currentContentRef}>
        {renderPage(view)}
      </div>

      {preview && (
        <>
          <PageWallpaper
            image={WALLPAPERS[preview.view]}
            domRef={previewWallpaperRef}
            className="page-wallpaper preview-layer"
            style={{ transform: previewStartTransform(preview.direction) }}
          />
          <div
            className="app-content swipe-preview-content"
            ref={previewContentRef}
            style={{ transform: previewStartTransform(preview.direction) }}
          >
            {renderPage(preview.view)}
          </div>
        </>
      )}

      <NavBar view={view} onChangeView={changeView} />
    </div>
  )
}

export default App
