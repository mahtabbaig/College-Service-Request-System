import React, { createContext, useContext, useEffect, useState } from 'react'
import { loginRequest, meRequest } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('csr_user')
    return raw ? JSON.parse(raw) : null
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('csr_token')
    if (!token) {
      setLoading(false)
      return
    }
    meRequest()
      .then((res) => {
        setUser(res.data)
        localStorage.setItem('csr_user', JSON.stringify(res.data))
      })
      .catch(() => {
        localStorage.removeItem('csr_token')
        localStorage.removeItem('csr_user')
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, password, role) => {

  const res = await loginRequest(email, password, role)

  localStorage.setItem('csr_token', res.data.access_token)
  localStorage.setItem('csr_user', JSON.stringify(res.data.user))
  setUser(res.data.user)

  return res.data.user
}

  const logout = () => {
    localStorage.removeItem('csr_token')
    localStorage.removeItem('csr_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

export function homeRouteForRole(role) {
  switch (role) {
    case 'ADMIN': return '/admin/dashboard'
    case 'SERVICE_LEAD': return '/lead/dashboard'
    case 'SERVICE_STAFF': return '/staff/dashboard'
    default: return '/dashboard'
  }
}
