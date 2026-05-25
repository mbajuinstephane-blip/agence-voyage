import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'

// Layouts
import MainLayout from './components/common/MainLayout'

// Pages Auth
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

// Pages Admin
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminVoyages from './pages/admin/AdminVoyages'
import AdminDestinations from './pages/admin/AdminDestinations'
import AdminReservations from './pages/admin/AdminReservations'

// Pages Agent
import AgentDashboard from './pages/agent/AgentDashboard'
import AgentReservations from './pages/agent/AgentReservations'
import AgentClients from './pages/agent/AgentClients'

// Pages Client
import ClientSearch from './pages/client/ClientSearch'
import ClientReservations from './pages/client/ClientReservations'
import ClientProfile from './pages/client/ClientProfile'

// ─── Composant de protection des routes ──────────────────────────────────────
function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()

  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'100vh' }}>
      <div className="spinner" />
    </div>
  )

  if (!user) return <Navigate to="/login" replace />

  if (roles && !roles.includes(user.role)) {
    // Redirige vers le bon dashboard selon le rôle
    const redirects = { admin: '/admin', agent: '/agent', client: '/client' }
    return <Navigate to={redirects[user.role] || '/login'} replace />
  }

  return children
}

function AppRoutes() {
  const { user } = useAuth()

  return (
    <Routes>
      {/* Routes publiques */}
      <Route path="/login" element={user ? <Navigate to={`/${user.role}`} /> : <LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Routes Admin */}
      <Route path="/admin" element={
        <ProtectedRoute roles={['admin']}>
          <MainLayout />
        </ProtectedRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="voyages" element={<AdminVoyages />} />
        <Route path="destinations" element={<AdminDestinations />} />
        <Route path="reservations" element={<AdminReservations />} />
      </Route>

      {/* Routes Agent */}
      <Route path="/agent" element={
        <ProtectedRoute roles={['agent', 'admin']}>
          <MainLayout />
        </ProtectedRoute>
      }>
        <Route index element={<AgentDashboard />} />
        <Route path="reservations" element={<AgentReservations />} />
        <Route path="clients" element={<AgentClients />} />
      </Route>

      {/* Routes Client */}
      <Route path="/client" element={
        <ProtectedRoute roles={['client']}>
          <MainLayout />
        </ProtectedRoute>
      }>
        <Route index element={<ClientSearch />} />
        <Route path="reservations" element={<ClientReservations />} />
        <Route path="profile" element={<ClientProfile />} />
      </Route>

      {/* Redirection par défaut */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster position="top-right" />
      </BrowserRouter>
    </AuthProvider>
  )
}
