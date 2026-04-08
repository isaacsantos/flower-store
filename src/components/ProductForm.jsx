import { useState } from 'react'
import { useLocale } from '../i18n/LocaleContext.jsx'
import { useAuth } from '../firebase/AuthContext.jsx'
import { apiRequest, ADMIN_API_URL } from '../utils/apiClient.js'
import './ProductForm.css'

export default function ProductForm({ product, onClose, onSaved }) {
  const { t } = useLocale()
  const { user } = useAuth()
  const isEdit = product != null

  const [name, setName] = useState(isEdit ? product.name : '')
  const [price, setPrice] = useState(isEdit && product.price != null ? String(product.price) : '')
  const [description, setDescription] = useState(isEdit ? product.description : '')
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      const path = isEdit
        ? `${ADMIN_API_URL}/${product.id}`
        : ADMIN_API_URL
      const method = isEdit ? 'PUT' : 'POST'
      await apiRequest(path, {
        method,
        body: JSON.stringify({ name, price: price.trim() === '' ? null : parseFloat(price), description }),
      }, user)
      onSaved()
      onClose()
    } catch {
      setError(t('admin.products.error.save'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="admin-form-overlay" role="dialog" aria-modal="true">
      <div className="admin-form-card">
        <h2 className="admin-form-title">
          {isEdit ? t('admin.products.form.title.edit') : t('admin.products.form.title.create')}
        </h2>

        {error && <p className="admin-form-error">{error}</p>}

        <form className="admin-form-body" onSubmit={handleSubmit}>
          <label className="admin-form-label">
            {t('admin.products.col.name')}
            <input
              className="admin-form-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>

          <label className="admin-form-label">
            {t('admin.products.col.price')}
            <input
              className="admin-form-input"
              type="text"
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="—"
            />
          </label>

          <label className="admin-form-label">
            {t('admin.products.col.description')}
            <textarea
              className="admin-form-input admin-form-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
            />
          </label>

          <div className="admin-form-actions">
            <button
              type="button"
              className="admin-form-btn admin-form-btn--cancel"
              onClick={onClose}
              disabled={saving}
            >
              {t('admin.products.cancel')}
            </button>
            <button
              type="submit"
              className="admin-form-btn admin-form-btn--save"
              disabled={saving}
            >
              {t('admin.products.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
