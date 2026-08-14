import { describe, it, expect } from 'vitest'
import {
  swipeDecision,
  nextView,
  startsInHorizontalScroller,
  SWIPE_MIN_DISTANCE,
  SWIPE_EDGE_GUARD,
} from './swipe.js'
import { VIEW_ORDER } from './navIcons.js'

const WIDTH = 375
const MID = Math.round(WIDTH / 2)

function decide(dx, dy, startX = MID) {
  return swipeDecision({ dx, dy, startX, viewportWidth: WIDTH })
}

describe('swipeDecision', () => {
  it('moves forward on a leftward swipe', () => {
    expect(decide(-120, 5)).toBe('next')
  })

  it('moves back on a rightward swipe', () => {
    expect(decide(120, 5)).toBe('previous')
  })

  it('ignores a drag too short to be deliberate', () => {
    expect(decide(-(SWIPE_MIN_DISTANCE - 1), 0)).toBeNull()
  })

  it('accepts a drag right at the threshold', () => {
    expect(decide(-SWIPE_MIN_DISTANCE, 0)).toBe('next')
  })

  it('ignores a mostly vertical drag, so scrolling never flips a tab', () => {
    expect(decide(-80, 200)).toBeNull()
  })

  it('still fires on a long horizontal drag that drifts a little vertically', () => {
    expect(decide(-200, 40)).toBe('next')
  })

  it('ignores a diagonal drag that is only marginally horizontal', () => {
    expect(decide(-100, 80)).toBeNull()
  })

  it('ignores swipes starting at the left edge, which iOS claims for going back', () => {
    expect(decide(120, 0, SWIPE_EDGE_GUARD - 1)).toBeNull()
  })

  it('ignores swipes starting at the right edge', () => {
    expect(decide(-120, 0, WIDTH - SWIPE_EDGE_GUARD + 1)).toBeNull()
  })

  it('allows a swipe starting just inside the guarded edges', () => {
    expect(decide(-120, 0, SWIPE_EDGE_GUARD + 1)).toBe('next')
  })

  it('ignores a tap that never moved', () => {
    expect(decide(0, 0)).toBeNull()
  })
})

describe('nextView', () => {
  it('walks the tab order forwards', () => {
    expect(nextView(VIEW_ORDER, 'habits', 'next')).toBe('goals')
    expect(nextView(VIEW_ORDER, 'goals', 'next')).toBe('summary')
    expect(nextView(VIEW_ORDER, 'summary', 'next')).toBe('journal')
  })

  it('walks the tab order backwards', () => {
    expect(nextView(VIEW_ORDER, 'journal', 'previous')).toBe('summary')
    expect(nextView(VIEW_ORDER, 'goals', 'previous')).toBe('habits')
  })

  it('stops at the ends instead of wrapping around', () => {
    expect(nextView(VIEW_ORDER, 'habits', 'previous')).toBe('habits')
    expect(nextView(VIEW_ORDER, 'journal', 'next')).toBe('journal')
  })

  it('leaves an unknown view alone', () => {
    expect(nextView(VIEW_ORDER, 'nonsense', 'next')).toBe('nonsense')
  })

  it('can reach every tab by swiping from either end', () => {
    let current = VIEW_ORDER[0]
    const forwards = [current]
    for (let step = 0; step < VIEW_ORDER.length - 1; step++) {
      current = nextView(VIEW_ORDER, current, 'next')
      forwards.push(current)
    }
    expect(forwards).toEqual(VIEW_ORDER)
  })
})

describe('startsInHorizontalScroller', () => {
  function build(html) {
    document.body.innerHTML = html
    return document.body.firstElementChild
  }

  it('detects a touch that began inside a sideways-scrolling strip', () => {
    const root = build('<div><div id="strip"><span id="tick">x</span></div></div>')
    const strip = root.querySelector('#strip')
    strip.style.overflowX = 'auto'
    // jsdom does not lay out, so stand in for a strip wider than its box.
    Object.defineProperty(strip, 'scrollWidth', { value: 800, configurable: true })
    Object.defineProperty(strip, 'clientWidth', { value: 300, configurable: true })

    expect(startsInHorizontalScroller(root.querySelector('#tick'), root)).toBe(true)
  })

  it('ignores a scroll container that has nothing to scroll', () => {
    const root = build('<div><div id="strip"><span id="tick">x</span></div></div>')
    const strip = root.querySelector('#strip')
    strip.style.overflowX = 'auto'
    Object.defineProperty(strip, 'scrollWidth', { value: 300, configurable: true })
    Object.defineProperty(strip, 'clientWidth', { value: 300, configurable: true })

    expect(startsInHorizontalScroller(root.querySelector('#tick'), root)).toBe(false)
  })

  it('is false for ordinary page content', () => {
    const root = build('<div><p id="text">hello</p></div>')
    expect(startsInHorizontalScroller(root.querySelector('#text'), root)).toBe(false)
  })

  it('stops looking once it reaches the root', () => {
    const root = build('<div id="root"><p id="text">hello</p></div>')
    root.style.overflowX = 'auto'
    Object.defineProperty(root, 'scrollWidth', { value: 800, configurable: true })
    Object.defineProperty(root, 'clientWidth', { value: 300, configurable: true })

    expect(startsInHorizontalScroller(root.querySelector('#text'), root)).toBe(false)
  })
})
