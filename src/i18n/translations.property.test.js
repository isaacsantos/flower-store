// Feature: product-condition, Property 9: Translation key completeness across all locales
import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { translations, SUPPORTED_LOCALES } from './translations.js'

/**
 * Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5
 *
 * Property 9: Translation key completeness across all locales
 * For any supported locale (es, en, fr, ko), all condition-related translation keys
 * SHALL exist and have non-empty string values, and the set of condition-related keys
 * SHALL be identical across all four locales.
 */

const CONDITION_KEYS = [
  'condition.type.new',
  'condition.type.used',
  'condition.rating.label',
  'admin.products.col.condition',
  'admin.products.col.conditionType',
  'admin.products.col.conditionRating',
  'admin.products.form.conditionType.placeholder',
  'admin.products.form.conditionRating.placeholder',
  'admin.products.validation.conditionType',
  'admin.products.validation.conditionRating',
  'marketplace.filter.conditionType',
  'marketplace.filter.minRating',
  'marketplace.filter.conditionType.new',
  'marketplace.filter.conditionType.used',
]

describe('Property 9: Translation key completeness across all locales', () => {
  it('all condition-related keys exist and have non-empty string values for any supported locale', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...SUPPORTED_LOCALES),
        (locale) => {
          for (const key of CONDITION_KEYS) {
            const value = translations[locale][key]
            expect(value, `${locale} missing key "${key}"`).toBeDefined()
            expect(typeof value, `${locale}["${key}"] should be a string`).toBe('string')
            expect(value.length, `${locale}["${key}"] should not be empty`).toBeGreaterThan(0)
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('the set of condition-related keys is identical across all four locales', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...SUPPORTED_LOCALES),
        fc.constantFrom(...SUPPORTED_LOCALES),
        (localeA, localeB) => {
          const keysA = CONDITION_KEYS.filter((k) => k in translations[localeA]).sort()
          const keysB = CONDITION_KEYS.filter((k) => k in translations[localeB]).sort()
          expect(keysA).toEqual(keysB)
          expect(keysA).toEqual(CONDITION_KEYS.slice().sort())
        }
      ),
      { numRuns: 100 }
    )
  })
})
