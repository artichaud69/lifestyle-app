const LEVEL_STYLES = {
  1: { color: 'var(--color-danger)', opacity: 0.5, scale: 0.6 },
  2: { color: 'var(--color-danger)', opacity: 0.75, scale: 0.75 },
  3: { color: 'var(--color-text-muted)', opacity: 0.8, scale: 0.85 },
  4: { color: 'var(--color-primary)', opacity: 0.85, scale: 0.95 },
  5: { color: 'var(--color-primary)', opacity: 1, scale: 1.1 },
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
      style={{ opacity: style.opacity }}
      aria-hidden="true"
    >
      <path d="M12 2C12 2 6 8 6 14C6 17.31 8.69 20 12 20C15.31 20 18 17.31 18 14C18 8 12 2 12 2Z" />
    </svg>
  )
}

export default FlameIcon
