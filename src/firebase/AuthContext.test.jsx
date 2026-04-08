// Feature: firebase-google-auth — AuthContext tests
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, act, cleanup, waitFor } from '@testing-library/react'
import * as fc from 'fast-check'
import { useAuth, AuthProvider } from './AuthContext.jsx'

// ─── Mocks ────────────────────────────────────────────────────────────────────

let mockOnAuthStateChangedCallback = null
let mockGetDocResult = { exists: () => true }

vi.mock('./firebaseConfig.js', () => ({
  auth: {},
  db: {},
}))

vi.mock('firebase/auth', () => ({
  GoogleAuthProvider: vi.fn(() => ({})),
  onAuthStateChanged: vi.fn((_auth, cb) => {
    mockOnAuthStateChangedCallback = cb
    return vi.fn() // unsubscribe
  }),
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
}))

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  doc: vi.fn(),
  getDoc: vi.fn(() => Promise.resolve(mockGetDocResult)),
}))

// ─── Arbitrary ───────────────────────────────────────────────────────────────

const userArbitrary = fc.record({
  email: fc.emailAddress(),
  uid: fc.string({ minLength: 1 }),
})

// ─── Helper ──────────────────────────────────────────────────────────────────

function TestConsumer() {
  const { user, loading, isAdmin } = useAuth()
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="user">{user ? user.email : 'null'}</span>
      <span data-testid="isAdmin">{String(isAdmin)}</span>
    </div>
  )
}

function renderWithProvider() {
  return render(
    <AuthProvider>
      <TestConsumer />
    </AuthProvider>
  )
}

beforeEach(() => {
  mockOnAuthStateChangedCallback = null
  mockGetDocResult = { exists: () => true }
  vi.clearAllMocks()
})

afterEach(() => {
  cleanup()
})

// ─── Unit tests ───────────────────────────────────────────────────────────────

describe('AuthContext — unit tests', () => {
  it('loading is true before onAuthStateChanged resolves', () => {
    // Validates: Requirement 2.5
    const { getByTestId } = renderWithProvider()
    // callback not yet called → loading should still be true
    expect(getByTestId('loading').textContent).toBe('true')
  })

  it('Firestore error → isAdmin=false + console.error', async () => {
    // Validates: Requirement 7.5
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { getDoc } = await import('firebase/firestore')
    getDoc.mockRejectedValueOnce(new Error('network error'))

    const { getByTestId } = renderWithProvider()

    await act(async () => {
      await mockOnAuthStateChangedCallback({ email: 'admin@test.com', uid: '123' })
    })

    expect(getByTestId('isAdmin').textContent).toBe('false')
    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })
})

// ─── Property 2: AuthContext refleja onAuthStateChanged ───────────────────────

describe('AuthContext — Property 2', () => {
  // Feature: firebase-google-auth, Property 2: AuthContext refleja cambios de onAuthStateChanged
  // Validates: Requirement 2.2
  it('Property 2: user and loading update correctly for any value emitted by onAuthStateChanged', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.option(userArbitrary, { nil: null }),
        async (emittedUser) => {
          cleanup()
          vi.clearAllMocks()
          mockGetDocResult = { exists: () => true }

          const { getByTestId } = renderWithProvider()

          await act(async () => {
            await mockOnAuthStateChangedCallback(emittedUser)
          })

          const loadingEl = getByTestId('loading').textContent
          const userEl = getByTestId('user').textContent

          if (emittedUser === null) {
            return loadingEl === 'false' && userEl === 'null'
          } else {
            return loadingEl === 'false' && userEl === emittedUser.email
          }
        }
      ),
      { numRuns: 50 }
    )
  })
})

// ─── Property 3: isAdmin refleja Firestore ────────────────────────────────────

describe('AuthContext — Property 3', () => {
  // Feature: firebase-google-auth, Property 3: isAdmin refleja el resultado de la consulta a Firestore
  // Validates: Requirements 2.3, 2.4, 7.2, 7.3, 7.4
  it('Property 3: isAdmin=true only when Firestore doc exists; false when user=null without querying Firestore', async () => {
    const { getDoc } = await import('firebase/firestore')

    await fc.assert(
      fc.asyncProperty(
        fc.option(fc.record({ email: fc.emailAddress(), uid: fc.string({ minLength: 1 }) }), { nil: null }),
        fc.boolean(),
        async (user, docExists) => {
          cleanup()
          vi.clearAllMocks()
          mockGetDocResult = { exists: () => docExists }
          getDoc.mockResolvedValue(mockGetDocResult)

          const { getByTestId } = renderWithProvider()

          await act(async () => {
            await mockOnAuthStateChangedCallback(user)
          })

          const isAdminEl = getByTestId('isAdmin').textContent

          if (user === null) {
            // Must be false without calling Firestore
            return isAdminEl === 'false' && getDoc.mock.calls.length === 0
          } else {
            return isAdminEl === String(docExists)
          }
        }
      ),
      { numRuns: 50 }
    )
  })
})
