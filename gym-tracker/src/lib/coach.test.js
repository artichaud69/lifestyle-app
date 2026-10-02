import { describe, it, expect } from 'vitest'
import { generateProgram, nextSessionTemplate, suggestNextTarget, analyzeWorkout } from './coach.js'

// The fixture logs are dated in January 2026. Suggestions are made as of the
// day after each test's last workout, so the gap up to the real date isn't
// read as a training break (breaks have their own tests below).
function dayAfterLast(logs) {
  const last = logs.map((log) => log.date).sort().at(-1) ?? '2026-01-01'
  const next = new Date(`${last}T00:00:00Z`)
  next.setUTCDate(next.getUTCDate() + 1)
  return next.toISOString().slice(0, 10)
}

function setsOf(weight, reps, count, overrides = {}) {
  return Array.from({ length: count }, () => ({ weight, reps, completed: true, isWarmup: false, ...overrides }))
}

function makeLog(id, date, sessionTemplateId, exerciseId, sets, exerciseName = 'Test Exercise', scheme = null) {
  return {
    id,
    date,
    sessionTemplateId,
    entries: [{ exerciseId, exerciseName, sets, scheme }],
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
    const result = suggestNextTarget(plan, [], 'kg', dayAfterLast([]))
    expect(result.targetWeight).toBeNull()
    expect(result.rationale).toMatch(/first time/i)
  })
})

describe('suggestNextTarget - linear progression', () => {
  const plan = { exerciseId: 'back-squat', targetSets: 3, repsMin: 5, repsMax: 5, progression: 'linear', targetWeight: 100 }

  it('adds the exercise increment once every set is at the rep target', () => {
    const logs = [makeLog('l1', '2026-01-01', 's1', 'back-squat', setsOf(100, 5, 3))]
    const result = suggestNextTarget(plan, logs, 'kg', dayAfterLast(logs))
    expect(result.targetWeight).toBe(105) // back-squat increment is 5kg
    expect(result.targetRepsPerSet).toEqual([5, 5, 5])
    expect(result.rationale).toMatch(/up to 105kg/)
  })

  it('holds the weight and asks for the missing set again after a missed rep', () => {
    const sets = [...setsOf(100, 5, 2), { weight: 100, reps: 4, completed: true, isWarmup: false }]
    const logs = [makeLog('l1', '2026-01-01', 's1', 'back-squat', sets)]
    const result = suggestNextTarget(plan, logs, 'kg', dayAfterLast(logs))
    expect(result.targetWeight).toBe(100)
    expect(result.targetRepsPerSet).toEqual([5, 5, 5])
  })

  it('suggests a 10% deload after three consecutive sessions without progress', () => {
    // The first session establishes the baseline — there is nothing yet for it
    // to have failed against — so three no-progress sessions means four logs.
    const failedSets = [...setsOf(100, 5, 2), { weight: 100, reps: 3, completed: true, isWarmup: false }]
    const logs = [
      makeLog('l1', '2026-01-01', 's1', 'back-squat', failedSets),
      makeLog('l2', '2026-01-08', 's1', 'back-squat', failedSets),
      makeLog('l3', '2026-01-15', 's1', 'back-squat', failedSets),
      makeLog('l4', '2026-01-22', 's1', 'back-squat', failedSets),
    ]
    const result = suggestNextTarget(plan, logs, 'kg', dayAfterLast(logs))
    expect(result.targetWeight).toBe(90)
    expect(result.rationale).toMatch(/without progress/i)
  })

  it('ignores RPE entirely — the jump size is always the flat increment', () => {
    const easyLogs = [makeLog('l1', '2026-01-01', 's1', 'back-squat', setsOf(100, 5, 3, { rpe: 5 }))]
    const hardLogs = [makeLog('l1', '2026-01-01', 's1', 'back-squat', setsOf(100, 5, 3, { rpe: 10 }))]
    expect(suggestNextTarget(plan, easyLogs, 'kg', dayAfterLast(easyLogs)).targetWeight).toBe(105)
    expect(suggestNextTarget(plan, hardLogs, 'kg', dayAfterLast(hardLogs)).targetWeight).toBe(105)
  })
})

