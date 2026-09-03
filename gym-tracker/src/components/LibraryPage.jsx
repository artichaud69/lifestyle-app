import { useMemo, useState } from 'react'
import PageHeader from './PageHeader.jsx'
import ExerciseLibrarySheet from './ExerciseLibrarySheet.jsx'
import { BookIcon, ChevronRightIcon } from '../lib/icons.jsx'
import { getAllExercises, CATEGORIES, CATEGORY_LABELS } from '../lib/exercises.js'

function LibraryPage({ customExercises }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [openExerciseId, setOpenExerciseId] = useState(null)

  const all = useMemo(() => getAllExercises(customExercises), [customExercises])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return all
      .filter((ex) => category === 'all' || ex.category === category)
      .filter((ex) => ex.name.toLowerCase().includes(q))
  }, [all, category, query])

  // With no category chosen, group results into a section per muscle group
  // (in a fixed, sensible order) so browsing the full list isn't just one
  // giant alphabetical wall — each section is itself alphabetical inside.
  const groups = useMemo(() => {
    if (category !== 'all') {
      return [{ key: category, label: CATEGORY_LABELS[category] ?? category, exercises: [...filtered].sort((a, b) => a.name.localeCompare(b.name)) }]
    }
    return CATEGORIES.map((cat) => ({
      key: cat,
      label: CATEGORY_LABELS[cat] ?? cat,
      exercises: filtered.filter((ex) => ex.category === cat).sort((a, b) => a.name.localeCompare(b.name)),
    })).filter((g) => g.exercises.length > 0)
  }, [filtered, category])

  return (
    <div>
      <PageHeader title="Library" />

      <input
        className="search-input"
        type="text"
        placeholder="Search exercises..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="chip-row chip-row-scroll" style={{ marginBottom: 'var(--space-3)' }}>
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

      {groups.length === 0 && (
        <div className="card empty-state">
          <BookIcon size={36} />
          <h3>No exercises match</h3>
          <p>Try a different search term or category.</p>
        </div>
      )}

      {groups.map((group) => (
        <div key={group.key} style={{ marginBottom: 'var(--space-4)' }}>
          {category === 'all' && <div className="library-group-label">{group.label}</div>}
          <div className="card card-tight">
            {group.exercises.map((ex) => (
              <div key={ex.id} className="exercise-list-item" onClick={() => setOpenExerciseId(ex.id)}>
                <div>
                  <div className="name">{ex.name}</div>
                  <div className="meta">{ex.equipment}</div>
                </div>
                <ChevronRightIcon size={18} />
              </div>
            ))}
          </div>
        </div>
      ))}

      {openExerciseId && (
        <ExerciseLibrarySheet
          exerciseId={openExerciseId}
          customExercises={customExercises}
          onClose={() => setOpenExerciseId(null)}
        />
      )}
    </div>
  )
}

export default LibraryPage
