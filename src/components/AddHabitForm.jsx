import { useState } from 'react'
import { Plus } from 'lucide-react'
import IconButton from './ui/IconButton.jsx'
import { todayISO } from '../dates.js'
import { DAILY } from '../frequency.js'
import FrequencyPicker from './FrequencyPicker.jsx'

function AddHabitForm({ onAdd }) {
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState('')
  const [startDate, setStartDate] = useState(todayISO())
  const [timesPerWeek, setTimesPerWeek] = useState(DAILY)

  function openModal() {
    setName('')
    setStartDate(todayISO())
    setTimesPerWeek(DAILY)
    setIsOpen(true)
  }

  function handleSubmit(event) {
    event.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    onAdd(trimmed, startDate, timesPerWeek)
    setIsOpen(false)
  }

  return (
    <>
      <IconButton label="Add habit" icon={Plus} variant="btn-icon-accent" size={20} onClick={openModal} />
      {isOpen && (
        <div className="modal-overlay">
          <form onSubmit={handleSubmit} className="modal-card">
            <input
              type="text"
              className="text-input"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Habit name"
              autoFocus
            />
            <label className="field-label">
              Start date
              <input
                type="date"
                className="text-input"
                value={startDate}
                max={todayISO()}
                onChange={(event) => setStartDate(event.target.value)}
              />
            </label>
            <div className="field-label">
              Times per week
              <FrequencyPicker timesPerWeek={timesPerWeek} onChange={setTimesPerWeek} />
            </div>
            <div className="button-row">
              <button type="submit" className="btn btn-primary">
                Add
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setIsOpen(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}

export default AddHabitForm