describe('suggestNextTarget - ramping/ascending sets', () => {
  const plan = { exerciseId: 'safety-bar-squat', targetSets: 3, repsMin: 5, repsMax: 5, progression: 'linear', targetWeight: 100 }

  it('takes the heaviest set as the working load, not the first', () => {
    // Ramping scheme: lighter set first, then two heavy top sets — a common
    // "3 heavy sets" protocol where the first set is not the target weight.
    // The ramp-up set is not a set at the top weight, so the load holds until
    // all three are taken there.
    const sets = [
      { weight: 90, reps: 5, completed: true, isWarmup: false },
      { weight: 100, reps: 5, completed: true, isWarmup: false },
      { weight: 100, reps: 5, completed: true, isWarmup: false },
    ]
    const logs = [makeLog('l1', '2026-01-01', 's1', 'safety-bar-squat', sets)]
    const result = suggestNextTarget(plan, logs, 'kg', dayAfterLast(logs))
    expect(result.targetWeight).toBe(100)
    expect(result.targetRepsPerSet).toEqual([5, 5, 5])
  })

  it('adds weight once all three sets are taken at the top weight', () => {
    const logs = [
      makeLog('l1', '2026-01-01', 's1', 'safety-bar-squat', [
        { weight: 90, reps: 5, completed: true, isWarmup: false },
        { weight: 100, reps: 5, completed: true, isWarmup: false },
        { weight: 100, reps: 5, completed: true, isWarmup: false },
      ]),
      makeLog('l2', '2026-01-08', 's1', 'safety-bar-squat', setsOf(100, 5, 3)),
    ]
    expect(suggestNextTarget(plan, logs, 'kg', dayAfterLast(logs)).targetWeight).toBe(105)
  })

  it('ignores a lighter ramp-up set that falls short of the rep floor', () => {
    const sets = [
      { weight: 90, reps: 3, completed: true, isWarmup: false },
      { weight: 100, reps: 5, completed: true, isWarmup: false },
      { weight: 100, reps: 5, completed: true, isWarmup: false },
    ]
    const logs = [makeLog('l1', '2026-01-01', 's1', 'safety-bar-squat', sets)]
    const result = suggestNextTarget(plan, logs, 'kg', dayAfterLast(logs))
    expect(result.targetWeight).toBe(100)
    expect(result.targetRepsPerSet).toEqual([5, 5, 5])
  })

  it('does not credit a top set that fell short of the rep floor', () => {
    const sets = [
      { weight: 90, reps: 5, completed: true, isWarmup: false },
      { weight: 100, reps: 5, completed: true, isWarmup: false },
      { weight: 100, reps: 3, completed: true, isWarmup: false },
    ]
    const logs = [makeLog('l1', '2026-01-01', 's1', 'safety-bar-squat', sets)]
    const result = suggestNextTarget(plan, logs, 'kg', dayAfterLast(logs))
    expect(result.targetWeight).toBe(100)
  })
})

