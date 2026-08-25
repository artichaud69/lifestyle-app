import { useState } from 'react'
import LineChart from './LineChart.jsx'
import { PlusIcon, TrashIcon, ScaleIcon } from '../lib/icons.jsx'
import { todayISO, formatDateShort } from '../lib/dates.js'
import { sortByDate, latestEntry, changeSincePrevious } from '../lib/bodyweight.js'
import { genId } from '../lib/id.js'

function ChangeStat({ change, unit }) {
  if (change === null) return <div className="value">—</div>
  const sign = change > 0 ? '+' : ''
  const color = change > 0 ? 'var(--color-warning)' : change < 0 ? 'var(--color-success)' : undefined
  return (
    <div className="value" style={{ color }}>
      {sign}
      {change.toFixed(1)}
      {unit}
    </div>
  )
}

function BodyweightSection({ entries, unit, onAdd, onDelete }) {
  const [showForm, setShowForm] = useState(false)
  const [weight, setWeight] = useState('')
  const [date, setDate] = useState(todayISO())

  function handleSave() {
    const value = Number(weight)
    if (!value) return
    onAdd({ id: genId(), date, weight: value })
    setWeight('')
    setDate(todayISO())
    setShowForm(false)
  }

  const sorted = sortByDate(entries)
  const points = sorted.map((entry) => ({ label: formatDateShort(entry.date), value: entry.weight }))
  const latest = latestEntry(entries)
  const change = changeSincePrevious(entries)
  const recent = [...sorted].reverse().slice(0, 5)

  return (
    <div className="card">
      <div className="card-title-row">
        <h2>Bodyweight</h2>
        <button type="button" className="icon-btn" onClick={() => setShowForm((s) => !s)} aria-label="Log weight">
          <PlusIcon size={18} />
        </button>
      </div>

      {showForm && (
        <div className="card card-tight" style={{ marginBottom: 'var(--space-3)' }}>
          <div className="set-table-head" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <span>Date</span>
            <span>Weight ({unit})</span>
          </div>
          <div className="set-row" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <input type="date" value={date} max={todayISO()} onChange={(e) => setDate(e.target.value)} />
            <input
              type="number"
              inputMode="decimal"
              value={weight}
              placeholder="0"
              onChange={(e) => setWeight(e.target.value)}
              autoFocus
            />
          </div>
          <button type="button" className="btn btn-primary" style={{ marginTop: 'var(--space-3)' }} onClick={handleSave}>
            Save
          </button>
        </div>
      )}

      {sorted.length === 0 ? (
        <div className="empty-state" style={{ padding: 'var(--space-4) 0' }}>
          <ScaleIcon size={32} />
          <p style={{ marginBottom: 0 }}>No entries yet — log your weight to start a trend line.</p>
        </div>
      ) : (
        <>
          <LineChart points={points} unit={unit} zeroBased={false} decimals={1} />
          <div className="stat-row">
            <div className="stat-tile">
              <div className="value">
                {latest.weight}
                {unit}
              </div>
              <div className="label">Latest</div>
            </div>
            <div className="stat-tile">
              <ChangeStat change={change} unit={unit} />
              <div className="label">vs Last Log</div>
            </div>
          </div>
          {recent.map((entry) => (
            <div key={entry.id} className="history-log-item" style={{ cursor: 'default' }}>
              <div>
                <div className="name">
                  {entry.weight}
                  {unit}
                </div>
                <div className="date">{formatDateShort(entry.date)}</div>
              </div>
              <button type="button" className="icon-btn" onClick={() => onDelete(entry.id)} aria-label="Delete entry">
                <TrashIcon size={16} />
              </button>
            </div>
          ))}
        </>
      )}
    </div>
  )
}

export default BodyweightSection
