import { useState } from 'react'
import { todayISO } from '../dates.js'

function AddHabitForm({ onAdd }) {
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState('')
  const [startDate, setStartDate] = useState(todayISO())

  function openModal() {
    setName('')
    setStartDate(todayISO())
    setIsOpen(true)
  }

  function handleSubmit(event) {
    event.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    onAdd(trimmed, startDate)
    setIsOpen(false)
  }

  return (
    <>
      <button type="button" className="icon-button" onClick={openModal} aria-label="Add habit">
        +
      </button>
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
            <div className="button-row">
              <button type="submit" className="button button-primary">
                Add
              </button>
              <button type="button" className="button button-secondary" onClick={() => setIsOpen(false)}>
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
