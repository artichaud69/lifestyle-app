import { useState } from 'react'
import Sheet from './Sheet.jsx'
import ExercisePicker from './ExercisePicker.jsx'
import { TrashIcon, PlusIcon } from '../lib/icons.jsx'
import { findExercise } from '../lib/exercises.js'
import { genId } from '../lib/id.js'

function SessionEditSheet({ session, customExercises, onAddCustomExercise, onSave, onClose }) {
  const [exercises, setExercises] = useState(session.exercises)
  const [showPicker, setShowPicker] = useState(false)

  function updateField(index, field, value) {
    setExercises(exercises.map((ex, i) => (i === index ? { ...ex, [field]: value } : ex)))
  }

  function removeExercise(index) {
    setExercises(exercises.filter((_, i) => i !== index))
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
      },
    ])
    setShowPicker(false)
  }

  return (
    <Sheet title={`Edit ${session.name}`} onClose={onClose}>
      {exercises.map((ex, index) => {
        const info = findExercise(ex.exerciseId, customExercises)
        return (
          <div key={ex.id} className="card card-tight">
            <div className="card-title-row">
              <strong>{info?.name ?? ex.exerciseId}</strong>
              <button type="button" className="icon-btn" onClick={() => removeExercise(index)} aria-label="Remove">
                <TrashIcon size={16} />
              </button>
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
