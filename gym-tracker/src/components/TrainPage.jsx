import ActiveWorkout from './ActiveWorkout.jsx'
import PageHeader from './PageHeader.jsx'
import { DumbbellIcon, PlayIcon } from '../lib/icons.jsx'
import { nextSessionTemplate, suggestSessionTargets } from '../lib/coach.js'
import { findExercise } from '../lib/exercises.js'

function TrainPage({
  program,
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
}) {
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

  const upNext = program ? nextSessionTemplate(program, logs) : null
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
    </div>
  )
}

export default TrainPage
