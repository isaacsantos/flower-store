import './Footer.css'
import { useLocale } from '../i18n/LocaleContext'

const WA_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER ?? ''

function openWhatsApp() {
  window.open(`https://wa.me/${WA_NUMBER}`, '_blank', 'noopener')
}

export default function Footer() {
  const { t } = useLocale()

  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-brand">
          <span className="footer-logo">🌸 El Jardin de Casa Blanca</span>
          <p>{t('footer.tagline')}</p>
        </div>
        <div className="footer-links">
          <h4>{t('footer.shop.heading')}</h4>
          <ul>
            <li>{t('footer.shop.bouquets')}</li>
            <li>{t('footer.shop.seasonal')}</li>
            <li>{t('footer.shop.gifts')}</li>
            <li>{t('footer.shop.subscriptions')}</li>
          </ul>
        </div>
        <div className="footer-links">
          <h4>{t('footer.help.heading')}</h4>
          <ul>
            <li>{t('footer.help.faq')}</li>
            <li>{t('footer.help.delivery')}</li>
            <li>{t('footer.help.returns')}</li>
            <li>
              <span className="footer-contact-link" onClick={openWhatsApp}>
                {t('footer.help.contact')}
              </span>
            </li>
          </ul>
        </div>
        <div className="footer-newsletter">
          <h4>{t('footer.newsletter.heading')}</h4>
          <p>{t('footer.newsletter.desc')}</p>
          <div className="newsletter-form">
            <input type="email" placeholder={t('footer.newsletter.placeholder')} />
            <button>{t('footer.newsletter.btn')}</button>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>{t('footer.copyright')}</p>
      </div>
    </footer>
  )
}
