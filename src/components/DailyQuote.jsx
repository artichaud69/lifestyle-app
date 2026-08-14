import { quoteForDate } from '../quotes.js'
import { todayISO } from '../dates.js'

function DailyQuote() {
  const quote = quoteForDate(todayISO())

  return (
    <blockquote className="daily-quote">
      <p className="daily-quote-text">“{quote.text}”</p>
      <footer className="daily-quote-author">{quote.author}</footer>
    </blockquote>
  )
}

export default DailyQuote
