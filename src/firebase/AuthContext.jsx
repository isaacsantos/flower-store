import { createContext, useContext, useEffect, useState } from 'react'
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { auth } from './firebaseConfig.js'

const AuthContext = createContext(null)

async function checkIsAdmin(firebaseUser) {
  try {
    // Read claims from the current token (no force-refresh here to avoid loops)
    const tokenResult = await firebaseUser.getIdTokenResult()
    const roles = tokenResult.claims?.roles ?? []
    return Array.isArray(roles)
      ? roles.includes('ADMIN')
      : roles === 'ADMIN'
  } catch (err) {
    console.error('Admin claim check failed:', err)
    return false
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)

      if (firebaseUser) {
        const adminStatus = await checkIsAdmin(firebaseUser)
        setIsAdmin(adminStatus)
      } else {
        setIsAdmin(false)
      }

      setLoading(false)
    })

    return unsubscribe
  }, [])

  async function signInWithGoogle() {
    const provider = new GoogleAuthProvider()
    const result = await signInWithPopup(auth, provider)
    // Force-refresh once after login so custom claims are in the token
    // before onAuthStateChanged reads them
    await result.user.getIdToken(true)
  }

  async function logout() {
    await signOut(auth)
  }

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
