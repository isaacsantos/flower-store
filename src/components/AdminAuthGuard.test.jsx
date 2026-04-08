// Feature: admin-module, Property 1: Guard redirige a login cuando no hay token
// Feature: admin-module, Property 2: Guard redirige a home cuando hay token
import { describe, it, beforeEach, afterEach } from 'vitest'
import { render, cleanup, screen } from '@testing-library/react'
import * as fc from 'fast-check'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import AdminAuthGuard from './AdminAuthGuard.jsx'

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
  cleanup()
})

/**
 * Property 1 helper: guard wraps /admin (protected route).
 * /admin/login is a separate unguarded route.
 * Without token at /admin → guard redirects to /admin/login.
 */
function renderAtAdminNoToken(token) {
  cleanup()
  lsMock.clear()
  if (token !== null && token !== '') {
    lsMock.setItem('admin_token', token)
  }
  return render(
    <MemoryRouter initialEntries={['/admin']}>
      <Routes>
        <Route path="/admin/login" element={<div>login-page</div>} />
        <Route path="/admin" element={<AdminAuthGuard />}>
          <Route index element={<div>admin-home</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  )
}

/**
 * Property 2 helper: guard wraps /admin/login route.
 * /admin is a separate unguarded route.
 * With token at /admin/login → guard redirects to /admin.
 */
function renderAtLoginWithToken(token) {
  cleanup()
  lsMock.clear()
  lsMock.setItem('admin_token', token)
  return render(
    <MemoryRouter initialEntries={['/admin/login']}>
      <Routes>
        <Route path="/admin" element={<div>admin-home</div>} />
        <Route path="/admin/login" element={<AdminAuthGuard />}>
          <Route index element={<div>login-page</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  )
}

describe('AdminAuthGuard', () => {
  // Property 1: Guard redirige a login cuando no hay token
  // Validates: Requirements 1.1, 1.4
  it('Property 1: Guard redirige a login cuando no hay token', () => {
    fc.assert(
      fc.property(
        fc.option(fc.string(), { nil: null }),
        (token) => {
          // Only test null or empty string (absence of token)
          const absentToken = token === null || token === '' ? token : null
          renderAtAdminNoToken(absentToken)
          screen.getByText('login-page')
        }
      ),
      { numRuns: 100 }
    )
    // Also explicitly test empty string
    renderAtAdminNoToken('')
    screen.getByText('login-page')
  })

  // Property 2: Guard redirige a home cuando hay token
  // Validates: Requirements 1.2, 1.3
  it('Property 2: Guard redirige a home cuando hay token desde login', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        (token) => {
          renderAtLoginWithToken(token)
          screen.getByText('admin-home')
        }
      ),
      { numRuns: 100 }
    )
  })
})
