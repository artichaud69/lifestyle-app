import { describe, it, expect } from 'vitest'
import {
  lockDirection,
  clampDragOffset,
  shouldCommitDrag,
  nextView,
  startsInHorizontalScroller,
  DIRECTION_LOCK_DISTANCE,
  COMMIT_DISTANCE_RATIO,
  COMMIT_VELOCITY_PX_MS,
} from './swipe.js'
import { VIEW_ORDER } from './navIcons.js'

const WIDTH = 375

describe('lockDirection', () => {
  it('has no opinion until movement is big enough to mean something', () => {
    expect(lockDirection(DIRECTION_LOCK_DISTANCE - 1, 0)).toBeNull()
  })

  it('locks forward on a leftward drag', () => {
    expect(lockDirection(-40, 2)).toBe('next')
  })

  it('locks backward on a rightward drag', () => {
    expect(lockDirection(40, 2)).toBe('previous')
  })

  it('hands a mostly-vertical drag to scrolling', () => {
    expect(lockDirection(-15, 60)).toBe('vertical')
  })

  it('still locks horizontal on a drag that drifts a little vertically', () => {
    expect(lockDirection(-60, 12)).toBe('next')
  })

  it('locks as soon as the vertical component alone crosses the threshold', () => {
    expect(lockDirection(2, DIRECTION_LOCK_DISTANCE)).toBe('vertical')
  })
})

describe('clampDragOffset', () => {
  it('lets a forward drag travel up to one full screen', () => {
    expect(clampDragOffset(-200, 'next', WIDTH)).toBe(-200)
    expect(clampDragOffset(-9999, 'next', WIDTH)).toBe(-WIDTH)
  })

  it('does not let a forward drag reverse past the resting position', () => {
    expect(clampDragOffset(50, 'next', WIDTH)).toBe(0)
  })

  it('lets a backward drag travel up to one full screen', () => {
    expect(clampDragOffset(200, 'previous', WIDTH)).toBe(200)
    expect(clampDragOffset(9999, 'previous', WIDTH)).toBe(WIDTH)
  })

  it('does not let a backward drag reverse past the resting position', () => {
    expect(clampDragOffset(-50, 'previous', WIDTH)).toBe(0)
  })
})

describe('shouldCommitDrag', () => {
  it('commits once dragged past the distance threshold', () => {
    expect(
      shouldCommitDrag({
        offset: -WIDTH * (COMMIT_DISTANCE_RATIO + 0.01),
        direction: 'next',
        viewportWidth: WIDTH,
        velocity: 0,
      }),
    ).toBe(true)
  })

  it('springs back from a short, slow drag', () => {
    expect(
      shouldCommitDrag({ offset: -20, direction: 'next', viewportWidth: WIDTH, velocity: 0 }),
    ).toBe(false)
  })

  it('commits on a fast flick even if released early', () => {
    expect(
      shouldCommitDrag({
        offset: -60,
        direction: 'next',
        viewportWidth: WIDTH,
        velocity: -(COMMIT_VELOCITY_PX_MS + 0.2),
      }),
    ).toBe(true)
  })

  it('ignores flick velocity in the wrong direction', () => {
    expect(
      shouldCommitDrag({
        offset: -60,
        direction: 'next',
        viewportWidth: WIDTH,
        velocity: COMMIT_VELOCITY_PX_MS + 0.2, // finger moving the opposite way at release
      }),
    ).toBe(false)
  })

  it('does not let a fast flick with almost no travel commit', () => {
    expect(
      shouldCommitDrag({
        offset: -2,
        direction: 'next',
        viewportWidth: WIDTH,
        velocity: -5,
      }),
    ).toBe(false)
  })

  it('applies the same rule for a backward drag', () => {
    expect(
      shouldCommitDrag({
        offset: WIDTH * (COMMIT_DISTANCE_RATIO + 0.01),
        direction: 'previous',
        viewportWidth: WIDTH,
        velocity: 0,
      }),
    ).toBe(true)
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

  it('can reach every tab by walking forward from the first', () => {
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
