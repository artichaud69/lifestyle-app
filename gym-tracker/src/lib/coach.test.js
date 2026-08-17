import { describe, it, expect } from 'vitest'
import { generateProgram, nextSessionTemplate, suggestNextTarget, analyzeWorkout } from './coach.js'

function setsOf(weight, reps, count, overrides = {}) {
  return Array.from({ length: count }, () => ({ weight, reps, completed: true, isWarmup: false, ...overrides }))
}

function makeLog(id, date, sessionTemplateId, exerciseId, sets, exerciseName = 'Test Exercise') {
  return {
    id,
    date,
    sessionTemplateId,
    entries: [{ exerciseId, exerciseName, sets }],
  }
}

describe('generateProgram', () => {
  it('builds a two-session full body split for low frequency', () => {
    const program = generateProgram({ goal: 'strength', experience: 'beginner', daysPerWeek: 3, unit: 'kg' })
    expect(program.sessions).toHaveLength(2)
    expect(program.sessions.map((s) => s.name)).toEqual(['Full Body A', 'Full Body B'])
  })

  it('builds a four-session upper/lower split for 4 days a week', () => {
    const program = generateProgram({ goal: 'hypertrophy', experience: 'intermediate', daysPerWeek: 4, unit: 'kg' })
    expect(program.sessions).toHaveLength(4)
  })

  it('builds a three-session push/pull/legs split for high frequency', () => {
    const program = generateProgram({ goal: 'hypertrophy', experience: 'advanced', daysPerWeek: 6, unit: 'kg' })
    expect(program.sessions.map((s) => s.name)).toEqual(['Push', 'Pull', 'Legs'])
  })

  it('gives strength compounds a linear progression and low rep target', () => {
    const program = generateProgram({ goal: 'strength', experience: 'intermediate', daysPerWeek: 3, unit: 'kg' })
    const squat = program.sessions[0].exercises.find((e) => e.exerciseId === 'back-squat')
    expect(squat.progression).toBe('linear')
    expect(squat.repsMin).toBe(5)
  })

  it('gives hypertrophy work a double progression rep range', () => {
    const program = generateProgram({ goal: 'hypertrophy', experience: 'intermediate', daysPerWeek: 6, unit: 'kg' })
    const curl = program.sessions[1].exercises.find((e) => e.exerciseId === 'barbell-curl')
    expect(curl.progression).toBe('double')
    expect(curl.repsMax).toBeGreaterThan(curl.repsMin)
  })
})

describe('nextSessionTemplate', () => {
  it('starts at the first session when nothing has been logged', () => {
    const program = generateProgram({ goal: 'strength', experience: 'beginner', daysPerWeek: 3, unit: 'kg' })
    expect(nextSessionTemplate(program, [])).toBe(program.sessions[0])
  })

  it('rotates to the next session after a log for the current one', () => {
    const program = generateProgram({ goal: 'strength', experience: 'beginner', daysPerWeek: 3, unit: 'kg' })
    const logs = [{ programId: program.id, sessionTemplateId: program.sessions[0].id, date: '2026-01-01', entries: [] }]
    expect(nextSessionTemplate(program, logs)).toBe(program.sessions[1])
  })

  it('wraps back to the first session after the last one', () => {
    const program = generateProgram({ goal: 'strength', experience: 'beginner', daysPerWeek: 3, unit: 'kg' })
    const logs = [{ programId: program.id, sessionTemplateId: program.sessions[1].id, date: '2026-01-01', entries: [] }]
    expect(nextSessionTemplate(program, logs)).toBe(program.sessions[0])
  })
})

describe('suggestNextTarget - no history', () => {
  it('leaves weight unset with a first-time rationale', () => {
    const plan = { exerciseId: 'back-squat', targetSets: 3, repsMin: 5, repsMax: 5, progression: 'linear', targetWeight: null }
    const result = suggestNextTarget(plan, [], 'kg')
    expect(result.targetWeight).toBeNull()
    expect(result.rationale).toMatch(/first time/i)
  })
})

