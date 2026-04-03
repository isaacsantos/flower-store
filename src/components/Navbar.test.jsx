// Feature: localization, Property 4: Language switcher reflects the active locale
// Feature: localization, Property 7: Navbar renders all text from the active locale
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, act, cleanup } from '@testing-library/react'
import * as fc from 'fast-check'
import Navbar from './Navbar.jsx'
import { LocaleProvider, useLocale } from '../i18n/LocaleContext.jsx'
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

function renderNavbar(locale) {
  lsMock.clear()
  lsMock.setItem('pb_locale', locale)
  let setLocaleRef = null
  function LocaleSetter() {
    const { setLocale } = useLocale()
    setLocaleRef = setLocale
    return null
  }
  render(
    <LocaleProvider>
      <LocaleSetter />
      <Navbar />
    </LocaleProvider>
  )
  return { setLocale: (code) => act(() => setLocaleRef(code)) }
}

describe('Navbar', () => {
  it('renders a LanguageSwitcher select inside Navbar', () => {
    renderNavbar('es')
    expect(screen.getByRole('combobox', { name: /select language/i })).toBeInTheDocument()
    cleanup()
  })

  it('renders exactly four language options', () => {
    renderNavbar('es')
    expect(screen.getAllByRole('option')).toHaveLength(4)
    cleanup()
  })

  // Property 4: Language switcher reflects the active locale
  it('Property 4: LanguageSwitcher select value matches the active locale', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...SUPPORTED_LOCALES),
        (locale) => {
          renderNavbar(locale)
          const select = screen.getByRole('combobox', { name: /select language/i })
          expect(select.value).toBe(locale)
          cleanup()
        }
      ),
      { numRuns: 100 }
    )
  })

  // Property 7: Navbar renders all text from the active locale
  it('Property 7: Navbar renders nav links and CTA from the active locale', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...SUPPORTED_LOCALES),
        (locale) => {
          renderNavbar(locale)
          const t = translations[locale]
          expect(screen.getByText(t['nav.home'])).toBeInTheDocument()
          expect(screen.getByText(t['nav.shop'])).toBeInTheDocument()
          expect(screen.getByText(t['nav.about'])).toBeInTheDocument()
          expect(screen.getByText(t['nav.contact'])).toBeInTheDocument()
          expect(screen.getByText(t['nav.cta'])).toBeInTheDocument()
          cleanup()
        }
      ),
      { numRuns: 100 }
    )
  })
})
