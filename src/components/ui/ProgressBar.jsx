function ProgressBar({ percent, label }) {
  const clamped = Math.max(0, Math.min(100, Math.round(percent)))
  return (
    <div
      className="progress"
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div className="progress-fill" style={{ width: `${clamped}%` }} />
    </div>
  )
}

export default ProgressBar
