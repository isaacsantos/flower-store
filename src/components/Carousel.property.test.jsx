// Feature: product-condition, Property 5: Carousel tag displays localized condition type
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, cleanup, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import * as fc from 'fast-check'
import Carousel from './Carousel.jsx'
import { LocaleProvider } from '../i18n/LocaleContext.jsx'
import { translations, SUPPORTED_LOCALES } from '../i18n/translations.js'

// **Validates: Requirements 3.1, 3.2, 3.3**

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
})

/**
 * Generator: produces a product with a valid conditionType ("NEW" or "USED")
 * and realistic product fields.
 */
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

describe('Carousel - Property 5: Carousel tag displays localized condition type', () => {
  it('displays the localized condition type label in the card tag for products with conditionType', async () => {
    await fc.assert(
      fc.asyncProperty(
        productWithConditionArb,
        fc.constantFrom(...SUPPORTED_LOCALES),
        async (product, locale) => {
          // Set locale
          lsMock.clear()
          lsMock.setItem('pb_locale', locale)

          // Mock fetch to return our generated product
          vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            json: () => Promise.resolve({ content: [product] }),
          }))

          render(
            <MemoryRouter>
              <LocaleProvider>
                <Carousel />
              </LocaleProvider>
            </MemoryRouter>
          )

          // Wait for products to load and render
          const expectedLabel = translations[locale][`condition.type.${product.conditionType.toLowerCase()}`]

          await waitFor(() => {
            const tags = document.querySelectorAll('.card-tag')
            expect(tags.length).toBeGreaterThan(0)
            // The first card-tag should display the localized condition type
            expect(tags[0].textContent).toBe(expectedLabel)
          })

          cleanup()
        }
      ),
      { numRuns: 100 }
    )
  }, 60000)
})


// Feature: product-condition, Property 6: Carousel tag falls back to index-based label when condition is absent
// **Validates: Requirements 3.4**

/**
 * Generator: produces a product with null/undefined/empty conditionType
 * to test the fallback to index-based TAG_KEYS rotation.
 */
const productWithoutConditionArb = fc.record({
  id: fc.integer({ min: 1, max: 10000 }),
  name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
  price: fc.oneof(fc.double({ min: 0.01, max: 9999.99, noNaN: true }), fc.constant(null)),
  description: fc.string({ minLength: 0, maxLength: 100 }),
  active: fc.boolean(),
  conditionType: fc.constantFrom(null, undefined, ''),
  conditionRating: fc.oneof(fc.integer({ min: 1, max: 10 }), fc.constant(null)),
  images: fc.constant([{ url: 'https://example.com/img.jpg', displayOrder: 0 }]),
  tags: fc.constant([]),
})

const TAG_KEYS = [
  'carousel.tag.bestseller',
  'carousel.tag.new',
  'carousel.tag.limited',
  'carousel.tag.popular',
  'carousel.tag.fresh',
  'carousel.tag.seasonal',
]

describe('Carousel - Property 6: Carousel tag falls back to index-based label when condition is absent', () => {
  it('displays the index-based rotating tag label when conditionType is null/undefined/empty', async () => {
    await fc.assert(
      fc.asyncProperty(
        productWithoutConditionArb,
        fc.constantFrom(...SUPPORTED_LOCALES),
        async (product, locale) => {
          // Set locale
          lsMock.clear()
          lsMock.setItem('pb_locale', locale)

          // Mock fetch to return our generated product
          vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            json: () => Promise.resolve({ content: [product] }),
          }))

          render(
            <MemoryRouter>
              <LocaleProvider>
                <Carousel />
              </LocaleProvider>
            </MemoryRouter>
          )

          // The fallback tag for index 0 should be TAG_KEYS[0 % 6]
          const expectedKey = TAG_KEYS[0 % TAG_KEYS.length]
          const expectedLabel = translations[locale][expectedKey]

          await waitFor(() => {
            const tags = document.querySelectorAll('.card-tag')
            expect(tags.length).toBeGreaterThan(0)
            expect(tags[0].textContent).toBe(expectedLabel)
          })

          cleanup()
        }
      ),
      { numRuns: 100 }
    )
  }, 60000)
})
