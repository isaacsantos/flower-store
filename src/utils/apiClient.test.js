// Feature: firebase-google-auth — apiClient tests
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as fc from 'fast-check'
import { apiRequest } from './apiClient'

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn())
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})

// Helper: build a minimal Response-like object
function mockResponse(status, body = {}) {
  return {
    status,
    ok: status >= 200 && status < 300,
    json: () => Promise.resolve(body),
  }
}

// Helper: build a mock Firebase user
function makeUser(token, freshToken = token) {
  return {
    getIdToken: vi.fn()
      .mockResolvedValueOnce(token)
      .mockResolvedValue(freshToken),
  }
}

// ─── Unit tests ──────────────────────────────────────────────────────────────

describe('apiClient — unit tests', () => {
  it('throws when user is null', async () => {
    await expect(apiRequest('/admin/api/products', {}, null)).rejects.toThrow('No authenticated user')
    expect(fetch).not.toHaveBeenCalled()
  })

  it('calls user.getIdToken() and injects Authorization header', async () => {
    const user = makeUser('my-jwt')
    fetch.mockResolvedValue(mockResponse(200, { ok: true }))

    await apiRequest('/admin/api/products', {}, user)

    expect(user.getIdToken).toHaveBeenCalledWith()
    const [, opts] = fetch.mock.calls[0]
    expect(opts.headers.Authorization).toBe('Bearer my-jwt')
  })

  it('returns parsed JSON on 2xx response', async () => {
    const user = makeUser('tok')
    const data = [{ id: 1, name: 'Rose' }]
    fetch.mockResolvedValue(mockResponse(200, data))

    const result = await apiRequest('/admin/api/products', {}, user)
    expect(result).toEqual(data)
  })

  it('throws on non-2xx non-401 response', async () => {
    const user = makeUser('tok')
    fetch.mockResolvedValue(mockResponse(500))

    await expect(apiRequest('/admin/api/products', {}, user)).rejects.toThrow('HTTP 500')
  })

  it('on 401: retries with fresh token; if retry also 401 → redirects and throws', async () => {
    const user = makeUser('expired', 'fresh-tok')
    fetch
      .mockResolvedValueOnce(mockResponse(401))
      .mockResolvedValueOnce(mockResponse(401))

    await expect(apiRequest('/admin/api/products', {}, user)).rejects.toThrow('Unauthorized')
    expect(user.getIdToken).toHaveBeenCalledWith(true)
    expect(window.location.hash).toBe('#/admin/login')
  })

  it('on 401: retries with fresh token; if retry succeeds → returns data', async () => {
    const user = makeUser('expired', 'fresh-tok')
    fetch
      .mockResolvedValueOnce(mockResponse(401))
      .mockResolvedValueOnce(mockResponse(200, { ok: true }))

    const result = await apiRequest('/admin/api/products', {}, user)
    expect(result).toEqual({ ok: true })
    expect(user.getIdToken).toHaveBeenCalledWith(true)
  })
})

// ─── Property 9: apiClient inyecta JWT en todas las peticiones ────────────────

describe('apiClient — Property 9', () => {
  // Feature: firebase-google-auth, Property 9: apiClient inyecta el Firebase JWT en todas las peticiones
  // Validates: Requirements 6.1, 6.2
  it('Property 9: injects Authorization: Bearer <token> for any token and any HTTP method', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1 }),
        fc.constantFrom('GET', 'POST', 'PUT', 'DELETE'),
        async (token, method) => {
          fetch.mockResolvedValue(mockResponse(200, {}))
          const user = makeUser(token)

          await apiRequest('/admin/api/products', { method }, user)

          expect(user.getIdToken).toHaveBeenCalled()
          const [, opts] = fetch.mock.calls[fetch.mock.calls.length - 1]
          return opts.headers.Authorization === `Bearer ${token}`
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ─── Property 10: 401 provoca reintento con token renovado ───────────────────

describe('apiClient — Property 10', () => {
  // Feature: firebase-google-auth, Property 10: 401 provoca reintento con token renovado
  // Validates: Requirement 6.5
  it('Property 10: 401 response triggers getIdToken(true) and exactly one retry', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1 }),
        fc.string({ minLength: 1 }),
        async (originalToken, freshToken) => {
          // Reset fetch mock for each iteration
          fetch.mockReset()
          fetch
            .mockResolvedValueOnce(mockResponse(401))
            .mockResolvedValueOnce(mockResponse(200, {}))

          const user = {
            getIdToken: vi.fn()
              .mockResolvedValueOnce(originalToken)
              .mockResolvedValueOnce(freshToken),
          }

          await apiRequest('/admin/api/products', {}, user)

          // getIdToken(true) must have been called for the refresh
          const calls = user.getIdToken.mock.calls
          const refreshCall = calls.find((c) => c[0] === true)
          if (!refreshCall) return false

          // fetch must have been called exactly twice
          if (fetch.mock.calls.length !== 2) return false

          // Second fetch must use the fresh token
          const [, retryOpts] = fetch.mock.calls[1]
          return retryOpts.headers.Authorization === `Bearer ${freshToken}`
        }
      ),
      { numRuns: 100 }
    )
  })
})
