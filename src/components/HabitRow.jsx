import HabitHeatmap from './HabitHeatmap.jsx'

function HabitRow({ name, dates, doneDates, createdAt, onToggleDate }) {
  return (
    <>
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
      {dates.map((date) => (
        <input
          key={date}
          type="checkbox"
          checked={doneDates.includes(date)}
          onChange={() => onToggleDate(date)}
          style={{ justifySelf: 'center' }}
        />
      ))}
      <div style={{ gridColumn: '1 / -1' }}>
        <HabitHeatmap createdAt={createdAt} doneDates={doneDates} />
      </div>
    </>
  )
}

export default HabitRow
