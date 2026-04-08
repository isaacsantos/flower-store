import { Navigate, Outlet, useLocation } from 'react-router-dom'

export default function AdminAuthGuard() {
  const location = useLocation()
  const token = localStorage.getItem('admin_token')
  const hasToken = token !== null && token !== ''

  // Authenticated user trying to access /admin/login → redirect to /admin
  if (hasToken && location.pathname === '/admin/login') {
    return <Navigate to="/admin" replace />
  }

  // Unauthenticated user trying to access protected routes → redirect to login
  if (!hasToken) {
    return <Navigate to="/admin/login" replace />
  }

  return <Outlet />
}
