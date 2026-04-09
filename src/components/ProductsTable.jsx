import { useState, useEffect, useCallback } from 'react'
import { useLocale } from '../i18n/LocaleContext.jsx'
import { useAuth } from '../firebase/AuthContext.jsx'
import { apiRequest, ADMIN_API_URL } from '../utils/apiClient.js'
import ProductForm from './ProductForm.jsx'
import './ProductsTable.css'

const PAGE_SIZE = 10

export default function ProductsTable() {
  const { t } = useLocale()
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const loadProducts = useCallback(async (pageNum = 0) => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiRequest(`${ADMIN_API_URL}?page=${pageNum}&size=${PAGE_SIZE}`, {}, user)
      if (Array.isArray(data)) {
        setProducts(data)
        setTotalPages(1)
      } else {
        setProducts(data.content ?? data.data ?? data.products ?? [])
        setTotalPages(data.totalPages ?? 1)
      }
    } catch {
      setError(t('admin.products.error'))
    } finally {
      setLoading(false)
    }
  }, [t, user])

  useEffect(() => {
    loadProducts(page)
  }, [loadProducts, page])

  function handleAddClick() {
    setEditingProduct(null)
    setShowForm(true)
  }

  function handleEditClick(product) {
    setEditingProduct(product)
    setShowForm(true)
  }

  async function handleDeleteClick(product) {
    const confirmed = window.confirm(t('admin.products.confirm'))
    if (!confirmed) return
    try {
      await apiRequest(`${ADMIN_API_URL}/${product.id}`, { method: 'DELETE' }, user)
      await loadProducts(page)
    } catch {
      setError(t('admin.products.error.delete'))
    }
  }

  if (loading) {
    return (
      <div className="admin-products-loading">
        <span>{t('admin.products.loading')}</span>
      </div>
    )
  }

  return (
    <div className="admin-products">
      <div className="admin-products-header">
        <h2 className="admin-products-title">{t('admin.products.title')}</h2>
        <button className="admin-products-add-btn" onClick={handleAddClick}>
          {t('admin.products.add')}
        </button>
      </div>

      {error && <div className="admin-products-error">{error}</div>}

      {!error && products.length === 0 ? (
        <div className="admin-products-empty">{t('admin.products.empty')}</div>
      ) : (
        <>
          <div className="admin-products-table-wrapper">
            <table className="admin-products-table">
              <thead>
                <tr>
                  <th>{t('admin.products.col.name')}</th>
                  <th>{t('admin.products.col.price')}</th>
                  <th>{t('admin.products.col.description')}</th>
                  <th>{t('admin.products.col.image')}</th>
                  <th>{t('admin.products.col.active')}</th>
                  <th>{t('admin.products.col.tags')}</th>
                  <th>{t('admin.products.col.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const firstImage = product.images?.length > 0
                    ? product.images.reduce((a, b) => a.displayOrder <= b.displayOrder ? a : b)
                    : null
                  return (
                    <tr key={product.id}>
                      <td data-label={t('admin.products.col.name')}>{product.name}</td>
                      <td data-label={t('admin.products.col.price')}>{product.price}</td>
                      <td data-label={t('admin.products.col.description')} className="admin-products-desc">
                        {product.description}
                      </td>
                      <td data-label={t('admin.products.col.image')}>
                        {firstImage && (
                          <img src={firstImage.url} alt={product.name} className="admin-products-thumb" />
                        )}
                      </td>
                      <td data-label={t('admin.products.col.active')}>
                        <span className={`admin-products-badge ${product.active ? 'admin-products-badge--active' : 'admin-products-badge--inactive'}`}>
                          {product.active ? t('admin.products.active.yes') : t('admin.products.active.no')}
                        </span>
                      </td>
                      <td data-label={t('admin.products.col.tags')}>
                        <div className="admin-products-tags">
                          {(product.tags ?? []).map(tag => (
                            <span key={tag.id} className="admin-products-tag">{tag.name}</span>
                          ))}
                        </div>
                      </td>
                      <td data-label={t('admin.products.col.actions')}>
                        <div className="admin-products-actions">
                          <button className="admin-products-edit-btn" onClick={() => handleEditClick(product)} title={t('admin.products.edit')} aria-label={t('admin.products.edit')}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          </button>
                          <button className="admin-products-delete-btn" onClick={() => handleDeleteClick(product)} title={t('admin.products.delete')} aria-label={t('admin.products.delete')}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="admin-products-pagination">
              <button
                className="admin-products-page-btn"
                onClick={() => setPage(p => p - 1)}
                disabled={page === 0}
              >
                {t('admin.products.prev')}
              </button>
              <span className="admin-products-page-info">
                {t('admin.products.page')} {page + 1} {t('admin.products.of')} {totalPages}
              </span>
              <button
                className="admin-products-page-btn"
                onClick={() => setPage(p => p + 1)}
                disabled={page >= totalPages - 1}
              >
                {t('admin.products.next')}
              </button>
            </div>
          )}
        </>
      )}

      {showForm && (
        <ProductForm
          product={editingProduct}
          onClose={() => setShowForm(false)}
          onSaved={() => loadProducts(page)}
        />
      )}
    </div>
  )
}
