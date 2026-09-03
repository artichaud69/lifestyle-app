import { useState } from 'react'
import { findLastEntry, formatSetsSummary } from '../lib/workout.js'
import { MIN_WEIGHT_FOR_RAMP } from '../lib/warmup.js'
import { CheckIcon, TrashIcon, TargetIcon } from '../lib/icons.jsx'
import Sheet from './Sheet.jsx'
import ExerciseLibrarySheet from './ExerciseLibrarySheet.jsx'

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

function ExerciseCard({ entry, logs, unit, customExercises, onUpdateSet, onToggleComplete, onAddSet, onAddWarmup, onRemoveLastSet, onRemoveExercise }) {
  const [showRpeInfo, setShowRpeInfo] = useState(false)
  const [showLibrary, setShowLibrary] = useState(false)
  const [showWarmupPrompt, setShowWarmupPrompt] = useState(false)
  const [warmupWeightInput, setWarmupWeightInput] = useState('')
  const last = findLastEntry(logs, entry.exerciseId)
  const lastSummary = last ? formatSetsSummary(last.entry.sets, unit) : null

  const hasWarmupAlready = entry.sets.some((set) => set.isWarmup)
  const typedWeight = entry.sets.find((set) => !set.isWarmup && Number(set.weight) > 0)?.weight
  const knownWeight = Number(typedWeight) || Number(entry.planExercise?.targetWeight) || 0
  // Without a working weight there's nothing to build a percentage ramp
  // from, so ask for it once instead of silently falling back to a blank
  // set with no explanation - that read as the feature just not working.
  const needsWarmupPrompt = !hasWarmupAlready && knownWeight < MIN_WEIGHT_FOR_RAMP

  function handleWarmupClick() {
    if (needsWarmupPrompt) {
      setShowWarmupPrompt(true)
    } else {
      onAddWarmup()
    }
  }

  function submitWarmupPrompt() {
    if (!warmupWeightInput) return
    onAddWarmup(warmupWeightInput)
    setShowWarmupPrompt(false)
    setWarmupWeightInput('')
  }

  return (
    <div className="card exercise-card">
      <div className="card-title-row">
        <h3>{entry.exerciseName}</h3>
        <button type="button" className="icon-btn" onClick={onRemoveExercise} aria-label="Remove exercise">
          <TrashIcon size={16} />
        </button>
      </div>

      {entry.planExercise && <div className="muted" style={{ marginBottom: 6 }}>{targetLabel(entry.planExercise)}</div>}
      <button type="button" className="more-info-btn" onClick={() => setShowLibrary(true)}>
        <TargetIcon size={15} />
        <span>+ More info</span>
      </button>
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
        <button type="button" className="link-btn" onClick={handleWarmupClick}>
          + Warm-up
        </button>
        {entry.sets.length > 1 && (
          <button type="button" className="link-btn danger" onClick={onRemoveLastSet}>
            Remove last
          </button>
        )}
      </div>

      {showWarmupPrompt && (
        <div className="card card-tight" style={{ marginTop: 'var(--space-2)' }}>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 6 }}>
            What weight are you working up to?
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="number"
              inputMode="decimal"
              value={warmupWeightInput}
              placeholder={`0${unit}`}
              autoFocus
              onChange={(e) => setWarmupWeightInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitWarmupPrompt()}
              style={{
                flex: 1,
                padding: '9px 8px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                background: 'var(--color-bg-raised)',
                color: 'var(--color-text)',
              }}
            />
            <button type="button" className="btn btn-primary btn-sm" onClick={submitWarmupPrompt}>
              Suggest
            </button>
          </div>
          <button
            type="button"
            className="link-btn"
            onClick={() => {
              onAddSet(true)
              setShowWarmupPrompt(false)
            }}
          >
            Just add a blank warm-up set instead
          </button>
        </div>
      )}

      {showRpeInfo && <RpeInfoSheet onClose={() => setShowRpeInfo(false)} />}
      {showLibrary && (
        <ExerciseLibrarySheet
          exerciseId={entry.exerciseId}
          customExercises={customExercises}
          onClose={() => setShowLibrary(false)}
        />
      )}
    </div>
  )
}

export default ExerciseCard
