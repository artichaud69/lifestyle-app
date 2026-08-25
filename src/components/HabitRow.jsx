import { useState } from 'react'
import { Pencil } from 'lucide-react'
import HabitWeek from './HabitWeek.jsx'
import HabitHeatmap from './HabitHeatmap.jsx'
import FrequencyPicker from './FrequencyPicker.jsx'
import Button from './ui/Button.jsx'
import IconButton from './ui/IconButton.jsx'
import { todayISO, startOfWeek, addDays } from '../dates.js'
import { WEEK_STARTS_ON, weeklyCompletionPercent } from '../frequency.js'
import { currentStreak, bestStreak } from '../streaks.js'

function HabitRow({ name, doneDates, startDate, timesPerWeek, onToggleDate, onUpdateHabit, onDelete }) {
  const today = todayISO()
  const thisWeek = startOfWeek(today, WEEK_STARTS_ON)

  const [isEditing, setIsEditing] = useState(false)
  const [weekStart, setWeekStart] = useState(thisWeek)
  const [draftName, setDraftName] = useState(name)
  const [draftStartDate, setDraftStartDate] = useState(startDate)
  const [draftTimesPerWeek, setDraftTimesPerWeek] = useState(timesPerWeek)

  const streak = currentStreak(startDate, doneDates, timesPerWeek)
  const best = bestStreak(startDate, doneDates, timesPerWeek)
  const percent = weeklyCompletionPercent(startDate, doneDates, timesPerWeek)

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
    <article className="habit-card">
      <div className="habit-card-head">
        <h3 className="habit-name">{name}</h3>
        <IconButton label={`Edit ${name}`} icon={Pencil} onClick={startEditing} />
      </div>

      <div className="section">
        <HabitWeek
          weekStart={weekStart}
          doneDates={doneDates}
          startDate={startDate}
          onToggleDate={onToggleDate}
          onNavigate={(delta) => setWeekStart(addDays(weekStart, delta * 7))}
          canGoNext={weekStart < thisWeek}
        />
      </div>

      <div className="habit-stats">
        <div className="habit-stat">
          <span className="habit-stat-value">{streak}</span>
          <span className="caption">Current streak</span>
        </div>
        <div className="habit-stat">
          <span className="habit-stat-value">{best}</span>
          <span className="caption">Best</span>
        </div>
        <div className="habit-stat">
          <span className="habit-stat-value">{timesPerWeek}× / week</span>
          <span className="caption">Target · {percent}%</span>
        </div>
      </div>

      <div className="section">
        <span className="label-sm">Last 4 weeks</span>
        <HabitHeatmap doneDates={doneDates} startDate={startDate} />
      </div>

      {isEditing && (
        <form onSubmit={handleSave} className="edit-panel">
          <label className="field-label">
            Name
            <input
              type="text"
              className="text-input"
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
              placeholder="Habit name"
            />
          </label>
          <label className="field-label">
            Start date
            <input
              type="date"
              className="text-input"
              value={draftStartDate}
              max={today}
              onChange={(event) => setDraftStartDate(event.target.value)}
            />
          </label>
          <div className="field-label">
            Times per week
            <FrequencyPicker timesPerWeek={draftTimesPerWeek} onChange={setDraftTimesPerWeek} />
          </div>
          <div className="button-row">
            <Button type="submit" variant="primary">
              Save
            </Button>
            <Button onClick={() => setIsEditing(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </form>
      )}
    </article>
  )
}

export default HabitRow
