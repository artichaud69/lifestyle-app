// Built-in exercise library. `increment` is the default jump in kg the coach
// reaches for on a successful session (small for isolation work, bigger for
// heavy lower-body compounds) — see suggestNextTarget() in coach.js.
export const CATEGORIES = ['chest', 'back', 'shoulders', 'legs', 'arms', 'core', 'cardio']

export const CATEGORY_LABELS = {
  chest: 'Chest',
  back: 'Back',
  shoulders: 'Shoulders',
  legs: 'Legs',
  arms: 'Arms',
  core: 'Core',
  cardio: 'Cardio',
}

export const EQUIPMENT = ['barbell', 'dumbbell', 'machine', 'cable', 'bodyweight', 'kettlebell', 'other']

const E = (name, category, equipment, compound, increment) => ({
  id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
  name,
  category,
  equipment,
  compound,
  increment,
  isCustom: false,
})

export const BUILT_IN_EXERCISES = [
  // Chest
  E('Barbell Bench Press', 'chest', 'barbell', true, 2.5),
  E('Incline Barbell Bench Press', 'chest', 'barbell', true, 2.5),
  E('Dumbbell Bench Press', 'chest', 'dumbbell', true, 2),
  E('Incline Dumbbell Press', 'chest', 'dumbbell', true, 2),
  E('Cable Fly', 'chest', 'cable', false, 1),
  E('Push-Up', 'chest', 'bodyweight', true, 0),
  E('Chest Dip', 'chest', 'bodyweight', true, 0),
  E('Machine Chest Press', 'chest', 'machine', true, 2.5),
  E('Pec Deck', 'chest', 'machine', false, 2.5),

  // Back
  E('Deadlift', 'back', 'barbell', true, 5),
  E('Barbell Row', 'back', 'barbell', true, 2.5),
  E('Pull-Up', 'back', 'bodyweight', true, 0),
  E('Chin-Up', 'back', 'bodyweight', true, 0),
  E('Lat Pulldown', 'back', 'cable', true, 2.5),
  E('Seated Cable Row', 'back', 'cable', true, 2.5),
  E('One-Arm Dumbbell Row', 'back', 'dumbbell', true, 2),
  E('T-Bar Row', 'back', 'barbell', true, 2.5),
  E('Face Pull', 'back', 'cable', false, 1),
  E('Rack Pull', 'back', 'barbell', true, 5),

  // Shoulders
  E('Overhead Press', 'shoulders', 'barbell', true, 2.5),
  E('Dumbbell Shoulder Press', 'shoulders', 'dumbbell', true, 2),
  E('Arnold Press', 'shoulders', 'dumbbell', true, 2),
  E('Lateral Raise', 'shoulders', 'dumbbell', false, 1),
  E('Cable Lateral Raise', 'shoulders', 'cable', false, 1),
  E('Rear Delt Fly', 'shoulders', 'dumbbell', false, 1),
  E('Machine Shoulder Press', 'shoulders', 'machine', true, 2.5),
  E('Upright Row', 'shoulders', 'barbell', false, 2.5),

  // Legs
  E('Back Squat', 'legs', 'barbell', true, 5),
  E('Front Squat', 'legs', 'barbell', true, 2.5),
  E('Romanian Deadlift', 'legs', 'barbell', true, 5),
  E('Leg Press', 'legs', 'machine', true, 5),
  E('Walking Lunge', 'legs', 'dumbbell', true, 2),
  E('Bulgarian Split Squat', 'legs', 'dumbbell', true, 2),
  E('Leg Extension', 'legs', 'machine', false, 2.5),
  E('Leg Curl', 'legs', 'machine', false, 2.5),
  E('Hip Thrust', 'legs', 'barbell', true, 5),
  E('Calf Raise', 'legs', 'machine', false, 5),
  E('Goblet Squat', 'legs', 'dumbbell', true, 2),

  // Arms
  E('Barbell Curl', 'arms', 'barbell', false, 2.5),
  E('Dumbbell Curl', 'arms', 'dumbbell', false, 1),
  E('Hammer Curl', 'arms', 'dumbbell', false, 1),
  E('Preacher Curl', 'arms', 'barbell', false, 2.5),
  E('Cable Curl', 'arms', 'cable', false, 1),
  E('Triceps Pushdown', 'arms', 'cable', false, 1),
  E('Skull Crusher', 'arms', 'barbell', false, 2.5),
  E('Overhead Triceps Extension', 'arms', 'dumbbell', false, 1),
  E('Close-Grip Bench Press', 'arms', 'barbell', true, 2.5),
  E('Dip', 'arms', 'bodyweight', true, 0),

  // Core
  E('Plank', 'core', 'bodyweight', false, 0),
  E('Hanging Leg Raise', 'core', 'bodyweight', false, 0),
  E('Cable Crunch', 'core', 'cable', false, 2.5),
  E('Ab Wheel Rollout', 'core', 'bodyweight', false, 0),
  E('Russian Twist', 'core', 'other', false, 1),

  // Cardio
  E('Treadmill Run', 'cardio', 'other', false, 0),
  E('Rowing Machine', 'cardio', 'machine', false, 0),
  E('Stationary Bike', 'cardio', 'machine', false, 0),
  E('Jump Rope', 'cardio', 'other', false, 0),
]

export function getAllExercises(customExercises = []) {
  return [...BUILT_IN_EXERCISES, ...customExercises]
}

export function findExercise(exerciseId, customExercises = []) {
  return getAllExercises(customExercises).find((exercise) => exercise.id === exerciseId) ?? null
}

export function makeCustomExercise(name, category, equipment) {
  return {
    id: genIdForCustom(name),
    name: name.trim(),
    category,
    equipment,
    compound: false,
    increment: equipment === 'dumbbell' ? 1 : 2.5,
    isCustom: true,
  }
}

function genIdForCustom(name) {
  const base = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  return `custom-${base}-${Date.now().toString(36)}`
}
