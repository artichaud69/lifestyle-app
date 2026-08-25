import { describe, it, expect } from 'vitest'
import { groupLabels, isLastInGroup, linkExercises, unlinkExercise } from './superset.js'

function ex(id, supersetGroup = null) {
  return { id, exerciseId: id, supersetGroup }
}

describe('linkExercises', () => {
  it('creates a new group for two ungrouped exercises', () => {
    const result = linkExercises([ex('a'), ex('b'), ex('c')], 'a', 'b')
    const a = result.find((e) => e.id === 'a')
    const b = result.find((e) => e.id === 'b')
    expect(a.supersetGroup).toBeTruthy()
    expect(a.supersetGroup).toBe(b.supersetGroup)
  })

  it('moves the second exercise to sit right after the first', () => {
    const result = linkExercises([ex('a'), ex('x'), ex('b')], 'a', 'b')
    expect(result.map((e) => e.id)).toEqual(['a', 'b', 'x'])
  })

  it('adds a third exercise to an existing group instead of making a new one', () => {
    let result = linkExercises([ex('a'), ex('b'), ex('c')], 'a', 'b')
    result = linkExercises(result, 'a', 'c')
    const groups = new Set(result.map((e) => e.supersetGroup))
    expect(groups.size).toBe(1)
    expect(result.map((e) => e.id)).toEqual(['a', 'b', 'c'])
  })

  it('is a no-op when linking an exercise to itself', () => {
    const input = [ex('a'), ex('b')]
    expect(linkExercises(input, 'a', 'a')).toBe(input)
  })
})

describe('unlinkExercise', () => {
  it('removes the exercise from its group', () => {
    let result = linkExercises([ex('a'), ex('b'), ex('c')], 'a', 'b')
    result = linkExercises(result, 'a', 'c')
    result = unlinkExercise(result, 'c')
    expect(result.find((e) => e.id === 'c').supersetGroup).toBeNull()
    expect(result.find((e) => e.id === 'a').supersetGroup).toBe(result.find((e) => e.id === 'b').supersetGroup)
  })

  it('dissolves the group entirely when only one member would remain', () => {
    let result = linkExercises([ex('a'), ex('b')], 'a', 'b')
    result = unlinkExercise(result, 'b')
    expect(result.find((e) => e.id === 'a').supersetGroup).toBeNull()
    expect(result.find((e) => e.id === 'b').supersetGroup).toBeNull()
  })

  it('is a no-op for an exercise that is not grouped', () => {
    const input = [ex('a'), ex('b')]
    expect(unlinkExercise(input, 'a')).toBe(input)
  })
})

describe('isLastInGroup', () => {
  it('is always true for an ungrouped exercise', () => {
    expect(isLastInGroup([ex('a')], 0)).toBe(true)
  })

  it('is false when a later exercise shares the group', () => {
    const items = [ex('a', 'g1'), ex('b', 'g1')]
    expect(isLastInGroup(items, 0)).toBe(false)
  })

  it('is true for the last member of a group', () => {
    const items = [ex('a', 'g1'), ex('b', 'g1')]
    expect(isLastInGroup(items, 1)).toBe(true)
  })

  it('supports a custom getter for group ids nested elsewhere', () => {
    const entries = [{ planExercise: { supersetGroup: 'g1' } }, { planExercise: { supersetGroup: 'g1' } }]
    const getGroup = (item) => item.planExercise?.supersetGroup
    expect(isLastInGroup(entries, 0, getGroup)).toBe(false)
    expect(isLastInGroup(entries, 1, getGroup)).toBe(true)
  })
})

describe('groupLabels', () => {
  it('assigns letters in order of first appearance', () => {
    const items = [ex('a', 'g1'), ex('b', 'g2'), ex('c', 'g1'), ex('d', 'g2')]
    const labels = groupLabels(items)
    expect(labels.get('g1')).toBe('A')
    expect(labels.get('g2')).toBe('B')
  })

  it('skips ungrouped exercises', () => {
    const items = [ex('a'), ex('b', 'g1')]
    const labels = groupLabels(items)
    expect(labels.size).toBe(1)
    expect(labels.get('g1')).toBe('A')
  })
})
