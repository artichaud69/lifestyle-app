import Sheet from './Sheet.jsx'
import { findSwapCandidates } from '../lib/exerciseSwap.js'
import { CATEGORY_LABELS } from '../lib/exercises.js'

function SwapExerciseSheet({ exerciseId, exerciseName, customExercises, hasCompletedSets, onPick, onClose }) {
  const candidates = findSwapCandidates(exerciseId, customExercises)

  return (
    <Sheet title={`Swap ${exerciseName}`} onClose={onClose}>
      <p style={{ marginTop: 0 }}>
        Same muscles, different equipment — pick one if what's planned is occupied or unavailable right now.
      </p>

      {hasCompletedSets && (
        <div className="feedback-card warning">
          <p>Swapping clears the sets already logged for this exercise — they belong to a different movement.</p>
        </div>
      )}

      {candidates.length === 0 ? (
        <div className="empty-state" style={{ padding: 'var(--space-4) 0' }}>
          <p style={{ marginBottom: 0 }}>No obvious swap found in the library for this exercise.</p>
        </div>
      ) : (
        <div>
          {candidates.map((exercise) => (
            <div key={exercise.id} className="exercise-list-item" onClick={() => onPick(exercise)}>
              <div>
                <div className="name">{exercise.name}</div>
                <div className="meta">
                  {CATEGORY_LABELS[exercise.category]} · {exercise.equipment}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Sheet>
  )
}

export default SwapExerciseSheet
