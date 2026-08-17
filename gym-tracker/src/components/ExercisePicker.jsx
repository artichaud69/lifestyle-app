import { useMemo, useState } from 'react'
import Sheet from './Sheet.jsx'
import { getAllExercises, CATEGORY_LABELS, CATEGORIES, EQUIPMENT, makeCustomExercise } from '../lib/exercises.js'

function ExercisePicker({ customExercises, onPick, onAddCustom, onClose }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [creating, setCreating] = useState(false)
  const [newCategory, setNewCategory] = useState('chest')
  const [newEquipment, setNewEquipment] = useState('barbell')

  const all = useMemo(() => getAllExercises(customExercises), [customExercises])

  const filtered = useMemo(() => {
    return all
      .filter((ex) => category === 'all' || ex.category === category)
      .filter((ex) => ex.name.toLowerCase().includes(query.trim().toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [all, category, query])

  function handleCreate() {
    if (!query.trim()) return
    const exercise = makeCustomExercise(query.trim(), newCategory, newEquipment)
    onAddCustom(exercise)
    onPick(exercise)
  }

  return (
    <Sheet title="Add Exercise" onClose={onClose}>
      <input
        className="search-input"
        type="text"
        placeholder="Search exercises..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus
      />
      <div className="chip-row" style={{ marginBottom: 'var(--space-3)' }}>
        <button type="button" className={`chip${category === 'all' ? ' active' : ''}`} onClick={() => setCategory('all')}>
          All
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`chip${category === cat ? ' active' : ''}`}
            onClick={() => setCategory(cat)}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      <div>
        {filtered.map((ex) => (
          <div key={ex.id} className="exercise-list-item" onClick={() => onPick(ex)}>
            <div>
              <div className="name">{ex.name}</div>
              <div className="meta">
                {CATEGORY_LABELS[ex.category]} · {ex.equipment}
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && !creating && (
          <div className="empty-state" style={{ padding: 'var(--space-4) 0' }}>
            <p>No exercises match "{query}".</p>
            <button type="button" className="btn btn-secondary" onClick={() => setCreating(true)}>
              Create "{query}" as a custom exercise
            </button>
          </div>
        )}
        {creating && (
          <div className="card card-tight">
            <div className="field">
              <label>Category</label>
              <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)}>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {CATEGORY_LABELS[cat]}
                  </option>
                ))}
              </select>
            </div>
            <div className="field" style={{ marginBottom: 'var(--space-3)' }}>
              <label>Equipment</label>
              <select value={newEquipment} onChange={(e) => setNewEquipment(e.target.value)}>
                {EQUIPMENT.map((eq) => (
                  <option key={eq} value={eq}>
                    {eq}
                  </option>
                ))}
              </select>
            </div>
            <button type="button" className="btn btn-primary" onClick={handleCreate}>
              Add "{query}"
            </button>
          </div>
        )}
      </div>
    </Sheet>
  )
}

export default ExercisePicker
