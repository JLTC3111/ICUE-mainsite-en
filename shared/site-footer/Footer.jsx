import { memo } from 'react'
import CircularText from '@icue/ui/CircularText/CircularText'
import { FOOTER_LABELS } from './footerContent'
import { getFooterLinks } from './footerLinks'
import './Footer.css'

const CIRCULAR_TEXT = '@ICUE*©COPY*RIGHTS*'

function isPlainInternalNavigation(event, href) {
  return href?.startsWith('/')
    && !href.startsWith('//')
    && event.button === 0
    && !event.metaKey
    && !event.ctrlKey
    && !event.shiftKey
    && !event.altKey
}

function Footer({ linkMode = 'hash', onNavigate }) {
  const labels = FOOTER_LABELS
  const links = getFooterLinks(linkMode)
  const year = new Date().getFullYear()
  const navigate = (event) => {
    const href = event.currentTarget.getAttribute('href')
    if (!onNavigate || !isPlainInternalNavigation(event, href)) return
    event.preventDefault()
    onNavigate(href)
  }

  return (
    <footer className="icue-footer">
      <div className="icue-footer__container">
        <div className="icue-footer__col">
          <h4>{labels.company}</h4>
          <a href={links.notableAwards} onClick={navigate}>{labels.awards}</a>
          <a href={links.news}>{labels.news}</a>
          <a href={links.archive} onClick={navigate}>{labels.archive}</a>
        </div>
        <div className="icue-footer__col">
          <h4>{labels.otherPages}</h4>
          <a href={links.faqs} onClick={navigate}>{labels.faqs}</a>
          <a href={links.recruitment} onClick={navigate}>{labels.recruitment}</a>
        </div>
        <div className="icue-footer__brand">
          <div className="icue-footer__logo-wrap">
            <span className="icue-footer__logo">ICUE</span>
            <CircularText
              text={CIRCULAR_TEXT}
              className="icue-footer__circular-text"
              spinDuration={24}
              onHover="pause"
              lightColor="#ffffff"
              darkColor="#ffffff"
              tintColor="#ffffff"
              brightness={1.22}
              contrast={0.5}
            />
          </div>
          <p className="icue-footer__institute">{labels.instituteName}</p>
          <p className="icue-footer__rights">© {year} {labels.rights}</p>
        </div>
      </div>

      <div className="icue-footer__bottom icue-container">
        <div className="icue-footer__legal">
          <a href={links.privacy} onClick={navigate}>{labels.privacy}</a><span>|</span>
          <a href={links.terms} onClick={navigate}>{labels.terms}</a><span>|</span>
          <a href={links.gdpr} onClick={navigate}>{labels.gdpr}</a><span>|</span>
          <a href={links.cookies} onClick={navigate}>{labels.cookies}</a>
        </div>
        <a href={links.contact} className="icue-footer__partner" onClick={navigate}>{labels.partner}</a>
      </div>
    </footer>
  )
}

export default memo(Footer)
