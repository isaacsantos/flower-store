import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useLocale } from '../i18n/LocaleContext'
import './ProductDetail.css'

const API_BASE = import.meta.env.VITE_PRODUCTS_API_URL.replace(/\/products$/, '')
const WA_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER ?? ''

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useLocale()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [imgIndex, setImgIndex] = useState(0)

  useEffect(() => {
    setLoading(true)
    setError(false)
    fetch(`${API_BASE}/products/${id}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then(data => {
        // Sort images by displayOrder so index 0 is always the primary
        const sorted = [...(data.images ?? [])].sort((a, b) => a.displayOrder - b.displayOrder)
        setProduct({ ...data, images: sorted })
        setLoading(false)
      })
      .catch(() => { setError(true); setLoading(false) })
  }, [id])

  function handleWhatsApp() {
    const msg = encodeURIComponent(`${t('product.whatsappMsg')}${product.name}`)
    window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`, '_blank', 'noopener')
  }

  const images = product?.images ?? []
  const hasMultiple = images.length > 1

  function prev() { setImgIndex(i => (i - 1 + images.length) % images.length) }
  function next() { setImgIndex(i => (i + 1) % images.length) }

  return (
    <div className="pd-page">
      <button className="pd-back" onClick={() => navigate(-1)}>
        {t('product.back')}
      </button>

      {loading && (
        <div className="pd-state">
          <div className="pd-skeleton-img" />
          <p>{t('product.loading')}</p>
        </div>
      )}

      {error && (
        <div className="pd-state">
          <p className="pd-error">{t('product.error')}</p>
        </div>
      )}

      {product && (
        <div className="pd-card">
          {/* Image gallery */}
          <div className="pd-gallery">
            <div className="pd-img-wrap">
              {hasMultiple && (
                <button className="pd-arrow pd-arrow--left" onClick={prev} aria-label={t('product.prevImage')}>‹</button>
              )}
              <img
                key={imgIndex}
                className="pd-img"
                src={images[imgIndex]?.url}
                alt={`${t('product.imageAlt')} ${imgIndex + 1}`}
              />
              {hasMultiple && (
                <button className="pd-arrow pd-arrow--right" onClick={next} aria-label={t('product.nextImage')}>›</button>
              )}
            </div>

            {hasMultiple && (
              <div className="pd-dots">
                {images.map((_, i) => (
                  <button
                    key={i}
                    className={`pd-dot ${i === imgIndex ? 'pd-dot--active' : ''}`}
                    onClick={() => setImgIndex(i)}
                    aria-label={`${t('product.imageAlt')} ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="pd-info">
            <h1 className="pd-name">{product.name}</h1>

            {product.price != null && (
              <p className="pd-price">${Number(product.price).toFixed(2)}</p>
            )}

            <p className="pd-desc">
              {product.description || t('product.defaultDesc')}
            </p>

            <button className="pd-cta" onClick={handleWhatsApp}>
              {t('product.cta')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
