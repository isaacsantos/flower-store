import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useLocale } from '../i18n/LocaleContext.jsx'
import './AdminSidebar.css'

const ProductsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <rect x="2" y="3" width="20" height="14" rx="2"/>
    <line x1="8" y1="21" x2="16" y2="21"/>
    <line x1="12" y1="17" x2="12" y2="21"/>
  </svg>
)

const CollapseIcon = ({ collapsed }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    {collapsed
      ? <polyline points="9 18 15 12 9 6"/>
      : <polyline points="15 18 9 12 15 6"/>
    }
  </svg>
)

export default function AdminSidebar() {
  const { t } = useLocale()
  const [collapsed, setCollapsed] = useState(() => window.innerWidth <= 900)

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
    </aside>
  )
}
