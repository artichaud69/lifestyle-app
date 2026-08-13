import { useRef, useEffect } from 'react'
import { buildYearWeeks } from '../yearGrid.js'
import { todayISO } from '../dates.js'

function JournalYearMap({ entries, onSelectDay }) {
  const weeks = buildYearWeeks()
  const today = todayISO()
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth
    }
  }, [])

  return (
    <div className="year-map-scroll" ref={scrollRef}>
      <div className="year-map">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="year-map-week">
            {week.map((date, dayIndex) => {
              if (!date) return <div key={dayIndex} className="year-map-day empty" />
              const entry = entries[date]
              const moodClass = entry ? ` mood-${entry.mood}` : ''
              const isToday = date === today
              return (
                <button
                  key={date}
                  type="button"
                  className={`year-map-day${moodClass}${isToday ? ' today' : ''}`}
                  onClick={() => onSelectDay(date)}
                  aria-label={date}
                  title={date}
                />
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

export default JournalYearMap
