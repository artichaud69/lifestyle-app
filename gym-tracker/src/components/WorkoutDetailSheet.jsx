import { useState } from 'react'
import Sheet from './Sheet.jsx'
import { formatDate } from '../lib/dates.js'
import { totalVolume } from '../lib/workout.js'

function WorkoutDetailSheet({ log, unit, onClose, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <Sheet title={log.sessionName} onClose={onClose}>
      <p style={{ marginTop: -8 }}>{formatDate(log.date)}</p>

      {log.entries.map((entry, i) => (
        <div key={i} className="card card-tight">
          <div className="card-title-row">
            <h3>{entry.exerciseName}</h3>
            <span className="muted">{Math.round(totalVolume(entry.sets)).toLocaleString()} {unit} vol</span>
          </div>
          {entry.sets.filter((s) => s.completed).map((set, j) => (
            <div key={j} className="ex-name" style={{ borderTop: j === 0 ? 'none' : undefined }}>
              <span>{set.isWarmup ? 'Warm-up' : `Set ${j + 1}`}</span>
              <span>
                {set.weight}
                {unit} × {set.reps}
                {set.rpe ? ` @ RPE ${set.rpe}` : ''}
              </span>
            </div>
          ))}
        </div>
      ))}

      {log.notes && (
        <div className="card card-tight">
          <h3>Notes</h3>
          <p style={{ margin: 0 }}>{log.notes}</p>
        </div>
      )}

      {!confirmDelete ? (
        <button type="button" className="link-btn danger" onClick={() => setConfirmDelete(true)}>
          Delete this workout
        </button>
      ) : (
        <div className="btn-block-row">
          <button type="button" className="btn btn-ghost" onClick={() => setConfirmDelete(false)}>
            Cancel
          </button>
          <button type="button" className="btn btn-danger" onClick={() => onDelete(log.id)}>
            Confirm Delete
          </button>
        </div>
      )}
    </Sheet>
  )
}

export default WorkoutDetailSheet
