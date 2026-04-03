// Feature: localization, Property 9: Carousel renders all text from the active locale
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import * as fc from 'fast-check'
import Carousel from './Carousel.jsx'
import { LocaleProvider } from '../i18n/LocaleContext.jsx'
import { translations, SUPPORTED_LOCALES } from '../i18n/translations.js'

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
  vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise(() => {})))
})

function renderCarousel(locale) {
  lsMock.clear()
  lsMock.setItem('pb_locale', locale)
  render(
    <LocaleProvider>
      <Carousel />
    </LocaleProvider>
  )
}

describe('Carousel', () => {
  // Property 9: Carousel renders section text from the active locale
  it('Property 9: Carousel renders section eyebrow, title, and subtitle from the active locale', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...SUPPORTED_LOCALES),
        (locale) => {
          renderCarousel(locale)
          const t = translations[locale]
          expect(screen.getByText(t['carousel.eyebrow'])).toBeInTheDocument()
          expect(screen.getByText(t['carousel.title'])).toBeInTheDocument()
          expect(screen.getByText(t['carousel.sub'])).toBeInTheDocument()
          cleanup()
        }
      ),
      { numRuns: 100 }
    )
  })

  it('renders loading text from the active locale', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...SUPPORTED_LOCALES),
        (locale) => {
          renderCarousel(locale)
          expect(screen.getByText(translations[locale]['carousel.loading'])).toBeInTheDocument()
          cleanup()
        }
      ),
      { numRuns: 100 }
    )
  })

  it('renders error text from the active locale', async () => {
    for (const locale of SUPPORTED_LOCALES) {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('fail')))
      lsMock.clear()
      lsMock.setItem('pb_locale', locale)
      render(
        <LocaleProvider>
          <Carousel />
        </LocaleProvider>
      )
      await screen.findByText(translations[locale]['carousel.error'])
      cleanup()
    }
  })
})
