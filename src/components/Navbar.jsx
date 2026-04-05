import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Navbar.css'
import { useLocale } from '../i18n/LocaleContext'
import LanguageSwitcher from './LanguageSwitcher'
import logo from '../assets/logo.png'

const WA_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER ?? ''

function openWhatsApp() {
  window.open(`https://wa.me/${WA_NUMBER}`, '_blank', 'noopener')
}

export default function Navbar() {
  const { t } = useLocale()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  function close() { setMenuOpen(false) }

  return (
    <nav className="navbar">
      <div className="nav-logo" onClick={() => { close(); navigate('/') }} style={{ cursor: 'pointer' }}>
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
          <li><a href="#" onClick={e => { e.preventDefault(); close(); navigate('/') }}>{t('nav.home')}</a></li>
          <li>
            <a href="#" onClick={e => { e.preventDefault(); close(); navigate('/shop') }}>
              {t('nav.shop')}
            </a>
          </li>
          <li><a href="#about" onClick={close}>{t('nav.about')}</a></li>
          <li>
            <a href="#" onClick={e => { e.preventDefault(); close(); openWhatsApp() }}>
              {t('nav.contact')}
            </a>
          </li>
        </ul>
        <div className="nav-actions">
          <LanguageSwitcher />
          <button className="nav-cta">{t('nav.cta')}</button>
        </div>
      </div>
    </nav>
  )
}
