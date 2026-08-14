function PageWallpaper({ image, domRef, className = 'page-wallpaper' }) {
  return (
    <div
      ref={domRef}
      className={className}
      style={{ backgroundImage: `url(${import.meta.env.BASE_URL}${image})` }}
    >
      <div className="page-wallpaper-scrim" />
    </div>
  )
}

export default PageWallpaper
