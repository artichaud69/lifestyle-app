import { useState } from 'react'
import LineChart from './LineChart.jsx'
import Sheet from './Sheet.jsx'
import BodySilhouette from './BodySilhouette.jsx'
import { PlusIcon, TrashIcon, RulerIcon, InfoIcon } from '../lib/icons.jsx'
import { todayISO, formatDateShort } from '../lib/dates.js'
import { MEASUREMENT_FIELDS, fieldHistory, latestValue, changeSincePrevious, fieldsWithData } from '../lib/measurements.js'
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

function emptyFormValues() {
  return Object.fromEntries(MEASUREMENT_FIELDS.map((f) => [f.key, '']))
}

function MeasurementsSection({ entries, unit, onAdd, onDelete }) {
  const [showForm, setShowForm] = useState(false)
  const [date, setDate] = useState(todayISO())
  const [formValues, setFormValues] = useState(emptyFormValues)
  const [infoField, setInfoField] = useState(null)
  const available = fieldsWithData(entries)
  const [selectedField, setSelectedField] = useState(null)
  const activeField = available.some((f) => f.key === selectedField) ? selectedField : available[0]?.key ?? null

  function handleSave() {
    const values = {}
    for (const field of MEASUREMENT_FIELDS) {
      const raw = formValues[field.key]
      if (raw !== '' && !Number.isNaN(Number(raw))) values[field.key] = Number(raw)
    }
    if (Object.keys(values).length === 0) return
    onAdd({ id: genId(), date, values })
    setFormValues(emptyFormValues())
    setDate(todayISO())
    setShowForm(false)
  }

  const recent = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5)
  const activeFieldLabel = MEASUREMENT_FIELDS.find((f) => f.key === activeField)?.label

  return (
    <div className="card">
      <div className="card-title-row">
        <h2>Measurements</h2>
        <button type="button" className="icon-btn" onClick={() => setShowForm((s) => !s)} aria-label="Log measurements">
          <PlusIcon size={18} />
        </button>
      </div>

      {showForm && (
        <div className="card card-tight" style={{ marginBottom: 'var(--space-3)' }}>
          <div className="field">
            <label>Date</label>
            <input type="date" value={date} max={todayISO()} onChange={(e) => setDate(e.target.value)} />
          </div>
          {Array.from({ length: Math.ceil(MEASUREMENT_FIELDS.length / 2) }, (_, row) => (
            <div key={row} className="set-row" style={{ gridTemplateColumns: '1fr 1fr' }}>
              {MEASUREMENT_FIELDS.slice(row * 2, row * 2 + 2).map((f) => (
                <div key={f.key} className="measurement-field">
                  <div className="measurement-field-label">
                    <span>
                      {f.label} ({unit})
                    </span>
                    <button
                      type="button"
                      className="icon-btn icon-btn-small"
                      onClick={() => setInfoField(f.key)}
                      aria-label={`How to measure ${f.label.toLowerCase()}`}
                    >
                      <InfoIcon size={14} />
                    </button>
                  </div>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={formValues[f.key]}
                    onChange={(e) => setFormValues((prev) => ({ ...prev, [f.key]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
          ))}
          <p className="muted" style={{ marginTop: 'var(--space-2)', marginBottom: 0 }}>
            Fill in whatever you measured today — leave the rest blank.
          </p>
          <button type="button" className="btn btn-primary" style={{ marginTop: 'var(--space-3)' }} onClick={handleSave}>
            Save
          </button>
        </div>
      )}

      {available.length === 0 ? (
        <div className="empty-state" style={{ padding: 'var(--space-4) 0' }}>
          <RulerIcon size={32} />
          <p style={{ marginBottom: 0 }}>No measurements yet — log neck, waist, chest and more to track your shape over time.</p>
        </div>
      ) : (
        <>
          <BodySilhouette entries={entries} unit={unit} onSelectField={setSelectedField} />

          <div className="chip-row chip-row-scroll" style={{ marginBottom: 'var(--space-3)' }}>
            {available.map((f) => (
              <button
                key={f.key}
                type="button"
                className={`chip${f.key === activeField ? ' active' : ''}`}
                onClick={() => setSelectedField(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>

          <LineChart
            points={fieldHistory(entries, activeField).map((h) => ({ label: formatDateShort(h.date), value: h.value }))}
            unit={unit}
            zeroBased={false}
            decimals={1}
          />
          <div className="stat-row">
            <div className="stat-tile">
              <div className="value">
                {latestValue(entries, activeField)}
                {unit}
              </div>
              <div className="label">Latest {activeFieldLabel}</div>
            </div>
            <div className="stat-tile">
              <ChangeStat change={changeSincePrevious(entries, activeField)} unit={unit} />
              <div className="label">vs Last Log</div>
            </div>
          </div>

          {recent.map((entry) => (
            <div key={entry.id} className="history-log-item" style={{ cursor: 'default' }}>
              <div>
                <div className="name">
                  {MEASUREMENT_FIELDS.filter((f) => typeof entry.values[f.key] === 'number')
                    .map((f) => `${f.label} ${entry.values[f.key]}${unit}`)
                    .join(' · ')}
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

      {infoField && (
        <Sheet title={`How to measure ${MEASUREMENT_FIELDS.find((f) => f.key === infoField).label.toLowerCase()}`} onClose={() => setInfoField(null)}>
          <p>{MEASUREMENT_FIELDS.find((f) => f.key === infoField).howTo}</p>
        </Sheet>
      )}
    </div>
  )
}

export default MeasurementsSection
