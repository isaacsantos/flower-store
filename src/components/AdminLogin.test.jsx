// Feature: firebase-google-auth — AdminLogin tests
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react'
import * as fc from 'fast-check'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import AdminLogin from './AdminLogin.jsx'

// ─── Mocks ────────────────────────────────────────────────────────────────────

let mockAuthValue = {
  user: null,
  isAdmin: false,
  loading: false,
  signInWithGoogle: vi.fn(),
  logout: vi.fn(),
}

vi.mock('../firebase/AuthContext.jsx', () => ({
  useAuth: () => mockAuthValue,
}))

vi.mock('../i18n/LocaleContext.jsx', () => ({
  useLocale: () => ({
    t: (key) => key,
  }),
}))

// ─── Helpers ─────────────────────────────────────────────────────────────────

const userArbitrary = fc.record({
  email: fc.emailAddress(),
  uid: fc.string({ minLength: 1 }),
})

function renderLogin() {
  return render(
    <MemoryRouter initialEntries={['/admin/login']}>
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<div>admin-home</div>} />
      </Routes>
    </MemoryRouter>
  )
}

beforeEach(() => {
  mockAuthValue = {
    user: null,
    isAdmin: false,
    loading: false,
    signInWithGoogle: vi.fn(),
    logout: vi.fn(),
  }
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

// ─── Unit tests ───────────────────────────────────────────────────────────────

describe('AdminLogin — unit tests', () => {
  // Validates: Requirements 3.1, 8.1
  it('renders exactly one Google button and no username/token fields', () => {
    renderLogin()
    const btn = screen.getByRole('button', { name: /admin\.login\.google/i })
    expect(btn).toBeTruthy()
    expect(screen.queryByLabelText(/username/i)).toBeNull()
    expect(screen.queryByLabelText(/token/i)).toBeNull()
  })

  // Validates: Requirement 3.2
  it('clicking the button calls signInWithGoogle()', async () => {
    mockAuthValue.signInWithGoogle = vi.fn().mockResolvedValue(undefined)
    renderLogin()
    const btn = screen.getByRole('button', { name: /admin\.login\.google/i })
    await act(async () => { fireEvent.click(btn) })
    expect(mockAuthValue.signInWithGoogle).toHaveBeenCalledTimes(1)
  })

  // Validates: Requirement 3.6
  it('popup-closed error does not show any error message', async () => {
    const err = Object.assign(new Error('popup closed'), { code: 'auth/popup-closed-by-user' })
    mockAuthValue.signInWithGoogle = vi.fn().mockRejectedValue(err)
    renderLogin()
    const btn = screen.getByRole('button', { name: /admin\.login\.google/i })
    await act(async () => { fireEvent.click(btn) })
    expect(screen.queryByRole('alert')).toBeNull()
  })
})

// ─── Property 6: Login redirige cuando isAdmin=true ───────────────────────────

describe('AdminLogin — Property 6', () => {
  // Feature: firebase-google-auth, Property 6: Login con isAdmin=true redirige a /admin
  // Validates: Requirement 3.4
  it('Property 6: renders <Navigate to="/admin"> when isAdmin=true', () => {
    fc.assert(
      fc.property(userArbitrary, (user) => {
        cleanup()
        mockAuthValue = { user, isAdmin: true, loading: false, signInWithGoogle: vi.fn(), logout: vi.fn() }
        renderLogin()
        expect(screen.getByText('admin-home')).toBeTruthy()
      }),
      { numRuns: 50 }
    )
  })
})

// ─── Property 7: Login muestra error y cierra sesión cuando isAdmin=false ─────

describe('AdminLogin — Property 7', () => {
  // Feature: firebase-google-auth, Property 7: Login con isAdmin=false muestra error y cierra sesión
  // Validates: Requirement 3.5
  it('Property 7: shows unauthorized error and calls logout() when user is authenticated but not admin', async () => {
    await fc.assert(
      fc.asyncProperty(userArbitrary, async (user) => {
        cleanup()
        const logoutMock = vi.fn().mockResolvedValue(undefined)
        mockAuthValue = { user, isAdmin: false, loading: false, signInWithGoogle: vi.fn(), logout: logoutMock }
        renderLogin()
        // Wait for the useEffect to fire
        await act(async () => {})
        const alert = screen.queryByRole('alert')
        return alert !== null && alert.textContent.includes('admin.login.error.unauthorized') && logoutMock.mock.calls.length > 0
      }),
      { numRuns: 30 }
    )
  })
})

// ─── Property 8: Errores Firebase muestran mensaje ───────────────────────────

describe('AdminLogin — Property 8', () => {
  // Feature: firebase-google-auth, Property 8: Errores de Firebase (excepto popup-closed) muestran mensaje
  // Validates: Requirements 3.6, 3.7
  it('Property 8: non-popup-closed Firebase errors show error message; popup-closed does not', async () => {
    const errorCodes = ['auth/network-request-failed', 'auth/internal-error', 'auth/cancelled-popup-request']

    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...errorCodes),
        async (code) => {
          cleanup()
          const err = Object.assign(new Error(code), { code })
          mockAuthValue = {
            user: null, isAdmin: false, loading: false,
            signInWithGoogle: vi.fn().mockRejectedValue(err),
            logout: vi.fn(),
          }
          renderLogin()
          const btn = screen.getByRole('button', { name: /admin\.login\.google/i })
          await act(async () => { fireEvent.click(btn) })
          const alert = screen.queryByRole('alert')
          return alert !== null && alert.textContent.includes('admin.login.error.network')
        }
      ),
      { numRuns: 50 }
    )
  })
})
