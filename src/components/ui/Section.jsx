// A titled block. Sections own the page's vertical rhythm, so pages don't set
// margins of their own.
function Section({ title, action, children }) {
  return (
    <section className="section">
      {(title || action) && (
        <div className="section-header">
          {title && <h2 className="label-sm">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  )
}

export default Section
