import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Navbar.css'
import { useLocale } from '../i18n/LocaleContext'
import { useAuth } from '../firebase/AuthContext'
import LanguageSwitcher from './LanguageSwitcher'
import logo from '../assets/logo-gaming.svg'

export default function Navbar() {
  const { t } = useLocale()
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  function close() { setMenuOpen(false) }

  return (
    <nav className="navbar">
      <div className="nav-logo" onClick={() => { close(); navigate('/') }} style={{ cursor: 'pointer' }}>
        <img src={logo} alt="Pixel Realm" className="logo-icon" />
        <span className="logo-text">Pixel Realm</span>
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
            <a href="#" onClick={e => { e.preventDefault(); close(); navigate('/contact') }}>
              {t('nav.contact')}
            </a>
          </li>
          {user && isAdmin && (
            <li>
              <a href="#" onClick={e => { e.preventDefault(); close(); navigate('/admin') }}>
                {t('nav.admin')}
              </a>
            </li>
          )}
        </ul>
        <div className="nav-actions">
          <LanguageSwitcher />
        </div>
      </div>
    </nav>
  )
}
