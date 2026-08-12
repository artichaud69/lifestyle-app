function HabitRow({ name, dates, doneDates, onToggleDate }) {
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
    </>
  )
}

export default HabitRow
