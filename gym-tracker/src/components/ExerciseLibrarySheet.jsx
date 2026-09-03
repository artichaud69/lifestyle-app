import { findExercise } from '../lib/exercises.js'
import { getLibraryEntry } from '../lib/exerciseLibrary.js'
import { CATEGORY_LABELS } from '../lib/exercises.js'
import Sheet from './Sheet.jsx'

function GuideList({ title, items }) {
  if (!items || items.length === 0) return null
  return (
    <div className="library-section">
      <h3>{title}</h3>
      <ol className="library-list">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ol>
    </div>
  )
}

function MuscleRow({ label, muscles }) {
  if (!muscles || muscles.length === 0) return null
  return (
    <div className="ex-name">
      <span className="muted">{label}</span>
      <span>{muscles.join(', ')}</span>
    </div>
  )
}

function ExerciseLibrarySheet({ exerciseId, customExercises, onClose }) {
  const info = findExercise(exerciseId, customExercises)
  const entry = getLibraryEntry(exerciseId)
  const guide = entry?.guide

  return (
    <Sheet title={info?.name ?? 'Exercise'} onClose={onClose}>
      <div className="chip-row" style={{ marginBottom: 'var(--space-3)' }}>
        {info?.category && <span className="badge">{CATEGORY_LABELS[info.category] ?? info.category}</span>}
        {info?.equipment && <span className="badge">{info.equipment}</span>}
      </div>

      {entry?.images && (
        <div className="library-image-row">
          <div className="library-image-wrap">
            <img src={entry.images.start} alt={`${info?.name ?? 'Exercise'} — starting position`} loading="lazy" />
            <span className="library-image-label">Start</span>
          </div>
          <div className="library-image-wrap">
            <img src={entry.images.end} alt={`${info?.name ?? 'Exercise'} — end position`} loading="lazy" />
            <span className="library-image-label">End</span>
          </div>
        </div>
      )}

      {guide?.overview && <p>{guide.overview}</p>}

      {!guide && info?.cue && (
        <div className="card card-tight">
          <p style={{ marginBottom: 0 }}>{info.cue}</p>
        </div>
      )}

      {guide && (
        <>
          <GuideList title="Setup" items={guide.setup} />
          <GuideList title="Execution" items={guide.execution} />
          <GuideList title="Common mistakes" items={guide.mistakes} />
          {(guide.primaryMuscles || guide.secondaryMuscles) && (
            <div className="library-section">
              <h3>Muscles worked</h3>
              <div className="card card-tight">
                <MuscleRow label="Primary" muscles={guide.primaryMuscles} />
                <MuscleRow label="Secondary" muscles={guide.secondaryMuscles} />
              </div>
            </div>
          )}
        </>
      )}

      {!guide && !info?.cue && <p>No extended guide for this exercise yet.</p>}
    </Sheet>
  )
}

export default ExerciseLibrarySheet
