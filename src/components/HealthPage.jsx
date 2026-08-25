import { useState, useEffect, useCallback } from 'react'
import PageHero from './PageHero.jsx'
import Section from './ui/Section.jsx'
import Button from './ui/Button.jsx'
import EmptyState from './ui/EmptyState.jsx'
import { PAGE_ICONS } from '../navIcons.js'
import { startOuraConnect, fetchOuraData, disconnectOura } from '../oura.js'
import { formatShortLabel } from '../dates.js'

function HealthPage({ session, initialMessage, onBack, onOpenSettings }) {
  const [status, setStatus] = useState('loading') // loading | disconnected | connected | error | signed-out
  const [data, setData] = useState(null)
  const [message, setMessage] = useState(initialMessage ?? null)
  const base = import.meta.env.BASE_URL

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

  // Connecting needs an account, but that is our plumbing, not something the
  // user should have to know - so the same button starts whichever step is
  // actually outstanding.
  function handleConnect() {
    if (session) startOuraConnect()
    else onOpenSettings?.()
  }

  return (
    <div className="page">
      <PageHero view="health" title="Health" onBack={onBack} />

      <div className="page-body">
        {status === 'loading' && <p className="body-md">Loading…</p>}

        {(status === 'signed-out' || status === 'disconnected') && (
          <EmptyState
            icon={`${base}${PAGE_ICONS.health}`}
            title="Connect your health data"
            body="Bring your Oura sleep and activity scores into the app, so how you rested sits alongside what you did."
            action={
              <Button variant="primary" onClick={handleConnect}>
                Connect Oura
              </Button>
            }
          />
        )}

        {status === 'error' && (
          <EmptyState
            icon={`${base}${PAGE_ICONS.health}`}
            title="Couldn't reach Oura"
            body={message}
            action={
              <Button variant="secondary" onClick={load}>
                Try again
              </Button>
            }
          />
        )}

        {status === 'connected' && data && (
          <>
            <Section title="Latest">
              <div className="list-group">
                <div className="list-row">
                  <div className="list-row-main">
                    <span className="list-row-name">Sleep</span>
                  </div>
                  <span className="stat-xl">{data.sleep[0]?.score ?? '—'}</span>
                </div>
                <div className="list-row">
                  <div className="list-row-main">
                    <span className="list-row-name">Activity</span>
                  </div>
                  <span className="stat-xl">{data.activity[0]?.score ?? '—'}</span>
                </div>
              </div>
            </Section>

            {data.sleep.length > 0 && (
              <Section title="Recent days">
                <div className="list-group">
                  {data.sleep.map((entry) => {
                    const activity = data.activity.find((item) => item.day === entry.day)
                    return (
                      <div key={entry.day} className="list-row">
                        <div className="list-row-main">
                          <span className="list-row-name">{formatShortLabel(entry.day)}</span>
                        </div>
                        <span className="caption">
                          Sleep {entry.score ?? '—'} · Activity {activity?.score ?? '—'}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </Section>
            )}

            <div className="button-row">
              <Button onClick={handleDisconnect}>Disconnect Oura</Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default HealthPage
