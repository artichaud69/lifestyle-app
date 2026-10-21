import { describe, it, expect } from 'vitest'
import { BUILT_IN_EXERCISES, bodyweightLoad, makeCustomExercise } from './exercises.js'

describe('bodyweightLoad', () => {
  it('flags exactly the built-in lifts that move the whole body', () => {
    const flagged = BUILT_IN_EXERCISES.filter((e) => bodyweightLoad(e.name)).map((e) => [e.name, bodyweightLoad(e.name)])
    expect(flagged).toEqual([
      ['Chest Dip', 'added'],
      ['Pull-Up', 'added'],
      ['Weighted Pull-Up', 'added'],
      ['Chin-Up', 'added'],
      ['Neutral-Grip Pull-Up', 'added'],
      ['Assisted Pull-Up', 'assisted'],
      ['Dip', 'added'],
    ])
  })

  it('leaves lifts that only move part of the body conventional', () => {
    expect(bodyweightLoad('Bench Dip')).toBeNull()
    expect(bodyweightLoad('Push-Up')).toBeNull()
    expect(bodyweightLoad('Inverted Row')).toBeNull()
  })

  it('leaves conventional lifts with similar names alone', () => {
    expect(bodyweightLoad('Lat Pulldown')).toBeNull()
    expect(bodyweightLoad('Band Pull-Apart')).toBeNull()
  })

  it('recognises custom exercises by name, however they are spelled', () => {
    expect(bodyweightLoad(makeCustomExercise('Weighted Dip', 'arms', 'other').name)).toBe('added')
    expect(bodyweightLoad('weighted pull ups')).toBe('added')
    expect(bodyweightLoad('Ring Muscle-Up')).toBe('added')
    expect(bodyweightLoad('Band Assisted Chin-Up')).toBe('assisted')
  })
})
