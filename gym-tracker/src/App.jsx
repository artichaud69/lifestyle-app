import { useEffect, useState } from 'react'
import TrainPage from './components/TrainPage.jsx'
import HistoryPage from './components/HistoryPage.jsx'
import ProgressPage from './components/ProgressPage.jsx'
import PlanPage from './components/PlanPage.jsx'
import NavBar from './components/NavBar.jsx'
import WorkoutSummarySheet from './components/WorkoutSummarySheet.jsx'
import {
  loadProgram,
  saveProgram,
  loadLogs,
  saveLogs,
  loadCustomExercises,
  saveCustomExercises,
  loadSettings,
  saveSettings,
  loadDraft,
  saveDraft,
  loadGoalSettings,
  saveGoalSettings,
} from './lib/storage.js'
import { generateProgram, suggestSessionTargets, analyzeWorkout } from './lib/coach.js'
import { findExercise } from './lib/exercises.js'
import { genId } from './lib/id.js'
import { todayISO, nowISO } from './lib/dates.js'

function App() {
  const [program, setProgram] = useState(() => loadProgram())
  const [logs, setLogs] = useState(() => loadLogs())
  const [customExercises, setCustomExercises] = useState(() => loadCustomExercises())
  const [settings, setSettings] = useState(() => loadSettings())
  const [draft, setDraft] = useState(() => loadDraft())
  const [goalSettings, setGoalSettings] = useState(() => loadGoalSettings())
  const [view, setView] = useState('train')
  const [summary, setSummary] = useState(null)

  useEffect(() => saveProgram(program), [program])
  useEffect(() => saveLogs(logs), [logs])
  useEffect(() => saveCustomExercises(customExercises), [customExercises])
  useEffect(() => saveSettings(settings), [settings])
  useEffect(() => saveDraft(draft), [draft])
  useEffect(() => saveGoalSettings(goalSettings), [goalSettings])

  function changeView(next) {
    setView(next)
    window.scrollTo(0, 0)
  }

  function handleGenerateProgram(newGoalSettings) {
    const newProgram = generateProgram(newGoalSettings)
    setProgram(newProgram)
    setGoalSettings(newGoalSettings)
  }

  function handleUpdateSession(updatedSession) {
    setProgram({
      ...program,
      sessions: program.sessions.map((s) => (s.id === updatedSession.id ? updatedSession : s)),
    })
  }

  function handleAddCustomExercise(exercise) {
    setCustomExercises((prev) => [...prev, exercise])
  }

  function startWorkout(sessionTemplate) {
    let entries = []
    if (sessionTemplate) {
      const suggested = suggestSessionTargets(sessionTemplate, logs, settings.unit)
      entries = suggested.exercises.map((planExercise) => {
        const info = findExercise(planExercise.exerciseId, customExercises)
        const startingReps = planExercise.repsMin
        const sets = Array.from({ length: planExercise.targetSets }, () => ({
          weight: planExercise.targetWeight ?? '',
          reps: startingReps ?? '',
          rpe: '',
          completed: false,
          isWarmup: false,
        }))
        return {
          exerciseId: planExercise.exerciseId,
          exerciseName: info?.name ?? planExercise.exerciseId,
          planExercise,
          sets,
        }
      })
    }

    setDraft({
      id: genId(),
      date: todayISO(),
      programId: sessionTemplate ? program.id : null,
      sessionTemplateId: sessionTemplate ? sessionTemplate.id : null,
      sessionName: sessionTemplate ? sessionTemplate.name : 'Freeform Workout',
      finisherNote: sessionTemplate?.finisherNote ?? null,
      startedAt: nowISO(),
      entries,
      notes: '',
      rest: null,
    })
  }

  function finishWorkout() {
    const entries = draft.entries
      .map((entry) => ({
        exerciseId: entry.exerciseId,
        exerciseName: entry.exerciseName,
        sets: entry.sets
          .filter((set) => set.completed)
          .map((set) => ({
            weight: Number(set.weight) || 0,
            reps: Number(set.reps) || 0,
            rpe: set.rpe === '' || set.rpe === null ? null : Number(set.rpe),
            completed: true,
            isWarmup: set.isWarmup,
          })),
      }))
      .filter((entry) => entry.sets.length > 0)

    if (entries.length === 0) {
      window.alert('Log at least one completed set before finishing.')
      return
    }

    const log = {
      id: draft.id,
      date: draft.date,
      programId: draft.programId,
      sessionTemplateId: draft.sessionTemplateId,
      sessionName: draft.sessionName,
      entries,
      notes: draft.notes,
      startedAt: draft.startedAt,
      finishedAt: nowISO(),
    }

    const planExercisesByExerciseId = {}
    if (draft.sessionTemplateId && program) {
      const template = program.sessions.find((s) => s.id === draft.sessionTemplateId)
      template?.exercises.forEach((ex) => {
        planExercisesByExerciseId[ex.exerciseId] = ex
      })
    }

    const allLogs = [...logs, log]
    const result = analyzeWorkout(log, allLogs, planExercisesByExerciseId)
    setLogs(allLogs)
    setDraft(null)
    setSummary({ log, result })
  }

  function cancelWorkout() {
    setDraft(null)
  }

  function deleteLog(logId) {
    setLogs((prev) => prev.filter((l) => l.id !== logId))
  }

  function renderPage() {
    if (view === 'train') {
      return (
        <TrainPage
          program={program}
          logs={logs}
          draft={draft}
          settings={settings}
          customExercises={customExercises}
          onChangeDraft={setDraft}
          onStartWorkout={startWorkout}
          onFinishWorkout={finishWorkout}
          onCancelWorkout={cancelWorkout}
          onAddCustomExercise={handleAddCustomExercise}
          onGoToPlan={() => changeView('plan')}
        />
      )
    }
    if (view === 'history') {
      return <HistoryPage logs={logs} settings={settings} onDeleteLog={deleteLog} />
    }
    if (view === 'progress') {
      return <ProgressPage logs={logs} customExercises={customExercises} settings={settings} />
    }
    if (view === 'plan') {
      return (
        <PlanPage
          program={program}
          settings={settings}
          customExercises={customExercises}
          goalSettings={goalSettings}
          onGenerateProgram={handleGenerateProgram}
          onUpdateSession={handleUpdateSession}
          onSaveSettings={setSettings}
          onAddCustomExercise={handleAddCustomExercise}
          onImportProgram={setProgram}
        />
      )
    }
    return null
  }

  return (
    <div className="app">
      {renderPage()}
      <NavBar view={view} onChangeView={changeView} />
      {summary && (
        <WorkoutSummarySheet log={summary.log} result={summary.result} unit={settings.unit} onClose={() => setSummary(null)} />
      )}
    </div>
  )
}

export default App
