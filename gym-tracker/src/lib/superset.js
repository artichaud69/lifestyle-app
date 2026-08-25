import { genId } from './id.js'

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

// Assigns a friendly "A"/"B"/"C" label to each distinct superset group, in
// the order each group first appears in the list — so labels stay stable
// and readable regardless of the underlying group id.
export function groupLabels(items) {
  const labels = new Map()
  for (const item of items) {
    const group = item.supersetGroup
    if (group && !labels.has(group)) {
      labels.set(group, LETTERS[labels.size] ?? `${labels.size + 1}`)
    }
  }
  return labels
}

// An ungrouped exercise is trivially "last" (normal rest always applies).
// A grouped one is last only if nothing later in the list shares its group
// — this is what the active workout uses to decide whether completing a
// set gets a short superset transition or the real rest period. `getGroup`
// lets callers whose group id lives at a different path (e.g. a workout
// entry's `planExercise.supersetGroup`) reuse this without reshaping data.
export function isLastInGroup(items, index, getGroup = (item) => item.supersetGroup) {
  const group = getGroup(items[index])
  if (!group) return true
  return !items.slice(index + 1).some((item) => getGroup(item) === group)
}

// Joins two exercises (by id) into the same superset group — reusing
// either one's existing group if it already has one, so linking a third
// exercise to an existing pair just grows that group — and moves the
// second exercise to sit right after the group's current last member, so
// linked exercises always render adjacently.
export function linkExercises(exercises, idA, idB) {
  if (idA === idB) return exercises
  const a = exercises.find((ex) => ex.id === idA)
  const b = exercises.find((ex) => ex.id === idB)
  if (!a || !b) return exercises

  const groupId = a.supersetGroup ?? b.supersetGroup ?? genId()
  const updated = exercises.map((ex) => (ex.id === idA || ex.id === idB ? { ...ex, supersetGroup: groupId } : ex))

  const bItem = updated.find((ex) => ex.id === idB)
  const rest = updated.filter((ex) => ex.id !== idB)
  let insertAt = rest.length
  for (let i = rest.length - 1; i >= 0; i--) {
    if (rest[i].supersetGroup === groupId) {
      insertAt = i + 1
      break
    }
  }
  rest.splice(insertAt, 0, bItem)
  return rest
}

// Removes one exercise from its group. A "superset" of one doesn't mean
// anything, so if that leaves a single member behind, its group is cleared
// too rather than leaving an orphaned group of one.
export function unlinkExercise(exercises, id) {
  const target = exercises.find((ex) => ex.id === id)
  if (!target?.supersetGroup) return exercises
  const group = target.supersetGroup

  const cleared = exercises.map((ex) => (ex.id === id ? { ...ex, supersetGroup: null } : ex))
  const remaining = cleared.filter((ex) => ex.supersetGroup === group)
  if (remaining.length === 1) {
    return cleared.map((ex) => (ex.supersetGroup === group ? { ...ex, supersetGroup: null } : ex))
  }
  return cleared
}
