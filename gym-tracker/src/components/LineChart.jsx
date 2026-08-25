import { useRef, useState } from 'react'

const WIDTH = 320
const HEIGHT = 160
const PAD_X = 14
const PAD_TOP = 20
const PAD_BOTTOM = 24

function niceMax(max) {
  if (max <= 0) return 10
  const magnitude = 10 ** Math.floor(Math.log10(max))
  const steps = [1, 2, 2.5, 5, 10]
  for (const step of steps) {
    const candidate = step * magnitude
    if (candidate >= max) return candidate
  }
  return magnitude * 10
}

// Single-series trend (est. 1RM, bodyweight, ...). No legend (one series),
// direct end-label, hairline gridlines, and a pointer-tracked crosshair +
// tooltip per the dataviz interaction spec.
//
// `zeroBased` controls the y-axis floor: a lift's 1RM naturally reads
// against a 0 baseline, but bodyweight fluctuates in a narrow band (say
// 78-82kg) where forcing the axis down to 0 flattens the trend into an
// unreadable near-flat line — pass false to instead zoom to the data's own
// range with a little padding. `decimals` controls label/tooltip rounding
// (0 for whole-kg lifts, 1 for bodyweight tracked to a tenth of a kg/lb).
function LineChart({ points, unit = 'kg', zeroBased = true, decimals = 0 }) {
  const [hoverIndex, setHoverIndex] = useState(null)
  const svgRef = useRef(null)

  if (points.length === 0) return null

  const values = points.map((p) => p.value)
  const dataMin = Math.min(...values)
  const dataMax = Math.max(...values)
  let minVal, maxVal
  if (zeroBased) {
    minVal = Math.min(0, ...values)
    maxVal = niceMax(dataMax * 1.05)
  } else {
    const range = dataMax - dataMin
    const pad = range > 0 ? range * 0.2 : Math.max(1, dataMax * 0.02)
    minVal = dataMin - pad
    maxVal = dataMax + pad
  }
  const plotW = WIDTH - PAD_X * 2
  const plotH = HEIGHT - PAD_TOP - PAD_BOTTOM

  function xFor(i) {
    if (points.length === 1) return PAD_X + plotW / 2
    return PAD_X + (i / (points.length - 1)) * plotW
  }
  function yFor(value) {
    const t = (value - minVal) / (maxVal - minVal || 1)
    return PAD_TOP + plotH - t * plotH
  }

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i)} ${yFor(p.value)}`).join(' ')
  const last = points[points.length - 1]
  const active = hoverIndex ?? points.length - 1
  const activePoint = points[active]

  function handleMove(e) {
    const rect = svgRef.current.getBoundingClientRect()
    const px = ((e.clientX - rect.left) / rect.width) * WIDTH
    let nearest = 0
    let best = Infinity
    points.forEach((p, i) => {
      const d = Math.abs(xFor(i) - px)
      if (d < best) {
        best = d
        nearest = i
      }
    })
    setHoverIndex(nearest)
  }

  return (
    <div style={{ position: 'relative' }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        width="100%"
        height={HEIGHT}
        onPointerMove={handleMove}
        onPointerLeave={() => setHoverIndex(null)}
        style={{ touchAction: 'pan-y' }}
      >
        {[0, 0.5, 1].map((t) => {
          const y = PAD_TOP + plotH - t * plotH
          const value = (minVal + t * (maxVal - minVal)).toFixed(decimals)
          return (
            <g key={t}>
              <line x1={PAD_X} x2={WIDTH - PAD_X} y1={y} y2={y} stroke="var(--color-border)" strokeWidth="1" />
              <text x={0} y={y - 4} fontSize="9" fill="var(--color-text-muted)">
                {value}
              </text>
            </g>
          )
        })}

        {hoverIndex !== null && (
          <line
            x1={xFor(hoverIndex)}
            x2={xFor(hoverIndex)}
            y1={PAD_TOP}
            y2={PAD_TOP + plotH}
            stroke="var(--color-text-muted)"
            strokeWidth="1"
          />
        )}

        <path d={linePath} fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

        {points.map((p, i) => (
          <circle
            key={i}
            cx={xFor(i)}
            cy={yFor(p.value)}
            r={i === active ? 5 : 4}
            fill="var(--color-primary)"
            stroke="var(--color-bg-card)"
            strokeWidth="2"
          />
        ))}

        <text x={xFor(points.length - 1)} y={yFor(last.value) - 12} fontSize="11" fontWeight="700" fill="var(--color-text)" textAnchor="end">
          {last.value.toFixed(decimals)}
        </text>
      </svg>
      {activePoint && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: `${(xFor(active) / WIDTH) * 100}%`,
            transform: `translateX(${active > points.length / 2 ? '-100%' : '0'})`,
            background: 'var(--color-bg-raised)',
            border: '1px solid var(--color-border)',
            borderRadius: 6,
            padding: '4px 8px',
            fontSize: 11,
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          <strong>{activePoint.value.toFixed(decimals)}{unit}</strong> · {activePoint.label}
        </div>
      )}
    </div>
  )
}

export default LineChart
