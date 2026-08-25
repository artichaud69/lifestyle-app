// What a page shows before it has anything to show. Explains the situation in
// the user's terms and offers the action that resolves it, rather than
// describing where in the app the plumbing lives.
function EmptyState({ icon, title, body, action }) {
  return (
    <div className="empty-state">
      {icon && <img src={icon} alt="" className="empty-state-icon" />}
      <h2 className="display-md">{title}</h2>
      {body && <p className="empty-state-body">{body}</p>}
      {action}
    </div>
  )
}

export default EmptyState
