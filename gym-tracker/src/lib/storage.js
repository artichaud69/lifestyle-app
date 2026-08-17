const KEYS = {
  program: 'gym-tracker.program',
  logs: 'gym-tracker.logs',
  customExercises: 'gym-tracker.customExercises',
  settings: 'gym-tracker.settings',
  draft: 'gym-tracker.activeWorkoutDraft',
  goalSettings: 'gym-tracker.goalSettings',
}

function load(key, fallback) {
  const raw = localStorage.getItem(key)
  if (!raw) return fallback
  try {
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

function save(key, value) {
  if (value === null || value === undefined) {
    localStorage.removeItem(key)
  } else {
    localStorage.setItem(key, JSON.stringify(value))
  }
}

export const DEFAULT_SETTINGS = { unit: 'kg', restSeconds: 90 }

export function loadProgram() {
  return load(KEYS.program, null)
}
export function saveProgram(program) {
  save(KEYS.program, program)
}

export function loadLogs() {
  return load(KEYS.logs, [])
}
export function saveLogs(logs) {
  save(KEYS.logs, logs)
}

export function loadCustomExercises() {
  return load(KEYS.customExercises, [])
}
export function saveCustomExercises(exercises) {
  save(KEYS.customExercises, exercises)
}

export function loadSettings() {
  return { ...DEFAULT_SETTINGS, ...load(KEYS.settings, {}) }
}
export function saveSettings(settings) {
  save(KEYS.settings, settings)
}

export function loadDraft() {
  return load(KEYS.draft, null)
}
export function saveDraft(draft) {
  save(KEYS.draft, draft)
}
export function clearDraft() {
  save(KEYS.draft, null)
}

export function loadGoalSettings() {
  return load(KEYS.goalSettings, null)
}
export function saveGoalSettings(goalSettings) {
  save(KEYS.goalSettings, goalSettings)
}
