function Quote({ text, author }) {
  return (
    <figure className="quote">
      <blockquote className="quote-text">“{text}”</blockquote>
      <figcaption className="quote-author">{author}</figcaption>
    </figure>
  )
}

export default Quote
