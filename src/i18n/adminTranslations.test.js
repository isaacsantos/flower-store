// Feature: admin-module, Property 11: Claves de traducción completas en los cuatro idiomas
import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { translations } from './translations.js'

describe('admin translations', () => {
  it('Property 11: all four locales have every admin.* key with a non-empty value', () => {
    // Validates: Requirements 10.2
    const adminKeys = Object.keys(translations.es).filter((k) => k.startsWith('admin.'))

    fc.assert(
      fc.property(
        fc.constantFrom(...adminKeys),
        (key) => {
          for (const locale of ['es', 'en', 'fr', 'ko']) {
            const value = translations[locale][key]
            expect(
              typeof value,
              `locale "${locale}" is missing key "${key}"`
            ).toBe('string')
            expect(
              value.length,
              `locale "${locale}" has empty value for key "${key}"`
            ).toBeGreaterThan(0)
          }
        }
      ),
      { numRuns: 100 }
    )
  })
})
