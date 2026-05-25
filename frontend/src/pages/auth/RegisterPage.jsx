import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({
    username: '', first_name: '', last_name: '',
    email: '', telephone: '', password: '', confirm: ''
  })
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    if (!form.username || !form.email || !form.password) return toast.error('Remplissez les champs obligatoires')
    if (form.password !== form.confirm) return toast.error('Les mots de passe ne correspondent pas')
    if (form.password.length < 8) return toast.error('Mot de passe : minimum 8 caractères')

    setLoading(true)
    try {
      const { confirm, ...payload } = form
      await authService.register(payload)
      // Connexion automatique après inscription
      const user = await login({ username: form.username, password: form.password })
      toast.success('Compte créé avec succès ! Bienvenue 🎉')
      navigate('/client')
    } catch (err) {
      const errors = err.response?.data
      if (errors) {
        const msg = Object.entries(errors).map(([k, v]) => `${k} : ${Array.isArray(v) ? v[0] : v}`).join('\n')
        toast.error(msg)
      } else {
        toast.error('Erreur lors de la création du compte')
      }
    } finally {
      setLoading(false)
    }
  }

  const strength = form.password.length === 0 ? 0
    : form.password.length < 6 ? 1
    : form.password.length < 10 ? 2 : 3

  const strengthLabel = ['', 'Faible', 'Moyen', 'Fort']
  const strengthColor = ['', 'var(--red)', 'var(--amber)', 'var(--green)']

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)', padding: 20
    }}>
      <div style={{ width: '100%', maxWidth: 460 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 44, marginBottom: 8 }}>✈️</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--gray-900)' }}>VoyageApp</h1>
          <p style={{ color: 'var(--gray-500)', marginTop: 4 }}>Créez votre compte client</p>
        </div>

        <div className="card" style={{ boxShadow: '0 8px 32px rgba(0,0,0,.08)' }}>
          <h2 style={{ fontSize: 17, fontWeight: 600, marginBottom: 20, textAlign: 'center' }}>
            Inscription
          </h2>

          <form onSubmit={submit}>
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
              <input name="username" value={form.username} onChange={handle}
                placeholder="Ex: marie_dupont" autoComplete="username" />
            </div>

            <div className="form-group">
              <label className="form-label">Email *</label>
              <input name="email" type="email" value={form.email} onChange={handle}
                placeholder="votre@email.com" />
            </div>

            <div className="form-group">
              <label className="form-label">Téléphone</label>
              <input name="telephone" value={form.telephone} onChange={handle}
                placeholder="+237 6XX XXX XXX" />
            </div>

            <div className="form-group">
              <label className="form-label">Mot de passe *</label>
              <div style={{ position: 'relative' }}>
                <input name="password" type={showPwd ? 'text' : 'password'}
                  value={form.password} onChange={handle}
                  placeholder="Minimum 8 caractères" style={{ paddingRight: 40 }} />
                <button type="button" onClick={() => setShowPwd(p => !p)}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}>
                  {showPwd ? '🙈' : '👁️'}
                </button>
              </div>
              {form.password && (
                <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ flex: 1, height: 4, background: 'var(--gray-100)', borderRadius: 99 }}>
                    <div style={{ width: `${strength * 33}%`, height: '100%',
                      background: strengthColor[strength], borderRadius: 99, transition: 'all .3s' }} />
                  </div>
                  <span style={{ fontSize: 11, color: strengthColor[strength] }}>
                    {strengthLabel[strength]}
                  </span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Confirmer le mot de passe *</label>
              <input name="confirm" type="password" value={form.confirm} onChange={handle}
                placeholder="Répétez le mot de passe" />
              {form.confirm && form.password !== form.confirm && (
                <div className="form-error">Les mots de passe ne correspondent pas</div>
              )}
            </div>

            <button type="submit" className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', height: 42, fontSize: 15 }}
              disabled={loading}>
              {loading ? 'Création du compte…' : '🚀 Créer mon compte'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--gray-500)' }}>
            Déjà un compte ?{' '}
            <Link to="/login" style={{ color: 'var(--blue)', fontWeight: 500 }}>
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
