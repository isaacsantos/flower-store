import { useLocale } from '../i18n/LocaleContext.jsx'
import ProductsTable from './ProductsTable.jsx'
import './AdminHome.css'

export default function AdminHome() {
  const { t } = useLocale()

  return (
    <div className="admin-home">
      <div className="admin-home__content">
        <ProductsTable />
      </div>
    </div>
  )
}
