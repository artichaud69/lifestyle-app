import Sheet from './Sheet.jsx'
import { AwardIcon, AlertIcon, TrendUpIcon, CheckIcon } from '../lib/icons.jsx'
import { totalVolume } from '../lib/workout.js'

const ICONS = {
  pr: AwardIcon,
  stall: AlertIcon,
  warning: AlertIcon,
  progress: TrendUpIcon,
  info: CheckIcon,
}

function WorkoutSummarySheet({ log, result, unit, onClose }) {
  const volume = log.entries.reduce((sum, entry) => sum + totalVolume(entry.sets), 0)
  const setCount = log.entries.reduce((sum, entry) => sum + entry.sets.filter((s) => s.completed).length, 0)

  return (
    <Sheet title="Workout Complete" onClose={onClose}>
      <p>{result.overallMessage}</p>

      <div className="stat-row">
        <div className="stat-tile">
          <div className="value">{log.entries.length}</div>
          <div className="label">Exercises</div>
        </div>
        <div className="stat-tile">
          <div className="value">{setCount}</div>
          <div className="label">Sets</div>
        </div>
        <div className="stat-tile">
          <div className="value">
            {Math.round(volume).toLocaleString()}
          </div>
          <div className="label">Volume ({unit})</div>
        </div>
      </div>

      {result.cards.map((card, i) => {
        const Icon = ICONS[card.type] ?? CheckIcon
        return (
          <div key={i} className={`feedback-card ${card.type}`}>
            <div className="icon-wrap">
              <Icon size={16} />
            </div>
            <p>{card.message}</p>
          </div>
        )
      })}

      <button type="button" className="btn btn-primary" style={{ marginTop: 'var(--space-3)' }} onClick={onClose}>
        Done
      </button>
    </Sheet>
  )
}

export default WorkoutSummarySheet
