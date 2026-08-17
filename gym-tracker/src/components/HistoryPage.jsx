import { useState } from 'react'
import PageHeader from './PageHeader.jsx'
import WorkoutDetailSheet from './WorkoutDetailSheet.jsx'
import { HistoryIcon } from '../lib/icons.jsx'
import { formatDateShort } from '../lib/dates.js'
import { totalVolume } from '../lib/workout.js'

function HistoryPage({ logs, settings, onDeleteLog }) {
  const [openLogId, setOpenLogId] = useState(null)
  const sorted = [...logs].sort((a, b) => new Date(b.date) - new Date(a.date))
  const openLog = sorted.find((l) => l.id === openLogId)

  return (
    <div>
      <PageHeader title="History" />

      {sorted.length === 0 && (
        <div className="card empty-state">
          <HistoryIcon size={36} />
          <h3>No workouts logged yet</h3>
          <p>Finish a workout from the Train tab and it will show up here.</p>
        </div>
      )}

      {sorted.length > 0 && (
        <div className="card">
          {sorted.map((log) => {
            const volume = log.entries.reduce((sum, e) => sum + totalVolume(e.sets), 0)
            const setCount = log.entries.reduce((sum, e) => sum + e.sets.filter((s) => s.completed).length, 0)
            return (
              <div key={log.id} className="history-log-item" onClick={() => setOpenLogId(log.id)}>
                <div>
                  <div className="name">{log.sessionName}</div>
                  <div className="date">
                    {formatDateShort(log.date)} · {log.entries.length} exercises · {setCount} sets
                  </div>
                </div>
                <div className="muted">{Math.round(volume).toLocaleString()} {settings.unit}</div>
              </div>
            )
          })}
        </div>
      )}

      {openLog && (
        <WorkoutDetailSheet
          log={openLog}
          unit={settings.unit}
          onClose={() => setOpenLogId(null)}
          onDelete={(id) => {
            onDeleteLog(id)
            setOpenLogId(null)
          }}
        />
      )}
    </div>
  )
}

export default HistoryPage
