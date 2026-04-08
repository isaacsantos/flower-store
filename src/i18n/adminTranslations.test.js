// Feature: firebase-google-auth, Property 11: Claves de traducción nuevas completas en los cuatro idiomas
// Validates: Requirements 10.2, 10.4
import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { translations } from './translations.js'

const NEW_AUTH_KEYS = [
  'admin.login.google',
  'admin.login.error.unauthorized',
  'admin.login.error.network',
  'admin.login.loading',
]

describe('admin translations — firebase-google-auth', () => {
  // Property 11: Claves de traducción nuevas completas en los cuatro idiomas
  it('Property 11: all four locales have every new admin.login.* key with a non-empty string value', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...NEW_AUTH_KEYS),
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

  it('all four locales have every admin.* key with a non-empty value', () => {
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

  it('obsolete keys are removed from all locales', () => {
    const obsoleteKeys = [
      'admin.login.username',
      'admin.login.token',
      'admin.login.submit',
      'admin.login.error.required',
    ]
    for (const locale of ['es', 'en', 'fr', 'ko']) {
      for (const key of obsoleteKeys) {
        expect(
          translations[locale][key],
          `locale "${locale}" should not have obsolete key "${key}"`
        ).toBeUndefined()
      }
    }
  })
})
