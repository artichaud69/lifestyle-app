// The app's only button. Variants exist so pages never invent their own
// styling for what is, everywhere, the same control.
function Button({ variant = 'secondary', type = 'button', className = '', children, ...rest }) {
  return (
    <button type={type} className={`btn btn-${variant} ${className}`.trim()} {...rest}>
      {children}
    </button>
  )
}

export default Button
