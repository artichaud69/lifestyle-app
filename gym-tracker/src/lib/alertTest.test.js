import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { startLockedAlertTest, getLockedAlertResults, clearLockedAlertTest } from './alertTest.js'

describe('locked alert test', () => {
  beforeEach(() => {
    clearLockedAlertTest()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('has no results before it is started', () => {
    expect(getLockedAlertResults()).toBeNull()
  })

  it('records one pending entry per requested delay', () => {
    startLockedAlertTest([5, 30])
    const results = getLockedAlertResults()
    expect(results.entries.map((e) => e.seconds)).toEqual([5, 30])
    expect(results.entries.every((e) => e.fired === false && e.stillPending === true)).toBe(true)
  })

  // The distinction the whole test hangs on: a suspended app's timer doesn't
  // disappear, it fires late on resume. Only lateness separates "ran while
  // locked" from "ran when the phone was picked up".
  it('counts an alert that fires at its due time as on time', () => {
    startLockedAlertTest([5])
    vi.advanceTimersByTime(5000)
    const entry = getLockedAlertResults().entries[0]
    expect(entry.fired).toBe(true)
    expect(entry.onTime).toBe(true)
  })

  it('reports how late an alert was when it fires well past its due time', () => {
    startLockedAlertTest([5])
    vi.setSystemTime(Date.now() + 45000)
    vi.advanceTimersByTime(5000)
    const entry = getLockedAlertResults().entries[0]
    expect(entry.fired).toBe(true)
    expect(entry.onTime).toBe(false)
    expect(Math.round(entry.lateBy / 1000)).toBeGreaterThanOrEqual(40)
  })

  it('stops reporting an overdue alert that never fired as pending', () => {
    startLockedAlertTest([5])
    vi.setSystemTime(Date.now() + 20000)
    const entry = getLockedAlertResults().entries[0]
    expect(entry.fired).toBe(false)
    expect(entry.stillPending).toBe(false)
  })
})
