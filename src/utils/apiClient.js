/**
 * Centralized API client for admin requests.
 * Injects the Firebase JWT via user.getIdToken() and handles 401 with one retry.
 */
export const ADMIN_API_URL = import.meta.env.VITE_ADMIN_API_URL

export async function apiRequest(path, options = {}, user) {
  if (!user) {
    throw new Error('No authenticated user')
  }

  const token = await user.getIdToken()

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`,
  }

  const res = await fetch(path, { ...options, headers })

  if (res.status === 401) {
    // Retry once with a fresh token
    const freshToken = await user.getIdToken(true)
    const retryHeaders = { ...headers, Authorization: `Bearer ${freshToken}` }
    const retryRes = await fetch(path, { ...options, headers: retryHeaders })

    if (retryRes.status === 401) {
      throw new Error('Unauthorized')
    }

    if (!retryRes.ok) {
      throw new Error(`HTTP ${retryRes.status}`)
    }

    return retryRes.json()
  }

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`)
  }

  return res.json()
}
