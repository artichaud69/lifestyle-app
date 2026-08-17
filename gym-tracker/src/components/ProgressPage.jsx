import { useMemo, useState } from 'react'
import PageHeader from './PageHeader.jsx'
import LineChart from './LineChart.jsx'
import { ChartIcon, AlertIcon, AwardIcon } from '../lib/icons.jsx'
import { findEntryHistory, bestSet, estimateOneRepMax } from '../lib/workout.js'
import { findExercise } from '../lib/exercises.js'
import { formatDateShort } from '../lib/dates.js'

function loggedExerciseIds(logs) {
  const seen = new Map()
  const sorted = [...logs].sort((a, b) => new Date(b.date) - new Date(a.date))
  for (const log of sorted) {
    for (const entry of log.entries) {
      if (!seen.has(entry.exerciseId)) seen.set(entry.exerciseId, entry.exerciseName)
    }
  }
  return [...seen.entries()].map(([id, name]) => ({ id, name }))
}

function ProgressPage({ logs, customExercises, settings }) {
  const options = useMemo(() => loggedExerciseIds(logs), [logs])
  const [selectedId, setSelectedId] = useState(options[0]?.id ?? null)
  const activeId = options.some((o) => o.id === selectedId) ? selectedId : options[0]?.id ?? null

  if (options.length === 0) {
    return (
      <div>
        <PageHeader title="Progress" />
        <div className="card empty-state">
          <ChartIcon size={36} />
          <h3>Nothing to chart yet</h3>
          <p>Log a few workouts and this tab will track your estimated 1-rep max over time.</p>
        </div>
      </div>
    )
  }

  const history = findEntryHistory(logs, activeId, 20)
  const points = history.map((h) => {
    const set = bestSet(h.entry.sets)
    return { label: formatDateShort(h.date), value: set ? estimateOneRepMax(set.weight, set.reps) : 0 }
  })
  const values = points.map((p) => p.value)
  const best = Math.max(...values)
  const lastPoint = points[points.length - 1]
  const isCurrentBest = lastPoint && lastPoint.value >= best - 0.001
  const recent = values.slice(-3)
  const isStalling = recent.length === 3 && Math.max(...recent) - Math.min(...recent) <= Math.max(...recent) * 0.02
  const exerciseInfo = findExercise(activeId, customExercises)

  return (
    <div>
      <PageHeader title="Progress" />

      <div className="chip-row" style={{ marginBottom: 'var(--space-3)' }}>
        {options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            className={`chip${opt.id === activeId ? ' active' : ''}`}
            onClick={() => setSelectedId(opt.id)}
          >
            {opt.name}
          </button>
        ))}
      </div>

      <div className="card">
        <h2>{exerciseInfo?.name ?? 'Exercise'}</h2>
        <p className="muted" style={{ marginTop: -8 }}>Estimated 1-rep max over time</p>
        <LineChart points={points} unit={settings.unit} />
      </div>

      <div className="stat-row">
        <div className="stat-tile">
          <div className="value">{Math.round(best)}{settings.unit}</div>
          <div className="label">Best Est. 1RM</div>
        </div>
        <div className="stat-tile">
          <div className="value">{points.length}</div>
          <div className="label">Sessions</div>
        </div>
      </div>

      {isCurrentBest && points.length > 1 && (
        <div className="feedback-card pr">
          <div className="icon-wrap">
            <AwardIcon size={16} />
          </div>
          <p>Your last session was an all-time best on this lift.</p>
        </div>
      )}

      {isStalling && (
        <div className="feedback-card stall">
          <div className="icon-wrap">
            <AlertIcon size={16} />
          </div>
          <p>This lift has been flat for your last 3 sessions. The coach will suggest a deload or a lighter jump next time.</p>
        </div>
      )}
    </div>
  )
}

export default ProgressPage
