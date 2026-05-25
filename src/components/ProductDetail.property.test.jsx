// Feature: product-condition, Property 8: Product detail displays condition badge and rating
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, cleanup, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import * as fc from 'fast-check'
import ProductDetail from './ProductDetail.jsx'
import { LocaleProvider } from '../i18n/LocaleContext.jsx'
import { translations, SUPPORTED_LOCALES } from '../i18n/translations.js'

/**
 * Validates: Requirements 5.1, 5.2, 5.3, 5.4
 *
 * Property 8: Product detail displays condition badge and rating
 * For any product with a non-null conditionType and conditionRating, the product detail view
 * SHALL render a badge with the localized condition type text and display the rating in the
 * format {conditionRating}/10. The badge element SHALL have a CSS class that differs based
 * on whether conditionType is "NEW" or "USED".
 */

function makeLocalStorageMock() {
  let store = {}
  return {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v) },
    removeItem: (k) => { delete store[k] },
    clear: () => { store = {} },
  }
}

let lsMock

beforeEach(() => {
  lsMock = makeLocalStorageMock()
  Object.defineProperty(globalThis, 'localStorage', {
    value: lsMock,
    writable: true,
    configurable: true,
  })
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

function renderProductDetail(productId, locale) {
  lsMock.setItem('pb_locale', locale)
  return render(
    <MemoryRouter initialEntries={[`/product/${productId}`]}>
      <LocaleProvider>
        <Routes>
          <Route path="/product/:id" element={<ProductDetail />} />
        </Routes>
      </LocaleProvider>
    </MemoryRouter>
  )
}

const productWithConditionArb = fc.record({
  id: fc.integer({ min: 1, max: 10000 }),
  name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
  price: fc.oneof(fc.double({ min: 0.01, max: 9999.99, noNaN: true }), fc.constant(null)),
  description: fc.string({ minLength: 0, maxLength: 100 }),
  active: fc.boolean(),
  conditionType: fc.constantFrom('NEW', 'USED'),
  conditionRating: fc.integer({ min: 1, max: 10 }),
  images: fc.constant([{ url: 'https://example.com/img.jpg', displayOrder: 0 }]),
  tags: fc.constant([]),
})

const productWithoutConditionArb = fc.record({
  id: fc.integer({ min: 1, max: 10000 }),
  name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
  price: fc.oneof(fc.double({ min: 0.01, max: 9999.99, noNaN: true }), fc.constant(null)),
  description: fc.string({ minLength: 0, maxLength: 100 }),
  active: fc.boolean(),
  conditionType: fc.constant(null),
  conditionRating: fc.oneof(fc.constant(null), fc.integer({ min: 1, max: 10 })),
  images: fc.constant([{ url: 'https://example.com/img.jpg', displayOrder: 0 }]),
  tags: fc.constant([]),
})

describe('Property 8: Product detail displays condition badge and rating', () => {
  it('renders localized badge text and rating format for products with condition data', async () => {
    await fc.assert(
      fc.asyncProperty(
        productWithConditionArb,
        fc.constantFrom(...SUPPORTED_LOCALES),
        async (product, locale) => {
          lsMock.clear()

          vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: () => Promise.resolve(product),
          }))

          renderProductDetail(product.id, locale)

          const expectedBadgeText = translations[locale][`condition.type.${product.conditionType.toLowerCase()}`]
          const expectedRatingText = `${product.conditionRating}/10`

          await waitFor(() => {
            const conditionSection = document.querySelector('.pd-condition')
            expect(conditionSection).not.toBeNull()

            const badge = document.querySelector('.pd-condition-badge')
            expect(badge).not.toBeNull()
            expect(badge.textContent).toBe(expectedBadgeText)

            const rating = document.querySelector('.pd-condition-rating')
            expect(rating).not.toBeNull()
            expect(rating.textContent).toContain(expectedRatingText)
          })

          cleanup()
        }
      ),
      { numRuns: 100 }
    )
  }, 60000)

  it('applies correct CSS class based on conditionType (--new vs --used)', async () => {
    await fc.assert(
      fc.asyncProperty(
        productWithConditionArb,
        async (product) => {
          lsMock.clear()

          vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: () => Promise.resolve(product),
          }))

          renderProductDetail(product.id, 'en')

          const expectedClass = `pd-condition-badge--${product.conditionType.toLowerCase()}`

          await waitFor(() => {
            const badge = document.querySelector('.pd-condition-badge')
            expect(badge).not.toBeNull()
            expect(badge.classList.contains(expectedClass)).toBe(true)
          })

          // Verify the class differs between NEW and USED
          if (product.conditionType === 'NEW') {
            const badge = document.querySelector('.pd-condition-badge')
            expect(badge.classList.contains('pd-condition-badge--used')).toBe(false)
          } else {
            const badge = document.querySelector('.pd-condition-badge')
            expect(badge.classList.contains('pd-condition-badge--new')).toBe(false)
          }

          cleanup()
        }
      ),
      { numRuns: 100 }
    )
  }, 60000)

  it('does NOT render condition section when conditionType is null', async () => {
    await fc.assert(
      fc.asyncProperty(
        productWithoutConditionArb,
        async (product) => {
          lsMock.clear()

          vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: () => Promise.resolve(product),
          }))

          renderProductDetail(product.id, 'en')

          await waitFor(() => {
            // Verify the product loaded (name is visible)
            const nameEl = document.querySelector('.pd-name')
            expect(nameEl).not.toBeNull()
          })

          // Condition section should NOT be rendered
          const conditionSection = document.querySelector('.pd-condition')
          expect(conditionSection).toBeNull()

          cleanup()
        }
      ),
      { numRuns: 100 }
    )
  }, 60000)
})
