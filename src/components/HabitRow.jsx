import { useState } from 'react'
import HabitHeatmap from './HabitHeatmap.jsx'
import SchedulePicker from './SchedulePicker.jsx'
import { todayISO } from '../dates.js'
import { isScheduled } from '../schedule.js'

function HabitRow({ name, dates, doneDates, startDate, schedule, onToggleDate, onUpdateHabit, onDelete }) {
  const [isEditing, setIsEditing] = useState(false)
  const [draftName, setDraftName] = useState(name)
  const [draftStartDate, setDraftStartDate] = useState(startDate)
  const [draftSchedule, setDraftSchedule] = useState(schedule)

  function startEditing() {
    setDraftName(name)
    setDraftStartDate(startDate)
    setDraftSchedule(schedule)
    setIsEditing(true)
  }

  function handleSave(event) {
    event.preventDefault()
    const trimmed = draftName.trim()
    if (!trimmed || draftSchedule.length === 0) return
    onUpdateHabit({ name: trimmed, startDate: draftStartDate, schedule: draftSchedule })
    setIsEditing(false)
  }

  function handleDelete() {
    if (window.confirm(`Delete "${name}"? This can't be undone.`)) {
      onDelete()
    }
  }

  return (
    <>
      <button type="button" className="habit-name-button" onClick={startEditing}>
        {name} <span className="edit-icon">✎</span>
      </button>
      {dates.map((date) =>
        isScheduled(date, schedule) ? (
          <input
            key={date}
            type="checkbox"
            className="day-checkbox"
            checked={doneDates.includes(date)}
            onChange={() => onToggleDate(date)}
          />
        ) : (
          <div key={date} className="day-checkbox day-checkbox-na" aria-hidden="true" />
        ),
      )}
      {isEditing && (
        <form onSubmit={handleSave} className="edit-panel">
          <input
            type="text"
            className="text-input"
            value={draftName}
            onChange={(event) => setDraftName(event.target.value)}
            placeholder="Habit name"
          />
          <label className="field-label">
            Start date
            <input
              type="date"
              className="text-input"
              value={draftStartDate}
              max={todayISO()}
              onChange={(event) => setDraftStartDate(event.target.value)}
            />
          </label>
          <div className="field-label">
            Days
            <SchedulePicker schedule={draftSchedule} onChange={setDraftSchedule} />
          </div>
          <div className="button-row">
            <button type="submit" className="button button-primary">
              Save
            </button>
            <button type="button" className="button button-secondary" onClick={() => setIsEditing(false)}>
              Cancel
            </button>
            <button type="button" className="button button-danger" onClick={handleDelete}>
              Delete
            </button>
          </div>
        </form>
      )}
      <HabitHeatmap startDate={startDate} doneDates={doneDates} schedule={schedule} />
    </>
  )
}

export default HabitRow
