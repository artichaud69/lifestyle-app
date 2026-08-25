// An icon-only control. `label` is required rather than optional: without it
// the button is unreadable to a screen reader, since there is no text in it.
function IconButton({ label, icon: Icon, variant = '', size = 18, className = '', ...rest }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`btn-icon ${variant} ${className}`.trim()}
      {...rest}
    >
      <Icon size={size} strokeWidth={1.75} aria-hidden="true" />
    </button>
  )
}

export default IconButton
