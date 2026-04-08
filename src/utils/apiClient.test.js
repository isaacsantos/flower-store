import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as fc from 'fast-check'
import { apiRequest } from './apiClient'

// ─── localStorage mock ───────────────────────────────────────────────────────

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
  vi.stubGlobal('fetch', vi.fn())
})

afterEach(() => {
  vi.unstubAllGlobals()
})

// Helper: build a minimal Response-like object
function mockResponse(status, body = {}) {
  return {
    status,
    ok: status >= 200 && status < 300,
    json: () => Promise.resolve(body),
  }
}

// ─── Unit tests ──────────────────────────────────────────────────────────────

describe('apiClient — unit tests', () => {
  it('adds Authorization header when token is present', async () => {
    lsMock.setItem('admin_token', 'my-jwt')
    fetch.mockResolvedValue(mockResponse(200, { ok: true }))

    await apiRequest('/admin/api/products')

    const [, opts] = fetch.mock.calls[0]
    expect(opts.headers.Authorization).toBe('Bearer my-jwt')
  })

  it('does not add Authorization header when token is absent', async () => {
    fetch.mockResolvedValue(mockResponse(200, {}))

    await apiRequest('/admin/api/products')

    const [, opts] = fetch.mock.calls[0]
    expect(opts.headers.Authorization).toBeUndefined()
  })

  it('returns parsed JSON on 2xx response', async () => {
    lsMock.setItem('admin_token', 'tok')
    const data = [{ id: 1, name: 'Rose' }]
    fetch.mockResolvedValue(mockResponse(200, data))

    const result = await apiRequest('/admin/api/products')
    expect(result).toEqual(data)
  })

  it('throws on non-2xx response (e.g. 500)', async () => {
    lsMock.setItem('admin_token', 'tok')
    fetch.mockResolvedValue(mockResponse(500))

    await expect(apiRequest('/admin/api/products')).rejects.toThrow('HTTP 500')
  })

  it('on 401: removes token, redirects to /admin/login, and throws', async () => {
    lsMock.setItem('admin_token', 'expired-tok')
    fetch.mockResolvedValue(mockResponse(401))

    await expect(apiRequest('/admin/api/products')).rejects.toThrow('Unauthorized')
    expect(lsMock.getItem('admin_token')).toBeNull()
    // jsdom prefixes the hash with '#' when reading it back
    expect(window.location.hash).toBe('#/admin/login')
  })
})

// ─── Property-based tests ────────────────────────────────────────────────────

describe('apiClient — property tests', () => {
  it(
    // Feature: admin-module, Property 6: apiClient inyecta el JWT en todas las peticiones
    'Property 6 — injects Authorization header for any token and any HTTP method',
    async () => {
      // Validates: Requirements 5.1, 6.4, 7.3, 8.3, 9.1, 9.3
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1 }),
          fc.constantFrom('GET', 'POST', 'PUT', 'DELETE'),
          async (token, method) => {
            lsMock.setItem('admin_token', token)
            fetch.mockResolvedValue(mockResponse(200, {}))

            await apiRequest('/admin/api/products', { method })

            const [, opts] = fetch.mock.calls[fetch.mock.calls.length - 1]
            return opts.headers.Authorization === `Bearer ${token}`
          }
        ),
        { numRuns: 100 }
      )
    }
  )

  it(
    // Feature: admin-module, Property 10: Respuesta 401 limpia el token y redirige
    'Property 10 — any 401 response removes token and redirects to /admin/login',
    async () => {
      // Validates: Requirements 9.2
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1 }),
          async (token) => {
            lsMock.setItem('admin_token', token)
            fetch.mockResolvedValue(mockResponse(401))

            try {
              await apiRequest('/admin/api/products')
            } catch {
              // expected
            }

            // jsdom prefixes the hash with '#' when reading it back
            return (
              lsMock.getItem('admin_token') === null &&
              window.location.hash === '#/admin/login'
            )
          }
        ),
        { numRuns: 100 }
      )
    }
  )
})
