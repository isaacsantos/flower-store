import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useLocale } from '../i18n/LocaleContext'
import NotFound from './NotFound'
import ChannelPickerModal from './ChannelPickerModal'
import './ProductDetail.css'

const API_BASE = import.meta.env.VITE_PRODUCTS_API_URL.replace(/\/products$/, '')
const STORE_URL = import.meta.env.VITE_STORE_URL ?? ''
const WHATSAPP = import.meta.env.VITE_BRANCH1_WHATSAPP ?? ''
const MESSENGER = import.meta.env.VITE_FACEBOOK_MESSENGER ?? ''

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useLocale()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState(false)
  const [imgIndex, setImgIndex] = useState(0)
  const [showPicker, setShowPicker] = useState(false)

  useEffect(() => {
    setLoading(true)
    setError(false)
    fetch(`${API_BASE}/products/${id}`)
      .then(r => { if (r.status === 404) { setNotFound(true); setLoading(false); return null } if (!r.ok) throw new Error(); return r.json() })
      .then(data => {
        if (!data) return
        const sorted = [...(data.images ?? [])].sort((a, b) => a.displayOrder - b.displayOrder)
        setProduct({ ...data, images: sorted })
        setLoading(false)
      })
      .catch(() => { setError(true); setLoading(false) })
  }, [id])

  function buildMsg(product) {
    const pageUrl = `${STORE_URL}/#/product/${product.id}`
    return `${t('product.whatsappMsg')}${product.name}\n${pageUrl}`
  }

  function handleCta() {
    setShowPicker(true)
  }

  function handleChannelSelect(channel) {
    setShowPicker(false)
    const msg = buildMsg(product)
    if (channel === 'whatsapp' && WHATSAPP) {
      const number = WHATSAPP.replace(/\D/g, '')
      window.open(`https://wa.me/${number}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener')
    } else if (channel === 'messenger' && MESSENGER) {
      window.open(`https://m.me/${MESSENGER}`, '_blank', 'noopener')
    }
  }

  const images = product?.images ?? []
  const hasMultiple = images.length > 1

  function prev() { setImgIndex(i => (i - 1 + images.length) % images.length) }
  function next() { setImgIndex(i => (i + 1) % images.length) }

  if (notFound) return <NotFound />

  return (
    <div className="pd-page">
      {showPicker && (
        <ChannelPickerModal
          onSelect={handleChannelSelect}
          onClose={() => setShowPicker(false)}
        />
      )}

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

            {product.conditionType && (
              <div className="pd-condition">
                <span className={`pd-condition-badge pd-condition-badge--${product.conditionType.toLowerCase()}`}>
                  {t(`condition.type.${product.conditionType.toLowerCase()}`)}
                </span>
                <span className="pd-condition-rating">
                  {t('condition.rating.label')}: {product.conditionRating}/10
                </span>
              </div>
            )}

            <p className="pd-desc">
              {product.description || t('product.defaultDesc')}
            </p>

            <button className="pd-cta" onClick={handleCta}>
              {t('product.cta')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
