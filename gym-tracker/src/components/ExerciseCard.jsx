import { useState } from 'react'
import { findLastEntry, formatSetsSummary } from '../lib/workout.js'
import { CheckIcon, TrashIcon } from '../lib/icons.jsx'
import Sheet from './Sheet.jsx'

function targetLabel(planExercise) {
  if (!planExercise) return null
  const reps = planExercise.repsMin === planExercise.repsMax ? `${planExercise.repsMin}` : `${planExercise.repsMin}-${planExercise.repsMax}`
  const rpe = planExercise.targetRPE ? ` @ RPE ${planExercise.targetRPE}` : ''
  return `Target: ${planExercise.targetSets} × ${reps}${rpe}`
}

const RPE_SCALE = [
  ['10', 'Max effort — could not do another rep'],
  ['9', '1 rep left in the tank'],
  ['8', '2 reps left in the tank'],
  ['7', '3 reps left in the tank'],
  ['≤6', 'Warm-up or easy — 4+ reps left'],
]

function RpeInfoSheet({ onClose }) {
  return (
    <Sheet title="What is RPE?" onClose={onClose}>
      <p>
        Rate of Perceived Exertion — how hard a set felt, on a 1-10 scale. It's optional: the coach works fine off
        reps alone, but logging RPE helps it tell a genuinely maxed-out set from one with room to spare.
      </p>
      <div className="card card-tight">
        {RPE_SCALE.map(([value, desc]) => (
          <div key={value} className="ex-name">
            <span>RPE {value}</span>
            <span className="muted">{desc}</span>
          </div>
        ))}
      </div>
    </Sheet>
  )
}

function ExerciseCard({ entry, logs, unit, onUpdateSet, onToggleComplete, onAddSet, onAddWarmup, onRemoveLastSet, onRemoveExercise }) {
  const [showRpeInfo, setShowRpeInfo] = useState(false)
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
      {entry.planExercise?.notes && <div className="exercise-note">{entry.planExercise.notes}</div>}
      {lastSummary && <div className="last-time">Last time: {lastSummary}</div>}
      {entry.planExercise?.rationale && <div className="rationale">{entry.planExercise.rationale}</div>}

      <div className="set-table-head">
        <span>#</span>
        <span>{unit}</span>
        <span>Reps</span>
        <button type="button" className="rpe-info-btn" onClick={() => setShowRpeInfo(true)}>
          RPE ⓘ
        </button>
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
        <button type="button" className="link-btn" onClick={onAddWarmup}>
          + Warm-up
        </button>
        {entry.sets.length > 1 && (
          <button type="button" className="link-btn danger" onClick={onRemoveLastSet}>
            Remove last
          </button>
        )}
      </div>

      {showRpeInfo && <RpeInfoSheet onClose={() => setShowRpeInfo(false)} />}
    </div>
  )
}

export default ExerciseCard
