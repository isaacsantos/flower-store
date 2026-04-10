// Feature: localization, Property 8: Banner renders all text from the active locale
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import * as fc from 'fast-check'
import { MemoryRouter } from 'react-router-dom'
import Banner from './Banner.jsx'
import { LocaleProvider } from '../i18n/LocaleContext.jsx'
import { translations, SUPPORTED_LOCALES } from '../i18n/translations.js'

// Determine which banner variant is active (mirrors Banner.jsx logic)
const ACTIVE_BANNER = import.meta.env.VITE_ACTIVE_BANNER ?? 'default'

// Keys to check per banner variant
const BANNER_KEYS = {
  'default': ['banner.eyebrow', 'banner.title', 'banner.title.accent', 'banner.sub', 'banner.cta.ghost'],
  'mothers-day': ['banner.mothers.eyebrow', 'banner.mothers.title', 'banner.mothers.title.accent', 'banner.mothers.sub', 'banner.mothers.cta.primary'],
  'valentines': ['banner.valentines.eyebrow', 'banner.valentines.title', 'banner.valentines.title.accent', 'banner.valentines.sub', 'banner.valentines.cta.primary', 'banner.valentines.cta.ghost'],
}

const activeKeys = BANNER_KEYS[ACTIVE_BANNER] ?? BANNER_KEYS['default']

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
    <MemoryRouter>
      <LocaleProvider>
        <Banner />
      </LocaleProvider>
    </MemoryRouter>
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
          for (const key of activeKeys) {
            const elements = screen.getAllByText(t[key])
            expect(elements.length).toBeGreaterThanOrEqual(1)
          }
          cleanup()
        }
      ),
      { numRuns: 100 }
    )
  }, 30000)
})
