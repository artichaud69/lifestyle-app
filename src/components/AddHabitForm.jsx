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
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px', margin: '16px 0' }}>
      <input
        type="text"
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="New habit name"
      />
      <button type="submit">Add</button>
    </form>
  )
}

export default AddHabitForm
