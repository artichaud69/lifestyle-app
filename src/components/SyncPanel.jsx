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

function SyncPanel({ session, ready, status, message, syncedAt, onSignIn, onSignOut }) {
  const [email, setEmail] = useState('')
  const [isSending, setIsSending] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    const trimmed = email.trim()
    if (!trimmed) return
    setIsSending(true)
    const sent = await onSignIn(trimmed)
    setIsSending(false)
    if (sent) setEmail('')
  }

  if (!ready) return null

  if (!session) {
    return (
      <form className="edit-panel" onSubmit={handleSubmit}>
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
        />
        <div className="button-row">
          <button type="submit" className="button button-primary" disabled={!email.trim() || isSending}>
            {isSending ? 'Sending…' : 'Email me a link'}
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
