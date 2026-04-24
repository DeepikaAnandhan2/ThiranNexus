import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedToken = localStorage.getItem('tn_token')
    const savedUser = localStorage.getItem('tn_user')

    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))

      // ✅ Set axios header on refresh
      axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`
    }

    setLoading(false)
  }, [])

  const login = (authToken, userData) => {
    setToken(authToken)
    setUser(userData)

    // ✅ KEEP YOUR ORIGINAL STORAGE
    localStorage.setItem('tn_token', authToken)
    localStorage.setItem('tn_user', JSON.stringify(userData))

    // ✅ ADD THIS (IMPORTANT FIX)
    localStorage.setItem('token', authToken)   // 🔥 FIX FOR SCHEMES

    // ✅ Set axios header immediately
    axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`
  }

  const logout = () => {
    setUser(null)
    setToken(null)

    // ✅ REMOVE BOTH KEYS
    localStorage.removeItem('tn_token')
    localStorage.removeItem('tn_user')
    localStorage.removeItem('token')   // 🔥 cleanup

    delete axios.defaults.headers.common['Authorization']
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, isAuthenticated: !!token, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}