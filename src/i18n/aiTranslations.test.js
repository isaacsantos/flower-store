// Feature: ai-product-creation, Property 1: Completitud de claves i18n
// Validates: Requirements 1.3, 2.10, 5.5
import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { translations } from './translations.js'

const AI_KEYS = [
  'admin.ai.button',
  'admin.ai.title',
  'admin.ai.dropzone',
  'admin.ai.dropzone.active',
  'admin.ai.browse',
  'admin.ai.counter',
  'admin.ai.error.limit',
  'admin.ai.error.send',
  'admin.ai.error.type',
  'admin.ai.send',
  'admin.ai.sending',
  'admin.ai.success',
  'admin.ai.accept',
  'admin.ai.retry',
  'admin.ai.close',
  'admin.ai.remove',
]

describe('admin.ai.* translations — ai-product-creation', () => {
  // Feature: ai-product-creation, Property 1: Completitud de claves i18n
  it('Property 1: all four locales have every admin.ai.* key with a non-empty string value', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...AI_KEYS),
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
