import { MOODS } from '../journal.js'

// A segmented selector rather than five equally prominent boxes. The flame
// artwork stays, normalised to one size so the row reads as a scale.
function MoodSelector({ value, onSelect }) {
  const base = import.meta.env.BASE_URL

  return (
    <div className="mood-segment" role="radiogroup" aria-label="How do you feel today?">
      {MOODS.map((mood) => {
        const active = value === mood.value
        return (
          <button
            key={mood.value}
            type="button"
            role="radio"
            aria-checked={active}
            className={`mood-option${active ? ' is-active' : ''}`}
            onClick={() => onSelect(mood.value)}
          >
            <img src={`${base}icons/flame-${mood.value}.png`} alt="" />
            <span>{mood.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export default MoodSelector
