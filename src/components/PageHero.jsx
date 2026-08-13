function PageHero({ title, icon, image, children }) {
  return (
    <header className="page-hero" style={{ backgroundImage: `url(${import.meta.env.BASE_URL}${image})` }}>
      <div className="page-hero-scrim" />
      <div className="page-hero-content">
        <div className="page-title">
          <img src={`${import.meta.env.BASE_URL}${icon}`} alt="" className="page-logo" />
          <h1>{title}</h1>
        </div>
        {children}
      </div>
    </header>
  )
}

export default PageHero
