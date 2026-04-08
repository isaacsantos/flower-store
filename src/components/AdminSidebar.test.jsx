// Feature: firebase-google-auth — AdminSidebar tests
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AdminSidebar from './AdminSidebar.jsx'

// ─── Mocks ────────────────────────────────────────────────────────────────────

let mockLogout = vi.fn()

vi.mock('../firebase/AuthContext.jsx', () => ({
  useAuth: () => ({ logout: mockLogout }),
}))

vi.mock('../i18n/LocaleContext.jsx', () => ({
  useLocale: () => ({ t: (key) => key }),
}))

function renderSidebar() {
  return render(
    <MemoryRouter>
      <AdminSidebar />
    </MemoryRouter>
  )
}

beforeEach(() => {
  mockLogout = vi.fn().mockResolvedValue(undefined)
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('AdminSidebar', () => {
  // Validates: Requirement 5.1
  it('contains a "Cerrar Sesión" button', () => {
    renderSidebar()
    expect(screen.getByTitle('admin.logout.button')).toBeTruthy()
  })

  // Validates: Requirement 5.2
  it('clicking logout button calls logout()', async () => {
    renderSidebar()
    const btn = screen.getByTitle('admin.logout.button')
    await act(async () => { fireEvent.click(btn) })
    expect(mockLogout).toHaveBeenCalledTimes(1)
  })

  // Validates: Requirement 5.5
  it('shows inline error if logout() fails without redirecting', async () => {
    mockLogout = vi.fn().mockRejectedValue(new Error('network'))
    renderSidebar()
    const btn = screen.getByTitle('admin.logout.button')
    await act(async () => { fireEvent.click(btn) })
    expect(screen.getByRole('alert')).toBeTruthy()
  })
})
