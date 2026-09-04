import { useEffect, useState } from 'react'
import ExerciseCard from './ExerciseCard.jsx'
import ExercisePicker from './ExercisePicker.jsx'
import RestTimer from './RestTimer.jsx'
import { PlusIcon, XIcon } from '../lib/icons.jsx'
import { primeAudio } from '../lib/sound.js'
import { groupLabels, isLastInGroup } from '../lib/superset.js'
import { suggestWarmupSets } from '../lib/warmup.js'
import { moveItemById } from '../lib/reorder.js'

// Real rest happens only after the last exercise in a superset round; the
// handoff between paired exercises just needs enough time to walk to the
// next station or change the weight, not a full rest period.
const SUPERSET_TRANSITION_SECONDS = 15

const getEntryGroup = (entry) => entry.planExercise?.supersetGroup

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

function renderCard(entry, index, handlers) {
  const { logs, unit, customExercises, updateSet, toggleComplete, addSet, addWarmup, removeLastSet, removeExercise, moveExercise, entryCount } = handlers
  return (
    <ExerciseCard
      key={entry.exerciseId}
      entry={entry}
      logs={logs}
      unit={unit}
      customExercises={customExercises}
      onUpdateSet={(setIndex, field, value) => updateSet(index, setIndex, field, value)}
      onToggleComplete={(setIndex) => toggleComplete(index, setIndex)}
      onAddSet={(isWarmup) => addSet(index, isWarmup)}
      onAddWarmup={(weightOverride) => addWarmup(index, weightOverride)}
      onRemoveLastSet={() => removeLastSet(index)}
      onRemoveExercise={() => removeExercise(index)}
      onMoveUp={() => moveExercise(entry.exerciseId, 'up')}
      onMoveDown={() => moveExercise(entry.exerciseId, 'down')}
      canMoveUp={index > 0}
      canMoveDown={index < entryCount - 1}
    />
  )
}

// Clusters consecutive entries sharing a supersetGroup so they render inside
// one labeled wrapper ("Superset A") instead of scattered among the other
// exercise cards — linking only matters visually if the linked exercises
// actually sit next to each other.
function renderEntryBlocks(entries, handlers) {
  const labels = groupLabels(entries.map((e) => ({ supersetGroup: getEntryGroup(e) })))
  const blocks = []
  let i = 0
  while (i < entries.length) {
    const group = getEntryGroup(entries[i])
    if (!group) {
      blocks.push({ type: 'single', index: i })
      i++
      continue
    }
    const start = i
    while (i < entries.length && getEntryGroup(entries[i]) === group) i++
    blocks.push({ type: 'group', group, indices: Array.from({ length: i - start }, (_, k) => start + k) })
  }

  return blocks.map((block) => {
    if (block.type === 'single') {
      return renderCard(entries[block.index], block.index, handlers)
    }
    return (
      <div key={block.group} className="superset-group">
        <div className="superset-group-label">Superset {labels.get(block.group)}</div>
        {block.indices.map((index) => renderCard(entries[index], index, handlers))}
      </div>
    )
  })
}

