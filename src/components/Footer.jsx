import './Footer.css'
import { useLocale } from '../i18n/LocaleContext'
import { useNavigate } from 'react-router-dom'

export default function Footer() {
  const { t } = useLocale()
  const navigate = useNavigate()

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
            <li>
              <span className="footer-contact-link" onClick={() => navigate('/contact')}>
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
