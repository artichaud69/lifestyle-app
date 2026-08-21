import { useState } from 'react'
import Sheet from './Sheet.jsx'
import { formatDate } from '../lib/dates.js'
import { totalVolume, formatWorkoutAsText } from '../lib/workout.js'
import { DownloadIcon, CopyIcon } from '../lib/icons.jsx'

function slugify(text) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function downloadWorkout(log, unit) {
  const text = formatWorkoutAsText(log, unit)
  const blob = new Blob([text], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${slugify(log.sessionName)}-${log.date}.txt`
  link.click()
  URL.revokeObjectURL(url)
}

function WorkoutDetailSheet({ log, unit, onClose, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(formatWorkoutAsText(log, unit))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      downloadWorkout(log, unit)
    }
  }

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

      <div className="field">
        <label>Share this workout</label>
        <p style={{ marginTop: 0 }}>
          Export it as plain text — ready to paste into an AI chatbot for feedback, or save for your records.
        </p>
        <div className="btn-block-row">
          <button type="button" className="btn btn-secondary" onClick={() => downloadWorkout(log, unit)}>
            <DownloadIcon size={17} /> Download
          </button>
          <button type="button" className="btn btn-secondary" onClick={handleCopy}>
            <CopyIcon size={16} /> {copied ? 'Copied!' : 'Copy Text'}
          </button>
        </div>
      </div>

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
