import { DAY_LABELS } from '../schedule.js'

function SchedulePicker({ schedule, onChange }) {
  function toggleDay(day) {
    if (schedule.includes(day)) {
      onChange(schedule.filter((d) => d !== day))
    } else {
      onChange([...schedule, day].sort())
    }
  }

  return (
    <div className="schedule-picker">
      {DAY_LABELS.map((label, day) => (
        <button
          key={day}
          type="button"
          className={`day-toggle${schedule.includes(day) ? ' active' : ''}`}
          onClick={() => toggleDay(day)}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

export default SchedulePicker
