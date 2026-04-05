import { useEffect, useState, useRef, useCallback, forwardRef } from 'react'
import { useNavigate } from 'react-router-dom'
import './Carousel.css'
import { useLocale } from '../i18n/LocaleContext'

const TAG_KEYS = [
  'carousel.tag.bestseller',
  'carousel.tag.new',
  'carousel.tag.limited',
  'carousel.tag.popular',
  'carousel.tag.fresh',
  'carousel.tag.seasonal',
]

const WA_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER ?? ''

const ProductCard = forwardRef(function ProductCard({ product, index, t }, ref) {
  const navigate = useNavigate()
  const [hovered, setHovered] = useState(false)
  const img = product.images?.find(i => i.displayOrder === 0)?.url ?? ''
  const tagKey = TAG_KEYS[index % TAG_KEYS.length]

  function handleWhatsApp(e) {
    e.stopPropagation()
    const msg = encodeURIComponent(`${t('product.whatsappMsg')}${product.name}`)
    window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`, '_blank', 'noopener')
  }

  return (
    <div
      ref={ref}
      className={`product-card ${hovered ? 'hovered' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="card-img-wrap">
        <img
          src={img}
          alt={product.name}
          className="card-img"
          onClick={() => navigate(`/product/${product.id}`)}
          style={{ cursor: 'pointer' }}
        />
        <span className="card-tag">{t(tagKey)}</span>
        <div className="card-overlay">
          <button className="card-quick-btn" onClick={handleWhatsApp}>{t('carousel.card.quickAdd')}</button>
        </div>
      </div>
      <div className="card-body">
        <h3 className="card-name">{product.name}</h3>
        <div className="card-footer">
          {product.price != null && (
            <span className="card-price">${Number(product.price).toFixed(2)}</span>
          )}
          <button className="card-btn" onClick={() => navigate(`/product/${product.id}`)}>
            {t('carousel.card.addToCart')}
          </button>
        </div>
      </div>
    </div>
  )
})

export default function Carousel() {
  const { t } = useLocale()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [index, setIndex] = useState(0)
  const trackRef = useRef(null)
  const firstCardRef = useRef(null)
  const [cardWidth, setCardWidth] = useState(324) // fallback: 300px + 24px gap

  const measureCard = useCallback(() => {
    if (!firstCardRef.current) return
    // gap is set in CSS as 24px; offsetWidth gives the card's rendered width
    setCardWidth(firstCardRef.current.offsetWidth + 24)
  }, [])

  useEffect(() => {
    fetch(import.meta.env.VITE_PRODUCTS_API_URL)
      .then(r => r.json())
      .then(data => { setProducts(data.content ?? data); setLoading(false) })
      .catch(() => { setError(true); setLoading(false) })
  }, [])

  // Re-measure whenever products load or window resizes
  useEffect(() => {
    if (products.length === 0) return
    // Small delay to let the DOM paint first
    const t = setTimeout(measureCard, 50)
    window.addEventListener('resize', measureCard)
    return () => { clearTimeout(t); window.removeEventListener('resize', measureCard) }
  }, [products, measureCard])

  const count = products.length
  const displayed = [...products, ...products, ...products]

  const prev = () => setIndex(i => (i - 1 + count) % count)
  const next = () => setIndex(i => (i + 1) % count)

  return (
    <section className="carousel-section" id="shop">
      <div className="section-header">
        <p className="section-eyebrow">{t('carousel.eyebrow')}</p>
        <h2 className="section-title">{t('carousel.title')}</h2>
        <p className="section-sub">{t('carousel.sub')}</p>
      </div>

      {loading && (
        <div className="loading-wrap">
          {[1, 2, 3].map(i => <div key={i} className="skeleton-card" />)}
          <p className="loading-text">{t('carousel.loading')}</p>
        </div>
      )}

      {error && <p className="error-msg">{t('carousel.error')}</p>}

      {!loading && !error && (
        <div className="carousel-wrap">
          <button className="carousel-arrow left" onClick={prev}>‹</button>

          <div className="carousel-viewport">
            <div
              className="carousel-track"
              ref={trackRef}
              style={{ transform: `translateX(-${index * cardWidth}px)` }}
            >
              {displayed.map((p, i) => (
                <ProductCard
                  key={`${p.id}-${i}`}
                  ref={i === 0 ? firstCardRef : null}
                  product={p}
                  index={i}
                  t={t}
                />
              ))}
            </div>
          </div>

          <button className="carousel-arrow right" onClick={next}>›</button>
        </div>
      )}

      <div className="dots">
        {products.map((_, i) => (
          <span
            key={i}
            className={`dot ${index === i ? 'active' : ''}`}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </section>
  )
}
