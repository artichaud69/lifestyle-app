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
import PageHeader from './PageHeader.jsx'
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
    <div className="wallpaper-page">
      <PageHeader title="Gratitude" icon={PAGE_ICONS.gratitude} onBack={onBack} />

      {streak > 0 && (
        <p className="journal-prompt">
          🔥 {streak}-day streak{best > streak ? ` · Best ${best}` : ''}
        </p>
      )}

      <div className="edit-panel">
        <p className="gratitude-prompt">{promptForDate(today)}</p>
        {items.map((value, index) => (
          <input
            key={index}
            type="text"
            className="text-input"
            value={value}
            onChange={(event) => {
              const next = [...items]
              next[index] = event.target.value
              setItems(next)
            }}
            onBlur={(event) => commit(index, event.target.value)}
            placeholder={`${index + 1}.`}
            maxLength={140}
          />
        ))}
      </div>

      {lastYearItems.length > 0 && (
        <>
          <h2 className="section-heading">A year ago today</h2>
          <div className="edit-panel">
            {lastYearItems.map((item, index) => (
              <p key={index} className="gratitude-echo">
                {item}
              </p>
            ))}
          </div>
        </>
      )}

      {history.length > 0 && (
        <>
          <h2 className="section-heading">Recent days</h2>
          <div className="summary-list">
            {history.map((date) => (
              <div key={date} className="summary-row">
                <div className="summary-row-name">{formatShortLabel(date)}</div>
                {itemsForDay(entries, date)
                  .filter((item) => item?.trim())
                  .map((item, index) => (
                    <div key={index} className="summary-row-stats">
                      {item}
                    </div>
                  ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default GratitudePage