describe('suggestNextTarget - double progression', () => {
  const plan = { exerciseId: 'dumbbell-curl', targetSets: 3, repsMin: 10, repsMax: 15, progression: 'double', targetWeight: 20 }

  it('increases weight and resets reps after hitting the top of the range', () => {
    const logs = [makeLog('l1', '2026-01-01', 's1', 'dumbbell-curl', setsOf(20, 15, 3))]
    const result = suggestNextTarget(plan, logs, 'kg', dayAfterLast(logs))
    expect(result.targetWeight).toBe(21) // dumbbell-curl increment is 1kg
    expect(result.targetRepsPerSet).toEqual([10, 10, 10])
    expect(result.rationale).toMatch(/back to 10s/)
  })

  it('holds weight when in range but not yet at the ceiling, and adds a rep to one set', () => {
    const logs = [makeLog('l1', '2026-01-01', 's1', 'dumbbell-curl', setsOf(20, 12, 3))]
    const result = suggestNextTarget(plan, logs, 'kg', dayAfterLast(logs))
    expect(result.targetWeight).toBe(20)
    expect(result.targetRepsPerSet).toEqual([13, 12, 12])
    expect(result.rationale).toMatch(/next step is 13\/12\/12/i)
  })

  it('adds the rep to the weakest set, leaving the stronger sets where they were', () => {
    const logs = [makeLog('l1', '2026-01-01', 's1', 'dumbbell-curl', [
      { weight: 20, reps: 14, completed: true, isWarmup: false },
      { weight: 20, reps: 14, completed: true, isWarmup: false },
      { weight: 20, reps: 10, completed: true, isWarmup: false },
    ])]
    const result = suggestNextTarget(plan, logs, 'kg', dayAfterLast(logs))
    expect(result.targetRepsPerSet).toEqual([14, 14, 11])
  })

  it('holds weight and targets the bottom of the range after missing it entirely', () => {
    const logs = [makeLog('l1', '2026-01-01', 's1', 'dumbbell-curl', setsOf(20, 8, 3))]
    const result = suggestNextTarget(plan, logs, 'kg', dayAfterLast(logs))
    expect(result.targetWeight).toBe(20)
    expect(result.targetRepsPerSet).toEqual([10, 10, 10])
  })
})

