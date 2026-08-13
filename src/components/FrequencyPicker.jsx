const OPTIONS = [1, 2, 3, 4, 5, 6, 7]

function FrequencyPicker({ timesPerWeek, onChange }) {
  return (
    <div className="frequency-picker">
      {OPTIONS.map((n) => (
        <button
          key={n}
          type="button"
          className={`frequency-option${n === timesPerWeek ? ' active' : ''}`}
          onClick={() => onChange(n)}
        >
          {n}
        </button>
      ))}
    </div>
  )
}

export default FrequencyPicker
