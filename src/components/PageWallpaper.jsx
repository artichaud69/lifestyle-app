function PageWallpaper({ image, domRef, className = 'page-wallpaper', style }) {
  return (
    <div
      ref={domRef}
      className={className}
      style={{ backgroundImage: `url(${import.meta.env.BASE_URL}${image})`, ...style }}
    >
      <div className="page-wallpaper-scrim" />
    </div>
  )
}

export default PageWallpaper
