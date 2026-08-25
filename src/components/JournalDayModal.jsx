import { useState } from 'react'
import MoodSelector from './MoodSelector.jsx'
import { formatShortLabel } from '../dates.js'

function JournalDayModal({ date, entry, onSave, onClose }) {
  const [mood, setMood] = useState(entry?.mood ?? null)
  const [note, setNote] = useState(entry?.note ?? '')

  function handleSubmit(event) {
    event.preventDefault()
    if (mood === null) return
    onSave(date, { mood, note: note.trim() })
    onClose()
  }

  return (
    <div className="modal-overlay">
      <form onSubmit={handleSubmit} className="modal-card">
        <div className="display-md">{formatShortLabel(date)}</div>
        <MoodSelector value={mood} onSelect={setMood} />
        <label className="field-label">
          Note
          <textarea
            className="text-input"
            rows={3}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Optional note..."
          />
        </label>
        <div className="button-row">
          <button type="submit" className="btn btn-primary">
            Save
          </button>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default JournalDayModal
