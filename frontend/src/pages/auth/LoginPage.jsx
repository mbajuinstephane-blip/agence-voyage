import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [form, setForm]       = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    if (!form.username || !form.password) return toast.error('Remplissez tous les champs')
    setLoading(true)
    try {
      const user = await login(form)
      toast.success(`Bienvenue, ${user.full_name || user.username} !`)
      // Redirection selon le rôle
      const routes = { admin: '/admin', agent: '/agent', client: '/client' }
      navigate(routes[user.role] || '/client')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Identifiants incorrects')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #ffefef 0%, #fdf0f8 100%)', padding: 20
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>✈️</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--gray-900)' }}>VoyageApp</h1>
          <p style={{ color: 'var(--gray-500)', marginTop: 4 }}>Agence de voyage en ligne</p>
        </div>

        <div className="card" style={{ boxShadow: '0 8px 32px rgba(0,0,0,.08)' }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, textAlign: 'center' }}>
            Connexion
          </h2>

          <form onSubmit={submit}>
            <div className="form-group">
              <label className="form-label">Nom d'utilisateur</label>
              <input
                name="username" value={form.username} onChange={handle}
                placeholder="Votre username" autoComplete="username" autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">Mot de passe</label>
              <div style={{ position: 'relative' }}>
                <input
                  name="password" type={showPwd ? 'text' : 'password'}
                  value={form.password} onChange={handle}
                  placeholder="••••••••" autoComplete="current-password"
                  style={{ paddingRight: 40 }}
                />
                <button type="button" onClick={() => setShowPwd(p => !p)}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--gray-400)' }}>
                  {showPwd ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', height: 42, fontSize: 15 }}
              disabled={loading}>
              {loading ? 'Connexion…' : '🔐 Se connecter'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--gray-500)' }}>
            Pas encore de compte ?{' '}
            <Link to="/register" style={{ color: 'var(--blue)', fontWeight: 500 }}>
              Créer un compte
            </Link>
          </div>
        </div>

        {/* Comptes de démo */}
        <div style={{ marginTop: 20, padding: 14, background: 'white', borderRadius: 10,
          border: '1px solid var(--gray-200)', fontSize: 12 }}>
          <div style={{ fontWeight: 600, marginBottom: 8, color: 'var(--gray-600)' }}>
            🧪 Comptes de démonstration
          </div>
          {[
            { role: 'Admin',  user: 'admin',  pwd: 'admin123' },
            { role: 'Agent',  user: 'agent1', pwd: 'agent123' },
            { role: 'Client', user: 'client1',pwd: 'client123' },
          ].map(c => (
            <div key={c.role} style={{ display: 'flex', justifyContent: 'space-between',
              padding: '5px 0', borderBottom: '1px solid var(--gray-100)', color: 'var(--gray-500)' }}>
              <span style={{ fontWeight: 500 }}>{c.role}</span>
              <span>
                <button style={{ background: 'none', border: 'none', color: 'var(--blue)', cursor: 'pointer', fontSize: 12 }}
                  onClick={() => setForm({ username: c.user, password: c.pwd })}>
                  Utiliser
                </button>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
