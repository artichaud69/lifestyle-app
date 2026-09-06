import { BUILT_IN_EXERCISES } from './exercises.js'
import { getLibraryEntry } from './exerciseLibrary.js'

// Finds reasonable substitutes for `exerciseId` when its usual equipment is
// unavailable (a busy machine, a gym that just doesn't have it) — same
// muscles, different equipment. Two tiers, best first:
//   1. same primaryMuscles (from the exercise library guide) — precise, but
//      only available for exercises with a library entry
//   2. same category (from exercises.js) — coarser, but works for every
//      exercise including custom ones a user added themselves, which never
//      have library guide data
// Within each tier, exercises that keep the same compound/isolation
// character as the original are preferred, then alphabetical.
export function findSwapCandidates(exerciseId, customExercises = []) {
  const all = [...BUILT_IN_EXERCISES, ...customExercises]
  const source = all.find((e) => e.id === exerciseId)
  if (!source) return []

  const sourcePrimary = getLibraryEntry(exerciseId)?.guide?.primaryMuscles ?? null

  const scored = all
    .filter((e) => e.id !== exerciseId && e.equipment !== source.equipment)
    .map((e) => {
      const candidatePrimary = getLibraryEntry(e.id)?.guide?.primaryMuscles
      const muscleMatch = !!(sourcePrimary && candidatePrimary && candidatePrimary.some((m) => sourcePrimary.includes(m)))
      const categoryMatch = e.category === source.category
      return { exercise: e, muscleMatch, categoryMatch }
    })
    .filter((s) => s.muscleMatch || s.categoryMatch)

  return scored
    .sort((a, b) => {
      if (a.muscleMatch !== b.muscleMatch) return a.muscleMatch ? -1 : 1
      const aCompoundMatch = a.exercise.compound === source.compound ? 0 : 1
      const bCompoundMatch = b.exercise.compound === source.compound ? 0 : 1
      if (aCompoundMatch !== bCompoundMatch) return aCompoundMatch - bCompoundMatch
      return a.exercise.name.localeCompare(b.exercise.name)
    })
    .map((s) => s.exercise)
}
