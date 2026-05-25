import React, { useState, useEffect } from 'react'
import { userService } from '../../services/api'
import toast from 'react-hot-toast'

const ROLE_CONFIG = {
  admin: { label: 'Administrateur', class: 'badge-danger' },
  agent: { label: 'Agent', class: 'badge-info' },
  client: { label: 'Client', class: 'badge-warning' },
}

const INITIALS = (u) => {
  const f = u.first_name?.[0] || ''
  const l = u.last_name?.[0] || ''
  return (f + l).toUpperCase() || u.username?.[0]?.toUpperCase() || '?'
}

const AV_COLORS = {
  admin: { bg: '#fef2f2', color: '#dc2626' },
  agent: { bg: '#eff6ff', color: '#2563eb' },
  client: { bg: '#f0fdf4', color: '#16a34a' },
}

// Formulaire modal (création / édition)
function UserModal({ user, onClose, onSave }) {
  const [form, setForm] = useState({
    username: user?.username || '',
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    role: user?.role || 'client',
    telephone: user?.telephone || '',
    is_active: user?.is_active ?? true,
    password: '',
  })
  const [saving, setSaving] = useState(false)

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  const submit = async () => {
    if (!form.username || !form.email) return toast.error('Username et email requis')
    if (!user && !form.password) return toast.error('Le mot de passe est requis')
    setSaving(true)
    try {
      const payload = { ...form }
      if (!payload.password) delete payload.password
      if (user) await userService.update(user.id, payload)
      else await userService.create(payload)
      toast.success(user ? 'Utilisateur mis à jour' : 'Utilisateur créé')
      onSave()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{user ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}</span>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Prénom</label>
            <input name="first_name" value={form.first_name} onChange={handle} placeholder="Prénom" />
          </div>
          <div className="form-group">
            <label className="form-label">Nom</label>
            <input name="last_name" value={form.last_name} onChange={handle} placeholder="Nom" />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Nom d'utilisateur *</label>
          <input name="username" value={form.username} onChange={handle} placeholder="username" />
        </div>
        <div className="form-group">
          <label className="form-label">Email *</label>
          <input name="email" type="email" value={form.email} onChange={handle} placeholder="email@exemple.com" />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Rôle</label>
            <select name="role" value={form.role} onChange={handle}>
              <option value="admin">Administrateur</option>
              <option value="agent">Agent de voyage</option>
              <option value="client">Client</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Téléphone</label>
            <input name="telephone" value={form.telephone} onChange={handle} placeholder="+237 6XX XXX XXX" />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">{user ? 'Nouveau mot de passe (laisser vide = inchangé)' : 'Mot de passe *'}</label>
          <input name="password" type="password" value={form.password} onChange={handle} placeholder="••••••••" />
        </div>
        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input name="is_active" type="checkbox" checked={form.is_active} onChange={handle} style={{ width: 'auto' }} id="is_active" />
          <label htmlFor="is_active" className="form-label" style={{ margin: 0 }}>Compte actif</label>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
          <button className="btn btn-secondary" onClick={onClose}>Annuler</button>
          <button className="btn btn-primary" onClick={submit} disabled={saving}>
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [modal, setModal] = useState(null) // null | 'create' | user_object
  const [deleting, setDeleting] = useState(null)

  const fetchUsers = () => {
    setLoading(true)
    userService.list()
      .then(({ data }) => setUsers(data.results || data))
      .catch(() => toast.error('Impossible de charger les utilisateurs'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchUsers() }, [])

  const filtered = users.filter(u => {
    const q = search.toLowerCase()
    const matchSearch = !q || u.username?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) ||
      u.first_name?.toLowerCase().includes(q) || u.last_name?.toLowerCase().includes(q)
    const matchRole = !roleFilter || u.role === roleFilter
    return matchSearch && matchRole
  })

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cet utilisateur ?')) return
    setDeleting(id)
    try {
      await userService.delete(id)
      toast.success('Utilisateur supprimé')
      fetchUsers()
    } catch {
      toast.error('Erreur lors de la suppression')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Gestion des utilisateurs</h1>
        <p>Créez, modifiez et gérez les comptes et leurs rôles</p>
      </div>

      {/* Barre de recherche */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <input
          style={{ flex: 1 }}
          placeholder="🔍 Rechercher par nom, email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select style={{ width: 180 }} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="">Tous les rôles</option>
          <option value="admin">Administrateur</option>
          <option value="agent">Agent</option>
          <option value="client">Client</option>
        </select>
        <button className="btn btn-primary" onClick={() => setModal('create')}>
          + Nouvel utilisateur
        </button>
      </div>

      {/* Tableau */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between' }}>
          <span className="card-title">Utilisateurs</span>
          <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>{filtered.length} résultat{filtered.length > 1 ? 's' : ''}</span>
        </div>

        {loading ? (
          <div style={{ padding: 40, display: 'flex', justifyContent: 'center' }}>
            <div className="spinner" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">Aucun utilisateur trouvé</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>Téléphone</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => {
                const av = AV_COLORS[u.role] || AV_COLORS.client
                return (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="avatar" style={{ background: av.bg, color: av.color }}>
                          {INITIALS(u)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500 }}>{u.full_name || u.username}</div>
                          <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>@{u.username}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: 'var(--gray-500)' }}>{u.email}</td>
                    <td>
                      <span className={`badge ${ROLE_CONFIG[u.role]?.class}`}>
                        {ROLE_CONFIG[u.role]?.label}
                      </span>
                    </td>
                    <td style={{ color: 'var(--gray-500)', fontSize: 12 }}>{u.telephone || '—'}</td>
                    <td>
                      <span className={`badge ${u.is_active ? 'badge-success' : 'badge-danger'}`}>
                        {u.is_active ? 'Actif' : 'Suspendu'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => setModal(u)}>
                          ✏️ Modifier
                        </button>
                        <button
                          className="btn btn-sm"
                          style={{ background: 'var(--red-light)', color: 'var(--red)', border: 'none' }}
                          onClick={() => handleDelete(u.id)}
                          disabled={deleting === u.id}
                        >
                          {deleting === u.id ? '…' : '🗑️'}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <UserModal
          user={modal === 'create' ? null : modal}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); fetchUsers() }}
        />
      )}
    </div>
  )
}
