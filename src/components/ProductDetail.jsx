import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useLocale } from '../i18n/LocaleContext'
import NotFound from './NotFound'
import BranchPickerModal from './BranchPickerModal'
import { getNearestBranch, BRANCHES } from '../utils/nearestBranch'
import './ProductDetail.css'

const API_BASE = import.meta.env.VITE_PRODUCTS_API_URL.replace(/\/products$/, '')
const STORE_URL = import.meta.env.VITE_STORE_URL ?? ''

function openWhatsApp(branch, product, msg) {
  const number = branch.whatsapp.replace(/\D/g, '')
  window.open(`https://wa.me/${number}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener')
}

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
    const branch = getNearestBranch()
    if (branch?.whatsapp) {
      openWhatsApp(branch, product, buildMsg(product))
    } else {
      setShowPicker(true)
    }
  }

  function handleBranchSelect(branch) {
    localStorage.setItem('pb_nearest_branch', JSON.stringify(branch))
    setShowPicker(false)
    openWhatsApp(branch, product, buildMsg(product))
  }

  const images = product?.images ?? []
  const hasMultiple = images.length > 1

  function prev() { setImgIndex(i => (i - 1 + images.length) % images.length) }
  function next() { setImgIndex(i => (i + 1) % images.length) }

  if (notFound) return <NotFound />

  return (
    <div className="pd-page">
      {showPicker && (
        <BranchPickerModal
          onSelect={handleBranchSelect}
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
