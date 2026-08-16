import { useState, useEffect } from 'react'
import {
  pushSupported,
  canSubscribeHere,
  existingSubscription,
  enablePush,
  disablePush,
  updateReminderHour,
  sendTestPush,
  DEFAULT_REMINDER_HOUR,
} from '../push.js'

const HOURS = [7, 8, 9, 12, 17, 18, 19, 20, 21, 22]
const HOUR_KEY = 'lifestyle-app.reminderHour'

function formatHour(hour) {
  return `${String(hour).padStart(2, '0')}:00`
}

function NotificationsPanel({ session }) {
  const [enabled, setEnabled] = useState(false)
  const [checked, setChecked] = useState(false)
  const [hour, setHour] = useState(() => Number(localStorage.getItem(HOUR_KEY)) || DEFAULT_REMINDER_HOUR)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    existingSubscription()
      .then((subscription) => {
        if (cancelled) return
        setEnabled(Boolean(subscription))
        setChecked(true)
      })
      .catch(() => setChecked(true))
    return () => {
      cancelled = true
    }
  }, [])

  async function run(work) {
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      await work()
    } catch (caught) {
      setError(caught.message)
    } finally {
      setBusy(false)
    }
  }

  function handleEnable() {
    return run(async () => {
      await enablePush(hour)
      setEnabled(true)
      setMessage('Reminders are on. Tap "Send a test" to check they arrive.')
    })
  }

  function handleDisable() {
    return run(async () => {
      await disablePush()
      setEnabled(false)
      setMessage('Reminders are off.')
    })
  }

  function handleHourChange(nextHour) {
    setHour(nextHour)
    localStorage.setItem(HOUR_KEY, String(nextHour))
    if (!enabled) return
    return run(async () => {
      await updateReminderHour(nextHour)
      setMessage(`Reminder moved to ${formatHour(nextHour)}.`)
    })
  }

  function handleTest() {
    return run(async () => {
      await sendTestPush()
      setMessage('Sent. It should arrive in a moment.')
    })
  }

  if (!pushSupported()) {
    return (
      <div className="edit-panel">
        <div className="sync-title">Reminders</div>
        <p className="sync-note">This browser cannot show notifications.</p>
      </div>
    )
  }

  // iOS only lets an app subscribe once it has been opened from the home
  // screen, and fails with an opaque error otherwise - worth saying up front.
  // Everywhere else this does not apply, so the panel is shown as normal.
  if (!canSubscribeHere()) {
    return (
      <div className="edit-panel">
        <div className="sync-title">Reminders</div>
        <p className="sync-note">
          Add this app to your home screen and open it from there to switch on reminders.
        </p>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="edit-panel">
        <div className="sync-title">Reminders</div>
        <p className="sync-note">Sign in above first — reminders are tied to your account.</p>
      </div>
    )
  }

  return (
    <div className="edit-panel">
      <div className="sync-title">
        <span className={`sync-dot ${enabled ? 'synced' : 'error'}`} />
        {enabled ? 'Reminders on' : 'Reminders off'}
      </div>
      <p className="sync-note">
        A nudge each evening naming whatever is still open — nothing if the day is already done.
      </p>

      <label className="field-label">
        Remind me at
        <select
          className="text-input"
          value={hour}
          onChange={(event) => handleHourChange(Number(event.target.value))}
          disabled={busy}
        >
          {HOURS.map((option) => (
            <option key={option} value={option}>
              {formatHour(option)}
            </option>
          ))}
        </select>
      </label>

      {error && <p className="goal-error">{error}</p>}
      {message && <p className="sync-note">{message}</p>}

      <div className="button-row">
        {enabled ? (
          <>
            <button type="button" className="button button-secondary" onClick={handleTest} disabled={busy}>
              Send a test
            </button>
            <button type="button" className="button button-secondary" onClick={handleDisable} disabled={busy}>
              Turn off
            </button>
          </>
        ) : (
          <button
            type="button"
            className="button button-primary"
            onClick={handleEnable}
            disabled={busy || !checked}
          >
            {busy ? 'Working…' : 'Turn on reminders'}
          </button>
        )}
      </div>
    </div>
  )
}

export default NotificationsPanel
