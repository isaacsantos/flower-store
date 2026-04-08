import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useLocale } from '../i18n/LocaleContext.jsx'
import { useAuth } from '../firebase/AuthContext.jsx'
import './AdminLogin.css'

export default function AdminLogin() {
  const { t } = useLocale()
  const { user, isAdmin, loading, signInWithGoogle, logout } = useAuth()
  const [error, setError] = useState(null)
  const [signingIn, setSigningIn] = useState(false)

  // Must be before any early return — hooks rules
  useEffect(() => {
    // If somehow a non-admin user ends up authenticated (e.g. token claims changed),
    // sign them out reactively
    if (!loading && user && !isAdmin) {
      logout()
    }
  }, [loading, user, isAdmin])

  // If already admin, redirect to /admin
  if (!loading && isAdmin) {
    return <Navigate to="/admin" replace />
  }

  // While loading, show nothing (guard handles the spinner for protected routes)
  if (loading) return null

  async function handleGoogleSignIn() {
    setError(null)
    setSigningIn(true)
    try {
      await signInWithGoogle()
    } catch (err) {
      if (err?.code === 'auth/popup-closed-by-user') {
        // silent — user closed the popup
      } else if (err?.code === 'auth/unauthorized-email') {
        setError('unauthorized')
      } else {
        setError('network')
      }
    } finally {
      setSigningIn(false)
    }
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <h1 className="admin-login-title">{t('admin.login.title')}</h1>

        {error === 'unauthorized' && (
          <p className="admin-login-error" role="alert">
            {t('admin.login.error.unauthorized')}
          </p>
        )}
        {error === 'network' && (
          <p className="admin-login-error" role="alert">
            {t('admin.login.error.network')}
          </p>
        )}

        <button
          className="admin-login-google-btn"
          onClick={handleGoogleSignIn}
          disabled={signingIn}
          aria-label={t('admin.login.google')}
        >
          <GoogleIcon />
          <span>{signingIn ? t('admin.login.loading') : t('admin.login.google')}</span>
        </button>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  )
}
