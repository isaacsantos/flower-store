import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useLocale } from '../i18n/LocaleContext.jsx'
import { useAuth } from '../firebase/AuthContext.jsx'
import './AdminSidebar.css'

const ProductsIcon = () => (
  <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>🌹</span>
)

const CollapseIcon = ({ collapsed }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    {collapsed
      ? <polyline points="9 18 15 12 9 6"/>
      : <polyline points="15 18 9 12 15 6"/>
    }
  </svg>
)

const LogoutIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)

export default function AdminSidebar() {
  const { t } = useLocale()
  const { logout } = useAuth()
  const [collapsed, setCollapsed] = useState(true)
  const [logoutError, setLogoutError] = useState(null)

  async function handleLogout() {
    setLogoutError(null)
    try {
      await logout()
    } catch {
      setLogoutError(t('admin.products.error'))
    }
  }

  return (
    <aside className={`admin-sidebar${collapsed ? ' admin-sidebar--collapsed' : ''}`}>
      <nav className="admin-sidebar__nav">
        <NavLink
          to="/admin"
          end
          className={({ isActive }) =>
            `admin-sidebar__link${isActive ? ' admin-sidebar__link--active' : ''}`
          }
          title={t('admin.sidebar.products')}
        >
          <span className="admin-sidebar__icon"><ProductsIcon /></span>
          {!collapsed && <span className="admin-sidebar__label">{t('admin.sidebar.products')}</span>}
        </NavLink>
      </nav>

      <button
        className="admin-sidebar__toggle"
        onClick={() => setCollapsed(c => !c)}
        aria-label={collapsed ? t('admin.sidebar.expand') : t('admin.sidebar.collapse')}
        title={collapsed ? t('admin.sidebar.expand') : t('admin.sidebar.collapse')}
      >
        <CollapseIcon collapsed={collapsed} />
        {!collapsed && <span className="admin-sidebar__label">{t('admin.sidebar.collapse')}</span>}
      </button>

      <button
        className="admin-sidebar__logout"
        onClick={handleLogout}
        title={t('admin.logout.button')}
      >
        <LogoutIcon />
        {!collapsed && <span className="admin-sidebar__label">{t('admin.logout.button')}</span>}
      </button>

      {logoutError && (
        <p className="admin-sidebar__logout-error" role="alert">{logoutError}</p>
      )}
    </aside>
  )
}
