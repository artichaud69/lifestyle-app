import { useState } from 'react'
import Sheet from './Sheet.jsx'
import ExercisePicker from './ExercisePicker.jsx'
import { TrashIcon, PlusIcon, LinkIcon, UnlinkIcon } from '../lib/icons.jsx'
import { findExercise } from '../lib/exercises.js'
import { genId } from '../lib/id.js'
import { groupLabels, linkExercises, unlinkExercise } from '../lib/superset.js'

function SessionEditSheet({ session, customExercises, onAddCustomExercise, onSave, onClose }) {
  const [exercises, setExercises] = useState(session.exercises)
  const [showPicker, setShowPicker] = useState(false)
  const [linkingId, setLinkingId] = useState(null)

  function updateField(index, field, value) {
    setExercises(exercises.map((ex, i) => (i === index ? { ...ex, [field]: value } : ex)))
  }

  function removeExercise(index) {
    const id = exercises[index].id
    setExercises(unlinkExercise(exercises, id).filter((ex) => ex.id !== id))
    if (linkingId === id) setLinkingId(null)
  }

  function addExercise(exercise) {
    setExercises([
      ...exercises,
      {
        id: genId(),
        exerciseId: exercise.id,
        targetSets: 3,
        repsMin: 8,
        repsMax: 12,
        targetRPE: 7,
        targetWeight: null,
        progression: 'double',
        restSeconds: 90,
        supersetGroup: null,
      },
    ])
    setShowPicker(false)
  }

  function handleLinkClick(ex) {
    if (ex.supersetGroup) {
      setExercises(unlinkExercise(exercises, ex.id))
      return
    }
    if (linkingId === null) {
      setLinkingId(ex.id)
      return
    }
    if (linkingId === ex.id) {
      setLinkingId(null)
      return
    }
    setExercises(linkExercises(exercises, linkingId, ex.id))
    setLinkingId(null)
  }

  const labels = groupLabels(exercises)

  return (
    <Sheet title={`Edit ${session.name}`} onClose={onClose}>
      <p style={{ marginTop: 0 }}>
        {linkingId
          ? 'Tap the link icon on another exercise to pair it as a superset — or tap it again to cancel.'
          : 'Tap the link icon on two exercises to pair them as a superset (minimal rest between them, full rest after the last one).'}
      </p>

      {exercises.map((ex, index) => {
        const info = findExercise(ex.exerciseId, customExercises)
        const label = ex.supersetGroup ? labels.get(ex.supersetGroup) : null
        return (
          <div
            key={ex.id}
            className="card card-tight"
            style={{ borderColor: linkingId === ex.id ? 'var(--color-primary)' : undefined }}
          >
            <div className="card-title-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <strong>{info?.name ?? ex.exerciseId}</strong>
                {label && <span className="badge primary">Superset {label}</span>}
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => handleLinkClick(ex)}
                  aria-label={ex.supersetGroup ? 'Unlink from superset' : 'Link as superset'}
                  style={{ color: ex.supersetGroup || linkingId === ex.id ? 'var(--color-primary)' : undefined }}
                >
                  {ex.supersetGroup ? <UnlinkIcon size={16} /> : <LinkIcon size={16} />}
                </button>
                <button type="button" className="icon-btn" onClick={() => removeExercise(index)} aria-label="Remove">
                  <TrashIcon size={16} />
                </button>
              </div>
            </div>
            <div className="set-table-head" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
              <span>Sets</span>
              <span>Min reps</span>
              <span>Max reps</span>
            </div>
            <div className="set-row" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
              <input type="number" value={ex.targetSets} onChange={(e) => updateField(index, 'targetSets', Number(e.target.value))} />
              <input type="number" value={ex.repsMin} onChange={(e) => updateField(index, 'repsMin', Number(e.target.value))} />
              <input type="number" value={ex.repsMax} onChange={(e) => updateField(index, 'repsMax', Number(e.target.value))} />
            </div>
          </div>
        )
      })}

      <button type="button" className="btn btn-secondary" onClick={() => setShowPicker(true)}>
        <PlusIcon size={18} /> Add Exercise
      </button>

      <button type="button" className="btn btn-primary" style={{ marginTop: 'var(--space-3)' }} onClick={() => onSave({ ...session, exercises })}>
        Save Changes
      </button>

      {showPicker && (
        <ExercisePicker
          customExercises={customExercises}
          onAddCustom={onAddCustomExercise}
          onPick={addExercise}
          onClose={() => setShowPicker(false)}
        />
      )}
    </Sheet>
  )
}

export default SessionEditSheet
