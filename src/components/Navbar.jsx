import { useState } from 'react'
import './Navbar.css'
import { useLocale } from '../i18n/LocaleContext'
import LanguageSwitcher from './LanguageSwitcher'
import logo from '../assets/logo.png'

export default function Navbar() {
  const { t } = useLocale()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="navbar">
      <div className="nav-logo">
        <img src={logo} alt="El Jardin de Casa Blanca" className="logo-icon" />
        <span className="logo-text">El Jardin de Casa Blanca</span>
      </div>

      <button
        className={`nav-hamburger ${menuOpen ? 'open' : ''}`}
        onClick={() => setMenuOpen(o => !o)}
        aria-label="Abrir menú"
        aria-expanded={menuOpen}
      >
        <span /><span /><span />
      </button>

      <div className={`nav-menu ${menuOpen ? 'open' : ''}`}>
        <ul className="nav-links">
          <li><a href="#home"  onClick={() => setMenuOpen(false)}>{t('nav.home')}</a></li>
          <li><a href="#shop"  onClick={() => setMenuOpen(false)}>{t('nav.shop')}</a></li>
          <li><a href="#about" onClick={() => setMenuOpen(false)}>{t('nav.about')}</a></li>
          <li><a href="#contact" onClick={() => setMenuOpen(false)}>{t('nav.contact')}</a></li>
        </ul>
        <div className="nav-actions">
          <LanguageSwitcher />
          <button className="nav-cta">{t('nav.cta')}</button>
        </div>
      </div>
    </nav>
  )
}
