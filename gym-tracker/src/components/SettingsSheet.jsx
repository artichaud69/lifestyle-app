import { useRef, useState } from 'react'
import Sheet from './Sheet.jsx'

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
  const [importError, setImportError] = useState('')
  const fileInputRef = useRef(null)

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
      <button type="button" className="btn btn-primary" onClick={() => onSave({ unit, restSeconds })}>
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
    </Sheet>
  )
}

export default SettingsSheet
