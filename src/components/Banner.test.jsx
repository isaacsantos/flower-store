// Feature: localization, Property 8: Banner renders all text from the active locale
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import * as fc from 'fast-check'
import Banner from './Banner.jsx'
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
})

function renderBanner(locale) {
  lsMock.clear()
  lsMock.setItem('pb_locale', locale)
  render(
    <LocaleProvider>
      <Banner />
    </LocaleProvider>
  )
}

describe('Banner', () => {
  // Property 8: Banner renders all text from the active locale
  it('Property 8: Banner renders eyebrow, title, subtitle, and CTAs from the active locale', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...SUPPORTED_LOCALES),
        (locale) => {
          renderBanner(locale)
          const t = translations[locale]
          expect(screen.getByText(t['banner.eyebrow'])).toBeInTheDocument()
          expect(screen.getByText(t['banner.title'])).toBeInTheDocument()
          expect(screen.getByText(t['banner.title.accent'])).toBeInTheDocument()
          expect(screen.getByText(t['banner.sub'])).toBeInTheDocument()
          expect(screen.getByText(t['banner.cta.primary'])).toBeInTheDocument()
          expect(screen.getByText(t['banner.cta.ghost'])).toBeInTheDocument()
          cleanup()
        }
      ),
      { numRuns: 100 }
    )
  })
})
