/**
 * Preservation Property Tests — Desktop Layout and Edit/Delete Behavior
 *
 * Property 2: Preservation
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4
 *
 * These tests MUST PASS on unfixed code — they verify baseline behavior that
 * should NOT change after the fix is implemented.
 *
 * Observations on unfixed code:
 * - At viewport >640px, `.admin-products-table` has `min-width: 900px` in CSS source
 * - `.admin-products-table-wrapper` has `overflow-x: auto` in CSS source
 * - Clicking edit button calls `handleEditClick` and shows ProductForm with correct product
 * - Clicking delete button calls `window.confirm` and sends DELETE request on confirmation
 * - Mobile card-view renders `data-label` attributes on each `<td>` element
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as fc from 'fast-check'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { MemoryRouter } from 'react-router-dom'
import { LocaleProvider } from '../i18n/LocaleContext.jsx'
import ProductsTable from './ProductsTable.jsx'
import { apiRequest, ADMIN_API_URL } from '../utils/apiClient.js'

vi.mock('../utils/apiClient', () => ({
  apiRequest: vi.fn(),
  ADMIN_API_URL: 'http://localhost/admin/api/products',
}))

vi.mock('../firebase/AuthContext.jsx', () => ({
  useAuth: () => ({ user: { getIdToken: vi.fn().mockResolvedValue('token') }, loading: false, isAdmin: true })
}))

vi.mock('./ProductForm.jsx', () => ({
  default: ({ product }) => <div data-testid="product-form" data-product-id={product?.id ?? ''}>ProductForm</div>
}))

vi.mock('./AiProductModal.jsx', () => ({
  default: ({ onClose }) => <div data-testid="ai-product-modal"><button onClick={onClose}>close-ai</button></div>
}))

const confirmMock = vi.fn(() => true)
vi.stubGlobal('confirm', confirmMock)

const productArbitrary = fc.record({
  id: fc.integer({ min: 1, max: 10000 }),
  name: fc.string({ minLength: 1, maxLength: 30 }),
  price: fc.float({ min: Math.fround(0.01), max: Math.fround(9999), noNaN: true }),
  description: fc.string({ minLength: 0, maxLength: 100 }),
  active: fc.boolean(),
  images: fc.array(
    fc.record({
      url: fc.constant('https://example.com/img.jpg'),
      displayOrder: fc.integer({ min: 0, max: 10 })
    }),
    { minLength: 0, maxLength: 2 }
  ),
  tags: fc.array(
    fc.record({
      id: fc.integer({ min: 1, max: 100 }),
      name: fc.string({ minLength: 1, maxLength: 15 })
    }),
    { minLength: 0, maxLength: 3 }
  )
})

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
  confirmMock.mockReturnValue(true)
})

afterEach(() => {
  cleanup()
})

describe('ProductsTable Preservation Properties', () => {
  /**
   * Preservation Property: Desktop Layout
   * For all viewport widths >640px, table retains `min-width: 900px` and
   * wrapper has `overflow-x: auto` in the CSS source.
   *
   * Since jsdom does not process CSS stylesheets, we verify by reading the CSS
   * source file and confirming the base rules are present.
   *
   * Validates: Requirements 3.1
   */
  it('Preservation: desktop table has min-width: 900px and wrapper has overflow-x: auto', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 641, max: 2560 }),
        async (viewportWidth) => {
          const cssPath = resolve(__dirname, 'ProductsTable.css')
          const cssContent = readFileSync(cssPath, 'utf-8')

          // Verify base .admin-products-table has min-width: 900px
          // This rule is outside any media query
          const tableMinWidthMatch = /\.admin-products-table\s*\{[^}]*min-width:\s*900px/s.test(cssContent)
          expect(tableMinWidthMatch).toBe(true)

          // Verify .admin-products-table-wrapper has overflow-x: auto
          const wrapperOverflowMatch = /\.admin-products-table-wrapper\s*\{[^}]*overflow-x:\s*auto/s.test(cssContent)
          expect(wrapperOverflowMatch).toBe(true)
        }
      ),
      { numRuns: 10 }
    )
  }, 15000)

  /**
   * Preservation Property: Edit Button Opens ProductForm
   * For all products, clicking the edit button opens ProductForm with the correct product.
   *
   * Validates: Requirements 3.2
   */
  it('Preservation: edit button opens ProductForm with correct product', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(productArbitrary, { minLength: 1, maxLength: 5 }),
        fc.integer({ min: 0, max: 4 }),
        async (products, indexRaw) => {
          const index = indexRaw % products.length
          apiRequest.mockResolvedValue(products)
          const { unmount } = renderProductsTable()

          await waitFor(() => {
            expect(screen.queryByText(/cargando/i)).not.toBeInTheDocument()
          })

          // ProductForm should not be visible initially
          expect(screen.queryByTestId('product-form')).not.toBeInTheDocument()

          // Find all edit buttons and click the one at the target index
          const editButtons = screen.getAllByRole('button', { name: 'Editar' })
          expect(editButtons.length).toBe(products.length)

          await userEvent.click(editButtons[index])

          // ProductForm should now be visible with the correct product id
          const form = screen.getByTestId('product-form')
          expect(form).toBeInTheDocument()
          expect(form.getAttribute('data-product-id')).toBe(String(products[index].id))

          unmount()
          cleanup()
        }
      ),
      { numRuns: 10 }
    )
  }, 30000)

  /**
   * Preservation Property: Delete Button Triggers Confirmation + API Call
   * For all products, clicking the delete button calls window.confirm and,
   * if confirmed, sends a DELETE request to the API.
   *
   * Validates: Requirements 3.3
   */
  it('Preservation: delete button triggers confirmation and DELETE API call', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(productArbitrary, { minLength: 1, maxLength: 5 }),
        fc.integer({ min: 0, max: 4 }),
        async (products, indexRaw) => {
          const index = indexRaw % products.length
          confirmMock.mockReturnValue(true)
          apiRequest.mockResolvedValue(products)
          const { unmount } = renderProductsTable()

          await waitFor(() => {
            expect(screen.queryByText(/cargando/i)).not.toBeInTheDocument()
          })

          // Find all delete buttons and click the one at the target index
          const deleteButtons = screen.getAllByRole('button', { name: 'Eliminar' })
          expect(deleteButtons.length).toBe(products.length)

          // Mock the reload after delete
          apiRequest.mockResolvedValue(products)

          await userEvent.click(deleteButtons[index])

          // window.confirm should have been called
          expect(confirmMock).toHaveBeenCalled()

          // apiRequest should have been called with DELETE method for the correct product
          expect(apiRequest).toHaveBeenCalledWith(
            `http://localhost/admin/api/products/${products[index].id}`,
            expect.objectContaining({ method: 'DELETE' }),
            expect.anything()
          )

          unmount()
          cleanup()
        }
      ),
      { numRuns: 10 }
    )
  }, 30000)

  /**
   * Preservation Property: Mobile Card-View data-label Attributes
   * For all viewport widths ≤640px, card-view `data-label` attributes are
   * rendered on each `<td>` element in the table.
   *
   * Since jsdom doesn't apply media queries, we verify that the JSX always
   * renders `data-label` attributes on td elements regardless of viewport.
   * The CSS uses these attributes via `content: attr(data-label)` in mobile view.
   *
   * Validates: Requirements 3.4
   */
  it('Preservation: card-view data-label attributes are rendered on each td', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(productArbitrary, { minLength: 1, maxLength: 5 }),
        fc.integer({ min: 320, max: 640 }),
        async (products, viewportWidth) => {
          apiRequest.mockResolvedValue(products)
          const { container, unmount } = renderProductsTable()

          await waitFor(() => {
            expect(screen.queryByText(/cargando/i)).not.toBeInTheDocument()
          })

          // Each product row should have td elements with data-label attributes
          const rows = container.querySelectorAll('.admin-products-table tbody tr')
          expect(rows.length).toBe(products.length)

          for (const row of rows) {
            const cells = row.querySelectorAll('td')
            // Each td should have a data-label attribute
            for (const cell of cells) {
              expect(cell.hasAttribute('data-label')).toBe(true)
              // data-label should not be empty
              expect(cell.getAttribute('data-label')).not.toBe('')
            }
          }

          unmount()
          cleanup()
        }
      ),
      { numRuns: 10 }
    )
  }, 30000)
})
