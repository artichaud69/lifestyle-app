const OPTIONS = [1, 2, 3, 4, 5, 6, 7]

function FrequencyPicker({ timesPerWeek, onChange }) {
  return (
    <div className="frequency-picker">
      {OPTIONS.map((n) => (
        <button
          key={n}
          type="button"
          aria-pressed={n === timesPerWeek}
          className={`frequency-option${n === timesPerWeek ? ' is-active' : ''}`}
          onClick={() => onChange(n)}
        >
          {n}
        </button>
      ))}
    </div>
  )
}

export default FrequencyPicker
