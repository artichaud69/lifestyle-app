import { describe, it, expect } from 'vitest'
import { startLockScreenTimer, updateLockScreenTimer, stopLockScreenTimer } from './lockScreenTimer.js'

// jsdom (the test environment) implements neither the Media Session API
// nor Web Audio, which is exactly the "unsupported browser" case this
// module has to degrade safely on — real coverage of the supported path
// isn't possible from an automated test, so this just locks in that
// calling any of these never throws when the platform can't do it.
describe('lockScreenTimer on an unsupported platform', () => {
  it('startLockScreenTimer does not throw', () => {
    expect(() => startLockScreenTimer('Rest — 1:30')).not.toThrow()
  })

  it('updateLockScreenTimer does not throw', () => {
    expect(() => updateLockScreenTimer('Rest — 1:00')).not.toThrow()
  })

  it('stopLockScreenTimer does not throw', () => {
    expect(() => stopLockScreenTimer()).not.toThrow()
  })

  it('a full start/update/stop sequence does not throw', () => {
    expect(() => {
      startLockScreenTimer('Rest — 1:30')
      updateLockScreenTimer('Rest — 1:00')
      updateLockScreenTimer('Rest — 0:30')
      stopLockScreenTimer()
    }).not.toThrow()
  })
})
