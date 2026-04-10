import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useLocale } from '../i18n/LocaleContext'
import './Marketplace.css'

const API_BASE = import.meta.env.VITE_PRODUCTS_API_URL.replace(/\/products$/, '')
const PAGE_SIZE = 20

export default function Marketplace() {
  const { t } = useLocale()
  const navigate = useNavigate()
  const location = useLocation()

  const [tags, setTags] = useState([])
  const [selectedTags, setSelectedTags] = useState(() => {
    const params = new URLSearchParams(location.search)
    const tag = params.get('tag')
    return tag ? [Number(tag)] : []
  })
  const [products, setProducts] = useState([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  // Fetch tags once
  useEffect(() => {
    fetch(`${API_BASE}/tags`)
      .then(r => r.json())
      .then(setTags)
      .catch(() => {})
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(false)
    const params = new URLSearchParams({ page, size: PAGE_SIZE })
    if (selectedTags.length > 0) params.set('tagIds', selectedTags.join(','))
    fetch(`${API_BASE}/products?${params}`, { signal: controller.signal })
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then(data => {
        setProducts(data.content ?? [])
        setTotalPages(data.totalPages ?? 1)
        setLoading(false)
      })
      .catch(err => { if (err.name !== 'AbortError') { setError(true); setLoading(false) } })
    return () => controller.abort()
  }, [page, selectedTags])

  function toggleTag(id) {
    setPage(0)
    setSelectedTags(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    )
  }

  function clearFilters() {
    setPage(0)
    setSelectedTags([])
  }

  function goToPage(p) {
    setPage(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="mp-page">
      <div className="mp-bg">
        <div className="mp-float mp-float-1">🎮</div>
        <div className="mp-float mp-float-2">🕹️</div>
        <div className="mp-float mp-float-3">👾</div>
        <div className="mp-float mp-float-4">⚡</div>
        <div className="mp-float mp-float-5">🏆</div>
        <div className="mp-float mp-float-6">🎯</div>
      </div>
      <div className="mp-header">
        <h1 className="mp-title">{t('marketplace.title')}</h1>
        <p className="mp-sub">{t('marketplace.sub')}</p>
      </div>

      <div className="mp-layout">
        {/* Sidebar filters */}
        <aside className="mp-sidebar">
          <div className="mp-filter-box">
            <div className="mp-filter-heading-row">
              <h3 className="mp-filter-heading">{t('marketplace.filter.heading')}</h3>
              {selectedTags.length > 0 && (
                <button className="mp-clear-btn" onClick={clearFilters}>
                  {t('marketplace.filter.clear')}
                </button>
              )}
            </div>
            <ul className="mp-tag-list">
              {tags.map(tag => (
                <li key={tag.id}>
                  <label className={`mp-tag-item ${selectedTags.includes(tag.id) ? 'mp-tag-item--active' : ''}`}>
                    <input
                      type="checkbox"
                      checked={selectedTags.includes(tag.id)}
                      onChange={() => toggleTag(tag.id)}
                    />
                    <span>{tag.name}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Product grid */}
        <main className="mp-main">
          {loading && (
            <div className="mp-grid">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="mp-skeleton" />
              ))}
            </div>
          )}

          {!loading && error && (
            <p className="mp-message mp-message--error">{t('marketplace.error')}</p>
          )}

          {!loading && !error && products.length === 0 && (
            <p className="mp-message">{t('marketplace.empty')}</p>
          )}

          {!loading && !error && products.length > 0 && (
            <>
              <div className="mp-grid">
                {products.map(product => (
                  <ProductCard key={product.id} product={product} navigate={navigate} />
                ))}
              </div>

              {totalPages > 1 && (
                <Pagination page={page} totalPages={totalPages} onPage={goToPage} t={t} />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}

function ProductCard({ product, navigate }) {
  const img = product.images?.find(i => i.displayOrder === 0)?.url ?? ''

  return (
    <div className="mp-card" onClick={() => navigate(`/product/${product.id}`)}>
      <div className="mp-card-img-wrap">
        <img src={img} alt={product.name} className="mp-card-img" />
        <div className="mp-card-overlay">
          <span className="mp-card-view">Ver Detalles →</span>
        </div>
      </div>
      <div className="mp-card-body">
        <h3 className="mp-card-name">{product.name}</h3>
        {product.price != null && (
          <span className="mp-card-price">${Number(product.price).toFixed(2)}</span>
        )}
      </div>
    </div>
  )
}

function Pagination({ page, totalPages, onPage, t }) {
  // Show at most 5 page buttons centered around current page
  const range = []
  const delta = 2
  const left = Math.max(0, page - delta)
  const right = Math.min(totalPages - 1, page + delta)
  for (let i = left; i <= right; i++) range.push(i)

  return (
    <nav className="mp-pagination" aria-label="pagination">
      <button
        className="mp-page-btn mp-page-btn--nav"
        onClick={() => onPage(page - 1)}
        disabled={page === 0}
      >‹</button>

      {left > 0 && (
        <>
          <button className="mp-page-btn" onClick={() => onPage(0)}>1</button>
          {left > 1 && <span className="mp-page-ellipsis">…</span>}
        </>
      )}

      {range.map(p => (
        <button
          key={p}
          className={`mp-page-btn ${p === page ? 'mp-page-btn--active' : ''}`}
          onClick={() => onPage(p)}
        >
          {p + 1}
        </button>
      ))}

      {right < totalPages - 1 && (
        <>
          {right < totalPages - 2 && <span className="mp-page-ellipsis">…</span>}
          <button className="mp-page-btn" onClick={() => onPage(totalPages - 1)}>{totalPages}</button>
        </>
      )}

      <button
        className="mp-page-btn mp-page-btn--nav"
        onClick={() => onPage(page + 1)}
        disabled={page === totalPages - 1}
      >›</button>
    </nav>
  )
}
