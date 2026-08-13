import { useState } from 'react'
import HabitHeatmap from './HabitHeatmap.jsx'
import { todayISO } from '../dates.js'

function HabitRow({ name, dates, doneDates, startDate, onToggleDate, onUpdateHabit, onDelete }) {
  const [isEditing, setIsEditing] = useState(false)
  const [draftName, setDraftName] = useState(name)
  const [draftStartDate, setDraftStartDate] = useState(startDate)

  function startEditing() {
    setDraftName(name)
    setDraftStartDate(startDate)
    setIsEditing(true)
  }

  function handleSave(event) {
    event.preventDefault()
    const trimmed = draftName.trim()
    if (!trimmed) return
    onUpdateHabit({ name: trimmed, startDate: draftStartDate })
    setIsEditing(false)
  }

  function handleDelete() {
    if (window.confirm(`Delete "${name}"? This can't be undone.`)) {
      onDelete()
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={startEditing}
        style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          textAlign: 'left',
          background: 'none',
          border: 'none',
          padding: 0,
          font: 'inherit',
          color: 'inherit',
          cursor: 'pointer',
        }}
      >
        {name} <span style={{ fontSize: '10px' }}>✎</span>
      </button>
      {dates.map((date) => (
        <input
          key={date}
          type="checkbox"
          checked={doneDates.includes(date)}
          onChange={() => onToggleDate(date)}
          style={{ justifySelf: 'center' }}
        />
      ))}
      {isEditing && (
        <form
          onSubmit={handleSave}
          style={{
            gridColumn: '1 / -1',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            padding: '8px',
            marginBottom: '4px',
            border: '1px solid #ddd',
            borderRadius: '6px',
          }}
        >
          <input
            type="text"
            value={draftName}
            onChange={(event) => setDraftName(event.target.value)}
            placeholder="Habit name"
          />
          <label style={{ fontSize: '12px', color: '#555' }}>
            Start date
            <input
              type="date"
              value={draftStartDate}
              max={todayISO()}
              onChange={(event) => setDraftStartDate(event.target.value)}
              style={{ display: 'block', marginTop: '2px' }}
            />
          </label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <button type="submit">Save</button>
            <button type="button" onClick={() => setIsEditing(false)}>
              Cancel
            </button>
            <button type="button" onClick={handleDelete} style={{ color: '#b3261e', marginLeft: 'auto' }}>
              Delete
            </button>
          </div>
        </form>
      )}
      <div style={{ gridColumn: '1 / -1' }}>
        <HabitHeatmap startDate={startDate} doneDates={doneDates} />
      </div>
    </>
  )
}

export default HabitRow
