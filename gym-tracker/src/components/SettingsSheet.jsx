import { useRef, useState } from 'react'
import Sheet from './Sheet.jsx'
import { runPushCheck } from '../lib/pushCheck.js'
import { startLockedAlertTest, getLockedAlertResults, clearLockedAlertTest } from '../lib/alertTest.js'

function slugify(text) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function downloadProgram(program) {
  const blob = new Blob([JSON.stringify(program, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${slugify(program.name || 'gym-program')}.json`
  link.click()
  URL.revokeObjectURL(url)
}

function SettingsSheet({ settings, program, onSave, onImportProgram, onClose }) {
  const [unit, setUnit] = useState(settings.unit)
  const [restSeconds, setRestSeconds] = useState(settings.restSeconds)
  const [measurementUnit, setMeasurementUnit] = useState(settings.measurementUnit)
  const [importError, setImportError] = useState('')
  const [pushSteps, setPushSteps] = useState(null)
  const [pushChecking, setPushChecking] = useState(false)
  const [alertResults, setAlertResults] = useState(() => getLockedAlertResults())
  const fileInputRef = useRef(null)

  function startAlertTest() {
    // Permission has to be asked for inside the tap, same iOS rule as the
    // push check above.
    const ask = typeof Notification !== 'undefined' && Notification.permission === 'default'
      ? Notification.requestPermission()
      : Promise.resolve(typeof Notification === 'undefined' ? 'unavailable' : Notification.permission)
    ask.then(() => {
      clearLockedAlertTest()
      startLockedAlertTest()
      setAlertResults(getLockedAlertResults())
    })
  }

  function checkPush() {
    setPushChecking(true)
    // Deliberately not awaited before the permission prompt inside — iOS ties
    // that prompt to the tap that started it.
    runPushCheck()
      .then(setPushSteps)
      .catch((error) => setPushSteps([{ label: 'Check failed', ok: false, detail: error?.message ?? '' }]))
      .finally(() => setPushChecking(false))
  }

  function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setImportError('')
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result)
        if (!Array.isArray(parsed.sessions) || parsed.sessions.length === 0) {
          throw new Error('missing sessions')
        }
        onImportProgram(parsed)
      } catch {
        setImportError('That file doesn\'t look like a valid program export.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <Sheet title="Settings" onClose={onClose}>
      <div className="field">
        <label>Weight unit</label>
        <div className="chip-row">
          <button type="button" className={`chip${unit === 'kg' ? ' active' : ''}`} onClick={() => setUnit('kg')}>
            kg
          </button>
          <button type="button" className={`chip${unit === 'lb' ? ' active' : ''}`} onClick={() => setUnit('lb')}>
            lb
          </button>
        </div>
      </div>
      <div className="field">
        <label>Default rest between sets</label>
        <div className="chip-row">
          {[60, 90, 120, 180].map((s) => (
            <button key={s} type="button" className={`chip${restSeconds === s ? ' active' : ''}`} onClick={() => setRestSeconds(s)}>
              {s}s
            </button>
          ))}
        </div>
      </div>
      <div className="field">
        <label>Measurement unit</label>
        <div className="chip-row">
          <button
            type="button"
            className={`chip${measurementUnit === 'cm' ? ' active' : ''}`}
            onClick={() => setMeasurementUnit('cm')}
          >
            cm
          </button>
          <button
            type="button"
            className={`chip${measurementUnit === 'in' ? ' active' : ''}`}
            onClick={() => setMeasurementUnit('in')}
          >
            in
          </button>
        </div>
      </div>
      <button type="button" className="btn btn-primary" onClick={() => onSave({ unit, restSeconds, measurementUnit })}>
        Save
      </button>

      <div className="field" style={{ marginTop: 'var(--space-5)' }}>
        <label>Program data</label>
        <p style={{ marginTop: 0 }}>
          Back up your current plan to a file, or load one someone (or an AI) built for you — useful for a custom
          program that doesn't fit the goal wizard, or moving to a new device.
        </p>
        <div className="btn-block-row">
          <button type="button" className="btn btn-secondary" disabled={!program} onClick={() => downloadProgram(program)}>
            Export Program
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => fileInputRef.current?.click()}>
            Import Program
          </button>
        </div>
        <input ref={fileInputRef} type="file" accept="application/json" onChange={handleFile} style={{ display: 'none' }} />
        {importError && <div className="feedback-card warning" style={{ marginTop: 'var(--space-2)' }}><p>{importError}</p></div>}
      </div>

      <div className="field" style={{ marginTop: 'var(--space-5)' }}>
        <label>Do alerts survive locking the phone?</label>
        <p style={{ marginTop: 0 }}>
          Start this, then <strong>lock your phone immediately</strong> and leave it for about two and a half minutes.
          It schedules alerts at 5s, 30s, 60s and 120s. Come back and press Show Results — whether the later ones
          arrived <em>on time</em> decides whether rest alerts need a server at all.
        </p>
        <div className="btn-block-row">
          <button type="button" className="btn btn-secondary" onClick={startAlertTest}>
            Start &amp; Lock Phone
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => setAlertResults(getLockedAlertResults())}>
            Show Results
          </button>
        </div>
        {alertResults && (
          <div className="card card-tight" style={{ marginTop: 'var(--space-2)' }}>
            {alertResults.entries.map((entry) => (
              <div key={entry.seconds} className="ex-name">
                <span>After {entry.seconds}s</span>
                <span className="muted">
                  {!entry.fired
                    ? entry.stillPending
                      ? 'not due yet'
                      : 'never fired'
                    : entry.onTime
                      ? 'on time'
                      : `late by ${Math.round(entry.lateBy / 1000)}s`}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="field" style={{ marginTop: 'var(--space-5)' }}>
        <label>Watch alerts — capability check</label>
        <p style={{ marginTop: 0 }}>
          A temporary check, not a feature. Getting rest alerts to an Apple Watch needs notifications pushed from a
          server, and this says whether your phone can receive them at all — worth knowing before that server gets
          built. Run it from the installed app, not a Safari tab.
        </p>
        <button type="button" className="btn btn-secondary" disabled={pushChecking} onClick={checkPush}>
          {pushChecking ? 'Checking…' : 'Run Check'}
        </button>
        {pushSteps && (
          <div className="card card-tight" style={{ marginTop: 'var(--space-2)' }}>
            {pushSteps.map((step) => (
              <div key={step.label}>
                <div className="ex-name">
                  <span>{step.label}</span>
                  <span className="muted">{step.ok ? 'yes' : 'no'}</span>
                </div>
                {step.detail && <div className="ex-meta">{step.detail}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </Sheet>
  )
}

export default SettingsSheet
