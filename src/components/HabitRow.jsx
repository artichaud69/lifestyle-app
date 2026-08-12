function HabitRow({ name, days, onToggleDay }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0' }}>
      <span style={{ width: '120px' }}>{name}</span>
      {days.map((done, index) => (
        <input
          key={index}
          type="checkbox"
          checked={done}
          onChange={() => onToggleDay(index)}
        />
      ))}
    </div>
  )
}

export default HabitRow
