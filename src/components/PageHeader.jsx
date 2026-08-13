function PageHeader({ title, icon, children }) {
  return (
    <header className="app-header">
      <div className="page-title">
        <img src={`${import.meta.env.BASE_URL}${icon}`} alt="" className="page-logo" />
        <h1>{title}</h1>
      </div>
      {children}
    </header>
  )
}

export default PageHeader
