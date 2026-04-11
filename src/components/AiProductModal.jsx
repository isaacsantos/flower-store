import { useState, useEffect, useRef } from 'react'
import { useLocale } from '../i18n/LocaleContext.jsx'
import { useAuth } from '../firebase/AuthContext.jsx'
import { apiUploadRaw, ADMIN_API_URL } from '../utils/apiClient.js'
import './AiProductModal.css'

const MAX_FILES = Number(import.meta.env.VITE_AI_MAX_FILES) || 10
const AI_ENDPOINT = ADMIN_API_URL.replace(/\/products$/, '/products/ai-create')

export default function AiProductModal({ onClose }) {
  const { t } = useLocale()
  const { user } = useAuth()
  const fileInputRef = useRef(null)

  const [files, setFiles] = useState([])
  const [previews, setPreviews] = useState([])
  const [dragOver, setDragOver] = useState(false)
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  // Revoke all preview URLs on unmount
  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function addFiles(incoming) {
    const images = incoming.filter((f) => f.type.startsWith('image/'))
    if (images.length === 0) return

    const available = MAX_FILES - files.length
    if (available <= 0) return

    let accepted
    if (images.length > available) {
      accepted = images.slice(0, available)
      setError(t('admin.ai.error.limit').replace('{max}', String(MAX_FILES)))
    } else {
      accepted = images
      setError(null)
    }

    const newPreviews = accepted.map((f) => URL.createObjectURL(f))
    setFiles((prev) => [...prev, ...accepted])
    setPreviews((prev) => [...prev, ...newPreviews])
  }

  function removeFile(index) {
    URL.revokeObjectURL(previews[index])
    setFiles((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    const dropped = Array.from(e.dataTransfer.files)
    addFiles(dropped)
  }

  function handleDragOver(e) {
    e.preventDefault()
    setDragOver(true)
  }

  function handleDragLeave() {
    setDragOver(false)
  }

  function handleFileChange(e) {
    const selected = Array.from(e.target.files)
    addFiles(selected)
    e.target.value = ''
  }

  async function handleSend() {
    setError(null)
    setSending(true)
    try {
      const formData = new FormData()
      files.forEach((file) => formData.append('files', file))
      const response = await apiUploadRaw(AI_ENDPOINT, formData, user)
      if (response.status === 202) {
        setResult('success')
      } else {
        setResult('error')
        setError(t('admin.ai.error.send'))
      }
    } catch {
      setResult('error')
      setError(t('admin.ai.error.send'))
    } finally {
      setSending(false)
    }
  }

  function handleRetry() {
    setResult(null)
    setError(null)
    handleSend()
  }

  const atLimit = files.length >= MAX_FILES
  const counterText = t('admin.ai.counter')
    .replace('{count}', String(files.length))
    .replace('{max}', String(MAX_FILES))

  // Success state
  if (result === 'success') {
    return (
      <div className="ai-modal-overlay" role="dialog" aria-modal="true">
        <div className="ai-modal-card">
          <h2 className="ai-modal-title">{t('admin.ai.title')}</h2>
          <p className="ai-modal-success">{t('admin.ai.success')}</p>
          <div className="ai-modal-actions">
            <button className="ai-modal-btn ai-modal-btn--primary" onClick={onClose}>
              {t('admin.ai.accept')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Error state (after send attempt)
  if (result === 'error') {
    return (
      <div className="ai-modal-overlay" role="dialog" aria-modal="true">
        <div className="ai-modal-card">
          <h2 className="ai-modal-title">{t('admin.ai.title')}</h2>
          {error && <p className="ai-modal-error">{error}</p>}
          <div className="ai-modal-actions">
            <button className="ai-modal-btn ai-modal-btn--secondary" onClick={onClose}>
              {t('admin.ai.close')}
            </button>
            <button className="ai-modal-btn ai-modal-btn--primary" onClick={handleRetry}>
              {t('admin.ai.retry')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Default state: file selection
  return (
    <div className="ai-modal-overlay" role="dialog" aria-modal="true">
      <div className="ai-modal-card">
        <h2 className="ai-modal-title">{t('admin.ai.title')}</h2>

        {error && <p className="ai-modal-error">{error}</p>}

        {sending ? (
          <div className="ai-modal-loading">
            <span className="ai-modal-spinner" />
            <span>{t('admin.ai.sending')}</span>
          </div>
        ) : (
          <>
            <div
              className={`ai-modal-dropzone${dragOver ? ' ai-modal-dropzone--active' : ''}${atLimit ? ' ai-modal-dropzone--disabled' : ''}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => !atLimit && fileInputRef.current?.click()}
            >
              <span>{dragOver ? t('admin.ai.dropzone.active') : t('admin.ai.dropzone')}</span>
              {!dragOver && (
                <span className="ai-modal-browse">{t('admin.ai.browse')}</span>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </>
        )}

        {previews.length > 0 && (
          <div className="ai-modal-previews">
            {previews.map((src, i) => (
              <div key={src} className="ai-modal-thumb">
                <img src={src} alt={t('admin.ai.remove')} />
                <button
                  type="button"
                  className="ai-modal-thumb-remove"
                  onClick={() => removeFile(i)}
                  aria-label={t('admin.ai.remove')}
                  disabled={sending}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <span className="ai-modal-counter">{counterText}</span>

        <div className="ai-modal-actions">
          <button
            className="ai-modal-btn ai-modal-btn--secondary"
            onClick={onClose}
            disabled={sending}
          >
            {t('admin.ai.close')}
          </button>
          <button
            className="ai-modal-btn ai-modal-btn--primary"
            onClick={handleSend}
            disabled={sending || files.length === 0}
          >
            {t('admin.ai.send')}
          </button>
        </div>
      </div>
    </div>
  )
}
