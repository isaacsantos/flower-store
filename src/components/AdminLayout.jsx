import { Outlet } from 'react-router-dom'
import AdminSidebar from './AdminSidebar.jsx'
import './AdminLayout.css'

export default function AdminLayout() {
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-layout__main">
        <Outlet />
      </main>
    </div>
  )
}
