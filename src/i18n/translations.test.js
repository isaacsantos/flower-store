// Feature: localization, Property 13: All locales share identical key sets
import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { translations, SUPPORTED_LOCALES } from './translations.js'

describe('translations', () => {
  it('has exactly four locale keys', () => {
    expect(Object.keys(translations).sort()).toEqual(['en', 'es', 'fr', 'ko'])
  })

  it('Property 13: all locales share identical key sets', () => {
    const esKeys = Object.keys(translations.es).sort()

    fc.assert(
      fc.property(
        fc.constantFrom('en', 'fr', 'ko'),
        (locale) => {
          const localeKeys = Object.keys(translations[locale]).sort()
          expect(localeKeys).toEqual(esKeys)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('all locales have non-empty string values for every key', () => {
    for (const locale of SUPPORTED_LOCALES) {
      for (const [key, value] of Object.entries(translations[locale])) {
        expect(typeof value, `${locale}.${key} should be a string`).toBe('string')
        expect(value.length, `${locale}.${key} should not be empty`).toBeGreaterThan(0)
      }
    }
  })
})
