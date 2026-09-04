import { describe, it, expect } from 'vitest'
import { moveItem, moveItemById } from './reorder.js'

describe('moveItem', () => {
  it('swaps an item with its predecessor when moving up', () => {
    expect(moveItem(['a', 'b', 'c'], 1, 'up')).toEqual(['b', 'a', 'c'])
  })

  it('swaps an item with its successor when moving down', () => {
    expect(moveItem(['a', 'b', 'c'], 1, 'down')).toEqual(['a', 'c', 'b'])
  })

  it('is a no-op moving the first item up', () => {
    const arr = ['a', 'b', 'c']
    expect(moveItem(arr, 0, 'up')).toBe(arr)
  })

  it('is a no-op moving the last item down', () => {
    const arr = ['a', 'b', 'c']
    expect(moveItem(arr, 2, 'down')).toBe(arr)
  })

  it('does not mutate the original array', () => {
    const arr = ['a', 'b', 'c']
    moveItem(arr, 1, 'up')
    expect(arr).toEqual(['a', 'b', 'c'])
  })
})

describe('moveItemById', () => {
  const items = [{ id: 'a' }, { id: 'b' }, { id: 'c' }]

  it('moves the item with the given id, resolving its index fresh', () => {
    expect(moveItemById(items, 'a', 'down').map((i) => i.id)).toEqual(['b', 'a', 'c'])
  })

  it('is a no-op for an id not in the array', () => {
    expect(moveItemById(items, 'z', 'down')).toBe(items)
  })

  // The bug this exists to prevent: a reorder button's onClick closure
  // captures a numeric index from the render that created it. Two clicks
  // landing before React re-renders both fire with that same stale index,
  // and swapping the same two slots twice cancels itself out. Resolving
  // by id instead means the second call finds the item's *new* position
  // and keeps moving it, so two rapid same-button clicks compound instead
  // of reverting.
  it('compounds correctly across repeated calls even with a fixed stale index in play', () => {
    let result = items
    result = moveItemById(result, 'a', 'down') // ['b', 'a', 'c']
    result = moveItemById(result, 'a', 'down') // ['b', 'c', 'a']
    expect(result.map((i) => i.id)).toEqual(['b', 'c', 'a'])
  })

  it('supports a custom id accessor', () => {
    const entries = [{ exerciseId: 'squat' }, { exerciseId: 'bench' }]
    const result = moveItemById(entries, 'bench', 'up', (e) => e.exerciseId)
    expect(result.map((e) => e.exerciseId)).toEqual(['bench', 'squat'])
  })
})
