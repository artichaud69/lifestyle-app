import { describe, it, expect } from 'vitest'
import { moveItem } from './reorder.js'

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
