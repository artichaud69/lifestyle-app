import { datesBetween, todayISO, formatShortLabel } from '../dates.js'

function HabitHeatmap({ startDate, doneDates }) {
  const allDates = datesBetween(startDate, todayISO())
  const doneSet = new Set(doneDates)
  const totalCount = allDates.length
  const doneCount = allDates.filter((date) => doneSet.has(date)).length
  const percent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0

  return (
    <div style={{ paddingBottom: '12px', borderBottom: '1px solid #eee' }}>
      <div style={{ fontSize: '11px', color: '#555', marginBottom: '4px' }}>
        {percent}% since {formatShortLabel(startDate)} ({totalCount} day{totalCount === 1 ? '' : 's'})
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', maxWidth: '100%' }}>
        {allDates.map((date) => (
          <div
            key={date}
            title={`${date}: ${doneSet.has(date) ? 'done' : 'not done'}`}
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '2px',
              backgroundColor: doneSet.has(date) ? '#2da44e' : '#e6e6e6',
            }}
          />
        ))}
      </div>
    </div>
  )
}

export default HabitHeatmap
