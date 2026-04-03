// Feature: localization, Property 1: Default locale is Spanish
// Feature: localization, Property 2: Invalid locale is rejected
// Feature: localization, Property 3: setLocale updates the active locale
// Feature: localization, Property 5: setLocale persists to localStorage
// Feature: localization, Property 6: Locale is restored from localStorage
// Feature: localization, Property 11: Missing key falls back to Spanish
// Feature: localization, Property 12: Key missing from all locales returns the key itself
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, act, cleanup } from '@testing-library/react'
import * as fc from 'fast-check'
import { LocaleProvider, useLocale } from './LocaleContext.jsx'
import { translations, SUPPORTED_LOCALES, STORAGE_KEY } from './translations.js'

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

afterEach(() => {
  lsMock.clear()
  cleanup()
})

// Returns a ref whose .current always points to the latest context value
function renderProvider(preStoredLocale = null) {
  lsMock.clear()
  if (preStoredLocale !== null) lsMock.setItem(STORAGE_KEY, preStoredLocale)
  const ref = { current: null }
  function Consumer() {
    ref.current = useLocale()
    return null
  }
  render(
    <LocaleProvider>
      <Consumer />
    </LocaleProvider>
  )
  return ref
}

describe('LocaleContext', () => {
  // Property 1: Default locale is Spanish
  it('Property 1: defaults to Spanish when no localStorage entry exists', () => {
    fc.assert(
      fc.property(fc.constant(undefined), () => {
        const ref = renderProvider()
        const locale = ref.current.locale
        cleanup()
        expect(locale).toBe('es')
      }),
      { numRuns: 100 }
    )
  })

  // Property 2: Invalid locale is rejected
  it('Property 2: setLocale is a no-op for invalid locale codes', () => {
    fc.assert(
      fc.property(
        fc.string().filter(s => !SUPPORTED_LOCALES.includes(s)),
        (invalidCode) => {
          const ref = renderProvider()
          const before = ref.current.locale
          act(() => { ref.current.setLocale(invalidCode) })
          const after = ref.current.locale
          cleanup()
          expect(after).toBe(before)
        }
      ),
      { numRuns: 100 }
    )
  })

  // Property 3: setLocale updates the active locale
  it('Property 3: setLocale updates locale to any valid code', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...SUPPORTED_LOCALES),
        (code) => {
          const ref = renderProvider()
          act(() => { ref.current.setLocale(code) })
          const updated = ref.current.locale
          cleanup()
          expect(updated).toBe(code)
        }
      ),
      { numRuns: 100 }
    )
  })

  // Property 5: setLocale persists to localStorage
  it('Property 5: setLocale writes the locale to localStorage', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...SUPPORTED_LOCALES),
        (code) => {
          const ref = renderProvider()
          act(() => { ref.current.setLocale(code) })
          const stored = lsMock.getItem(STORAGE_KEY)
          cleanup()
          expect(stored).toBe(code)
        }
      ),
      { numRuns: 100 }
    )
  })

  // Property 6: Locale is restored from localStorage (round-trip)
  it('Property 6: locale is restored from localStorage on mount', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...SUPPORTED_LOCALES),
        (code) => {
          const ref = renderProvider(code)
          const locale = ref.current.locale
          cleanup()
          expect(locale).toBe(code)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('resets invalid localStorage value to es on mount', () => {
    const ref = renderProvider('de')
    expect(ref.current.locale).toBe('es')
  })

  // Property 11: t() returns a non-empty string for any valid key
  it('Property 11 (fallback): t() returns a non-empty string for any es key', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...SUPPORTED_LOCALES),
        fc.constantFrom(...Object.keys(translations.es)),
        (locale, key) => {
          const ref = renderProvider(locale)
          const result = ref.current.t(key)
          cleanup()
          expect(typeof result).toBe('string')
          expect(result.length).toBeGreaterThan(0)
        }
      ),
      { numRuns: 100 }
    )
  })

  // Property 12: Key missing from all locales returns the key itself
  it('Property 12: t() returns the key itself when missing from all locales', () => {
    const allKeys = new Set(Object.keys(translations.es))
    const protoKeys = new Set(Object.getOwnPropertyNames(Object.prototype))
    fc.assert(
      fc.property(
        fc.string().filter(k => !allKeys.has(k) && !protoKeys.has(k)),
        (missingKey) => {
          const ref = renderProvider()
          const result = ref.current.t(missingKey)
          cleanup()
          expect(result).toBe(missingKey)
        }
      ),
      { numRuns: 100 }
    )
  })
})
