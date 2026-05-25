// Feature: product-condition, Property 7: Marketplace condition filters produce correct API parameters
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, cleanup, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import * as fc from 'fast-check'
import Marketplace from './Marketplace.jsx'
import { LocaleProvider } from '../i18n/LocaleContext.jsx'
import { translations } from '../i18n/translations.js'

/**
 * Validates: Requirements 4.2, 4.4
 *
 * Property 7: Marketplace condition filters produce correct API parameters
 * For any condition filter selection (conditionType "NEW" or "USED", or minRating 1–10),
 * when the filter is applied, the API request SHALL include the corresponding query parameter
 * (`conditionType` or `conditionRating`) with the selected value, and pagination SHALL be
 * reset to page 0.
 */

const defaultLocale = 'es'

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
let fetchMock
let fetchCalls

beforeEach(() => {
  lsMock = makeLocalStorageMock()
  lsMock.setItem('pb_locale', defaultLocale)
  Object.defineProperty(globalThis, 'localStorage', {
    value: lsMock,
    writable: true,
    configurable: true,
  })

  fetchCalls = []
  fetchMock = vi.fn((url, opts) => {
    fetchCalls.push(url)
    // Return empty product response for /products calls, empty array for /tags
    if (url.includes('/tags')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
    }
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ content: [], totalPages: 1 }),
    })
  })
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

function renderMarketplace() {
  return render(
    <MemoryRouter>
      <LocaleProvider>
        <Marketplace />
      </LocaleProvider>
    </MemoryRouter>
  )
}

describe('Property 7: Marketplace condition filters produce correct API parameters', () => {
  it('conditionType filter sends correct conditionType param and resets page to 0', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('NEW', 'USED'),
        async (conditionTypeValue) => {
          fetchCalls = []
          renderMarketplace()

          // Wait for initial fetch to complete
          await waitFor(() => {
            expect(fetchCalls.some(url => url.includes('/products'))).toBe(true)
          })

          // Clear fetch calls to capture only the filter-triggered fetch
          fetchCalls = []

          // Select the condition type radio button
          const label = conditionTypeValue === 'NEW'
            ? translations[defaultLocale]['marketplace.filter.conditionType.new']
            : translations[defaultLocale]['marketplace.filter.conditionType.used']

          const radio = screen.getByLabelText(label)
          fireEvent.click(radio)

          // Wait for the fetch triggered by the filter change
          await waitFor(() => {
            expect(fetchCalls.some(url => url.includes('/products'))).toBe(true)
          })

          // Find the products fetch URL
          const productsFetchUrl = fetchCalls.find(url => url.includes('/products'))
          const urlParams = new URLSearchParams(productsFetchUrl.split('?')[1])

          // Verify conditionType parameter is set correctly
          expect(urlParams.get('conditionType')).toBe(conditionTypeValue)
          // Verify pagination is reset to page 0
          expect(urlParams.get('page')).toBe('0')

          cleanup()
        }
      ),
      { numRuns: 100 }
    )
  }, 60000)

  it('minRating filter sends correct conditionRating param and resets page to 0', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 10 }),
        async (ratingValue) => {
          fetchCalls = []
          renderMarketplace()

          // Wait for initial fetch to complete
          await waitFor(() => {
            expect(fetchCalls.some(url => url.includes('/products'))).toBe(true)
          })

          // Clear fetch calls to capture only the filter-triggered fetch
          fetchCalls = []

          // Select the min rating from the select element
          const select = screen.getByRole('combobox', { name: translations[defaultLocale]['marketplace.filter.minRating'] })
          fireEvent.change(select, { target: { value: String(ratingValue) } })

          // Wait for the fetch triggered by the filter change
          await waitFor(() => {
            expect(fetchCalls.some(url => url.includes('/products'))).toBe(true)
          })

          // Find the products fetch URL
          const productsFetchUrl = fetchCalls.find(url => url.includes('/products'))
          const urlParams = new URLSearchParams(productsFetchUrl.split('?')[1])

          // Verify conditionRating parameter is set correctly
          expect(urlParams.get('conditionRating')).toBe(String(ratingValue))
          // Verify pagination is reset to page 0
          expect(urlParams.get('page')).toBe('0')

          cleanup()
        }
      ),
      { numRuns: 100 }
    )
  }, 60000)
})