function ActiveWorkout({ draft, onChangeDraft, onFinish, onCancel, logs, settings, customExercises, onAddCustomExercise }) {
  const [tick, setTick] = useState(0)
  const [showPicker, setShowPicker] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)

  useEffect(() => {
    const bump = () => setTick((t) => t + 1)
    const id = setInterval(bump, 1000)
    // A locked screen or backgrounded tab throttles/suspends the interval,
    // so the displayed elapsed time can lag; force an immediate refresh the
    // moment the app is actually visible again instead of waiting up to 1s.
    document.addEventListener('visibilitychange', bump)
    window.addEventListener('focus', bump)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', bump)
      window.removeEventListener('focus', bump)
    }
  }, [])

  // Every mutation below goes through onChangeDraft's *functional* setState
  // form (prev => ...), never `{ ...draft, ... }` off the closed-over
  // `draft` variable. Two taps landing in the same React batch (a laggy
  // re-render tempting a real double-tap, or a touch device's occasional
  // double-fire) would otherwise both compute their result from the same
  // stale snapshot — the second call silently overwrites the first's
  // effect instead of compounding it, which is exactly what a dropped or
  // "reverted" reorder looks like.
  function patchEntry(entryIndex, patchOrFn) {
    onChangeDraft((prev) => ({
      ...prev,
      entries: prev.entries.map((entry, i) => {
        if (i !== entryIndex) return entry
        const patch = typeof patchOrFn === 'function' ? patchOrFn(entry) : patchOrFn
        return { ...entry, ...patch }
      }),
    }))
  }

  function updateSet(entryIndex, setIndex, field, value) {
    patchEntry(entryIndex, (entry) => ({
      sets: entry.sets.map((set, i) => (i === setIndex ? { ...set, [field]: value } : set)),
    }))
  }

  function toggleComplete(entryIndex, setIndex) {
    primeAudio() // real click, the one chance to unlock audio before the rest-over chime needs to fire unattended
    onChangeDraft((prev) => {
      const entry = prev.entries[entryIndex]
      const set = entry.sets[setIndex]
      const willComplete = !set.completed
      const sets = entry.sets.map((s, i) => (i === setIndex ? { ...s, completed: willComplete } : s))
      const entries = prev.entries.map((e, i) => (i === entryIndex ? { ...e, sets } : e))

      // Rest is a real end-timestamp on the persisted draft, not component
      // state — it has to survive the app being backgrounded, the phone
      // locked, or the tab fully reloaded, and still show the true remaining
      // time (see RestTimer.jsx).
      let rest = prev.rest
      if (willComplete && !set.isWarmup) {
        const last = isLastInGroup(prev.entries, entryIndex, getEntryGroup)
        const restSeconds = last ? entry.planExercise?.restSeconds ?? settings.restSeconds : SUPERSET_TRANSITION_SECONDS
        const now = Date.now()
        rest = { startedAt: now, endsAt: now + restSeconds * 1000 }
      } else if (!willComplete) {
        rest = null
      }

      return { ...prev, entries, rest }
    })
  }

  function addSet(entryIndex, isWarmup) {
    patchEntry(entryIndex, (entry) => {
      const previous = entry.sets[entry.sets.length - 1]
      return {
        sets: [
          ...entry.sets,
          { weight: previous?.weight ?? '', reps: isWarmup ? '' : previous?.reps ?? '', rpe: '', completed: false, isWarmup },
        ],
      }
    })
  }

  // First tap with no warm-ups yet: fill in a full percentage-based ramp at
  // once, using (in priority order) an explicit weightOverride from the
  // "what are you working up to?" prompt (see ExerciseCard), a weight
  // already typed into a working set, or the coach's suggestion. Once
  // warm-ups exist, it falls back to just adding one blank warm-up set.
  // The branch decision (ramp vs blank set) reads the current entry from
  // `draft` directly, which is fine — it only picks which computation
  // runs, and the actual write still goes through patchEntry's functional
  // updater either way.
  function addWarmup(entryIndex, weightOverride) {
    const entry = draft.entries[entryIndex]
    const hasWarmup = entry.sets.some((set) => set.isWarmup)
    if (!hasWarmup) {
      const typedWeight = entry.sets.find((set) => !set.isWarmup && Number(set.weight) > 0)?.weight
      const referenceWeight = Number(weightOverride) || Number(typedWeight) || Number(entry.planExercise?.targetWeight) || 0
      const ramp = suggestWarmupSets(referenceWeight, settings.unit)
      if (ramp.length > 0) {
        patchEntry(entryIndex, (e) => ({ sets: [...ramp, ...e.sets] }))
        return
      }
    }
    addSet(entryIndex, true)
  }

  function removeLastSet(entryIndex) {
    patchEntry(entryIndex, (entry) => ({ sets: entry.sets.slice(0, -1) }))
  }

  function removeExercise(entryIndex) {
    onChangeDraft((prev) => ({ ...prev, entries: prev.entries.filter((_, i) => i !== entryIndex) }))
  }

  // Reordering only moves the exercise itself; a superset pairing that
  // becomes non-adjacent as a result loses its visual grouping box here
  // (see renderEntryBlocks) but rest-timing logic still tracks the real
  // last-in-group member correctly regardless of adjacency.
  // Keyed by exerciseId (unique per entry, guarded in addExercise below)
  // rather than a numeric index — a card's onMoveUp/onMoveDown closure
  // captures whatever index was true at the render that created it, and
  // two taps landing before a re-render would both act on that same
  // stale index, swapping the same two slots twice and canceling back to
  // the start instead of compounding into a two-step move.
  function moveExercise(exerciseId, direction) {
    onChangeDraft((prev) => ({ ...prev, entries: moveItemById(prev.entries, exerciseId, direction, (e) => e.exerciseId) }))
  }

  function addExercise(exercise) {
    // Already logging this one this session — add another set to the
    // existing card instead of a second card, which used to split its sets
    // across two entries (and drop the second half from history).
    const existingIndex = draft.entries.findIndex((entry) => entry.exerciseId === exercise.id)
    if (existingIndex !== -1) {
      addSet(existingIndex, false)
      setShowPicker(false)
      return
    }
    const newEntry = {
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      planExercise: null,
      sets: [{ weight: '', reps: '', rpe: '', completed: false, isWarmup: false }],
    }
    onChangeDraft((prev) => ({ ...prev, entries: [...prev.entries, newEntry] }))
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

      {renderEntryBlocks(draft.entries, {
        logs,
        unit: settings.unit,
        customExercises,
        updateSet,
        toggleComplete,
        addWarmup,
        addSet,
        removeLastSet,
        removeExercise,
        moveExercise,
        entryCount: draft.entries.length,
      })}

      {draft.finisherNote && <div className="finisher-note">Optional finisher: {draft.finisherNote}</div>}

      <button type="button" className="btn btn-secondary" style={{ marginBottom: 'var(--space-4)' }} onClick={() => setShowPicker(true)}>
        <PlusIcon size={18} /> Add Exercise
      </button>

      <div className="field">
        <label>Notes (optional)</label>
        <textarea
          value={draft.notes}
          onChange={(e) => {
            const notes = e.target.value
            onChangeDraft((prev) => ({ ...prev, notes }))
          }}
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

      {draft.rest && (
        <RestTimer
          rest={draft.rest}
          onDone={() => onChangeDraft((prev) => ({ ...prev, rest: null }))}
          onExtend={() => onChangeDraft((prev) => ({ ...prev, rest: { ...prev.rest, endsAt: prev.rest.endsAt + 30000 } }))}
          onSkip={() => onChangeDraft((prev) => ({ ...prev, rest: { ...prev.rest, endsAt: Date.now() } }))}
        />
      )}
    </div>
  )
}

export default ActiveWorkout
