function PageHeader({ title, children }) {
  return (
    <header className="app-header">
      <div className="page-title">
        <img src={`${import.meta.env.BASE_URL}logo-mark.png`} alt="" className="page-logo" />
        <h1>{title}</h1>
      </div>
      {children}
    </header>
  )
}

export default PageHeader
