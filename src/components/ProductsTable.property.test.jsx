// Feature: product-condition, Property 4: Admin table condition cell formatting
import { describe, it, beforeEach } from 'vitest'
import { render, screen, cleanup, waitFor } from '@testing-library/react'
import * as fc from 'fast-check'
import { MemoryRouter } from 'react-router-dom'
import { LocaleProvider } from '../i18n/LocaleContext.jsx'
import ProductsTable from './ProductsTable.jsx'
import { apiRequest } from '../utils/apiClient.js'
import { translations } from '../i18n/translations.js'

vi.mock('../utils/apiClient', () => ({
  apiRequest: vi.fn(),
  ADMIN_API_URL: 'http://localhost/admin/api/products',
}))

vi.mock('../firebase/AuthContext.jsx', () => ({
  useAuth: () => ({ user: { getIdToken: vi.fn().mockResolvedValue('token') }, loading: false, isAdmin: true })
}))

vi.mock('./ProductForm.jsx', () => ({
  default: () => <div data-testid="product-form">ProductForm</div>
}))

vi.mock('./AiProductModal.jsx', () => ({
  default: ({ onClose }) => <div data-testid="ai-product-modal"><button onClick={onClose}>close-ai</button></div>
}))

/**
 * Validates: Requirements 2.2, 2.3, 2.4
 *
 * Property 4: Admin table condition cell formatting
 * For any product with a non-null conditionType and a non-null conditionRating,
 * the products table condition cell SHALL display the localized condition type label
 * followed by ({conditionRating}/10). For any product where either field is null/absent,
 * the cell SHALL be empty.
 */

// The default locale is 'es' (Spanish)
const defaultLocale = 'es'

function renderProductsTable() {
  return render(
    <MemoryRouter>
      <LocaleProvider>
        <ProductsTable />
      </LocaleProvider>
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('Property 4: Admin table condition cell formatting', () => {
  it('displays localized condition type followed by (rating/10) when both fields are present', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          id: fc.integer({ min: 1, max: 10000 }),
          name: fc.string({ minLength: 1, maxLength: 30 }),
          price: fc.float({ min: Math.fround(0.01), max: Math.fround(999), noNaN: true }),
          description: fc.string({ minLength: 0, maxLength: 50 }),
          active: fc.boolean(),
          images: fc.constant([]),
          tags: fc.constant([]),
          conditionType: fc.constantFrom('NEW', 'USED'),
          conditionRating: fc.integer({ min: 1, max: 10 }),
        }),
        async (product) => {
          apiRequest.mockResolvedValue([product])
          renderProductsTable()

          await waitFor(() => {
            expect(screen.queryByText(/cargando/i)).not.toBeInTheDocument()
          })

          const localizedType = translations[defaultLocale][`condition.type.${product.conditionType.toLowerCase()}`]
          const expectedText = `${localizedType} (${product.conditionRating}/10)`

          expect(screen.getByText(expectedText)).toBeInTheDocument()

          cleanup()
        }
      ),
      { numRuns: 100 }
    )
  }, 60000)

  it('displays empty condition cell when conditionType or conditionRating is null/absent', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          id: fc.integer({ min: 1, max: 10000 }),
          name: fc.string({ minLength: 1, maxLength: 30 }),
          price: fc.float({ min: Math.fround(0.01), max: Math.fround(999), noNaN: true }),
          description: fc.string({ minLength: 0, maxLength: 50 }),
          active: fc.boolean(),
          images: fc.constant([]),
          tags: fc.constant([]),
          conditionType: fc.constantFrom(null, undefined),
          conditionRating: fc.oneof(
            fc.constant(null),
            fc.constant(undefined),
            fc.integer({ min: 1, max: 10 })
          ),
        }),
        async (product) => {
          apiRequest.mockResolvedValue([product])
          renderProductsTable()

          await waitFor(() => {
            expect(screen.queryByText(/cargando/i)).not.toBeInTheDocument()
          })

          // The condition cell should be empty - verify no condition text pattern exists
          const conditionPattern = /\(\d+\/10\)/
          const allCells = document.querySelectorAll('td[data-label]')
          const conditionHeader = translations[defaultLocale]['admin.products.col.condition']
          const conditionCells = Array.from(allCells).filter(
            (cell) => cell.getAttribute('data-label') === conditionHeader
          )

          expect(conditionCells.length).toBe(1)
          expect(conditionCells[0].textContent.trim()).toBe('')

          cleanup()
        }
      ),
      { numRuns: 100 }
    )
  }, 60000)
})
