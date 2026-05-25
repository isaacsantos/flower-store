import { useState, useEffect, useRef } from 'react'
import { useLocale } from '../i18n/LocaleContext.jsx'
import { useAuth } from '../firebase/AuthContext.jsx'
import { apiRequest, apiUpload, ADMIN_API_URL } from '../utils/apiClient.js'
import './ProductForm.css'

const TAGS_API = import.meta.env.VITE_ADMIN_API_URL.replace(/\/products$/, '/tags')

export default function ProductForm({ product, onClose, onSaved }) {
  const { t } = useLocale()
  const { user } = useAuth()
  const isEdit = product != null
  const fileInputRef = useRef(null)

  const [name, setName] = useState(isEdit ? product.name : '')
  const [price, setPrice] = useState(isEdit && product.price != null ? String(product.price) : '')
  const [description, setDescription] = useState(isEdit ? product.description : '')
  const [active, setActive] = useState(isEdit ? (product.active ?? true) : true)
  const [conditionType, setConditionType] = useState(isEdit && product.conditionType ? product.conditionType : '')
  const [conditionRating, setConditionRating] = useState(isEdit && product.conditionRating != null ? String(product.conditionRating) : '')
  const [availableTags, setAvailableTags] = useState([])
  const [selectedTagIds, setSelectedTagIds] = useState(
    isEdit ? (product.tags ?? []).map(tag => tag.id) : []
  )
  // Images: existing (from product) + new files selected by user
  const [existingImages, setExistingImages] = useState(
    isEdit ? (product.images ?? []) : []
  )
  const [newImageFiles, setNewImageFiles] = useState([])
  const [newImagePreviews, setNewImagePreviews] = useState([])
  const [conditionTypeError, setConditionTypeError] = useState('')
  const [conditionRatingError, setConditionRatingError] = useState('')
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) return
    apiRequest(TAGS_API, {}, user)
      .then(setAvailableTags)
      .catch(() => {})
  }, [user])

  function handleFileChange(e) {
    const files = Array.from(e.target.files)
    if (!files.length) return
    setNewImageFiles(prev => [...prev, ...files])
    const previews = files.map(f => URL.createObjectURL(f))
    setNewImagePreviews(prev => [...prev, ...previews])
    // Reset input so same file can be re-selected if removed
    e.target.value = ''
  }

  function removeNewImage(index) {
    URL.revokeObjectURL(newImagePreviews[index])
    setNewImageFiles(prev => prev.filter((_, i) => i !== index))
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  function removeExistingImage(index) {
    setExistingImages(prev => prev.filter((_, i) => i !== index))
  }

  function toggleTag(id) {
    setSelectedTagIds(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setConditionTypeError('')
    setConditionRatingError('')

    // Validate condition fields
    let hasValidationError = false

    if (!conditionType) {
      setConditionTypeError(t('admin.products.validation.conditionType'))
      hasValidationError = true
    }

    const ratingNum = Number(conditionRating)
    if (conditionRating === '' || !Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 10) {
      setConditionRatingError(t('admin.products.validation.conditionRating'))
      hasValidationError = true
    }

    if (hasValidationError) {
      return
    }

    setSaving(true)
    try {
      const path = isEdit ? `${ADMIN_API_URL}/${product.id}` : ADMIN_API_URL
      const method = isEdit ? 'PUT' : 'POST'
      const saved = await apiRequest(path, {
        method,
        body: JSON.stringify({
          name,
          price: price.trim() === '' ? null : parseFloat(price),
          description,
          active,
          conditionType: conditionType || null,
          conditionRating: conditionRating !== '' ? parseInt(conditionRating, 10) : null,
        }),
      }, user)

      const productId = saved?.id ?? product?.id
      if (productId) {
        await apiRequest(`${ADMIN_API_URL}/${productId}/tags`, {
          method: 'PUT',
          body: JSON.stringify(selectedTagIds),
        }, user)

        // Upload new images if any
        if (newImageFiles.length > 0) {
          const formData = new FormData()
          newImageFiles.forEach(file => formData.append('files', file))
          await apiUpload(`${ADMIN_API_URL}/${productId}/images/upload`, formData, user)
        }
      }

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

          <label className="admin-form-toggle">
            <span>{t('admin.products.col.active')}</span>
            <div
              className={`admin-form-toggle-track ${active ? 'admin-form-toggle-track--on' : ''}`}
              onClick={() => setActive(a => !a)}
              role="switch"
              aria-checked={active}
              tabIndex={0}
              onKeyDown={e => (e.key === ' ' || e.key === 'Enter') && setActive(a => !a)}
            >
              <div className="admin-form-toggle-thumb" />
            </div>
          </label>

          <label className="admin-form-label">
            {t('admin.products.col.conditionType')}
            <select
              className="admin-form-input"
              value={conditionType}
              onChange={(e) => setConditionType(e.target.value)}
            >
              <option value="">{t('admin.products.form.conditionType.placeholder')}</option>
              <option value="NEW">{t('condition.type.new')}</option>
              <option value="USED">{t('condition.type.used')}</option>
            </select>
            {conditionTypeError && <span className="admin-form-field-error">{conditionTypeError}</span>}
          </label>

          <label className="admin-form-label">
            {t('admin.products.col.conditionRating')}
            <input
              className="admin-form-input"
              type="number"
              min="1"
              max="10"
              step="1"
              value={conditionRating}
              onChange={(e) => setConditionRating(e.target.value)}
              placeholder={t('admin.products.form.conditionRating.placeholder')}
            />
            {conditionRatingError && <span className="admin-form-field-error">{conditionRatingError}</span>}
          </label>

          {availableTags.length > 0 && (
            <div className="admin-form-label">
              <span>{t('admin.products.col.tags')}</span>
              <div className="admin-form-tags">
                {availableTags.map(tag => (
                  <label key={tag.id} className={`admin-form-tag ${selectedTagIds.includes(tag.id) ? 'admin-form-tag--selected' : ''}`}>
                    <input
                      type="checkbox"
                      checked={selectedTagIds.includes(tag.id)}
                      onChange={() => toggleTag(tag.id)}
                    />
                    {tag.name}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Images section */}
          <div className="admin-form-label">
            <span>{t('admin.products.col.images')}</span>
            <div className="admin-form-images">
              {existingImages.map((img, i) => (
                <div key={img.id ?? img.url ?? i} className="admin-form-image-thumb">
                  <img src={img.url} alt={t('product.imageAlt')} />
                  <button
                    type="button"
                    className="admin-form-image-remove"
                    onClick={() => removeExistingImage(i)}
                    aria-label={t('admin.products.images.remove')}
                  >×</button>
                </div>
              ))}
              {newImagePreviews.map((src, i) => (
                <div key={src} className="admin-form-image-thumb admin-form-image-thumb--new">
                  <img src={src} alt={t('product.imageAlt')} />
                  <button
                    type="button"
                    className="admin-form-image-remove"
                    onClick={() => removeNewImage(i)}
                    aria-label={t('admin.products.images.remove')}
                  >×</button>
                </div>
              ))}
              <button
                type="button"
                className="admin-form-image-add"
                onClick={() => fileInputRef.current?.click()}
              >
                <span>+</span>
                <span>{t('admin.products.images.add')}</span>
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </div>

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
