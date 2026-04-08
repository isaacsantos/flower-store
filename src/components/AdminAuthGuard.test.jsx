// Feature: firebase-google-auth — AdminAuthGuard tests
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import * as fc from 'fast-check'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import AdminAuthGuard from './AdminAuthGuard.jsx'

// ─── Mocks ────────────────────────────────────────────────────────────────────

let mockAuthValue = {
  user: null,
  isAdmin: false,
  loading: false,
}

vi.mock('../firebase/AuthContext.jsx', () => ({
  useAuth: () => mockAuthValue,
}))

// ─── Helpers ─────────────────────────────────────────────────────────────────

const userArbitrary = fc.record({
  email: fc.emailAddress(),
  uid: fc.string({ minLength: 1 }),
})

function renderGuardAtAdmin() {
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

function renderGuardAtLogin() {
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

beforeEach(() => {
  mockAuthValue = { user: null, isAdmin: false, loading: false }
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

// ─── Unit test: spinner when loading=true ─────────────────────────────────────

describe('AdminAuthGuard — unit tests', () => {
  // Validates: Requirement 4.4
  it('shows loading indicator and does not redirect when loading=true', () => {
    mockAuthValue = { user: null, isAdmin: false, loading: true }
    renderGuardAtAdmin()
    expect(screen.getByText('Loading...')).toBeTruthy()
    expect(screen.queryByText('login-page')).toBeNull()
    expect(screen.queryByText('admin-home')).toBeNull()
  })
})

// ─── Property 4: Guard redirige a login cuando usuario no es admin ────────────

describe('AdminAuthGuard — Property 4', () => {
  // Feature: firebase-google-auth, Property 4: AuthGuard redirige a login cuando el usuario no es admin
  // Validates: Requirements 4.1, 4.2
  it('Property 4: redirects to /admin/login when user is null or isAdmin=false', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(null, { email: 'x@x.com', uid: '1' }),
        (user) => {
          cleanup()
          mockAuthValue = { user, isAdmin: false, loading: false }
          renderGuardAtAdmin()
          expect(screen.getByText('login-page')).toBeTruthy()
          expect(screen.queryByText('admin-home')).toBeNull()
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ─── Property 5: Guard redirige admin desde /admin/login ─────────────────────

describe('AdminAuthGuard — Property 5', () => {
  // Feature: firebase-google-auth, Property 5: AuthGuard redirige a /admin cuando el usuario admin visita /admin/login
  // Validates: Requirement 4.3
  it('Property 5: redirects to /admin when isAdmin=true and visiting /admin/login', () => {
    fc.assert(
      fc.property(userArbitrary, (user) => {
        cleanup()
        mockAuthValue = { user, isAdmin: true, loading: false }
        renderGuardAtLogin()
        expect(screen.getByText('admin-home')).toBeTruthy()
        expect(screen.queryByText('login-page')).toBeNull()
      }),
      { numRuns: 50 }
    )
  })
})
