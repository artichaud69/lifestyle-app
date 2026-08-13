function PageWallpaper() {
  return (
    <div
      className="page-wallpaper"
      style={{ backgroundImage: `url(${import.meta.env.BASE_URL}images/theme-wallpaper.jpg)` }}
    >
      <div className="page-wallpaper-scrim" />
    </div>
  )
}

export default PageWallpaper
