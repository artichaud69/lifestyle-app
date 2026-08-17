import { useState } from 'react'
import Sheet from './Sheet.jsx'

function SettingsSheet({ settings, onSave, onClose }) {
  const [unit, setUnit] = useState(settings.unit)
  const [restSeconds, setRestSeconds] = useState(settings.restSeconds)

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
    </Sheet>
  )
}

export default SettingsSheet
