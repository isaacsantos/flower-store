// Feature: localization, Property 10: Footer renders all text from the active locale
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import * as fc from 'fast-check'
import Footer from './Footer.jsx'
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

function renderFooter(locale) {
  lsMock.clear()
  lsMock.setItem('pb_locale', locale)
  render(
    <LocaleProvider>
      <Footer />
    </LocaleProvider>
  )
}

describe('Footer', () => {
  // Property 10: Footer renders all text from the active locale
  it('Property 10: Footer renders all strings from the active locale', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...SUPPORTED_LOCALES),
        (locale) => {
          renderFooter(locale)
          const t = translations[locale]
          expect(screen.getByText(t['footer.tagline'])).toBeInTheDocument()
          expect(screen.getByText(t['footer.shop.heading'])).toBeInTheDocument()
          expect(screen.getByText(t['footer.shop.bouquets'])).toBeInTheDocument()
          expect(screen.getByText(t['footer.shop.seasonal'])).toBeInTheDocument()
          expect(screen.getByText(t['footer.shop.gifts'])).toBeInTheDocument()
          expect(screen.getByText(t['footer.shop.subscriptions'])).toBeInTheDocument()
          expect(screen.getByText(t['footer.help.heading'])).toBeInTheDocument()
          expect(screen.getByText(t['footer.help.faq'])).toBeInTheDocument()
          expect(screen.getByText(t['footer.help.delivery'])).toBeInTheDocument()
          expect(screen.getByText(t['footer.help.returns'])).toBeInTheDocument()
          expect(screen.getByText(t['footer.help.contact'])).toBeInTheDocument()
          expect(screen.getByText(t['footer.newsletter.heading'])).toBeInTheDocument()
          expect(screen.getByText(t['footer.newsletter.desc'])).toBeInTheDocument()
          expect(screen.getByText(t['footer.newsletter.btn'])).toBeInTheDocument()
          expect(screen.getByText(t['footer.copyright'])).toBeInTheDocument()
          cleanup()
        }
      ),
      { numRuns: 100 }
    )
  }, 30000)
})
