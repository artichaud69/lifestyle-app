import { Fragment, useState } from 'react'
import PageHeader from './PageHeader.jsx'
import ProgramWizard from './ProgramWizard.jsx'
import SessionEditSheet from './SessionEditSheet.jsx'
import SettingsSheet from './SettingsSheet.jsx'
import { CalendarIcon, SettingsIcon, EditIcon, PlusIcon } from '../lib/icons.jsx'
import { findExercise } from '../lib/exercises.js'
import { groupLabels } from '../lib/superset.js'
import { genId } from '../lib/id.js'

function PlanPage({
  program,
  settings,
  customExercises,
  goalSettings,
  onGenerateProgram,
  onUpdateSession,
  onAddSession,
  onDeleteSession,
  onSaveSettings,
  onAddCustomExercise,
  onImportProgram,
}) {
  const [showWizard, setShowWizard] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [editingSessionId, setEditingSessionId] = useState(null)

  const editingSession = program?.sessions.find((s) => s.id === editingSessionId)

  function addSession() {
    const newSession = { id: genId(), name: 'New Session', finisherNote: null, exercises: [] }
    onAddSession(newSession)
    setEditingSessionId(newSession.id)
  }

  return (
    <div>
      <PageHeader
        title="Plan"
        action={
          <button type="button" className="icon-btn" onClick={() => setShowSettings(true)} aria-label="Settings">
            <SettingsIcon size={18} />
          </button>
        }
      />

      {program ? (
        <>
          <div className="card">
            <div className="card-title-row">
              <h2>{program.name}</h2>
            </div>
            <p style={{ marginTop: -4 }}>{program.daysPerWeek} days a week · {program.experience}</p>
            <button type="button" className="btn btn-secondary" onClick={() => setShowWizard(true)}>
              Regenerate Plan
            </button>
          </div>

          {program.sessions.map((session) => (
            <div key={session.id} className="session-list-item">
              <div className="card-title-row">
                <strong>{session.name}</strong>
                <button type="button" className="icon-btn" onClick={() => setEditingSessionId(session.id)} aria-label="Edit session">
                  <EditIcon size={15} />
                </button>
              </div>
              {(() => {
                const labels = groupLabels(session.exercises)
                return session.exercises.map((ex) => {
                  const info = findExercise(ex.exerciseId, customExercises)
                  const reps = ex.repsMin === ex.repsMax ? `${ex.repsMin}` : `${ex.repsMin}-${ex.repsMax}`
                  const label = ex.supersetGroup ? labels.get(ex.supersetGroup) : null
                  return (
                    <Fragment key={ex.id}>
                      <div className="ex-name">
                        <span>
                          {label && <span className="badge primary" style={{ marginRight: 6 }}>{label}</span>}
                          {ex.longOnly && <span className="badge" style={{ marginRight: 6 }}>Full only</span>}
                          {info?.name ?? ex.exerciseId}
                        </span>
                        <span className="muted">{ex.targetSets} × {reps}</span>
                      </div>
                      {ex.notes && <div className="exercise-note">{ex.notes}</div>}
                    </Fragment>
                  )
                })
              })()}
              {session.finisherNote && <div className="finisher-note">{session.finisherNote}</div>}
            </div>
          ))}

          <button type="button" className="btn btn-secondary" onClick={addSession}>
            <PlusIcon size={18} /> Add Session
          </button>
        </>
      ) : (
        <div className="card empty-state">
          <CalendarIcon size={36} />
          <h3>No plan yet</h3>
          <p>Answer a few questions and the coach will build a full program around your goal.</p>
          <button type="button" className="btn btn-primary" onClick={() => setShowWizard(true)}>
            Build My Plan
          </button>
        </div>
      )}

      {showWizard && (
        <ProgramWizard
          initial={goalSettings}
          unit={settings.unit}
          onGenerate={(newGoalSettings) => {
            onGenerateProgram(newGoalSettings)
            setShowWizard(false)
          }}
          onClose={() => setShowWizard(false)}
        />
      )}

      {editingSession && (
        <SessionEditSheet
          session={editingSession}
          customExercises={customExercises}
          onAddCustomExercise={onAddCustomExercise}
          onSave={(updated) => {
            onUpdateSession(updated)
            setEditingSessionId(null)
          }}
          onDelete={
            program.sessions.length > 1
              ? (sessionId) => {
                  onDeleteSession(sessionId)
                  setEditingSessionId(null)
                }
              : undefined
          }
          onClose={() => setEditingSessionId(null)}
        />
      )}

      {showSettings && (
        <SettingsSheet
          settings={settings}
          program={program}
          onSave={(newSettings) => {
            onSaveSettings(newSettings)
            setShowSettings(false)
          }}
          onImportProgram={(imported) => {
            onImportProgram(imported)
            setShowSettings(false)
          }}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  )
}

export default PlanPage