describe('suggestNextTarget - separate rep schemes for the same lift', () => {
  const strengthPlan = { exerciseId: 'back-squat', targetSets: 3, repsMin: 5, repsMax: 5, progression: 'linear', targetWeight: 100 }
  const hypertrophyPlan = { exerciseId: 'back-squat', targetSets: 3, repsMin: 10, repsMax: 15, progression: 'double', targetWeight: null }

  it('does not carry a strength weight into a hypertrophy prescription', () => {
    const logs = [makeLog('l1', '2026-01-01', 's1', 'back-squat', setsOf(100, 5, 3), 'Back Squat', { repsMin: 5, repsMax: 5 })]
    const result = suggestNextTarget(hypertrophyPlan, logs, 'kg', dayAfterLast(logs))
    // est. 1RM 116.7 -> ~87.5 for 10 reps, held back to ~78.8, floored onto
    // the back squat's 5kg grid.
    expect(result.targetWeight).toBe(75)
    expect(result.targetReps).toBe(10)
    expect(result.rationale).toMatch(/no history yet at 10-15 reps/i)
  })

  it('does not carry a hypertrophy weight into a strength prescription either', () => {
    const logs = [makeLog('l1', '2026-01-01', 's1', 'back-squat', setsOf(80, 12, 3), 'Back Squat', { repsMin: 10, repsMax: 15 })]
    const result = suggestNextTarget(strengthPlan, logs, 'kg', dayAfterLast(logs))
    expect(result.targetWeight).toBeGreaterThan(80)
    expect(result.targetWeight).toBeLessThan(112)
    expect(result.targetReps).toBe(5)
  })

  it('progresses each rep scheme off its own history once both exist', () => {
    const logs = [
      makeLog('l1', '2026-01-01', 's1', 'back-squat', setsOf(75, 15, 3), 'Back Squat', { repsMin: 10, repsMax: 15 }),
      makeLog('l2', '2026-01-04', 's2', 'back-squat', setsOf(100, 5, 3), 'Back Squat', { repsMin: 5, repsMax: 5 }),
    ]
    expect(suggestNextTarget(strengthPlan, logs, 'kg', dayAfterLast(logs)).targetWeight).toBe(105)
    expect(suggestNextTarget(hypertrophyPlan, logs, 'kg', dayAfterLast(logs)).targetWeight).toBe(80)
  })

  it('still progresses normally when the most recent session is the other scheme', () => {
    const logs = [
      makeLog('l1', '2026-01-01', 's1', 'back-squat', setsOf(100, 5, 3), 'Back Squat', { repsMin: 5, repsMax: 5 }),
      makeLog('l2', '2026-01-04', 's2', 'back-squat', setsOf(75, 12, 3), 'Back Squat', { repsMin: 10, repsMax: 15 }),
    ]
    const result = suggestNextTarget(strengthPlan, logs, 'kg', dayAfterLast(logs))
    expect(result.targetWeight).toBe(105)
    expect(result.rationale).toMatch(/up to 105kg/)
  })

  it('reads the scheme off logged reps for entries saved before schemes were recorded', () => {
    const logs = [makeLog('l1', '2026-01-01', 's1', 'back-squat', setsOf(100, 5, 3), 'Back Squat')]
    expect(suggestNextTarget(hypertrophyPlan, logs, 'kg', dayAfterLast(logs)).targetWeight).toBe(75)
    expect(suggestNextTarget(strengthPlan, logs, 'kg', dayAfterLast(logs)).targetWeight).toBe(105)
  })

  it('keeps the no-progress streak within one rep range', () => {
    const missed = [...setsOf(100, 5, 2), { weight: 100, reps: 3, completed: true, isWarmup: false }]
    const strength = (id, date) => makeLog(id, date, 's1', 'back-squat', missed, 'Back Squat', { repsMin: 5, repsMax: 5 })
    const hypertrophy = (id, date) =>
      makeLog(id, date, 's2', 'back-squat', setsOf(70, 15, 3), 'Back Squat', { repsMin: 10, repsMax: 15 })
    const logs = [
      strength('l1', '2026-01-01'),
      hypertrophy('l2', '2026-01-03'),
      strength('l3', '2026-01-08'),
      hypertrophy('l4', '2026-01-10'),
      strength('l5', '2026-01-15'),
      hypertrophy('l6', '2026-01-17'),
      strength('l7', '2026-01-22'),
    ]
    // The hypertrophy sessions in between neither break nor pad the streak.
    const result = suggestNextTarget(strengthPlan, logs, 'kg', dayAfterLast(logs))
    expect(result.targetWeight).toBe(90)
    expect(result.rationale).toMatch(/without progress/i)
  })

  it('leaves bodyweight work on the first-time advice rather than converting from zero', () => {
    const plan = { exerciseId: 'push-up', targetSets: 3, repsMin: 12, repsMax: 20, progression: 'double', targetWeight: null }
    const logs = [makeLog('l1', '2026-01-01', 's1', 'push-up', setsOf(0, 5, 3), 'Push-Up', { repsMin: 5, repsMax: 5 })]
    const result = suggestNextTarget(plan, logs, 'kg', dayAfterLast(logs))
    expect(result.targetWeight).toBeNull()
    expect(result.rationale).toMatch(/first time/i)
  })
})

