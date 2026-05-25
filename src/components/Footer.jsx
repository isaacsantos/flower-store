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
          <span className="footer-logo">🎮 Zack Retro Store</span>
          <p>{t('footer.tagline')}</p>
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
      </div>
      <div className="footer-bottom">
        <p>{t('footer.copyright')}</p>
      </div>
    </footer>
  )
}
