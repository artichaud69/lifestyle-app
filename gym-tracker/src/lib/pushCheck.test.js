import { describe, it, expect } from 'vitest'
import { runPushCheck } from './pushCheck.js'

// jsdom has no Notification API, which is the same shape as a browser that
// can't do any of this — the check has to report that as a plain failed step
// rather than throwing.
describe('runPushCheck where notifications are unavailable', () => {
  it('resolves with steps instead of throwing', async () => {
    await expect(runPushCheck()).resolves.toBeInstanceOf(Array)
  })

  it('reports the Home Screen and notification checks, then stops', async () => {
    const steps = await runPushCheck()
    expect(steps.map((s) => s.label)).toEqual(['Installed to Home Screen', 'Notifications supported'])
    expect(steps.every((s) => s.ok === false)).toBe(true)
  })

  it('explains each failure rather than leaving it blank', async () => {
    const steps = await runPushCheck()
    expect(steps.every((s) => s.detail.length > 0)).toBe(true)
  })
})
