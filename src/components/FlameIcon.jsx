const SCALES = { 1: 0.7, 2: 0.82, 3: 0.92, 4: 1.02, 5: 1.15 }

function FlameIcon({ level, size = 24 }) {
  const dimension = size * SCALES[level]
  return (
    <img
      src={`${import.meta.env.BASE_URL}icons/flame-${level}.png`}
      alt=""
      style={{ height: dimension, width: 'auto' }}
    />
  )
}

export default FlameIcon