describe('suggestNextTarget - linear progression', () => {
  const plan = { exerciseId: 'back-squat', targetSets: 3, repsMin: 5, repsMax: 5, progression: 'linear', targetWeight: 100 }

  it('adds the exercise increment after a fully successful session', () => {
    const logs = [makeLog('l1', '2026-01-01', 's1', 'back-squat', setsOf(100, 5, 3))]
    const result = suggestNextTarget(plan, logs, 'kg')
    expect(result.targetWeight).toBe(105) // back-squat increment is 5kg
    expect(result.rationale).toMatch(/add 5kg/)
  })

  it('repeats the same weight after a single missed rep', () => {
    const sets = [...setsOf(100, 5, 2), { weight: 100, reps: 4, completed: true, isWarmup: false }]
    const logs = [makeLog('l1', '2026-01-01', 's1', 'back-squat', sets)]
    const result = suggestNextTarget(plan, logs, 'kg')
    expect(result.targetWeight).toBe(100)
    expect(result.rationale).toMatch(/missed a rep/i)
  })

  it('suggests a 10% deload after three straight failures at the same weight', () => {
    const failedSets = [...setsOf(100, 5, 2), { weight: 100, reps: 3, completed: true, isWarmup: false }]
    const logs = [
      makeLog('l1', '2026-01-01', 's1', 'back-squat', failedSets),
      makeLog('l2', '2026-01-08', 's1', 'back-squat', failedSets),
      makeLog('l3', '2026-01-15', 's1', 'back-squat', failedSets),
    ]
    const result = suggestNextTarget(plan, logs, 'kg')
    expect(result.targetWeight).toBe(90)
    expect(result.rationale).toMatch(/deload/i)
  })

  it('takes a bigger jump when the last session felt very easy (low RPE)', () => {
    const logs = [makeLog('l1', '2026-01-01', 's1', 'back-squat', setsOf(100, 5, 3, { rpe: 5 }))]
    const result = suggestNextTarget(plan, logs, 'kg')
    expect(result.targetWeight).toBe(110)
  })
})

describe('suggestNextTarget - double progression', () => {
  const plan = { exerciseId: 'dumbbell-curl', targetSets: 3, repsMin: 10, repsMax: 15, progression: 'double', targetWeight: 20 }

  it('increases weight and resets reps after hitting the top of the range', () => {
    const logs = [makeLog('l1', '2026-01-01', 's1', 'dumbbell-curl', setsOf(20, 15, 3))]
    const result = suggestNextTarget(plan, logs, 'kg')
    expect(result.targetWeight).toBe(21) // dumbbell-curl increment is 1kg
    expect(result.rationale).toMatch(/back to 10 reps/)
  })

  it('holds weight when in range but not yet at the ceiling', () => {
    const logs = [makeLog('l1', '2026-01-01', 's1', 'dumbbell-curl', setsOf(20, 12, 3))]
    const result = suggestNextTarget(plan, logs, 'kg')
    expect(result.targetWeight).toBe(20)
    expect(result.rationale).toMatch(/add a rep/i)
  })

  it('holds weight after missing the bottom of the range', () => {
    const logs = [makeLog('l1', '2026-01-01', 's1', 'dumbbell-curl', setsOf(20, 8, 3))]
    const result = suggestNextTarget(plan, logs, 'kg')
    expect(result.targetWeight).toBe(20)
    expect(result.rationale).toMatch(/missed the rep range/i)
  })
})

describe('analyzeWorkout', () => {
  it('flags a personal record when the estimated 1RM improves', () => {
    const priorLogs = [makeLog('l1', '2026-01-01', 's1', 'back-squat', setsOf(100, 5, 3), 'Back Squat')]
    const currentLog = makeLog('l2', '2026-01-08', 's1', 'back-squat', setsOf(105, 5, 3), 'Back Squat')
    const result = analyzeWorkout(currentLog, [...priorLogs, currentLog], {})
    expect(result.prCount).toBe(1)
    expect(result.cards[0].type).toBe('pr')
  })

  it('flags a missed target against the session plan', () => {
    const plan = { exerciseId: 'back-squat', targetSets: 3, repsMin: 5, repsMax: 5, progression: 'linear' }
    const currentLog = makeLog(
      'l1',
      '2026-01-08',
      's1',
      'back-squat',
      [...setsOf(100, 5, 2), { weight: 100, reps: 3, completed: true, isWarmup: false }],
      'Back Squat',
    )
    const result = analyzeWorkout(currentLog, [currentLog], { 'back-squat': plan })
    expect(result.cards.some((c) => c.type === 'warning')).toBe(true)
  })

  it('detects a stall when the estimated 1RM has been flat for several sessions', () => {
    const plan = { exerciseId: 'bench', targetSets: 3, repsMin: 5, repsMax: 5, progression: 'linear' }
    const flatSets = setsOf(100, 5, 3)
    const logs = [
      makeLog('l1', '2026-01-01', 's1', 'bench', flatSets, 'Bench'),
      makeLog('l2', '2026-01-08', 's1', 'bench', flatSets, 'Bench'),
      makeLog('l3', '2026-01-15', 's1', 'bench', flatSets, 'Bench'),
      makeLog('l4', '2026-01-22', 's1', 'bench', flatSets, 'Bench'),
    ]
    const result = analyzeWorkout(logs[3], logs, { bench: plan })
    expect(result.cards.some((c) => c.type === 'stall')).toBe(true)
  })

  it('has an encouraging default message when nothing notable happened', () => {
    const currentLog = makeLog('l1', '2026-01-01', 's1', 'back-squat', setsOf(100, 5, 3), 'Back Squat')
    const result = analyzeWorkout(currentLog, [currentLog], {})
    expect(result.overallMessage).toBeTruthy()
  })
})
