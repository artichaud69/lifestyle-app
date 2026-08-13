import { useState } from 'react'

const STATUS_LABELS = {
  idle: '',
  pending: 'Saving…',
  syncing: 'Backing up…',
  synced: 'Backed up',
  error: 'Backup failed',
}

function formatSyncedAt(iso) {
  if (!iso) return null
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function SyncPanel({
  session,
  ready,
  status,
  message,
  syncedAt,
  pendingEmail,
  onRequestCode,
  onVerifyCode,
  onCancelSignIn,
  onSignOut,
}) {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [isBusy, setIsBusy] = useState(false)

  async function handleRequest(event) {
    event.preventDefault()
    const trimmed = email.trim()
    if (!trimmed) return
    setIsBusy(true)
    await onRequestCode(trimmed)
    setIsBusy(false)
  }

  async function handleVerify(event) {
    event.preventDefault()
    const trimmed = code.trim()
    if (!trimmed) return
    setIsBusy(true)
    const ok = await onVerifyCode(trimmed)
    setIsBusy(false)
    if (ok) {
      setCode('')
      setEmail('')
    }
  }

  if (!ready) return null

  if (!session && pendingEmail) {
    return (
      <form className="edit-panel" onSubmit={handleVerify}>
        <div className="sync-title">Enter your code</div>
        <p className="sync-note">
          Check {pendingEmail} for a 6-digit code and type it here. Entering it in the app keeps you
          signed in here rather than in the browser.
        </p>
        <input
          type="text"
          className="text-input"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder="123456"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={10}
        />
        <div className="button-row">
          <button type="submit" className="button button-primary" disabled={!code.trim() || isBusy}>
            {isBusy ? 'Checking…' : 'Sign in'}
          </button>
          <button type="button" className="button button-secondary" onClick={onCancelSignIn}>
            Use another email
          </button>
        </div>
        {message && <p className="sync-note">{message}</p>}
      </form>
    )
  }

  if (!session) {
    return (
      <form className="edit-panel" onSubmit={handleRequest}>
        <div className="sync-title">Back up your data</div>
        <p className="sync-note">
          Your habits and journal live only on this device. Sign in to keep a private copy in the
          cloud so nothing is lost if you lose your phone.
        </p>
        <input
          type="email"
          className="text-input"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          inputMode="email"
        />
        <div className="button-row">
          <button type="submit" className="button button-primary" disabled={!email.trim() || isBusy}>
            {isBusy ? 'Sending…' : 'Email me a code'}
          </button>
        </div>
        {message && <p className="sync-note">{message}</p>}
      </form>
    )
  }

  const formatted = formatSyncedAt(syncedAt)

  return (
    <div className="edit-panel">
      <div className="sync-title">
        <span className={`sync-dot ${status}`} />
        {STATUS_LABELS[status] || 'Backed up'}
      </div>
      <p className="sync-note">
        {session.user.email}
        {formatted ? ` · last saved ${formatted}` : ''}
      </p>
      {status === 'error' && message && <p className="goal-error">{message}</p>}
      <div className="button-row">
        <button type="button" className="button button-secondary" onClick={onSignOut}>
          Sign out
        </button>
      </div>
    </div>
  )
}

export default SyncPanel
