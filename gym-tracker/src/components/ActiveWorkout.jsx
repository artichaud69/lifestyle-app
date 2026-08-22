import { useEffect, useState } from 'react'
import ExerciseCard from './ExerciseCard.jsx'
import ExercisePicker from './ExercisePicker.jsx'
import RestTimer from './RestTimer.jsx'
import { PlusIcon, XIcon } from '../lib/icons.jsx'
import { primeAudio } from '../lib/sound.js'

function elapsedClock(startedAt) {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000))
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

function startedAtClock(startedAt) {
  return new Date(startedAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

function ActiveWorkout({ draft, onChangeDraft, onFinish, onCancel, logs, settings, customExercises, onAddCustomExercise }) {
  const [tick, setTick] = useState(0)
  const [showPicker, setShowPicker] = useState(false)
  const [restTimer, setRestTimer] = useState(null)
  const [confirmCancel, setConfirmCancel] = useState(false)

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(id)
  }, [])

  function patchEntry(entryIndex, patch) {
    const entries = draft.entries.map((entry, i) => (i === entryIndex ? { ...entry, ...patch } : entry))
    onChangeDraft({ ...draft, entries })
  }

  function updateSet(entryIndex, setIndex, field, value) {
    const entry = draft.entries[entryIndex]
    const sets = entry.sets.map((set, i) => (i === setIndex ? { ...set, [field]: value } : set))
    patchEntry(entryIndex, { sets })
  }

  function toggleComplete(entryIndex, setIndex) {
    primeAudio() // real click, the one chance to unlock audio before the rest-over chime needs to fire unattended
    const entry = draft.entries[entryIndex]
    const set = entry.sets[setIndex]
    const willComplete = !set.completed
    const sets = entry.sets.map((s, i) => (i === setIndex ? { ...s, completed: willComplete } : s))
    patchEntry(entryIndex, { sets })
    if (willComplete && !set.isWarmup) {
      const restSeconds = entry.planExercise?.restSeconds ?? settings.restSeconds
      setRestTimer({ total: restSeconds, key: Date.now() })
    } else if (!willComplete) {
      setRestTimer(null)
    }
  }

  function addSet(entryIndex, isWarmup) {
    const entry = draft.entries[entryIndex]
    const previous = entry.sets[entry.sets.length - 1]
    const sets = [
      ...entry.sets,
      { weight: previous?.weight ?? '', reps: isWarmup ? '' : previous?.reps ?? '', rpe: '', completed: false, isWarmup },
    ]
    patchEntry(entryIndex, { sets })
  }

  function removeLastSet(entryIndex) {
    const entry = draft.entries[entryIndex]
    patchEntry(entryIndex, { sets: entry.sets.slice(0, -1) })
  }

  function removeExercise(entryIndex) {
    onChangeDraft({ ...draft, entries: draft.entries.filter((_, i) => i !== entryIndex) })
  }

  function addExercise(exercise) {
    const newEntry = {
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      planExercise: null,
      sets: [{ weight: '', reps: '', rpe: '', completed: false, isWarmup: false }],
    }
    onChangeDraft({ ...draft, entries: [...draft.entries, newEntry] })
    setShowPicker(false)
  }

  void tick

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{draft.sessionName}</h1>
          <div className="session-clock">
            <span className="live-dot" />
            <span className="session-clock-time">{elapsedClock(draft.startedAt)}</span>
            <span className="muted">started {startedAtClock(draft.startedAt)}</span>
          </div>
        </div>
        <div className="top-actions">
          <button type="button" className="icon-btn" onClick={() => setConfirmCancel(true)} aria-label="Cancel workout">
            <XIcon size={18} />
          </button>
        </div>
      </div>

      {confirmCancel && (
        <div className="card" style={{ borderColor: 'var(--color-danger)' }}>
          <p>Discard this workout? Nothing will be saved.</p>
          <div className="btn-block-row">
            <button type="button" className="btn btn-ghost" onClick={() => setConfirmCancel(false)}>
              Keep going
            </button>
            <button type="button" className="btn btn-danger" onClick={onCancel}>
              Discard
            </button>
          </div>
        </div>
      )}

      {draft.entries.map((entry, index) => (
        <ExerciseCard
          key={entry.exerciseId + index}
          entry={entry}
          logs={logs}
          unit={settings.unit}
          onUpdateSet={(setIndex, field, value) => updateSet(index, setIndex, field, value)}
          onToggleComplete={(setIndex) => toggleComplete(index, setIndex)}
          onAddSet={(isWarmup) => addSet(index, isWarmup)}
          onRemoveLastSet={() => removeLastSet(index)}
          onRemoveExercise={() => removeExercise(index)}
        />
      ))}

      {draft.finisherNote && <div className="finisher-note">Optional finisher: {draft.finisherNote}</div>}

      <button type="button" className="btn btn-secondary" style={{ marginBottom: 'var(--space-4)' }} onClick={() => setShowPicker(true)}>
        <PlusIcon size={18} /> Add Exercise
      </button>

      <div className="field">
        <label>Notes (optional)</label>
        <textarea
          value={draft.notes}
          onChange={(e) => onChangeDraft({ ...draft, notes: e.target.value })}
          placeholder="How did it feel? Anything to remember for next time?"
        />
      </div>

      <button type="button" className="btn btn-primary" onClick={onFinish}>
        Finish Workout
      </button>

      {showPicker && (
        <ExercisePicker
          customExercises={customExercises}
          onAddCustom={onAddCustomExercise}
          onPick={addExercise}
          onClose={() => setShowPicker(false)}
        />
      )}

      {restTimer && <RestTimer totalSeconds={restTimer.total} timerKey={restTimer.key} onDone={() => setRestTimer(null)} />}
    </div>
  )
}

export default ActiveWorkout
