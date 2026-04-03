import './Navbar.css'
import { useLocale } from '../i18n/LocaleContext'
import LanguageSwitcher from './LanguageSwitcher'

export default function Navbar() {
  const { t } = useLocale()

  return (
    <nav className="navbar">
      <div className="nav-logo">
        <span className="logo-icon">🌸</span>
        <span className="logo-text">El Jardin de Casa Blanca</span>
      </div>
      <ul className="nav-links">
        <li><a href="#home">{t('nav.home')}</a></li>
        <li><a href="#shop">{t('nav.shop')}</a></li>
        <li><a href="#about">{t('nav.about')}</a></li>
        <li><a href="#contact">{t('nav.contact')}</a></li>
      </ul>
      <div className="nav-actions">
        <LanguageSwitcher />
        <button className="nav-cta">{t('nav.cta')}</button>
      </div>
    </nav>
  )
}
