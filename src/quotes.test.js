import { describe, it, expect } from 'vitest'
import { QUOTES, quoteForDate } from './quotes.js'

function datesAcross(year, count) {
  const dates = []
  const cursor = new Date(year, 0, 1)
  for (let index = 0; index < count; index++) {
    const y = cursor.getFullYear()
    const m = String(cursor.getMonth() + 1).padStart(2, '0')
    const d = String(cursor.getDate()).padStart(2, '0')
    dates.push(`${y}-${m}-${d}`)
    cursor.setDate(cursor.getDate() + 1)
  }
  return dates
}

describe('QUOTES', () => {
  it('has a decent-sized library', () => {
    expect(QUOTES.length).toBeGreaterThanOrEqual(50)
  })

  it('gives every quote non-empty text and an attribution', () => {
    for (const quote of QUOTES) {
      expect(typeof quote.text).toBe('string')
      expect(quote.text.trim().length).toBeGreaterThan(0)
      expect(typeof quote.author).toBe('string')
      expect(quote.author.trim().length).toBeGreaterThan(0)
    }
  })

  it('contains no duplicate quotes', () => {
    const texts = QUOTES.map((quote) => quote.text)
    expect(new Set(texts).size).toBe(texts.length)
  })

  it('keeps quotes short enough to read at a glance', () => {
    for (const quote of QUOTES) {
      expect(quote.text.length).toBeLessThanOrEqual(160)
    }
  })

  it('does not bake in its own quotation marks, since the UI adds them', () => {
    for (const quote of QUOTES) {
      expect(quote.text.startsWith('"')).toBe(false)
      expect(quote.text.startsWith('“')).toBe(false)
    }
  })
})

describe('quoteForDate', () => {
  it('always returns a real quote from the library', () => {
    for (const date of datesAcross(2026, 400)) {
      expect(QUOTES).toContain(quoteForDate(date))
    }
  })

  it('is stable for a given day, so it survives re-renders and reloads', () => {
    expect(quoteForDate('2026-08-13')).toBe(quoteForDate('2026-08-13'))
  })

  it('changes from one day to the next', () => {
    const dates = datesAcross(2026, 365)
    let consecutiveRepeats = 0
    for (let index = 1; index < dates.length; index++) {
      if (quoteForDate(dates[index]).text === quoteForDate(dates[index - 1]).text) {
        consecutiveRepeats++
      }
    }
    expect(consecutiveRepeats).toBe(0)
  })

  it('works through the whole library over a year rather than favouring a few', () => {
    const shown = new Set(datesAcross(2026, 365).map((date) => quoteForDate(date).text))
    expect(shown.size).toBe(QUOTES.length)
  })

  it('spreads reasonably evenly, with no quote dominating the year', () => {
    const counts = new Map()
    for (const date of datesAcross(2026, 365)) {
      const { text } = quoteForDate(date)
      counts.set(text, (counts.get(text) ?? 0) + 1)
    }
    // 365 days over ~52 quotes averages 7; allow a wide but bounded spread.
    expect(Math.max(...counts.values())).toBeLessThanOrEqual(15)
  })
})
