// Feature: admin-module, Property 9: Formulario de edición precarga los datos del producto
import { describe, it, beforeEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import * as fc from 'fast-check'
import { MemoryRouter } from 'react-router-dom'
import { LocaleProvider } from '../i18n/LocaleContext.jsx'
import ProductForm from './ProductForm.jsx'

vi.mock('../utils/apiClient', () => ({
  apiRequest: vi.fn().mockResolvedValue({})
}))

function makeLocalStorageMock() {
  let store = {}
  return {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v) },
    removeItem: (k) => { delete store[k] },
    clear: () => { store = {} },
  }
}

let lsMock = makeLocalStorageMock()

beforeEach(() => {
  lsMock = makeLocalStorageMock()
  Object.defineProperty(globalThis, 'localStorage', {
    value: lsMock,
    writable: true,
    configurable: true,
  })
})

const productArbitrary = fc.record({
  id: fc.integer({ min: 1, max: 10000 }),
  name: fc.string({ minLength: 1, maxLength: 100 }),
  price: fc.float({ min: Math.fround(0.01), max: Math.fround(9999), noNaN: true }),
  description: fc.string({ minLength: 0, maxLength: 500 }),
  images: fc.constant([])
})

describe('ProductForm', () => {
  // Property 9: Formulario de edición precarga los datos del producto
  // Validates: Requirements 7.2
  it('Property 9: precarga los campos del formulario con los datos del producto en modo edición', () => {
    fc.assert(
      fc.property(
        productArbitrary,
        (product) => {
          render(
            <MemoryRouter>
              <LocaleProvider>
                <ProductForm product={product} onClose={vi.fn()} onSaved={vi.fn()} />
              </LocaleProvider>
            </MemoryRouter>
          )

          const nameInput = screen.getByLabelText(/nombre/i)
          const priceInput = screen.getByLabelText(/precio/i)
          const descriptionTextarea = screen.getByLabelText(/descripción/i)

          expect(nameInput.value).toBe(product.name)
          expect(priceInput.value).toBe(String(product.price))
          expect(descriptionTextarea.value).toBe(product.description)

          cleanup()
        }
      ),
      { numRuns: 100 }
    )
  })
})
