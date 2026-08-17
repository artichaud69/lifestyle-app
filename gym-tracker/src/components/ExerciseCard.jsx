import { findLastEntry, formatSetsSummary } from '../lib/workout.js'
import { CheckIcon, TrashIcon } from '../lib/icons.jsx'

function targetLabel(planExercise) {
  if (!planExercise) return null
  const reps = planExercise.repsMin === planExercise.repsMax ? `${planExercise.repsMin}` : `${planExercise.repsMin}-${planExercise.repsMax}`
  const rpe = planExercise.targetRPE ? ` @ RPE ${planExercise.targetRPE}` : ''
  return `Target: ${planExercise.targetSets} × ${reps}${rpe}`
}

function ExerciseCard({ entry, logs, unit, onUpdateSet, onToggleComplete, onAddSet, onRemoveLastSet, onRemoveExercise }) {
  const last = findLastEntry(logs, entry.exerciseId)
  const lastSummary = last ? formatSetsSummary(last.entry.sets, unit) : null

  return (
    <div className="card exercise-card">
      <div className="card-title-row">
        <h3>{entry.exerciseName}</h3>
        <button type="button" className="icon-btn" onClick={onRemoveExercise} aria-label="Remove exercise">
          <TrashIcon size={16} />
        </button>
      </div>

      {entry.planExercise && <div className="muted" style={{ marginBottom: 6 }}>{targetLabel(entry.planExercise)}</div>}
      {lastSummary && <div className="last-time">Last time: {lastSummary}</div>}
      {entry.planExercise?.rationale && <div className="rationale">{entry.planExercise.rationale}</div>}

      <div className="set-table-head">
        <span>#</span>
        <span>{unit}</span>
        <span>Reps</span>
        <span>RPE</span>
        <span></span>
      </div>

      {entry.sets.map((set, index) => (
        <div key={index} className={`set-row${set.completed ? ' done' : ''}${set.isWarmup ? ' warmup' : ''}`}>
          <div className="set-index">{set.isWarmup ? 'W' : index + 1 - entry.sets.slice(0, index).filter((s) => s.isWarmup).length}</div>
          <input
            type="number"
            inputMode="decimal"
            value={set.weight}
            placeholder="0"
            onChange={(e) => onUpdateSet(index, 'weight', e.target.value)}
          />
          <input
            type="number"
            inputMode="numeric"
            value={set.reps}
            placeholder="0"
            onChange={(e) => onUpdateSet(index, 'reps', e.target.value)}
          />
          <input
            type="number"
            inputMode="decimal"
            value={set.rpe}
            placeholder="-"
            onChange={(e) => onUpdateSet(index, 'rpe', e.target.value)}
          />
          <button
            type="button"
            className={`set-check${set.completed ? ' done' : ''}`}
            onClick={() => onToggleComplete(index)}
            aria-label="Mark set complete"
          >
            <CheckIcon size={18} />
          </button>
        </div>
      ))}

      <div className="set-actions">
        <button type="button" className="link-btn" onClick={() => onAddSet(false)}>
          + Add set
        </button>
        <button type="button" className="link-btn" onClick={() => onAddSet(true)}>
          + Warm-up
        </button>
        {entry.sets.length > 1 && (
          <button type="button" className="link-btn danger" onClick={onRemoveLastSet}>
            Remove last
          </button>
        )}
      </div>
    </div>
  )
}

export default ExerciseCard
