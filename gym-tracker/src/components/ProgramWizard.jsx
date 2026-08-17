import { useState } from 'react'
import Sheet from './Sheet.jsx'

const GOALS = [
  { key: 'strength', label: 'Strength', desc: 'Heavier weights, lower reps, linear progression on your main lifts.' },
  { key: 'hypertrophy', label: 'Build Muscle', desc: 'Moderate reps, more volume, double progression on everything.' },
  { key: 'general', label: 'General Fitness', desc: 'Lighter, higher reps, full-body focus.' },
]
const EXPERIENCE = [
  { key: 'beginner', label: 'Beginner', desc: 'New to structured training, or back after a long break.' },
  { key: 'intermediate', label: 'Intermediate', desc: 'Training consistently for 6+ months.' },
  { key: 'advanced', label: 'Advanced', desc: 'Years of consistent training.' },
]
const DAYS = [2, 3, 4, 5, 6]

function ProgramWizard({ initial, unit, onGenerate, onClose }) {
  const [step, setStep] = useState(0)
  const [goal, setGoal] = useState(initial?.goal ?? 'hypertrophy')
  const [experience, setExperience] = useState(initial?.experience ?? 'beginner')
  const [daysPerWeek, setDaysPerWeek] = useState(initial?.daysPerWeek ?? 3)

  const steps = ['Goal', 'Experience', 'Days per week']

  function next() {
    if (step < steps.length - 1) setStep(step + 1)
    else onGenerate({ goal, experience, daysPerWeek, unit })
  }

  return (
    <Sheet title="Build My Plan" onClose={onClose}>
      <div className="wizard-step-dots">
        {steps.map((_, i) => (
          <span key={i} className={i === step ? 'active' : ''} />
        ))}
      </div>

      {step === 0 && (
        <div>
          <h3>What's your main goal?</h3>
          {GOALS.map((g) => (
            <div
              key={g.key}
              className="card card-tight"
              style={{ cursor: 'pointer', borderColor: goal === g.key ? 'var(--color-primary)' : undefined }}
              onClick={() => setGoal(g.key)}
            >
              <div className="card-title-row" style={{ marginBottom: 4 }}>
                <strong>{g.label}</strong>
                {goal === g.key && <span className="badge primary">Selected</span>}
              </div>
              <p style={{ margin: 0 }}>{g.desc}</p>
            </div>
          ))}
        </div>
      )}

      {step === 1 && (
        <div>
          <h3>Training experience</h3>
          {EXPERIENCE.map((e) => (
            <div
              key={e.key}
              className="card card-tight"
              style={{ cursor: 'pointer', borderColor: experience === e.key ? 'var(--color-primary)' : undefined }}
              onClick={() => setExperience(e.key)}
            >
              <div className="card-title-row" style={{ marginBottom: 4 }}>
                <strong>{e.label}</strong>
                {experience === e.key && <span className="badge primary">Selected</span>}
              </div>
              <p style={{ margin: 0 }}>{e.desc}</p>
            </div>
          ))}
        </div>
      )}

      {step === 2 && (
        <div>
          <h3>How many days a week?</h3>
          <div className="chip-row">
            {DAYS.map((d) => (
              <button key={d} type="button" className={`chip${daysPerWeek === d ? ' active' : ''}`} onClick={() => setDaysPerWeek(d)}>
                {d} days
              </button>
            ))}
          </div>
          <p style={{ marginTop: 'var(--space-3)' }}>
            {daysPerWeek <= 3 && "You'll get a Full Body A/B split."}
            {daysPerWeek === 4 && "You'll get an Upper/Lower split."}
            {daysPerWeek >= 5 && "You'll get a Push/Pull/Legs split."}
          </p>
        </div>
      )}

      <div className="btn-block-row" style={{ marginTop: 'var(--space-4)' }}>
        {step > 0 && (
          <button type="button" className="btn btn-ghost" onClick={() => setStep(step - 1)}>
            Back
          </button>
        )}
        <button type="button" className="btn btn-primary" onClick={next}>
          {step === steps.length - 1 ? 'Generate Plan' : 'Next'}
        </button>
      </div>
    </Sheet>
  )
}

export default ProgramWizard
