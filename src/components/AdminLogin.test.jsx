// Feature: admin-module, Property 3: Login rechaza campos vacíos o solo whitespace
// Feature: admin-module, Property 4: Login persiste el token en localStorage
import { describe, it, beforeEach } from 'vitest'
import { render, fireEvent, screen, cleanup } from '@testing-library/react'
import * as fc from 'fast-check'
import { MemoryRouter } from 'react-router-dom'
import { LocaleProvider } from '../i18n/LocaleContext.jsx'
import AdminLogin from './AdminLogin.jsx'

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

function renderAdminLogin() {
  return render(
    <MemoryRouter>
      <LocaleProvider>
        <AdminLogin />
      </LocaleProvider>
    </MemoryRouter>
  )
}

describe('AdminLogin', () => {
  // Property 3: Login rechaza campos vacíos o solo whitespace
  // Validates: Requirements 2.2, 2.3
  it('Property 3: Login rechaza campos vacíos o solo whitespace', () => {
    fc.assert(
      fc.property(
        fc.tuple(fc.string(), fc.string())
          .filter(([u, t]) => !u.trim() || !t.trim()),
        ([username, token]) => {
          lsMock.clear()
          renderAdminLogin()

          fireEvent.change(screen.getByLabelText(/usuario|username|nom d'utilisateur|사용자 이름/i), {
            target: { value: username },
          })
          fireEvent.change(screen.getByLabelText(/token/i), {
            target: { value: token },
          })
          fireEvent.click(screen.getByRole('button', { name: /iniciar sesión|sign in|se connecter|로그인/i }))

          // localStorage must NOT have admin_token set
          const stored = lsMock.getItem('admin_token')
          if (stored !== null) {
            throw new Error(`Expected no admin_token in localStorage, but got: ${stored}`)
          }

          // An error message must be visible
          const alert = document.querySelector('[role="alert"]')
          if (!alert) {
            throw new Error('Expected an error alert to be shown')
          }

          cleanup()
        }
      ),
      { numRuns: 100 }
    )
  }, 30000)

  // Property 4: Login persiste el token en localStorage
  // Validates: Requirements 2.4, 2.5
  it('Property 4: Login persiste el token en localStorage', () => {
    fc.assert(
      fc.property(
        fc.tuple(fc.string({ minLength: 1 }), fc.string({ minLength: 1 }))
          .filter(([u, tok]) => u.trim().length > 0 && tok.trim().length > 0),
        ([username, token]) => {
          lsMock.clear()
          renderAdminLogin()

          fireEvent.change(screen.getByLabelText(/usuario|username|nom d'utilisateur|사용자 이름/i), {
            target: { value: username },
          })
          fireEvent.change(screen.getByLabelText(/token/i), {
            target: { value: token },
          })
          fireEvent.click(screen.getByRole('button', { name: /iniciar sesión|sign in|se connecter|로그인/i }))

          const stored = lsMock.getItem('admin_token')
          if (stored !== token) {
            throw new Error(`Expected admin_token="${token}", but got: ${stored}`)
          }

          cleanup()
        }
      ),
      { numRuns: 100 }
    )
  }, 30000)
})
