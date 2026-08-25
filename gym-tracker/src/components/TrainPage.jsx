import { useState } from 'react'
import ActiveWorkout from './ActiveWorkout.jsx'
import PageHeader from './PageHeader.jsx'
import Sheet from './Sheet.jsx'
import { DumbbellIcon, PlayIcon, ChevronRightIcon } from '../lib/icons.jsx'
import { suggestSessionTargets } from '../lib/coach.js'
import { findExercise } from '../lib/exercises.js'

function SessionPickerSheet({ program, upNext, onPick, onClose }) {
  return (
    <Sheet title="Choose a Session" onClose={onClose}>
      <p style={{ marginTop: 0 }}>Swap what's up next from {program.name} — this won't start anything yet.</p>
      <div className="card">
        {program.sessions.map((session) => (
          <div key={session.id} className="history-log-item" onClick={() => onPick(session)}>
            <div>
              <div className="name">{session.name}</div>
              <div className="date">
                {session.exercises.length} exercises
                {session.id === upNext?.id ? ' · up next' : ''}
              </div>
            </div>
            <ChevronRightIcon size={18} />
          </div>
        ))}
      </div>
    </Sheet>
  )
}

function TrainPage({
  program,
  upNext,
  logs,
  draft,
  settings,
  customExercises,
  onChangeDraft,
  onStartWorkout,
  onFinishWorkout,
  onCancelWorkout,
  onAddCustomExercise,
  onGoToPlan,
  onSelectSession,
}) {
  const [showPicker, setShowPicker] = useState(false)

  if (draft) {
    return (
      <ActiveWorkout
        draft={draft}
        onChangeDraft={onChangeDraft}
        onFinish={onFinishWorkout}
        onCancel={onCancelWorkout}
        logs={logs}
        settings={settings}
        customExercises={customExercises}
        onAddCustomExercise={onAddCustomExercise}
      />
    )
  }

  const suggested = upNext ? suggestSessionTargets(upNext, logs, settings.unit) : null

  return (
    <div>
      <PageHeader title="Train" />

      {suggested && (
        <div className="card">
          <div className="card-title-row">
            <h2>Up Next: {suggested.name}</h2>
            <span className="badge">{program.name.split(' — ')[1] ?? program.name}</span>
          </div>
          {suggested.exercises.map((ex) => {
            const info = findExercise(ex.exerciseId, customExercises)
            const reps = ex.repsMin === ex.repsMax ? `${ex.repsMin}` : `${ex.repsMin}-${ex.repsMax}`
            return (
              <div key={ex.id} className="ex-name">
                <span>{info?.name ?? ex.exerciseId}</span>
                <span className="muted">
                  {ex.targetSets} × {reps}
                  {ex.targetWeight ? ` @ ${ex.targetWeight}${settings.unit}` : ''}
                </span>
              </div>
            )
          })}
          <button type="button" className="btn btn-primary" style={{ marginTop: 'var(--space-3)' }} onClick={() => onStartWorkout(upNext)}>
            <PlayIcon size={18} /> Start Workout
          </button>
          {program.sessions.length > 1 && (
            <button type="button" className="link-btn" style={{ display: 'block', width: '100%', textAlign: 'center' }} onClick={() => setShowPicker(true)}>
              Not the right session? Choose another
            </button>
          )}
        </div>
      )}

      {!program && (
        <div className="card empty-state">
          <DumbbellIcon size={36} />
          <h3>No plan yet</h3>
          <p>Build a program from your goal and the coach will suggest weights every session.</p>
          <button type="button" className="btn btn-primary" onClick={onGoToPlan}>
            Build My Plan
          </button>
        </div>
      )}

      <button type="button" className="btn btn-secondary" onClick={() => onStartWorkout(null)}>
        Start Empty Workout
      </button>

      {showPicker && (
        <SessionPickerSheet
          program={program}
          upNext={upNext}
          onPick={(session) => {
            onSelectSession(session.id)
            setShowPicker(false)
          }}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  )
}

export default TrainPage
