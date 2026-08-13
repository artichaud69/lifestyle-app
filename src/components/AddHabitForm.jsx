import { useState } from 'react'

function AddHabitForm({ onAdd }) {
  const [name, setName] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    onAdd(trimmed)
    setName('')
  }

  return (
    <form onSubmit={handleSubmit} className="add-form">
      <input
        type="text"
        className="text-input"
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="New habit name"
      />
      <button type="submit" className="button button-primary">
        Add
      </button>
    </form>
  )
}

export default AddHabitForm
