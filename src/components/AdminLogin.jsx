import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocale } from '../i18n/LocaleContext.jsx'
import './AdminLogin.css'

export default function AdminLogin() {
  const { t } = useLocale()
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [token, setToken] = useState('')
  const [error, setError] = useState(null)

  function handleSubmit(e) {
    e.preventDefault()

    if (!username.trim() || !token.trim()) {
      setError(t('admin.login.error.required'))
      return
    }

    localStorage.setItem('admin_token', token)
    navigate('/admin')
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <h1 className="admin-login-title">{t('admin.login.title')}</h1>

        <form className="admin-login-form" onSubmit={handleSubmit} noValidate>
          <div className="admin-login-field">
            <label className="admin-login-label" htmlFor="admin-username">
              {t('admin.login.username')}
            </label>
            <input
              id="admin-username"
              className="admin-login-input"
              type="text"
              value={username}
              onChange={e => { setUsername(e.target.value); setError(null) }}
              autoComplete="username"
            />
          </div>

          <div className="admin-login-field">
            <label className="admin-login-label" htmlFor="admin-token">
              {t('admin.login.token')}
            </label>
            <input
              id="admin-token"
              className="admin-login-input"
              type="text"
              value={token}
              onChange={e => { setToken(e.target.value); setError(null) }}
              autoComplete="off"
            />
          </div>

          {error && (
            <p className="admin-login-error" role="alert">{error}</p>
          )}

          <button className="admin-login-submit" type="submit">
            {t('admin.login.submit')}
          </button>
        </form>
      </div>
    </div>
  )
}
