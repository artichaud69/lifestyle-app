import { MEASUREMENT_FIELDS, latestValue } from '../lib/measurements.js'

// Anatomical anchor points on the silhouette below (where each leader line
// starts) plus the y a label sits at on its margin — tuned by hand so labels
// on the same side never sit close enough to overlap, independent of the
// exact anatomical order fields are logged in.
const ANCHORS = {
  neck: { side: 'left', bodyX: 100, bodyY: 58, labelY: 50 },
  shoulders: { side: 'right', bodyX: 150, bodyY: 75, labelY: 78 },
  chest: { side: 'left', bodyX: 61, bodyY: 112, labelY: 115 },
  waist: { side: 'right', bodyX: 132, bodyY: 165, labelY: 178 },
  hips: { side: 'left', bodyX: 58, bodyY: 195, labelY: 205 },
  biceps: { side: 'right', bodyX: 172, bodyY: 120, labelY: 145 },
  thighs: { side: 'left', bodyX: 66, bodyY: 265, labelY: 270 },
  calves: { side: 'right', bodyX: 134, bodyY: 345, labelY: 345 },
}

// A single logged value placed at its anatomical spot reads on its own —
// the position tells you what it is, so no separate field-name label is
// needed here (unlike the chip row / recent-entries list above, which have
// no such visual context and do spell field names out).
function BodySilhouette({ entries, unit, onSelectField }) {
  const values = Object.fromEntries(MEASUREMENT_FIELDS.map((f) => [f.key, latestValue(entries, f.key)]))
  const hasAny = Object.values(values).some((v) => v !== null)
  if (!hasAny) return null

  return (
    <svg viewBox="0 0 220 420" className="body-silhouette" role="img" aria-label="Latest measurements shown on a body diagram">
      <g fill="var(--color-border)">
        <circle cx="100" cy="32" r="24" />
        <rect x="90" y="54" width="20" height="16" />
        <path d="M55,70 L145,70 L138,110 L130,165 L140,195 L60,195 L70,165 L62,110 Z" />
        <rect x="28" y="72" width="24" height="130" rx="12" />
        <rect x="148" y="72" width="24" height="130" rx="12" />
        <rect x="68" y="195" width="32" height="190" rx="14" />
        <rect x="100" y="195" width="32" height="190" rx="14" />
      </g>
      {MEASUREMENT_FIELDS.map((field) => {
        const value = values[field.key]
        if (value === null) return null
        const a = ANCHORS[field.key]
        const lineEndX = a.side === 'left' ? 45 : 175
        const textX = a.side === 'left' ? 42 : 178
        const textAnchor = a.side === 'left' ? 'end' : 'start'
        return (
          <g
            key={field.key}
            className="silhouette-tag"
            onClick={onSelectField ? () => onSelectField(field.key) : undefined}
          >
            <line x1={a.bodyX} y1={a.bodyY} x2={lineEndX} y2={a.labelY} stroke="var(--color-primary)" strokeWidth="1.5" />
            <circle cx={a.bodyX} cy={a.bodyY} r="3.5" fill="var(--color-primary)" />
            <text x={textX} y={a.labelY} textAnchor={textAnchor} dominantBaseline="middle">
              {value}
              {unit}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export default BodySilhouette
