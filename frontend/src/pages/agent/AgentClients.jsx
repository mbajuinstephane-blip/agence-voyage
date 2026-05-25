import React, { useState, useEffect } from 'react'
import { userService, reservationService } from '../../services/api'
import toast from 'react-hot-toast'

function ClientDetail({ client, reservations, onClose }) {
  const clientRes = reservations.filter(r => r.client_detail?.id === client.id)
  const totalPaye = clientRes.reduce((s, r) => s + Number(r.montant_paye), 0)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Profil client</span>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, padding: 14, background: 'var(--gray-50)', borderRadius: 10 }}>
          <div className="avatar" style={{ width: 50, height: 50, fontSize: 18, background: '#eff6ff', color: '#2563eb' }}>
            {(client.full_name || client.username || '?').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 16 }}>{client.full_name || client.username}</div>
            <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>{client.email}</div>
            <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>{client.telephone || 'Pas de téléphone'}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
          <div style={{ textAlign: 'center', background: '#eff6ff', borderRadius: 8, padding: 12 }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#2563eb' }}>{clientRes.length}</div>
            <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>Réservations</div>
          </div>
          <div style={{ textAlign: 'center', background: '#f0fdf4', borderRadius: 8, padding: 12 }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#16a34a' }}>
              {clientRes.filter(r => r.statut === 'confirme').length}
            </div>
            <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>Confirmées</div>
          </div>
          <div style={{ textAlign: 'center', background: '#f5f3ff', borderRadius: 8, padding: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#7c3aed' }}>
              {totalPaye.toLocaleString('fr-FR')} F
            </div>
            <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>Total payé</div>
          </div>
        </div>

        {clientRes.length > 0 && (
          <>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>Historique des réservations</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {clientRes.map(r => (
                <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', border: '1px solid var(--gray-100)', borderRadius: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{r.voyage_detail?.titre || '—'}</div>
                    <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>
                      {r.numero} · Départ {r.voyage_detail?.date_depart}
                    </div>
                  </div>
                  <span className={`badge ${r.statut === 'confirme' ? 'badge-success' : r.statut === 'annule' ? 'badge-danger' : 'badge-warning'}`}>
                    {r.statut === 'confirme' ? 'Confirmé' : r.statut === 'annule' ? 'Annulé' : 'En attente'}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
          <button className="btn btn-secondary" onClick={onClose}>Fermer</button>
        </div>
      </div>
    </div>
  )
}

export default function AgentClients() {
  const [clients, setClients] = useState([])
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    Promise.all([userService.list(), reservationService.list()])
      .then(([u, r]) => {
        const allUsers = u.data.results || u.data
        setClients(allUsers.filter(u => u.role === 'client'))
        setReservations(r.data.results || r.data)
      })
      .catch(() => toast.error('Erreur de chargement'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = clients.filter(c => {
    const q = search.toLowerCase()
    return !q ||
      c.full_name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.telephone?.includes(q)
  })

  const getClientStats = (clientId) => {
    const res = reservations.filter(r => r.client_detail?.id === clientId)
    return { total: res.length, confirme: res.filter(r => r.statut === 'confirme').length }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Clients</h1>
        <p>Liste de vos clients et leur historique</p>
      </div>

      <div style={{ marginBottom: 20 }}>
        <input placeholder="🔍 Rechercher par nom, email, téléphone…"
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">Aucun client trouvé</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {filtered.map(c => {
            const stats = getClientStats(c.id)
            return (
              <div key={c.id} className="card" style={{ cursor: 'pointer' }} onClick={() => setSelected(c)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <div className="avatar" style={{ width: 44, height: 44, fontSize: 16, background: '#eff6ff', color: '#2563eb' }}>
                    {(c.full_name || c.username || '?').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.full_name || c.username}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--gray-400)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.email}
                    </div>
                  </div>
                  <span className={`badge ${c.is_active ? 'badge-success' : 'badge-danger'}`}>
                    {c.is_active ? 'Actif' : 'Inactif'}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div style={{ background: 'var(--gray-50)', borderRadius: 6, padding: '8px 10px', textAlign: 'center' }}>
                    <div style={{ fontWeight: 700, color: '#2563eb' }}>{stats.total}</div>
                    <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>Réservations</div>
                  </div>
                  <div style={{ background: 'var(--gray-50)', borderRadius: 6, padding: '8px 10px', textAlign: 'center' }}>
                    <div style={{ fontWeight: 700, color: '#16a34a' }}>{stats.confirme}</div>
                    <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>Confirmées</div>
                  </div>
                </div>
                {c.telephone && (
                  <div style={{ marginTop: 10, fontSize: 12, color: 'var(--gray-400)' }}>
                    📞 {c.telephone}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {selected && (
        <ClientDetail
          client={selected}
          reservations={reservations}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}
