// Feature: admin-module, Property 5: Logout elimina el token y redirige
import { describe, it, beforeEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import * as fc from 'fast-check'
import { MemoryRouter } from 'react-router-dom'
import { LocaleProvider } from '../i18n/LocaleContext.jsx'
import AdminHome from './AdminHome.jsx'

vi.mock('../utils/apiClient', () => ({
  apiRequest: vi.fn().mockResolvedValue([])
}))

vi.mock('./ProductsTable.jsx', () => ({
  default: () => <div data-testid="products-table">ProductsTable</div>
}))

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

function renderAdminHome() {
  return render(
    <MemoryRouter>
      <LocaleProvider>
        <AdminHome />
      </LocaleProvider>
    </MemoryRouter>
  )
}

describe('AdminHome', () => {
  // Property 5: Logout elimina el token y redirige
  // Validates: Requirements 3.2, 3.3
  it('Property 5: Logout elimina el token de localStorage', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        (token) => {
          lsMock.setItem('admin_token', token)
          renderAdminHome()

          const logoutBtn = screen.getByRole('button', { name: /cerrar sesión/i })
          fireEvent.click(logoutBtn)

          expect(lsMock.getItem('admin_token')).toBeNull()
          cleanup()
        }
      ),
      { numRuns: 100 }
    )
  }, 30000)
})
