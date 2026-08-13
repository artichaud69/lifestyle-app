import { useState } from 'react'
import { MOODS } from '../journal.js'
import FlameIcon from './FlameIcon.jsx'
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
        <div className="modal-title">{formatShortLabel(date)}</div>
        <div className="mood-picker">
          {MOODS.map((moodOption) => (
            <button
              key={moodOption.value}
              type="button"
              className={`mood-option${mood === moodOption.value ? ' active' : ''}`}
              onClick={() => setMood(moodOption.value)}
              aria-label={moodOption.label}
            >
              <FlameIcon level={moodOption.value} />
            </button>
          ))}
        </div>
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
          <button type="submit" className="button button-primary">
            Save
          </button>
          <button type="button" className="button button-secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default JournalDayModal
