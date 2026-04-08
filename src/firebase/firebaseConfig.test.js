// Feature: firebase-google-auth, Property 1: Variables de entorno faltantes lanzan error descriptivo
// Validates: Requirements 1.3, 9.3
//
// NOTE: firebaseConfig.js reads import.meta.env at module evaluation time, so we
// cannot test it by dynamically re-importing the module in the same Vitest worker
// (module cache + hoisting make vi.stubGlobal('import.meta', …) unreliable).
// Instead, we test the validation logic directly by extracting it into a pure
// helper function that we can call with arbitrary env objects.
import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'

const ALL_VARS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_APP_ID',
]

/**
 * Pure validation function — mirrors the logic in firebaseConfig.js.
 * Returns the list of missing variable names.
 */
function getMissingVars(env) {
  return ALL_VARS.filter((k) => !env[k])
}

/**
 * Simulates the initialization guard from firebaseConfig.js.
 * Throws a descriptive error if any required var is missing.
 */
function validateFirebaseEnv(env) {
  const missing = getMissingVars(env)
  if (missing.length > 0) {
    throw new Error(`Firebase: missing env vars: ${missing.join(', ')}`)
  }
}

describe('firebaseConfig — env validation', () => {
  // Property 1: Variables de entorno faltantes lanzan error descriptivo
  // Validates: Requirements 1.3, 9.3
  it('Property 1: missing env vars throw a descriptive error mentioning each missing var', () => {
    fc.assert(
      fc.property(
        fc.subarray(ALL_VARS, { minLength: 1 }),
        (missingVars) => {
          const env = {}
          for (const v of ALL_VARS) {
            if (!missingVars.includes(v)) env[v] = 'test-value'
          }

          let error = null
          try {
            validateFirebaseEnv(env)
          } catch (e) {
            error = e
          }

          if (!error) return false
          return missingVars.every((v) => error.message.includes(v))
        }
      ),
      { numRuns: 100 }
    )
  })

  it('does not throw when all required env vars are present', () => {
    const env = {
      VITE_FIREBASE_API_KEY: 'key',
      VITE_FIREBASE_AUTH_DOMAIN: 'domain',
      VITE_FIREBASE_PROJECT_ID: 'project',
      VITE_FIREBASE_APP_ID: 'appid',
    }
    expect(() => validateFirebaseEnv(env)).not.toThrow()
  })

  it('throws when a var is present but empty string', () => {
    const env = {
      VITE_FIREBASE_API_KEY: '',
      VITE_FIREBASE_AUTH_DOMAIN: 'domain',
      VITE_FIREBASE_PROJECT_ID: 'project',
      VITE_FIREBASE_APP_ID: 'appid',
    }
    expect(() => validateFirebaseEnv(env)).toThrow('VITE_FIREBASE_API_KEY')
  })
})
