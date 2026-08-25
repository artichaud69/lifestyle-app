import { useState, useEffect } from 'react'
import {
  loadGratitude,
  saveGratitude,
  itemsForDay,
  hasEntry,
  currentStreak,
  bestStreak,
  sameDateLastYear,
  promptForDate,
  ENTRY_SIZE,
} from '../gratitude.js'
import { todayISO, formatShortLabel, addDays } from '../dates.js'
import PageHero from './PageHero.jsx'
import Section from './ui/Section.jsx'
import { PAGE_ICONS } from '../navIcons.js'

const HISTORY_DAYS = 14

function emptyItems() {
  return Array(ENTRY_SIZE).fill('')
}

function GratitudePage({ onBack }) {
  const [entries, setEntries] = useState(() => loadGratitude())
  const today = todayISO()
  const [items, setItems] = useState(() => {
    const saved = itemsForDay(entries, today)
    return saved.length ? [...saved, ...emptyItems()].slice(0, ENTRY_SIZE) : emptyItems()
  })

  useEffect(() => {
    saveGratitude(entries)
  }, [entries])

  function commit(index, value) {
    const next = [...items]
    next[index] = value
    setItems(next)
    setEntries({ ...entries, [today]: next })
  }

  const streak = currentStreak(entries, today)
  const best = bestStreak(entries, today)

  const lastYear = sameDateLastYear(today)
  const lastYearItems = itemsForDay(entries, lastYear).filter((item) => item?.trim())

  const history = []
  for (let i = 1; i <= HISTORY_DAYS; i++) {
    const date = addDays(today, -i)
    if (hasEntry(entries, date)) history.push(date)
  }

  return (
    <div className="page">
      <PageHero view="gratitude" title="Gratitude" onBack={onBack} />

      <div className="page-body">
        <Section
          title="Today's gratitude"
          action={streak > 0 && <span className="caption">{streak}-day streak · Best {best}</span>}
        >
          {/* The prompt is editorial, the fields are interface - so the two
              take different faces. */}
          <p className="gratitude-prompt">{promptForDate(today)}</p>

          <div className="gratitude-fields">
            {items.map((value, index) => (
              <div key={index} className="gratitude-field">
                <label className="gratitude-index" htmlFor={`gratitude-${index}`}>
                  {String(index + 1).padStart(2, '0')}
                </label>
                <input
                  id={`gratitude-${index}`}
                  type="text"
                  className="text-input"
                  value={value}
                  onChange={(event) => {
                    const next = [...items]
                    next[index] = event.target.value
                    setItems(next)
                  }}
                  onBlur={(event) => commit(index, event.target.value)}
                  maxLength={140}
                />
              </div>
            ))}
          </div>
        </Section>

        {lastYearItems.length > 0 && (
          <Section title="A year ago today">
            <div className="card">
              {lastYearItems.map((item, index) => (
                <p key={index} className="gratitude-echo">
                  {item}
                </p>
              ))}
            </div>
          </Section>
        )}

        {history.length > 0 && (
          <Section title="Recent days">
            <div className="list-group">
              {history.map((date) => (
                <div key={date} className="list-row">
                  <div className="list-row-main">
                    <span className="list-row-name">{formatShortLabel(date)}</span>
                    {itemsForDay(entries, date)
                      .filter((item) => item?.trim())
                      .map((item, index) => (
                        <span key={index} className="caption">
                          {item}
                        </span>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>
    </div>
  )
}

export default GratitudePage
