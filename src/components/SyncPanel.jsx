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
  onSignIn,
  onSignUp,
  onSetPassword,
  onSignOut,
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [isBusy, setIsBusy] = useState(false)

  async function handleSignIn(event) {
    event.preventDefault()
    if (!email.trim() || !password) return
    setIsBusy(true)
    const ok = await onSignIn(email.trim(), password)
    setIsBusy(false)
    if (ok) setPassword('')
  }

  async function handleSignUp() {
    if (!email.trim() || !password) return
    setIsBusy(true)
    await onSignUp(email.trim(), password)
    setIsBusy(false)
  }

  async function handleSetPassword(event) {
    event.preventDefault()
    if (!newPassword) return
    setIsBusy(true)
    const ok = await onSetPassword(newPassword)
    setIsBusy(false)
    if (ok) {
      setNewPassword('')
      setShowPasswordForm(false)
    }
  }

  if (!ready) return null

  if (!session) {
    return (
      <form className="edit-panel" onSubmit={handleSignIn}>
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
        <input
          type="password"
          className="text-input"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          autoComplete="current-password"
        />
        <div className="button-row">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!email.trim() || !password || isBusy}
          >
            {isBusy ? 'Working…' : 'Sign in'}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleSignUp}
            disabled={!email.trim() || !password || isBusy}
          >
            Create account
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

      {showPasswordForm ? (
        <form onSubmit={handleSetPassword}>
          <input
            type="password"
            className="text-input"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            placeholder="New password"
            autoComplete="new-password"
          />
          <div className="button-row">
            <button type="submit" className="btn btn-primary" disabled={!newPassword || isBusy}>
              {isBusy ? 'Saving…' : 'Save password'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowPasswordForm(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="button-row">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setShowPasswordForm(true)}
          >
            Set a password
          </button>
          <button type="button" className="btn btn-secondary" onClick={onSignOut}>
            Sign out
          </button>
        </div>
      )}
      {!showPasswordForm && status !== 'error' && message && <p className="sync-note">{message}</p>}
    </div>
  )
}

export default SyncPanel
