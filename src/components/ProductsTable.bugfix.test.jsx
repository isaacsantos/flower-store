/**
 * Bug Condition Exploration Test — Mobile Overflow and Missing Toggle Button
 *
 * Property 1: Bug Condition
 * Validates: Requirements 1.1, 1.2, 2.1, 2.2
 *
 * CRITICAL: This test MUST FAIL on unfixed code — failure confirms the bug exists.
 * DO NOT attempt to fix the test or the code when it fails.
 *
 * Scoped PBT Approach:
 * - At viewport ≤640px, `.admin-products-table` should NOT have `min-width: 900px`
 * - A toggle button should exist in each product row's active status cell
 * - Clicking the toggle button should send a PUT with inverted `active` value
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
  default: () => <div data-testid="product-form">ProductForm</div>
}))

vi.mock('./AiProductModal.jsx', () => ({
  default: ({ onClose }) => <div data-testid="ai-product-modal"><button onClick={onClose}>close-ai</button></div>
}))

vi.stubGlobal('confirm', vi.fn(() => false))

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
})

afterEach(() => {
  cleanup()
})

describe('ProductsTable Bug Condition Exploration', () => {
  /**
   * Bug Condition 1: Mobile Overflow
   * At viewport ≤640px, `.admin-products-table` should NOT have `min-width: 900px`.
   * Currently the CSS has min-width: 900px on .admin-products-table and the mobile
   * media query does NOT override it, causing horizontal overflow.
   *
   * Since jsdom does not process CSS stylesheets, we verify the bug by inspecting
   * the CSS source: the mobile media query must contain a min-width override for
   * .admin-products-table. Currently it does NOT.
   *
   * Validates: Requirements 1.1, 2.1
   */
  it('Bug Condition: mobile media query should override min-width on .admin-products-table', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 320, max: 640 }),
        async (viewportWidth) => {
          // Read the CSS source to verify the mobile media query overrides min-width
          const cssPath = resolve(__dirname, 'ProductsTable.css')
          const cssContent = readFileSync(cssPath, 'utf-8')

          // Find the mobile media query block (max-width: 640px)
          const mobileMediaRegex = /@media\s*\(\s*max-width:\s*640px\s*\)\s*\{([\s\S]*?)\n\}/g
          let mobileBlock = ''
          let match
          while ((match = mobileMediaRegex.exec(cssContent)) !== null) {
            mobileBlock += match[1]
          }

          // The mobile media query should contain a min-width override for .admin-products-table
          // that removes the 900px constraint (e.g., min-width: auto or min-width: 0)
          const hasMinWidthOverride = /\.admin-products-table\s*[^}]*min-width\s*:\s*(auto|0|unset|initial)/i.test(mobileBlock)

          // This will FAIL on unfixed code because the mobile media query does NOT
          // override min-width for .admin-products-table
          expect(hasMinWidthOverride).toBe(true)
        }
      ),
      { numRuns: 5 }
    )
  }, 15000)

  /**
   * Bug Condition 2: Missing Toggle Button
   * A toggle button should exist in each product row's active status cell.
   * Currently only a read-only badge <span> is rendered.
   *
   * Validates: Requirements 1.2, 2.2
   */
  it('Bug Condition: toggle button should exist in each product row active status cell', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(productArbitrary, { minLength: 1, maxLength: 5 }),
        async (products) => {
          apiRequest.mockResolvedValue(products)
          const { container, unmount } = renderProductsTable()

          await waitFor(() => {
            expect(screen.queryByText(/cargando/i)).not.toBeInTheDocument()
          })

          // Each product row should have a toggle button in the active status cell
          const rows = container.querySelectorAll('.admin-products-table tbody tr')
          expect(rows.length).toBe(products.length)

          for (const row of rows) {
            // Find the active status cell (5th td, index 4)
            const cells = row.querySelectorAll('td')
            const activeCell = cells[4]
            expect(activeCell).toBeDefined()

            // There should be a button (toggle) inside the active cell
            const toggleBtn = activeCell.querySelector('button')
            expect(toggleBtn).not.toBeNull()
          }

          unmount()
          cleanup()
        }
      ),
      { numRuns: 10 }
    )
  }, 30000)

  /**
   * Bug Condition 3: Toggle Button API Call
   * Clicking the toggle button should send a PUT to ${ADMIN_API_URL}/${product.id}
   * with the inverted `active` value.
   *
   * Validates: Requirements 2.2
   */
  it('Bug Condition: clicking toggle button sends PUT with inverted active value', async () => {
    const product = { id: 42, name: 'Test Rose', price: 19.99, description: 'A rose', active: true, images: [], tags: [] }
    apiRequest.mockResolvedValueOnce([product])

    renderProductsTable()

    await waitFor(() => {
      expect(screen.queryByText(/cargando/i)).not.toBeInTheDocument()
    })

    // Find the toggle button in the active status cell
    const row = document.querySelector('.admin-products-table tbody tr')
    const cells = row.querySelectorAll('td')
    const activeCell = cells[4]
    const toggleBtn = activeCell.querySelector('button')

    expect(toggleBtn).not.toBeNull()

    // Mock the PUT response for the toggle
    apiRequest.mockResolvedValueOnce({ ...product, active: false })

    await userEvent.click(toggleBtn)

    // Verify PUT was called with inverted active value
    expect(apiRequest).toHaveBeenCalledWith(
      `http://localhost/admin/api/products/${product.id}`,
      expect.objectContaining({
        method: 'PUT',
        body: expect.stringContaining('"active":false')
      }),
      expect.anything()
    )
  }, 15000)
})
