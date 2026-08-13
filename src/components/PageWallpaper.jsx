function PageWallpaper({ image }) {
  return (
    <div
      className="page-wallpaper"
      style={{ backgroundImage: `url(${import.meta.env.BASE_URL}${image})` }}
    >
      <div className="page-wallpaper-scrim" />
    </div>
  )
}

export default PageWallpaper