describe('coming back from a holiday', () => {
  const plan = { exerciseId: 'back-squat', targetSets: 3, repsMin: 5, repsMax: 8, progression: 'double', targetWeight: null }
  const scheme = { repsMin: 5, repsMax: 8 }
  const squat = (id, date, sets) => makeLog(id, date, 's1', 'back-squat', sets, 'Back Squat', scheme)
  const preHoliday = [
    squat('l1', '2026-06-01', [...setsOf(100, 7, 1), ...setsOf(100, 6, 2)]),
    squat('l2', '2026-06-04', [...setsOf(100, 7, 2), ...setsOf(100, 6, 1)]),
  ]

  it('eases the first session back in after two weeks off', () => {
    const result = suggestNextTarget(plan, preHoliday, 'kg', '2026-06-19')
    expect(result.targetWeight).toBe(90) // back-squat loads in 5kg steps
    expect(result.targetRepsPerSet).toEqual([7, 7, 6])
    expect(result.rationale).toMatch(/back from a 15-day break/i)
  })

  it('treats any workout as training, so a lift skipped for a fortnight is not a break', () => {
    const otherTraining = [
      ...preHoliday,
      makeLog('o1', '2026-06-09', 's2', 'barbell-bench-press', setsOf(80, 5, 3), 'Bench'),
      makeLog('o2', '2026-06-14', 's2', 'barbell-bench-press', setsOf(80, 5, 3), 'Bench'),
    ]
    const result = suggestNextTarget(plan, otherTraining, 'kg', '2026-06-19')
    expect(result.targetWeight).toBe(100)
  })

  it('reports the first session back as rebuilding rather than no progress', () => {
    const back = squat('l3', '2026-06-19', [...setsOf(90, 7, 2), ...setsOf(90, 6, 1)])
    const result = analyzeWorkout(back, [...preHoliday, back], { 'back-squat': plan })
    expect(result.rebuildCount).toBe(1)
    expect(result.cards.some((c) => /cleared on the way back/.test(c.message))).toBe(true)
    expect(result.cards.some((c) => /no new ground/i.test(c.message))).toBe(false)
  })

  it('returns to the pre-break load once the rebuild steps are cleared', () => {
    const logs = [
      ...preHoliday,
      squat('l3', '2026-06-19', [...setsOf(90, 7, 2), ...setsOf(90, 6, 1)]),
      squat('l4', '2026-06-22', [...setsOf(95, 7, 2), ...setsOf(95, 6, 1)]),
    ]
    const result = suggestNextTarget(plan, logs, 'kg', '2026-06-25')
    expect(result.targetWeight).toBe(100)
    expect(result.targetRepsPerSet).toEqual([7, 7, 7])
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

  it('reports no progress without calling the session a failure', () => {
    const plan = { exerciseId: 'back-squat', targetSets: 3, repsMin: 5, repsMax: 8, progression: 'double' }
    const scheme = { repsMin: 5, repsMax: 8 }
    const flat = [...setsOf(100, 7, 1), ...setsOf(100, 6, 2)]
    const priorLog = makeLog('l1', '2026-01-01', 's1', 'back-squat', flat, 'Back Squat', scheme)
    const currentLog = makeLog('l2', '2026-01-08', 's1', 'back-squat', flat, 'Back Squat', scheme)
    const result = analyzeWorkout(currentLog, [priorLog, currentLog], { 'back-squat': plan })
    expect(result.cards.some((c) => c.type === 'warning')).toBe(false)
    const card = result.cards.find((c) => c.type === 'info')
    expect(card.message).toMatch(/no new ground/i)
  })

  it('calls a partial set-level improvement progress', () => {
    const plan = { exerciseId: 'back-squat', targetSets: 3, repsMin: 5, repsMax: 8, progression: 'double' }
    const scheme = { repsMin: 5, repsMax: 8 }
    const priorLog = makeLog('l1', '2026-01-01', 's1', 'back-squat', setsOf(100, 5, 3), 'Back Squat', scheme)
    const currentLog = makeLog(
      'l2',
      '2026-01-08',
      's1',
      'back-squat',
      [...setsOf(100, 6, 1), ...setsOf(100, 5, 2)],
      'Back Squat',
      scheme,
    )
    const result = analyzeWorkout(currentLog, [priorLog, currentLog], { 'back-squat': plan })
    expect(result.cards.some((c) => c.type === 'warning')).toBe(false)
    expect(result.cards.some((c) => c.type === 'progress')).toBe(true)
  })

  it('announces that the load goes up when the rep range is topped out', () => {
    const plan = { exerciseId: 'back-squat', targetSets: 3, repsMin: 5, repsMax: 8, progression: 'double' }
    const scheme = { repsMin: 5, repsMax: 8 }
    const priorLog = makeLog('l1', '2026-01-01', 's1', 'back-squat', setsOf(100, 7, 3), 'Back Squat', scheme)
    const currentLog = makeLog('l2', '2026-01-08', 's1', 'back-squat', setsOf(100, 8, 3), 'Back Squat', scheme)
    const result = analyzeWorkout(currentLog, [priorLog, currentLog], { 'back-squat': plan })
    expect(result.levelCount).toBe(1)
    expect(result.cards.some((c) => /goes up next session/.test(c.message))).toBe(true)
  })

  it('says nothing either way about a session that was cut short', () => {
    const plan = { exerciseId: 'back-squat', targetSets: 3, repsMin: 5, repsMax: 8, progression: 'double' }
    const scheme = { repsMin: 5, repsMax: 8 }
    const priorLog = makeLog('l1', '2026-01-01', 's1', 'back-squat', setsOf(100, 6, 3), 'Back Squat', scheme)
    const currentLog = makeLog('l2', '2026-01-08', 's1', 'back-squat', setsOf(100, 6, 2), 'Back Squat', scheme)
    const result = analyzeWorkout(currentLog, [priorLog, currentLog], { 'back-squat': plan })
    expect(result.cards.some((c) => c.type === 'warning' || c.type === 'info')).toBe(false)
  })

  it('announces the unload on the third consecutive session without progress', () => {
    const plan = { exerciseId: 'bench', targetSets: 3, repsMin: 5, repsMax: 8, progression: 'double' }
    const scheme = { repsMin: 5, repsMax: 8 }
    const flatSets = [...setsOf(100, 7, 1), ...setsOf(100, 6, 2)]
    const logs = [
      makeLog('l1', '2026-01-01', 's1', 'bench', flatSets, 'Bench', scheme),
      makeLog('l2', '2026-01-08', 's1', 'bench', flatSets, 'Bench', scheme),
      makeLog('l3', '2026-01-15', 's1', 'bench', flatSets, 'Bench', scheme),
      makeLog('l4', '2026-01-22', 's1', 'bench', flatSets, 'Bench', scheme),
    ]
    // The first three hold the line without a card; only the fourth session,
    // which is the third with no new ground, unloads.
    expect(analyzeWorkout(logs[2], logs.slice(0, 3), { bench: plan }).cards.some((c) => c.type === 'stall')).toBe(false)
    const result = analyzeWorkout(logs[3], logs, { bench: plan })
    const card = result.cards.find((c) => c.type === 'stall')
    expect(card.message).toMatch(/dropping to 90kg/)
  })

  it('does not flag a missed target when only a lighter ramp-up set falls short of the rep goal', () => {
    const plan = { exerciseId: 'safety-bar-squat', targetSets: 3, repsMin: 5, repsMax: 5, progression: 'linear' }
    const sets = [
      { weight: 90, reps: 3, completed: true, isWarmup: false },
      { weight: 100, reps: 5, completed: true, isWarmup: false },
      { weight: 100, reps: 5, completed: true, isWarmup: false },
    ]
    const currentLog = makeLog('l1', '2026-01-08', 's1', 'safety-bar-squat', sets, 'Safety Bar Squat')
    const result = analyzeWorkout(currentLog, [currentLog], { 'safety-bar-squat': plan })
    expect(result.cards.some((c) => c.type === 'warning')).toBe(false)
  })

  it('does not call a volume increase when the previous session was a different rep scheme', () => {
    const priorLogs = [
      makeLog('l1', '2026-01-01', 's1', 'back-squat', setsOf(100, 5, 3), 'Back Squat', { repsMin: 5, repsMax: 5 }),
    ]
    const currentLog = makeLog('l2', '2026-01-04', 's2', 'back-squat', setsOf(75, 12, 3), 'Back Squat', { repsMin: 10, repsMax: 15 })
    const result = analyzeWorkout(currentLog, [...priorLogs, currentLog], {})
    expect(result.cards.some((c) => c.type === 'progress')).toBe(false)
  })

  it('has an encouraging default message when nothing notable happened', () => {
    const currentLog = makeLog('l1', '2026-01-01', 's1', 'back-squat', setsOf(100, 5, 3), 'Back Squat')
    const result = analyzeWorkout(currentLog, [currentLog], {})
    expect(result.overallMessage).toBeTruthy()
  })
})
