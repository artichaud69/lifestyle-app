import { todayISO, datesBetween } from '../dates.js'
import { currentStreak, bestStreak } from '../streaks.js'
import PageHero from './PageHero.jsx'
import Section from './ui/Section.jsx'
import ProgressBar from './ui/ProgressBar.jsx'
import Quote from './ui/Quote.jsx'
import { quoteForDate } from '../quotes.js'
import { PAGE_ICONS, SPOKES } from '../navIcons.js'

function formatToday(iso) {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

function SummaryPage({ habits, onChangeView, onOpenSettings }) {
  const today = todayISO()
  const doneToday = habits.filter((habit) => habit.doneDates.includes(today)).length
  const donePercent = habits.length ? (doneToday / habits.length) * 100 : 0

  const year = Number(today.slice(0, 4))
  const daysLeftInYear = datesBetween(today, `${year}-12-31`).length - 1
  const totalDaysInYear = datesBetween(`${year}-01-01`, `${year}-12-31`).length
  const yearPercent = Math.round(((totalDaysInYear - daysLeftInYear) / totalDaysInYear) * 100)

  const quote = quoteForDate(today)
  const base = import.meta.env.BASE_URL

  return (
    <div className="page">
      <PageHero
        view="summary"
        title="Summary"
        subtitle={formatToday(today)}
        onSettings={onOpenSettings}
      />

      <div className="page-body">
        {/* Today first: what you can still act on matters more than anything
            else on this page. */}
        <Section title="Today">
          <div className="progress-row">
            <span className="body-md">
              {doneToday} of {habits.length} completed
            </span>
            <span className="caption">{Math.round(donePercent)}%</span>
          </div>
          <ProgressBar percent={donePercent} label="Habits completed today" />
        </Section>

        <nav className="summary-links" aria-label="Sections">
          {SPOKES.map((spoke) => (
            <button
              key={spoke.key}
              type="button"
              className="summary-link"
              onClick={() => onChangeView(spoke.key)}
            >
              <img src={`${base}${PAGE_ICONS[spoke.key]}`} alt="" className="summary-link-icon" />
              {spoke.label}
            </button>
          ))}
        </nav>

        {habits.length > 0 && (
          <Section title="Habits">
            {/* One surface with divided rows, rather than a stack of cards
                that each demand separate attention. */}
            <div className="list-group">
              {habits.map((habit) => {
                const streak = currentStreak(habit.startDate, habit.doneDates, habit.timesPerWeek)
                const best = bestStreak(habit.startDate, habit.doneDates, habit.timesPerWeek)
                const done = habit.doneDates.includes(today)
                return (
                  <div key={habit.id} className="list-row">
                    <div className="list-row-main">
                      <span className="list-row-name">{habit.name}</span>
                      <span className="caption">
                        Current streak {streak} · Best {best}
                      </span>
                    </div>
                    <span className="caption">{done ? 'Done' : '—'}</span>
                  </div>
                )
              })}
            </div>
          </Section>
        )}

        <Section title={String(year)}>
          <div className="progress-row">
            <span className="body-sm">{yearPercent}% complete</span>
            <span className="caption">{daysLeftInYear} days left</span>
          </div>
          <ProgressBar percent={yearPercent} label={`Progress through ${year}`} />
        </Section>

        <Quote text={quote.text} author={quote.author} />
      </div>
    </div>
  )
}

export default SummaryPage
