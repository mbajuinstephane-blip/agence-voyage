import React, { useState, useEffect } from 'react'
import { reservationService } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

const STATUT = {
  en_attente: { label: 'En attente', cls: 'badge-warning' },
  confirme:   { label: 'Confirmé',   cls: 'badge-success' },
  en_cours:   { label: 'En cours',   cls: 'badge-info'    },
  termine:    { label: 'Terminé',    cls: 'badge-gray'    },
  annule:     { label: 'Annulé',     cls: 'badge-danger'  },
}

export default function AgentDashboard() {
  const { user } = useAuth()
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    reservationService.list()
      .then(({ data }) => setReservations(data.results || data))
      .catch(() => toast.error('Erreur de chargement'))
      .finally(() => setLoading(false))
  }, [])

  const enAttente  = reservations.filter(r => r.statut === 'en_attente')
  const confirmees = reservations.filter(r => r.statut === 'confirme')
  const clients    = [...new Set(reservations.map(r => r.client_detail?.id))].length

  const handleConfirmer = async (id) => {
    try {
      await reservationService.confirmer(id)
      toast.success('Réservation confirmée')
      setReservations(prev => prev.map(r => r.id === id ? { ...r, statut: 'confirme' } : r))
    } catch {
      toast.error('Erreur lors de la confirmation')
    }
  }

  const prenom = user?.first_name || user?.username || 'Agent'

  return (
    <div>
      <div className="page-header">
        <h1>Bonjour, {prenom} 👋</h1>
        <p>Voici un aperçu de votre activité du jour</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {[
          { label: 'Mes réservations', value: reservations.length, icon: '📋', color: '#2563eb', bg: '#eff6ff' },
          { label: 'En attente',       value: enAttente.length,    icon: '⏳', color: '#d97706', bg: '#fffbeb' },
          { label: 'Confirmées',       value: confirmees.length,   icon: '✅', color: '#16a34a', bg: '#f0fdf4' },
          { label: 'Clients gérés',    value: clients,             icon: '👥', color: '#7c3aed', bg: '#f5f3ff' },
        ].map(s => (
          <div className="stat-card" key={s.label} style={{ borderLeft: `3px solid ${s.color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div className="stat-label">{s.label}</div>
                <div className="stat-value">{loading ? '…' : s.value}</div>
              </div>
              <span style={{ fontSize: 24, background: s.bg, padding: '6px 8px', borderRadius: 8 }}>{s.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Réservations à traiter en priorité */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">⏳ À traiter en priorité</span>
          <Link to="/agent/reservations" style={{ fontSize: 12, color: 'var(--blue)' }}>Voir tout →</Link>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 30 }}><div className="spinner" /></div>
        ) : enAttente.length === 0 ? (
          <div className="empty-state" style={{ padding: 30 }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🎉</div>
            Aucune réservation en attente. Bon travail !
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {enAttente.slice(0, 5).map(r => (
              <div key={r.id} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '12px 0', borderBottom: '1px solid var(--gray-100)'
              }}>
                <div className="avatar" style={{ background: '#eff6ff', color: '#2563eb' }}>
                  {(r.client_detail?.full_name || '?').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500 }}>{r.client_detail?.full_name || '—'}</div>
                  <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>
                    {r.voyage_detail?.titre || '—'} · Départ {r.voyage_detail?.date_depart}
                  </div>
                </div>
                <div style={{ textAlign: 'right', marginRight: 12 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>
                    {Number(r.prix_total).toLocaleString('fr-FR')} F
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{r.nb_personnes} pers.</div>
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => handleConfirmer(r.id)}>
                  ✅ Confirmer
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dernières activités */}
      {reservations.length > 0 && (
        <div className="card" style={{ marginTop: 20 }}>
          <div className="card-header">
            <span className="card-title">Activité récente</span>
          </div>
          <table>
            <thead>
              <tr><th>N°</th><th>Client</th><th>Voyage</th><th>Montant</th><th>Statut</th></tr>
            </thead>
            <tbody>
              {reservations.slice(0, 6).map(r => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 600, color: 'var(--blue)', fontSize: 12 }}>{r.numero}</td>
                  <td>{r.client_detail?.full_name || '—'}</td>
                  <td style={{ color: 'var(--gray-500)', fontSize: 12 }}>{r.voyage_detail?.titre || '—'}</td>
                  <td style={{ fontWeight: 500, fontSize: 13 }}>
                    {Number(r.prix_total).toLocaleString('fr-FR')} F
                  </td>
                  <td>
                    <span className={`badge ${STATUT[r.statut]?.cls}`}>{STATUT[r.statut]?.label}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
