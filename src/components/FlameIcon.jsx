const LEVEL_STYLES = {
  1: { color: 'var(--mood-1)', scale: 0.7 },
  2: { color: 'var(--mood-2)', scale: 0.82 },
  3: { color: 'var(--mood-3)', scale: 0.92 },
  4: { color: 'var(--mood-4)', scale: 1.02 },
  5: { color: 'var(--mood-5)', scale: 1.15 },
}

function FlameIcon({ level, size = 24 }) {
  const style = LEVEL_STYLES[level]
  const dimension = size * style.scale
  return (
    <svg
      width={dimension}
      height={dimension}
      viewBox="0 0 24 24"
      fill={style.color}
      aria-hidden="true"
    >
      <path d="M12 2C12 2 6 8 6 14C6 17.31 8.69 20 12 20C15.31 20 18 17.31 18 14C18 8 12 2 12 2Z" />
    </svg>
  )
}

export default FlameIcon
