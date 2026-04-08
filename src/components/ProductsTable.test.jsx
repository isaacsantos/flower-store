// Feature: admin-module, Property 7: La tabla renderiza todos los productos recibidos
// Feature: admin-module, Property 8: Acciones por fila coinciden con el número de productos
import { describe, it, beforeEach } from 'vitest'
import { render, screen, cleanup, waitFor } from '@testing-library/react'
import * as fc from 'fast-check'
import { MemoryRouter } from 'react-router-dom'
import { LocaleProvider } from '../i18n/LocaleContext.jsx'
import ProductsTable from './ProductsTable.jsx'
import { apiRequest } from '../utils/apiClient.js'

vi.mock('../utils/apiClient', () => ({
  apiRequest: vi.fn()
}))

vi.mock('./ProductForm.jsx', () => ({
  default: () => <div data-testid="product-form">ProductForm</div>
}))

vi.stubGlobal('confirm', vi.fn(() => false))

const productArbitrary = fc.record({
  id: fc.integer({ min: 1, max: 10000 }),
  name: fc.string({ minLength: 1, maxLength: 50 }),
  price: fc.float({ min: 0, max: 9999 }),
  description: fc.string({ minLength: 0, maxLength: 200 }),
  images: fc.array(
    fc.record({
      url: fc.constant('https://example.com/img.jpg'),
      displayOrder: fc.integer({ min: 0, max: 10 })
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

describe('ProductsTable', () => {
  // Property 7: La tabla renderiza todos los productos recibidos
  // Validates: Requirements 5.2
  it('Property 7: renderiza exactamente tantas filas como productos recibidos', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(productArbitrary, { minLength: 0, maxLength: 50 }),
        async (products) => {
          apiRequest.mockResolvedValue(products)
          renderProductsTable()

          await waitFor(() => {
            expect(screen.queryByText(/cargando/i)).not.toBeInTheDocument()
          })

          const tbody = document.querySelector('tbody')
          if (products.length === 0) {
            // Empty state: no tbody rows expected
            const rows = tbody ? tbody.querySelectorAll('tr') : []
            expect(rows.length).toBe(0)
          } else {
            const rows = tbody ? tbody.querySelectorAll('tr') : []
            expect(rows.length).toBe(products.length)
          }

          cleanup()
        }
      ),
      { numRuns: 50 }
    )
  }, 60000)

  // Property 8: Acciones por fila coinciden con el número de productos
  // Validates: Requirements 7.1, 8.1
  it('Property 8: N productos generan exactamente N botones Editar y N botones Eliminar', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(productArbitrary, { minLength: 1, maxLength: 20 }),
        async (products) => {
          apiRequest.mockResolvedValue(products)
          renderProductsTable()

          const editButtons = await screen.findAllByRole('button', { name: 'Editar' })
          const deleteButtons = await screen.findAllByRole('button', { name: 'Eliminar' })

          expect(editButtons.length).toBe(products.length)
          expect(deleteButtons.length).toBe(products.length)

          cleanup()
        }
      ),
      { numRuns: 50 }
    )
  }, 60000)
})
