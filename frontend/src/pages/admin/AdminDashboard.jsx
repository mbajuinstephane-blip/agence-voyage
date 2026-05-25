import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { reservationService } from '../../services/api'
import toast from 'react-hot-toast'

const STAT_CARDS = [
  { label: 'Réservations ce mois', value: '—', key: 'total', color: '#2563eb', bg: '#eff6ff', icon: '📋' },
  { label: 'Chiffre d\'affaires', value: '—', key: 'ca_total', color: '#16a34a', bg: '#f0fdf4', icon: '💰', format: 'fcfa' },
  { label: 'En attente', value: '—', key: 'en_attente', color: '#d97706', bg: '#fffbeb', icon: '⏳' },
  { label: 'Confirmées', value: '—', key: 'confirmees', color: '#7c3aed', bg: '#f5f3ff', icon: '✅' },
]

const RECENT_RESERVATIONS = [
  { numero: '#R001', client: 'Marie paule', voyage: 'Paris 7j', statut: 'confirme', montant: '850 000' },
  { numero: '#R002', client: 'Marie paule', voyage: 'Dubaï 10j', statut: 'confirme', montant: '1 200 000' },
  { numero: '#R003', client: 'arthur billions', voyage: 'Londres 6j', statut: 'en_cours', montant: '750 000' },
  { numero: '#R004', client: 'Ange lucy', voyage: 'Istanbul 8j', statut: 'annule', montant: '900 000' },
]

const TOP_DESTINATIONS = [
  { nom: 'Paris, France', reservations: 28, prix: '850 000 F', icon: '🗼' },
  { nom: 'Dubaï, EAU', reservations: 22, prix: '1 200 000 F', icon: '🏙️' },
  { nom: 'Istanbul, Turquie', reservations: 17, prix: '900 000 F', icon: '🕌' },
  { nom: 'Londres, UK', reservations: 12, prix: '750 000 F', icon: '🎡' },
]

const STATUT_CONFIG = {
  confirme: { label: 'Confirmé', class: 'badge-success' },
  en_attente: { label: 'En attente', class: 'badge-warning' },
  en_cours: { label: 'En cours', class: 'badge-info' },
  annule: { label: 'Annulé', class: 'badge-danger' },
}

// Graphique en barres simple (SVG)
function BarChart({ data }) {
  const max = Math.max(...data.map(d => d.value), 1)
  const mois = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 100, padding: '8px 0' }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          {d.value > 0 && <span style={{ fontSize: 10, color: 'var(--gray-400)' }}>{d.value}</span>}
          <div style={{
            width: '100%',
            height: d.value ? `${Math.round(d.value / max * 80)}px` : 4,
            background: d.value ? '#2563eb' : 'var(--gray-100)',
            borderRadius: 4,
            minHeight: 4,
            transition: 'height .3s'
          }} />
          <span style={{ fontSize: 10, color: 'var(--gray-400)' }}>{mois[i]}</span>
        </div>
      ))}
    </div>
  )
}

const CHART_DATA = [
  { value: 30 }, { value: 45 }, { value: 38 }, { value: 52 },
  { value: 60 }, { value: 70 }, { value: 142 }, { value: 0 },
  { value: 0 }, { value: 0 }, { value: 0 }, { value: 0 },
]

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    reservationService.dashboardStats()
      .then(({ data }) => setStats(data))
      .catch(() => toast.error('Erreur de chargement des statistiques'))
      .finally(() => setLoading(false))
  }, [])

  const formatVal = (key, val) => {
    if (!val && val !== 0) return '—'
    if (key === 'ca_total') return `${Number(val).toLocaleString('fr-FR')} F`
    return val
  }

  return (
    <div>
      <div className="page-header">
        <h1>Tableau de bord</h1>
        <p>Vue d'ensemble de l'activité de l'agence</p>
      </div>

      {/* Statistiques */}
      <div className="stats-grid">
        {STAT_CARDS.map(card => (
          <div className="stat-card" key={card.key} style={{ borderLeft: `3px solid ${card.color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div className="stat-label">{card.label}</div>
                <div className="stat-value">
                  {loading ? '…' : formatVal(card.key, stats?.[card.key] ?? card.value)}
                </div>
              </div>
              <span style={{ fontSize: 24, background: card.bg, padding: '6px 8px', borderRadius: 8 }}>
                {card.icon}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Dernières réservations */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Dernières réservations</span>
            <Link to="/admin/reservations" style={{ fontSize: 12, color: 'var(--blue)' }}>Voir tout →</Link>
          </div>
          <table>
            <thead>
              <tr>
                <th>N°</th><th>Client</th><th>Voyage</th><th>Statut</th><th>Montant</th>
              </tr>
            </thead>
            <tbody>
              {RECENT_RESERVATIONS.map(r => (
                <tr key={r.numero}>
                  <td style={{ fontWeight: 500, color: 'var(--blue)', fontSize: 12 }}>{r.numero}</td>
                  <td>{r.client}</td>
                  <td style={{ color: 'var(--gray-500)' }}>{r.voyage}</td>
                  <td><span className={`badge ${STATUT_CONFIG[r.statut]?.class}`}>{STATUT_CONFIG[r.statut]?.label}</span></td>
                  <td style={{ fontWeight: 500, fontSize: 12 }}>{r.montant} F</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Destinations populaires */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Destinations populaires</span>
            <Link to="/admin/destinations" style={{ fontSize: 12, color: 'var(--blue)' }}>Gérer →</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {TOP_DESTINATIONS.map((d, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 10px', background: 'var(--gray-50)', borderRadius: 8 }}>
                <span style={{ fontSize: 22 }}>{d.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: 13 }}>{d.nom}</div>
                  <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{d.reservations} réservations</div>
                </div>
                <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--blue)' }}>{d.prix}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Graphique réservations par mois */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Réservations par mois — 2026</span>
          <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>Total : 437</span>
        </div>
        <BarChart data={CHART_DATA} />
      </div>
    </div>
  )
}
