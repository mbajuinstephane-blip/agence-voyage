import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { authService } from '../../services/api'
import toast from 'react-hot-toast'

export default function ClientProfile() {
  const { user, updateUser } = useAuth()

  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name:  user?.last_name  || '',
    email:      user?.email      || '',
    telephone:  user?.telephone  || '',
    adresse:    user?.adresse    || '',
  })
  const [passwords, setPasswords] = useState({ current: '', new1: '', new2: '' })
  const [saving, setSaving]       = useState(false)
  const [savingPwd, setSavingPwd] = useState(false)

  const handle    = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  const handlePwd = e => setPasswords(p => ({ ...p, [e.target.name]: e.target.value }))

  const saveProfile = async () => {
    setSaving(true)
    try {
      const { data } = await authService.updateMe(form)
      updateUser(data)
      toast.success('Profil mis à jour ✓')
    } catch {
      toast.error('Erreur lors de la mise à jour')
    } finally {
      setSaving(false)
    }
  }

  const savePassword = async () => {
    if (!passwords.new1) return toast.error('Entrez un nouveau mot de passe')
    if (passwords.new1 !== passwords.new2) return toast.error('Les mots de passe ne correspondent pas')
    if (passwords.new1.length < 8) return toast.error('Minimum 8 caractères')
    setSavingPwd(true)
    try {
      await authService.updateMe({ password: passwords.new1 })
      toast.success('Mot de passe modifié ✓')
      setPasswords({ current: '', new1: '', new2: '' })
    } catch {
      toast.error('Erreur lors du changement de mot de passe')
    } finally {
      setSavingPwd(false)
    }
  }

  const initials = `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`.toUpperCase()
    || user?.username?.[0]?.toUpperCase() || '?'

  return (
    <div style={{ maxWidth: 600 }}>
      <div className="page-header">
        <h1>Mon profil</h1>
        <p>Gérez vos informations personnelles</p>
      </div>

      {/* Avatar + nom */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: '#eff6ff', color: '#2563eb',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, fontWeight: 700, flexShrink: 0
          }}>
            {initials}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18 }}>
              {user?.first_name || ''} {user?.last_name || user?.username}
            </div>
            <div style={{ fontSize: 13, color: 'var(--gray-400)', marginTop: 2 }}>{user?.email}</div>
            <span className="badge badge-warning" style={{ marginTop: 6 }}>Client</span>
          </div>
        </div>
      </div>

      {/* Informations personnelles */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <span className="card-title">👤 Informations personnelles</span>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Prénom</label>
            <input name="first_name" value={form.first_name} onChange={handle} placeholder="Votre prénom" />
          </div>
          <div className="form-group">
            <label className="form-label">Nom</label>
            <input name="last_name" value={form.last_name} onChange={handle} placeholder="Votre nom" />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Email</label>
          <input name="email" type="email" value={form.email} onChange={handle} placeholder="email@exemple.com" />
        </div>

        <div className="form-group">
          <label className="form-label">Téléphone</label>
          <input name="telephone" value={form.telephone} onChange={handle} placeholder="+237 6XX XXX XXX" />
        </div>

        <div className="form-group">
          <label className="form-label">Adresse</label>
          <textarea name="adresse" value={form.adresse} onChange={handle} rows={3}
            placeholder="Votre adresse complète…" style={{ resize: 'vertical' }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary" onClick={saveProfile} disabled={saving}>
            {saving ? 'Enregistrement…' : '💾 Enregistrer'}
          </button>
        </div>
      </div>

      {/* Changer le mot de passe */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">🔒 Changer le mot de passe</span>
        </div>

        <div className="form-group">
          <label className="form-label">Nouveau mot de passe</label>
          <input name="new1" type="password" value={passwords.new1} onChange={handlePwd}
            placeholder="Minimum 8 caractères" />
        </div>

        <div className="form-group">
          <label className="form-label">Confirmer le nouveau mot de passe</label>
          <input name="new2" type="password" value={passwords.new2} onChange={handlePwd}
            placeholder="Répétez le mot de passe" />
          {passwords.new1 && passwords.new2 && passwords.new1 !== passwords.new2 && (
            <div className="form-error">Les mots de passe ne correspondent pas</div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary" onClick={savePassword} disabled={savingPwd}>
            {savingPwd ? 'Modification…' : '🔑 Modifier le mot de passe'}
          </button>
        </div>
      </div>
    </div>
  )
}
