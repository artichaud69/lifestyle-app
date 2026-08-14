import { useState, useEffect, useCallback } from 'react'
import PageHeader from './PageHeader.jsx'
import { PAGE_ICONS } from '../navIcons.js'
import { startOuraConnect, fetchOuraData, disconnectOura } from '../oura.js'
import { formatShortLabel } from '../dates.js'

function ScoreCard({ label, score }) {
  return (
    <div className="summary-today-card">
      <div className="summary-today-value">{score ?? '—'}</div>
      <div className="summary-today-label">{label}</div>
    </div>
  )
}

function HealthPage({ session, initialMessage }) {
  const [status, setStatus] = useState('loading') // loading | disconnected | connected | error | signed-out
  const [data, setData] = useState(null)
  const [message, setMessage] = useState(initialMessage ?? null)

  const load = useCallback(async () => {
    setStatus('loading')
    try {
      const result = await fetchOuraData()
      if (!result.connected) {
        setStatus('disconnected')
        return
      }
      setData(result)
      setStatus('connected')
    } catch (error) {
      setMessage(error.message)
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    if (session) load()
    else setStatus('signed-out')
  }, [session, load])

  async function handleDisconnect() {
    await disconnectOura()
    setData(null)
    setStatus('disconnected')
  }

  return (
    <div className="wallpaper-page">
      <PageHeader title="Health" icon={PAGE_ICONS.health} />

      {status === 'signed-out' && (
        <p className="summary-empty">
          Sign in from the Summary page's Backup section first — your Oura connection is tied to that account.
        </p>
      )}

      {status === 'loading' && <p className="journal-prompt">Loading…</p>}

      {status === 'error' && (
        <div className="edit-panel">
          <p className="goal-error">{message}</p>
          <div className="button-row">
            <button type="button" className="button button-secondary" onClick={load}>
              Try again
            </button>
          </div>
        </div>
      )}

      {status === 'disconnected' && (
        <div className="edit-panel">
          {message && <p className="goal-error">{message}</p>}
          <p className="journal-prompt">Connect your Oura Ring to see your sleep and activity scores here.</p>
          <div className="button-row">
            <button type="button" className="button button-primary" onClick={startOuraConnect}>
              Connect Oura
            </button>
          </div>
        </div>
      )}

      {status === 'connected' && data && (
        <>
          <div className="health-scores">
            <ScoreCard label="Latest sleep score" score={data.sleep[0]?.score} />
            <ScoreCard label="Latest activity score" score={data.activity[0]?.score} />
          </div>

          {data.sleep.length === 0 ? (
            <p className="summary-empty">No recent days yet — check back after your ring has synced.</p>
          ) : (
            <>
              <h2 className="section-heading">Recent days</h2>
              <div className="summary-list">
                {data.sleep.map((entry) => {
                  const activity = data.activity.find((item) => item.day === entry.day)
                  return (
                    <div key={entry.day} className="summary-row">
                      <div className="summary-row-name">{formatShortLabel(entry.day)}</div>
                      <div className="summary-row-stats">
                        Sleep {entry.score ?? '—'} · Activity {activity?.score ?? '—'}
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}

          <div className="button-row">
            <button type="button" className="button button-secondary" onClick={handleDisconnect}>
              Disconnect Oura
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default HealthPage
