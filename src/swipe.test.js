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
import { ALL_VIEWS, HUB_VIEW, SPOKES } from './navIcons.js'

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
  it('sends a backward swipe from any spoke home to the hub', () => {
    for (const spoke of SPOKES.map((entry) => entry.key)) {
      expect(nextView(ALL_VIEWS, spoke, 'previous')).toBe(HUB_VIEW)
    }
  })

  it('has nowhere to go backwards from the hub itself', () => {
    expect(nextView(ALL_VIEWS, HUB_VIEW, 'previous')).toBe(HUB_VIEW)
  })

  it('has nothing to reveal on a forward swipe, from anywhere', () => {
    expect(nextView(ALL_VIEWS, HUB_VIEW, 'next')).toBe(HUB_VIEW)
    expect(nextView(ALL_VIEWS, 'habits', 'next')).toBe('habits')
    expect(nextView(ALL_VIEWS, 'gratitude', 'next')).toBe('gratitude')
  })

  it('leaves an unknown view alone', () => {
    expect(nextView(ALL_VIEWS, 'nonsense', 'previous')).toBe('nonsense')
    expect(nextView(ALL_VIEWS, 'nonsense', 'next')).toBe('nonsense')
  })

  it('reaches the hub in one swipe from every page, however many exist', () => {
    // The point of hub and spoke: no page is ever more than one gesture from
    // home, so adding pages never lengthens the journey back.
    for (const view of ALL_VIEWS) {
      expect(nextView(ALL_VIEWS, view, 'previous')).toBe(HUB_VIEW)
    }
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
