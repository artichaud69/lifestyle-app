import PageHero from './PageHero.jsx'
import { PAGE_ICONS } from '../navIcons.js'
import { ORAISON_TITLE, ORAISON_VERSES } from '../oraison.js'

function OraisonPage({ onBack }) {
  const [opening, ...rest] = ORAISON_VERSES
  const closing = rest.pop()

  return (
    <div className="page">
      <PageHero view="oraison" title="Oraison" onBack={onBack} />

      <div className="page-body">

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
    </div>
  )
}

export default OraisonPage
