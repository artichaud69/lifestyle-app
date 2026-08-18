// Built-in exercise library. `increment` is the default jump in kg the coach
// reaches for on a successful session (small for isolation work, bigger for
// heavy lower-body compounds) — see suggestNextTarget() in coach.js.
//
// A handful of these IDs (e.g. 'back-squat', 'barbell-bench-press',
// 'lat-pulldown') are hardcoded into the program templates in coach.js —
// don't rename an existing entry's `name` without checking there first,
// since that changes its slug ID. New entries are always safe to add.
export const CATEGORIES = ['chest', 'back', 'shoulders', 'legs', 'arms', 'core', 'neck', 'cardio']

export const CATEGORY_LABELS = {
  chest: 'Chest',
  back: 'Back',
  shoulders: 'Shoulders',
  legs: 'Legs',
  arms: 'Arms',
  core: 'Core',
  neck: 'Neck',
  cardio: 'Cardio',
}

export const EQUIPMENT = ['barbell', 'dumbbell', 'machine', 'cable', 'band', 'bodyweight', 'kettlebell', 'other']

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
  E('Decline Barbell Bench Press', 'chest', 'barbell', true, 2.5),
  E('Close-Grip Barbell Bench Press', 'chest', 'barbell', true, 2.5),
  E('Smith Machine Bench Press', 'chest', 'machine', true, 2.5),
  E('Dumbbell Bench Press', 'chest', 'dumbbell', true, 2),
  E('Incline Dumbbell Press', 'chest', 'dumbbell', true, 2),
  E('Decline Dumbbell Press', 'chest', 'dumbbell', true, 2),
  E('Dumbbell Fly', 'chest', 'dumbbell', false, 1),
  E('Incline Dumbbell Fly', 'chest', 'dumbbell', false, 1),
  E('Cable Fly', 'chest', 'cable', false, 1),
  E('Low-to-High Cable Fly', 'chest', 'cable', false, 1),
  E('High-to-Low Cable Fly', 'chest', 'cable', false, 1),
  E('Cable Crossover', 'chest', 'cable', false, 1),
  E('Machine Chest Press', 'chest', 'machine', true, 2.5),
  E('Incline Machine Press', 'chest', 'machine', true, 2.5),
  E('Incline Smith Machine Bench Press', 'chest', 'machine', true, 2.5),
  E('Band Chest Fly', 'chest', 'band', false, 1),
  E('Pec Deck', 'chest', 'machine', false, 2.5),
  E('Push-Up', 'chest', 'bodyweight', true, 0),
  E('Incline Push-Up', 'chest', 'bodyweight', true, 0),
  E('Decline Push-Up', 'chest', 'bodyweight', true, 0),
  E('Diamond Push-Up', 'chest', 'bodyweight', true, 0),
  E('Chest Dip', 'chest', 'bodyweight', true, 0),
  E('Landmine Press', 'chest', 'barbell', true, 2.5),
  E('Svend Press', 'chest', 'other', false, 1),

  // Back
  E('Deadlift', 'back', 'barbell', true, 5),
  E('Sumo Deadlift', 'back', 'barbell', true, 5),
  E('Rack Pull', 'back', 'barbell', true, 5),
  E('Deficit Deadlift', 'back', 'barbell', true, 5),
  E('Good Morning', 'back', 'barbell', true, 2.5),
  E('Barbell Row', 'back', 'barbell', true, 2.5),
  E('Pendlay Row', 'back', 'barbell', true, 2.5),
  E('T-Bar Row', 'back', 'barbell', true, 2.5),
  E('Chest-Supported Row', 'back', 'machine', true, 2.5),
  E('Meadows Row', 'back', 'barbell', true, 2),
  E('One-Arm Dumbbell Row', 'back', 'dumbbell', true, 2),
  E('Kettlebell Row', 'back', 'kettlebell', true, 2),
  E('Seated Cable Row', 'back', 'cable', true, 2.5),
  E('Wide-Grip Cable Row', 'back', 'cable', true, 2.5),
  E('Machine Row', 'back', 'machine', true, 2.5),
  E('Inverted Row', 'back', 'bodyweight', true, 0),
  E('Lat Pulldown', 'back', 'cable', true, 2.5),
  E('Wide-Grip Lat Pulldown', 'back', 'cable', true, 2.5),
  E('Close-Grip Lat Pulldown', 'back', 'cable', true, 2.5),
  E('Single-Arm Lat Pulldown', 'back', 'cable', true, 2),
  E('Straight-Arm Pulldown', 'back', 'cable', false, 1),
  E('Pull-Up', 'back', 'bodyweight', true, 0),
  E('Weighted Pull-Up', 'back', 'bodyweight', true, 1.25),
  E('Chin-Up', 'back', 'bodyweight', true, 0),
  E('Neutral-Grip Pull-Up', 'back', 'bodyweight', true, 0),
  E('Assisted Pull-Up', 'back', 'machine', true, 2.5),
  E('Face Pull', 'back', 'cable', false, 1),
  E('Band Face Pull', 'back', 'band', false, 1),
  E('Band Pulldown', 'back', 'band', true, 1),
  E('Back Extension', 'back', 'bodyweight', false, 0),
  E('Weighted Back Extension', 'back', 'other', false, 2.5),

  // Shoulders
  E('Overhead Press', 'shoulders', 'barbell', true, 2.5),
  E('Seated Barbell Overhead Press', 'shoulders', 'barbell', true, 2.5),
  E('Push Press', 'shoulders', 'barbell', true, 2.5),
  E('Smith Machine Shoulder Press', 'shoulders', 'machine', true, 2.5),
  E('Dumbbell Shoulder Press', 'shoulders', 'dumbbell', true, 2),
  E('Seated Dumbbell Shoulder Press', 'shoulders', 'dumbbell', true, 2),
  E('Arnold Press', 'shoulders', 'dumbbell', true, 2),
  E('Machine Shoulder Press', 'shoulders', 'machine', true, 2.5),
  E('Landmine Shoulder Press', 'shoulders', 'barbell', true, 2.5),
  E('Lateral Raise', 'shoulders', 'dumbbell', false, 1),
  E('Cable Lateral Raise', 'shoulders', 'cable', false, 1),
  E('Leaning Cable Lateral Raise', 'shoulders', 'cable', false, 1),
  E('Machine Lateral Raise', 'shoulders', 'machine', false, 2.5),
  E('Band Lateral Raise', 'shoulders', 'band', false, 1),
  E('Front Raise', 'shoulders', 'dumbbell', false, 1),
  E('Cable Front Raise', 'shoulders', 'cable', false, 1),
  E('Rear Delt Fly', 'shoulders', 'dumbbell', false, 1),
  E('Cable Rear Delt Fly', 'shoulders', 'cable', false, 1),
  E('Band Rear Delt Fly', 'shoulders', 'band', false, 1),
  E('Reverse Pec Deck', 'shoulders', 'machine', false, 2.5),
  E('Upright Row', 'shoulders', 'barbell', false, 2.5),
  E('Cable Upright Row', 'shoulders', 'cable', false, 1),
  E('Barbell Shrug', 'shoulders', 'barbell', false, 5),
  E('Dumbbell Shrug', 'shoulders', 'dumbbell', false, 2),
  E('Cable Shrug', 'shoulders', 'cable', false, 2.5),

  // Legs
  E('Back Squat', 'legs', 'barbell', true, 5),
  E('Front Squat', 'legs', 'barbell', true, 2.5),
  E('Safety-Bar Squat', 'legs', 'barbell', true, 5),
  E('Box Squat', 'legs', 'barbell', true, 5),
  E('Zercher Squat', 'legs', 'barbell', true, 2.5),
  E('Hack Squat', 'legs', 'machine', true, 5),
  E('Smith Machine Squat', 'legs', 'machine', true, 5),
  E('Belt Squat', 'legs', 'machine', true, 5),
  E('Goblet Squat', 'legs', 'dumbbell', true, 2),
  E('Kettlebell Goblet Squat', 'legs', 'kettlebell', true, 2),
  E('Sissy Squat', 'legs', 'bodyweight', true, 0),
  E('Bulgarian Split Squat', 'legs', 'dumbbell', true, 2),
  E('Walking Lunge', 'legs', 'dumbbell', true, 2),
  E('Reverse Lunge', 'legs', 'dumbbell', true, 2),
  E('Lateral Lunge', 'legs', 'dumbbell', true, 2),
  E('Step-Up', 'legs', 'dumbbell', true, 2),
  E('Leg Press', 'legs', 'machine', true, 5),
  E('Romanian Deadlift', 'legs', 'barbell', true, 5),
  E('Dumbbell Romanian Deadlift', 'legs', 'dumbbell', true, 2),
  E('Stiff-Leg Deadlift', 'legs', 'barbell', true, 5),
  E('Kettlebell Deadlift', 'legs', 'kettlebell', true, 2),
  E('Kettlebell Swing', 'legs', 'kettlebell', true, 4),
  E('Glute Ham Raise', 'legs', 'bodyweight', false, 0),
  E('Nordic Curl', 'legs', 'bodyweight', false, 0),
  E('Hip Thrust', 'legs', 'barbell', true, 5),
  E('Barbell Glute Bridge', 'legs', 'barbell', true, 5),
  E('Cable Pull-Through', 'legs', 'cable', true, 2.5),
  E('Cable Kickback', 'legs', 'cable', false, 1),
  E('Leg Extension', 'legs', 'machine', false, 2.5),
  E('Leg Curl', 'legs', 'machine', false, 2.5),
  E('Seated Leg Curl', 'legs', 'machine', false, 2.5),
  E('Standing Calf Raise', 'legs', 'machine', false, 5),
  E('Seated Calf Raise', 'legs', 'machine', false, 2.5),
  E('Calf Raise', 'legs', 'machine', false, 5),
  E('Donkey Calf Raise', 'legs', 'machine', false, 5),
  E('Adductor Machine', 'legs', 'machine', false, 2.5),
  E('Abductor Machine', 'legs', 'machine', false, 2.5),

  // Arms
  E('Barbell Curl', 'arms', 'barbell', false, 2.5),
  E('EZ-Bar Curl', 'arms', 'barbell', false, 2.5),
  E('Dumbbell Curl', 'arms', 'dumbbell', false, 1),
  E('Alternating Dumbbell Curl', 'arms', 'dumbbell', false, 1),
  E('Incline Dumbbell Curl', 'arms', 'dumbbell', false, 1),
  E('Hammer Curl', 'arms', 'dumbbell', false, 1),
  E('Cross-Body Hammer Curl', 'arms', 'dumbbell', false, 1),
  E('Concentration Curl', 'arms', 'dumbbell', false, 1),
  E('Preacher Curl', 'arms', 'barbell', false, 2.5),
  E('Dumbbell Preacher Curl', 'arms', 'dumbbell', false, 1),
  E('Spider Curl', 'arms', 'barbell', false, 2.5),
  E('Drag Curl', 'arms', 'barbell', false, 2.5),
  E('Zottman Curl', 'arms', 'dumbbell', false, 1),
  E('Cable Curl', 'arms', 'cable', false, 1),
  E('Cable Hammer Curl', 'arms', 'cable', false, 1),
  E('Kettlebell Curl', 'arms', 'kettlebell', false, 2),
  E('Bayesian Curl', 'arms', 'cable', false, 1),
  E('Band Curl', 'arms', 'band', false, 1),
  E('Close-Grip Bench Press', 'arms', 'barbell', true, 2.5),
  E('Skull Crusher', 'arms', 'barbell', false, 2.5),
  E('Dumbbell Skull Crusher', 'arms', 'dumbbell', false, 1),
  E('Overhead Triceps Extension', 'arms', 'dumbbell', false, 1),
  E('Cable Overhead Triceps Extension', 'arms', 'cable', false, 1),
  E('Triceps Pushdown', 'arms', 'cable', false, 1),
  E('Rope Triceps Pushdown', 'arms', 'cable', false, 1),
  E('Single-Arm Triceps Pushdown', 'arms', 'cable', false, 1),
  E('Triceps Kickback', 'arms', 'dumbbell', false, 1),
  E('Band Triceps Extension', 'arms', 'band', false, 1),
  E('Dip', 'arms', 'bodyweight', true, 0),
  E('Bench Dip', 'arms', 'bodyweight', true, 0),
  E('Wrist Curl', 'arms', 'dumbbell', false, 1),
  E('Reverse Wrist Curl', 'arms', 'dumbbell', false, 1),
  E('Reverse Curl', 'arms', 'barbell', false, 1),

  // Core
  E('Plank', 'core', 'bodyweight', false, 0),
  E('Side Plank', 'core', 'bodyweight', false, 0),
  E('Hanging Leg Raise', 'core', 'bodyweight', false, 0),
  E('Hanging Knee Raise', 'core', 'bodyweight', false, 0),
  E('Toes to Bar', 'core', 'bodyweight', false, 0),
  E('Cable Crunch', 'core', 'cable', false, 2.5),
  E('Machine Crunch', 'core', 'machine', false, 2.5),
  E('Ab Wheel Rollout', 'core', 'bodyweight', false, 0),
  E('Sit-Up', 'core', 'bodyweight', false, 0),
  E('Weighted Sit-Up', 'core', 'other', false, 2.5),
  E('Crunch', 'core', 'bodyweight', false, 0),
  E('Bicycle Crunch', 'core', 'bodyweight', false, 0),
  E('Reverse Crunch', 'core', 'bodyweight', false, 0),
  E('Decline Sit-Up', 'core', 'bodyweight', false, 0),
  E('V-Up', 'core', 'bodyweight', false, 0),
  E('Russian Twist', 'core', 'other', false, 1),
  E('Dead Bug', 'core', 'bodyweight', false, 0),
  E('Mountain Climber', 'core', 'bodyweight', false, 0),
  E('Cable Woodchopper', 'core', 'cable', false, 1),
  E('Pallof Press', 'core', 'cable', false, 1),
  E('Band Pallof Press', 'core', 'band', false, 1),
  E('Kettlebell Turkish Get-Up', 'core', 'kettlebell', false, 2),

  // Neck — go conservative here: light load, slow reps (2s contraction,
  // 2-3s eccentric), and progress in much smaller jumps than everything
  // else in this file. Not part of any auto-generated program template;
  // available for anyone who wants to add it deliberately.
  E('Neck Flexion', 'neck', 'other', false, 1),
  E('Neck Extension', 'neck', 'other', false, 1),
  E('Neck Lateral Flexion', 'neck', 'other', false, 1),

  // Cardio
  E('Treadmill Run', 'cardio', 'other', false, 0),
  E('Treadmill Incline Walk', 'cardio', 'other', false, 0),
  E('Outdoor Run', 'cardio', 'other', false, 0),
  E('Rowing Machine', 'cardio', 'machine', false, 0),
  E('Stationary Bike', 'cardio', 'machine', false, 0),
  E('Assault Bike', 'cardio', 'machine', false, 0),
  E('Elliptical', 'cardio', 'machine', false, 0),
  E('Stair Climber', 'cardio', 'machine', false, 0),
  E('Jump Rope', 'cardio', 'other', false, 0),
  E('Sled Push', 'cardio', 'other', false, 0),
  E('Sled Pull', 'cardio', 'other', false, 0),
  E('Battle Ropes', 'cardio', 'other', false, 0),
  E('Swimming', 'cardio', 'other', false, 0),
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
    increment: equipment === 'dumbbell' || equipment === 'band' ? 1 : 2.5,
    isCustom: true,
  }
}

function genIdForCustom(name) {
  const base = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  return `custom-${base}-${Date.now().toString(36)}`
}
