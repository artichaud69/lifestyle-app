import PageHeader from './PageHeader.jsx'
import { PAGE_ICONS } from '../navIcons.js'
import { ORAISON_TITLE, ORAISON_VERSES } from '../oraison.js'

function OraisonPage() {
  const [opening, ...rest] = ORAISON_VERSES
  const closing = rest.pop()

  return (
    <div className="wallpaper-page">
      <PageHeader title="Oraison" icon={PAGE_ICONS.oraison} />

      <article className="oraison">
        <h2 className="oraison-title">{ORAISON_TITLE}</h2>
        <div className="oraison-rule" />

        <p className="oraison-opening">{opening}</p>

        {rest.map((verse) => (
          <p key={verse} className="oraison-verse">
            {verse}
          </p>
        ))}

        <div className="oraison-rule" />
        <p className="oraison-verse oraison-closing">{closing}</p>
      </article>
    </div>
  )
}

export default OraisonPage
