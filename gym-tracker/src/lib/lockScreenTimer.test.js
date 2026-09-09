import { describe, it, expect } from 'vitest'
import {
  primeLockScreenTimer,
  startLockScreenTimer,
  updateLockScreenPosition,
  updateLockScreenLabel,
  stopLockScreenTimer,
} from './lockScreenTimer.js'

// jsdom (the test environment) implements neither the Media Session API nor
// real media playback, which is exactly the "unsupported browser" case this
// module has to degrade safely on — plenty of real browsers land there too.
// The supported path can't be covered automatically (it needs a real OS
// media session), so this locks in that nothing here ever throws when the
// platform can't do it.
describe('lockScreenTimer on an unsupported platform', () => {
  it('primeLockScreenTimer does not throw', () => {
    expect(() => primeLockScreenTimer()).not.toThrow()
  })

  it('startLockScreenTimer does not throw', () => {
    expect(() => startLockScreenTimer('Rest — 1:30', 90, 90)).not.toThrow()
  })

  it('updateLockScreenPosition does not throw', () => {
    expect(() => updateLockScreenPosition(90, 45)).not.toThrow()
  })

  it('updateLockScreenLabel does not throw', () => {
    expect(() => updateLockScreenLabel('Rest over — go!')).not.toThrow()
  })

  it('stopLockScreenTimer does not throw', () => {
    expect(() => stopLockScreenTimer()).not.toThrow()
  })

  it('a full prime/start/update/stop sequence does not throw', () => {
    expect(() => {
      primeLockScreenTimer()
      startLockScreenTimer('Rest — 1:30', 90, 90)
      updateLockScreenPosition(90, 60)
      updateLockScreenPosition(90, 30)
      updateLockScreenLabel('Rest over — go!')
      stopLockScreenTimer()
    }).not.toThrow()
  })
})
