import { useEffect, useState, useRef } from 'react'
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

function ProductCard({ product, index, t }) {
  const [hovered, setHovered] = useState(false)
  const img = product.images?.find(i => i.displayOrder === 0)?.url ?? ''
  const tagKey = TAG_KEYS[index % TAG_KEYS.length]

  return (
    <div
      className={`product-card ${hovered ? 'hovered' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="card-img-wrap">
        <img src={img} alt={product.name} className="card-img" />
        <span className="card-tag">{t(tagKey)}</span>
        <div className="card-overlay">
          <button className="card-quick-btn">{t('carousel.card.quickAdd')}</button>
        </div>
      </div>
      <div className="card-body">
        <h3 className="card-name">{product.name}</h3>
        <p className="card-desc">{t('carousel.card.desc')}</p>
        <div className="card-footer">
          <span className="card-price">${Number(product.price).toFixed(2)}</span>
          <button className="card-btn">{t('carousel.card.addToCart')}</button>
        </div>
      </div>
    </div>
  )
}

export default function Carousel() {
  const { t } = useLocale()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [offset, setOffset] = useState(0)
  const trackRef = useRef(null)

  useEffect(() => {
    fetch(import.meta.env.VITE_PRODUCTS_API_URL)
      .then(r => r.json())
      .then(data => { setProducts(data); setLoading(false) })
      .catch(() => { setError(true); setLoading(false) })
  }, [])

  const displayed = [...products, ...products, ...products]
  const cardWidth = 300 + 24
  const maxOffset = products.length * cardWidth

  const prev = () => setOffset(o => Math.max(o - cardWidth, 0))
  const next = () => setOffset(o => (o + cardWidth) % maxOffset || cardWidth)

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
              style={{ transform: `translateX(-${offset}px)` }}
            >
              {displayed.map((p, i) => (
                <ProductCard key={`${p.id}-${i}`} product={p} index={i} t={t} />
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
            className={`dot ${offset === i * cardWidth ? 'active' : ''}`}
            onClick={() => setOffset(i * cardWidth)}
          />
        ))}
      </div>
    </section>
  )
}
