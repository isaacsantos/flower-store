import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../firebase/AuthContext.jsx'

export default function AdminAuthGuard() {
  const { user, loading, isAdmin } = useAuth()

  if (loading) {
    return <div className="admin-auth-loading" aria-live="polite">Loading...</div>
  }

  if (!user || !isAdmin) {
    return <Navigate to="/admin/login" replace />
  }

  return <Outlet />
}
