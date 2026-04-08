/**
 * Centralized API client for admin requests.
 * Injects the JWT from localStorage and handles 401 responses automatically.
 */
export const ADMIN_API_URL = import.meta.env.VITE_ADMIN_API_URL

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem('admin_token')

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }

  const res = await fetch(path, { ...options, headers })

  if (res.status === 401) {
    localStorage.removeItem('admin_token')
    window.location.hash = '/admin/login'
    throw new Error('Unauthorized')
  }

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`)
  }

  return res.json()
}
