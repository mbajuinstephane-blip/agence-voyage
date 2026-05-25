import React, { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Au démarrage, vérifie si un token est déjà en localStorage
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      authService.getMe()
        .then(({ data }) => setUser(data))
        .catch(() => localStorage.clear())
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (credentials) => {
    const { data } = await authService.login(credentials)
    localStorage.setItem('access_token', data.access)
    localStorage.setItem('refresh_token', data.refresh)
    setUser(data.user)
    return data.user
  }

  const logout = () => {
    localStorage.clear()
    setUser(null)
  }

  const updateUser = (newData) => setUser(prev => ({ ...prev, ...newData }))

  // Helpers de rôle accessibles partout dans l'app
  const isAdmin = user?.role === 'admin'
  const isAgent = user?.role === 'agent'
  const isClient = user?.role === 'client'

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, isAdmin, isAgent, isClient, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook personnalisé — s'utilise ainsi dans n'importe quel composant :
// const { user, isAdmin, login, logout } = useAuth()
export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être utilisé dans AuthProvider')
  return ctx
}
