import { describe, it, expect } from 'vitest'
import { findSwapCandidates } from './exerciseSwap.js'

function custom(overrides) {
  return {
    id: overrides.name.toLowerCase().replace(/\s+/g, '-'),
    name: overrides.name,
    category: overrides.category,
    equipment: overrides.equipment,
    compound: overrides.compound ?? false,
    increment: 1,
    cue: null,
    isCustom: true,
  }
}

describe('findSwapCandidates', () => {
  it('returns an empty array for an unknown exercise id', () => {
    expect(findSwapCandidates('not-a-real-exercise', [])).toEqual([])
  })

  it('never suggests the exercise itself or same-equipment variants', () => {
    const results = findSwapCandidates('barbell-bench-press', [])
    expect(results.some((e) => e.id === 'barbell-bench-press')).toBe(false)
    expect(results.every((e) => e.equipment !== 'barbell')).toBe(true)
  })

  it('prefers a same-muscle, different-equipment substitute for a built-in exercise', () => {
    const results = findSwapCandidates('barbell-bench-press', [])
    const ids = results.map((e) => e.id)
    // A dumbbell/cable/machine chest press or fly should show up somewhere —
    // same primary muscle (chest), different equipment than barbell.
    expect(ids).toContain('dumbbell-bench-press')
    // A back exercise should never be suggested as a chest substitute.
    expect(ids).not.toContain('barbell-row')
  })

  it('falls back to category matching for custom exercises with no library data', () => {
    const legPressAlt = custom({ name: 'Garage Leg Sled', category: 'legs', equipment: 'other', compound: true })
    const unrelated = custom({ name: 'Garage Neck Curl', category: 'neck', equipment: 'other' })
    const sameEquipment = custom({ name: 'Another Machine Thing', category: 'legs', equipment: 'machine' })
    const results = findSwapCandidates('leg-press', [legPressAlt, unrelated, sameEquipment])
    const ids = results.map((e) => e.id)
    expect(ids).toContain('garage-leg-sled')
    expect(ids).not.toContain('garage-neck-curl')
    // leg-press is itself a machine exercise, so a same-equipment custom
    // exercise should never appear regardless of category.
    expect(ids).not.toContain('another-machine-thing')
  })

  it('ranks category-tier matches with the same compound-ness above the rest, then alphabetically', () => {
    // 'neck' keeps this isolated from real library data: every built-in neck
    // exercise uses 'other' equipment, same as the source below, so they're
    // all excluded by the same-equipment filter and can't contaminate the
    // ordering being tested here.
    const source = custom({ name: 'Garage Neck Thing', category: 'neck', equipment: 'other', compound: false })
    const isolationMatch = custom({ name: 'Zebra Curl', category: 'neck', equipment: 'machine', compound: false })
    const compoundMismatch = custom({ name: 'Aardvark Press', category: 'neck', equipment: 'machine', compound: true })
    const results = findSwapCandidates(source.id, [source, isolationMatch, compoundMismatch])
    expect(results.map((e) => e.id)).toEqual(['zebra-curl', 'aardvark-press'])
  })
})
