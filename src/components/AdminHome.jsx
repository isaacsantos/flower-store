import { useNavigate } from 'react-router-dom'
import { useLocale } from '../i18n/LocaleContext.jsx'
import ProductsTable from './ProductsTable.jsx'
import './AdminHome.css'

export default function AdminHome() {
  const { t } = useLocale()
  const navigate = useNavigate()

  function handleLogout() {
    localStorage.removeItem('admin_token')
    navigate('/admin/login')
  }

  return (
    <div className="admin-home">
      <header className="admin-home__header">
        <button className="admin-home__logout-btn" onClick={handleLogout}>
          {t('admin.logout.button')}
        </button>
      </header>
      <div className="admin-home__content">
        <ProductsTable />
      </div>
    </div>
  )
}
