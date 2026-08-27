import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import PageHero from './PageHero.jsx'
import Section from './ui/Section.jsx'
import Button from './ui/Button.jsx'
import IconButton from './ui/IconButton.jsx'
import EmptyState from './ui/EmptyState.jsx'
import BreathingExercise from './BreathingExercise.jsx'
import GroundingExercise from './GroundingExercise.jsx'
import {
  loadEntries,
  saveEntries,
  addEntry,
  removeEntry,
  entriesInLastDays,
  groupByDay,
  SEVERITIES,
  TRIGGERS,
} from '../anxiety.js'
import { formatShortLabel } from '../dates.js'
import { PAGE_ICONS } from '../navIcons.js'

const HISTORY_DAYS = 14

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

function AnxietyPage({ onBack }) {
  const [entries, setEntries] = useState(() => loadEntries())
  const [severity, setSeverity] = useState('moderate')
  const [triggers, setTriggers] = useState([])
  const [note, setNote] = useState('')
  const base = import.meta.env.BASE_URL

  useEffect(() => {
    saveEntries(entries)
  }, [entries])

  function toggleTrigger(trigger) {
    setTriggers((current) =>
      current.includes(trigger) ? current.filter((t) => t !== trigger) : [...current, trigger],
    )
  }

  function handleLog() {
    setEntries((current) => addEntry(current, { severity, triggers, note }))
    setSeverity('moderate')
    setTriggers([])
    setNote('')
  }

  function handleDelete(id) {
    setEntries((current) => removeEntry(current, id))
  }

  const recentCount = entriesInLastDays(entries, 7).length
  const groups = groupByDay(entries)
  const days = Object.keys(groups)
    .sort((a, b) => (a < b ? 1 : -1))
    .slice(0, HISTORY_DAYS)

  return (
    <div className="page">
      <PageHero view="anxiety" title="Anxiety" onBack={onBack} />

      <div className="page-body">
        <Section title="Right now">
          <div className="anxiety-tools">
            <div className="card anxiety-tool">
              <h3 className="label-sm">Box breathing</h3>
              <BreathingExercise />
            </div>
            <div className="card anxiety-tool">
              <h3 className="label-sm">Grounding · 5-4-3-2-1</h3>
              <GroundingExercise />
            </div>
          </div>
        </Section>

        <Section
          title="Log an episode"
          action={
            recentCount > 0 && (
              <span className="caption">
                {recentCount} in the last 7 days
              </span>
            )
          }
        >
          <div className="anxiety-form">
            <div className="segmented" role="radiogroup" aria-label="Severity">
              {SEVERITIES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  role="radio"
                  aria-checked={severity === s.value}
                  className={`segmented-option${severity === s.value ? ' is-active' : ''}`}
                  onClick={() => setSeverity(s.value)}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <div className="chip-row">
              {TRIGGERS.map((trigger) => {
                const active = triggers.includes(trigger)
                return (
                  <button
                    key={trigger}
                    type="button"
                    aria-pressed={active}
                    className={`chip${active ? ' is-active' : ''}`}
                    onClick={() => toggleTrigger(trigger)}
                  >
                    {trigger}
                  </button>
                )
              })}
            </div>

            <textarea
              className="text-input"
              placeholder="What was happening? (optional)"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              maxLength={280}
            />

            <Button variant="primary" onClick={handleLog}>
              Log episode
            </Button>
          </div>
        </Section>

        {days.length > 0 ? (
          <Section title="Recent episodes">
            <div className="anxiety-history">
              {days.map((day) => (
                <div key={day} className="anxiety-day-group">
                  <h3 className="caption anxiety-day-label">{formatShortLabel(day)}</h3>
                  <div className="list-group">
                    {groups[day].map((entry) => (
                      <div key={entry.id} className="list-row">
                        <span
                          className={`anxiety-severity-dot is-${entry.severity}`}
                          aria-hidden="true"
                        />
                        <div className="list-row-main">
                          <span className="list-row-name">
                            {formatTime(entry.at)}
                            {entry.triggers.length > 0 && ` · ${entry.triggers.join(', ')}`}
                          </span>
                          {entry.note && <span className="caption">{entry.note}</span>}
                        </div>
                        <IconButton
                          label="Delete entry"
                          icon={X}
                          onClick={() => handleDelete(entry.id)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        ) : (
          <EmptyState
            icon={`${base}${PAGE_ICONS.anxiety}`}
            title="Nothing logged yet"
            body="When something happens, log it here - severity, what was going on, and it'll build a picture over time."
          />
        )}

        <p className="caption anxiety-disclaimer">
          This log is for your own awareness, not a diagnosis. If episodes are frequent or severe,
          it's worth talking to a doctor or therapist.
        </p>
      </div>
    </div>
  )
}

export default AnxietyPage
