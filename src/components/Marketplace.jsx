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
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [products, setProducts] = useState([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState({})
  const [conditionType, setConditionType] = useState(null)
  const [minRating, setMinRating] = useState(null)

  // Fetch tags once
  useEffect(() => {
    fetch(`${API_BASE}/tags`)
      .then(r => r.json())
      .then(setTags)
      .catch(() => {})
  }, [])

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    const controller = new AbortController()
    const hasConditionFilters = conditionType !== null || minRating !== null
    let timeoutId
    if (hasConditionFilters) {
      timeoutId = setTimeout(() => controller.abort(), 10000)
    }
    setLoading(true)
    setError(false)
    const params = new URLSearchParams({ page, size: PAGE_SIZE })
    if (selectedTags.length > 0) params.set('tagIds', selectedTags.join(','))
    if (debouncedSearch.trim()) params.set('search', debouncedSearch.trim())
    if (conditionType) params.set('conditionType', conditionType)
    if (minRating !== null) params.set('conditionRating', minRating)
    fetch(`${API_BASE}/products?${params}`, { signal: controller.signal })
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then(data => {
        setProducts(data.content ?? [])
        setTotalPages(data.totalPages ?? 1)
        setLoading(false)
      })
      .catch(err => { if (err.name !== 'AbortError') { setError(true); setLoading(false) } })
    return () => {
      controller.abort()
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [page, selectedTags, debouncedSearch, conditionType, minRating])

  function toggleTag(id) {
    setPage(0)
    setSelectedTags(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    )
  }

  function clearFilters() {
    setPage(0)
    setSelectedTags([])
    setSearch('')
    setConditionType(null)
    setMinRating(null)
  }

  function handleSearch(e) {
    setPage(0)
    setSearch(e.target.value)
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
        {/* Search input */}
        <div className="mp-search-wrap">
          <input
            type="text"
            className="mp-search-input"
            placeholder={t('marketplace.search.placeholder')}
            value={search}
            onChange={handleSearch}
          />
        </div>

        {/* Sidebar filters */}
        <aside className="mp-sidebar">
          <button className="mp-filter-toggle" onClick={() => setFiltersOpen(prev => !prev)}>
            {(selectedTags.length > 0 || conditionType || minRating !== null)
              ? t('marketplace.filter.activeCount').replace('{count}', selectedTags.length + (conditionType ? 1 : 0) + (minRating !== null ? 1 : 0))
              : t('marketplace.filter.toggle')}
          </button>
          <div className={`mp-filter-box ${!filtersOpen ? 'mp-filter-box--collapsed' : ''}`}>
            <div className="mp-filter-heading-row">
              <h3 className="mp-filter-heading">{t('marketplace.filter.heading')}</h3>
              {(selectedTags.length > 0 || conditionType || minRating !== null) && (
                <button className="mp-clear-btn" onClick={clearFilters}>
                  {t('marketplace.filter.clear')}
                </button>
              )}
            </div>

            {/* Condition Type Filter */}
            <div className="mp-filter-group">
              <span className="mp-filter-label">{t('marketplace.filter.conditionType')}</span>
              <div className="mp-condition-options">
                <label className={`mp-tag-item ${conditionType === 'NEW' ? 'mp-tag-item--active' : ''}`}>
                  <input
                    type="radio"
                    name="conditionType"
                    checked={conditionType === 'NEW'}
                    onChange={() => { setConditionType('NEW'); setPage(0) }}
                  />
                  <span>{t('marketplace.filter.conditionType.new')}</span>
                </label>
                <label className={`mp-tag-item ${conditionType === 'USED' ? 'mp-tag-item--active' : ''}`}>
                  <input
                    type="radio"
                    name="conditionType"
                    checked={conditionType === 'USED'}
                    onChange={() => { setConditionType('USED'); setPage(0) }}
                  />
                  <span>{t('marketplace.filter.conditionType.used')}</span>
                </label>
              </div>
            </div>

            {/* Min Rating Filter */}
            <div className="mp-filter-group">
              <label className="mp-filter-label" htmlFor="mp-min-rating">{t('marketplace.filter.minRating')}</label>
              <select
                id="mp-min-rating"
                className="mp-rating-select"
                value={minRating ?? ''}
                onChange={(e) => { setMinRating(e.target.value ? Number(e.target.value) : null); setPage(0) }}
              >
                <option value="">—</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>

            {Object.entries(
              tags.reduce((groups, tag) => {
                const type = tag.type || 'Other'
                if (!groups[type]) groups[type] = []
                groups[type].push(tag)
                return groups
              }, Object.create(null))
            ).map(([type, groupTags]) => (
              <div key={type} className="mp-filter-group">
                <button className="mp-group-toggle" onClick={() => setExpandedGroups(prev => ({ ...prev, [type]: !prev[type] }))}>
                  <span>{type}</span>
                  <span>{expandedGroups[type] ? '▾' : '▸'}</span>
                </button>
                <ul className={`mp-tag-list ${!expandedGroups[type] ? 'mp-tag-list--collapsed' : ''}`}>
                  {groupTags.map(tag => (
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
            ))}
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
