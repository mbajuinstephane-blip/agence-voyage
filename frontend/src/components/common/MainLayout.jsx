import React, { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const navByRole = {
  admin: [
    { to: '/admin', label: 'Tableau de bord', icon: '📊', end: true },
    { to: '/admin/users', label: 'Utilisateurs', icon: '👥' },
    { to: '/admin/destinations', label: 'Destinations', icon: '🗺️' },
    { to: '/admin/voyages', label: 'Voyages', icon: '✈️' },
    { to: '/admin/reservations', label: 'Réservations', icon: '📋' },
  ],
  agent: [
    { to: '/agent', label: 'Tableau de bord', icon: '📊', end: true },
    { to: '/agent/reservations', label: 'Réservations', icon: '📋' },
    { to: '/agent/clients', label: 'Clients', icon: '👥' },
  ],
  client: [
    { to: '/client', label: 'Rechercher', icon: '🔍', end: true },
    { to: '/client/reservations', label: 'Mes réservations', icon: '📋' },
    { to: '/client/profile', label: 'Mon profil', icon: '👤' },
  ],
}

const roleLabels = { admin: 'Administrateur', agent: 'Agent de voyage', client: 'Client' }
const roleColors = { admin: '#dc2626', agent: '#2563eb', client: '#16a34a' }

export default function MainLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const navItems = navByRole[user?.role] || []

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initials = user
    ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() || user.username?.[0]?.toUpperCase()
    : '?'

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* ── Sidebar ── */}
      <aside style={{
        width: 220, flexShrink: 0,
        background: 'white', borderRight: '1px solid #e5e7eb',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 16px', borderBottom: '1px solid #f3f4f6' }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: '#1f2937', display: 'flex', alignItems: 'center', gap: 8 }}>
            ✈️ VoyageApp
          </div>
          <div style={{
            marginTop: 8, fontSize: 11, fontWeight: 600, padding: '2px 8px',
            borderRadius: 20, display: 'inline-block',
            background: roleColors[user?.role] + '15',
            color: roleColors[user?.role]
          }}>
            {roleLabels[user?.role]}
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} end={item.end}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 8,
                marginBottom: 2, fontSize: 14, fontWeight: 500,
                color: isActive ? '#2563eb' : '#6b7280',
                background: isActive ? '#eff6ff' : 'transparent',
                transition: 'all .15s',
                textDecoration: 'none'
              })}
            >
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid #f3f4f6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div className="avatar">{initials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.full_name || user?.username}
              </div>
              <div style={{ fontSize: 11, color: '#9ca3af' }}>{user?.email}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
            🚪 Déconnexion
          </button>
        </div>
      </aside>

      {/* ── Contenu principal ── */}
      <main style={{ flex: 1, overflowY: 'auto', background: '#f9fafb' }}>
        <div style={{ padding: 28, maxWidth: 1200, margin: '0 auto' }}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
