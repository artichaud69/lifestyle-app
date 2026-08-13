import { useState, useRef, useEffect } from 'react'
import HabitHeatmap from './HabitHeatmap.jsx'
import FrequencyPicker from './FrequencyPicker.jsx'
import { todayISO, datesBetween, formatShortLabel } from '../dates.js'

function HabitRow({ name, doneDates, startDate, timesPerWeek, onToggleDate, onUpdateHabit, onDelete }) {
  const [isEditing, setIsEditing] = useState(false)
  const [draftName, setDraftName] = useState(name)
  const [draftStartDate, setDraftStartDate] = useState(startDate)
  const [draftTimesPerWeek, setDraftTimesPerWeek] = useState(timesPerWeek)
  const scrollRef = useRef(null)

  const today = todayISO()
  const dates = datesBetween(startDate, today)

  useEffect(() => {
    // show today by default; the user can scroll left from here back to start date
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth
    }
  }, [])

  function startEditing() {
    setDraftName(name)
    setDraftStartDate(startDate)
    setDraftTimesPerWeek(timesPerWeek)
    setIsEditing(true)
  }

  function handleSave(event) {
    event.preventDefault()
    const trimmed = draftName.trim()
    if (!trimmed) return
    onUpdateHabit({ name: trimmed, startDate: draftStartDate, timesPerWeek: draftTimesPerWeek })
    setIsEditing(false)
  }

  function handleDelete() {
    if (window.confirm(`Delete "${name}"? This can't be undone.`)) {
      onDelete()
    }
  }

  return (
    <div className="habit-card">
      <button type="button" className="habit-name-button" onClick={startEditing}>
        {name} <span className="edit-icon">✎</span>
      </button>

      <div className="habit-ticks-scroll" ref={scrollRef}>
        <div className="habit-ticks-row">
          {dates.map((date) => {
            const checked = doneDates.includes(date)
            const isToday = date === today
            return (
              <div key={date} className="tick-column">
                <span className={`tick-date-label${isToday ? ' today' : ''}`}>{formatShortLabel(date)}</span>
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={checked}
                  aria-label={date}
                  className={`day-toggle${checked ? ' checked' : ''}`}
                  onClick={() => onToggleDate(date)}
                >
                  {checked ? '✓' : ''}
                </button>
              </div>
            )
          })}
        </div>
      </div>

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
            Times per week
            <FrequencyPicker timesPerWeek={draftTimesPerWeek} onChange={setDraftTimesPerWeek} />
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

      <HabitHeatmap startDate={startDate} doneDates={doneDates} timesPerWeek={timesPerWeek} />
    </div>
  )
}

export default HabitRow
