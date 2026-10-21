import { useMemo, useState } from 'react'
import PageHeader from './PageHeader.jsx'
import LineChart from './LineChart.jsx'
import BodyweightSection from './BodyweightSection.jsx'
import MeasurementsSection from './MeasurementsSection.jsx'
import ProgressPhotosSection from './ProgressPhotosSection.jsx'
import { ChartIcon, AlertIcon, AwardIcon } from '../lib/icons.jsx'
import { findEntryHistory, bestSet, setOneRepMax, oneRepMaxContext } from '../lib/workout.js'
import { findExercise, bodyweightLoad } from '../lib/exercises.js'
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

const signed = (value) => `${value >= 0 ? '+' : '−'}${Math.abs(value)}`

function ExerciseProgress({ logs, customExercises, settings, bodyweightLogs }) {
  const options = useMemo(() => loggedExerciseIds(logs), [logs])
  const [selectedId, setSelectedId] = useState(options[0]?.id ?? null)
  const activeId = options.some((o) => o.id === selectedId) ? selectedId : options[0]?.id ?? null

  if (options.length === 0) {
    return (
      <div className="card empty-state">
        <ChartIcon size={36} />
        <h3>Nothing to chart yet</h3>
        <p>Log a few workouts and this tab will track your estimated 1-rep max over time.</p>
      </div>
    )
  }

  const history = findEntryHistory(logs, activeId, 20)
  const exerciseInfo = findExercise(activeId, customExercises)
  const exerciseName = exerciseInfo?.name ?? history[history.length - 1]?.entry.exerciseName
  // A lift that moves the body is charted as the most that could be *added*
  // for a single, each session measured at the bodyweight on record for its
  // date. Sessions with no estimate (no bodyweight logged) are left out.
  const isBodyweightLift = bodyweightLoad(exerciseName) !== null
  const points = []
  for (const h of history) {
    const context = oneRepMaxContext(exerciseName, h.date, bodyweightLogs)
    const set = bestSet(h.entry.sets, context)
    const value = set ? setOneRepMax(set, context) : null
    if (value !== null) {
      points.push({ label: formatDateShort(h.date), value, total: value + (context.bodyweight ?? 0) })
    }
  }
  const values = points.map((p) => p.value)
  const best = Math.max(...values)
  const lastPoint = points[points.length - 1]
  const isCurrentBest = lastPoint && lastPoint.value >= best - 0.001
  // "Flat" is judged on the total load lifted: for a conventional lift that
  // is the e1RM itself, but a bodyweight lift's added weight can sit near
  // zero, where a 2% band would be meaninglessly narrow.
  const recent = points.slice(-3).map((p) => p.total)
  const isStalling = recent.length === 3 && Math.max(...recent) - Math.min(...recent) <= Math.max(...recent) * 0.02

  return (
    <>
      <div className="chip-row chip-row-scroll" style={{ marginBottom: 'var(--space-3)' }}>
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

      {points.length === 0 ? (
        <div className="card">
          <h2>{exerciseInfo?.name ?? 'Exercise'}</h2>
          <p style={{ marginBottom: 0 }}>
            {(bodyweightLogs ?? []).length === 0
              ? 'This lift moves your bodyweight, so its estimated max needs it. Log your bodyweight under Body and the chart will appear.'
              : 'No estimate yet — the assistance on these sessions took your whole bodyweight.'}
          </p>
        </div>
      ) : (
        <>
          <div className="card">
            <h2>{exerciseInfo?.name ?? 'Exercise'}</h2>
            <p className="muted" style={{ marginTop: -8 }}>
              {isBodyweightLift
                ? 'Estimated weight you could add for 1 rep, over time (bodyweight included)'
                : 'Estimated 1-rep max over time'}
            </p>
            <LineChart points={points} unit={settings.unit} />
          </div>

          <div className="stat-row">
            <div className="stat-tile">
              <div className="value">
                {isBodyweightLift ? signed(Math.round(best)) : Math.round(best)}
                {settings.unit}
              </div>
              <div className="label">{isBodyweightLift ? 'Best Est. 1RM (added)' : 'Best Est. 1RM'}</div>
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
        </>
      )}
    </>
  )
}

function ProgressPage({
  logs,
  customExercises,
  settings,
  bodyweightLogs,
  onAddBodyweight,
  onDeleteBodyweight,
  measurementLogs,
  onAddMeasurement,
  onDeleteMeasurement,
}) {
  const [tab, setTab] = useState('body')

  return (
    <div>
      <PageHeader title="Progress" />
      <div className="chip-row" style={{ marginBottom: 'var(--space-3)' }}>
        <button type="button" className={`chip${tab === 'body' ? ' active' : ''}`} onClick={() => setTab('body')}>
          Body
        </button>
        <button type="button" className={`chip${tab === 'lifts' ? ' active' : ''}`} onClick={() => setTab('lifts')}>
          Lifts
        </button>
      </div>

      {tab === 'body' ? (
        <>
          <BodyweightSection entries={bodyweightLogs} unit={settings.unit} onAdd={onAddBodyweight} onDelete={onDeleteBodyweight} />
          <MeasurementsSection
            entries={measurementLogs}
            unit={settings.measurementUnit}
            onAdd={onAddMeasurement}
            onDelete={onDeleteMeasurement}
          />
          <ProgressPhotosSection />
        </>
      ) : (
        <ExerciseProgress logs={logs} customExercises={customExercises} settings={settings} bodyweightLogs={bodyweightLogs} />
      )}
    </div>
  )
}

export default ProgressPage
