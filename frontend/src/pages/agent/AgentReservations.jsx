import React, { useState, useEffect } from 'react'
import { reservationService } from '../../services/api'
import toast from 'react-hot-toast'

const STATUT = {
  en_attente: { label: 'En attente', cls: 'badge-warning' },
  confirme:   { label: 'Confirmé',   cls: 'badge-success' },
  en_cours:   { label: 'En cours',   cls: 'badge-info'    },
  termine:    { label: 'Terminé',    cls: 'badge-gray'    },
  annule:     { label: 'Annulé',     cls: 'badge-danger'  },
}

const PAIEMENT = {
  non_paye:  { label: 'Non payé',  cls: 'badge-danger'  },
  partiel:   { label: 'Partiel',   cls: 'badge-warning' },
  complet:   { label: 'Complet',   cls: 'badge-success' },
  rembourse: { label: 'Remboursé', cls: 'badge-gray'    },
}

function ActionModal({ res, onClose, onRefresh }) {
  const [montant, setMontant] = useState('')
  const [loading, setLoading] = useState(false)

  const run = async (fn, msg) => {
    setLoading(true)
    try { await fn(); toast.success(msg); onRefresh(); onClose() }
    catch { toast.error('Une erreur est survenue') }
    finally { setLoading(false) }
  }

  const restant = Number(res.prix_total) - Number(res.montant_paye)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Réservation {res.numero}</span>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>

        <div style={{ background: 'var(--gray-50)', borderRadius: 8, padding: 14, marginBottom: 16 }}>
          <div style={{ fontWeight: 600, marginBottom: 2 }}>{res.client_detail?.full_name}</div>
          <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>{res.client_detail?.email} · {res.client_detail?.telephone}</div>
          <div style={{ marginTop: 8, fontSize: 13 }}>
            ✈️ <strong>{res.voyage_detail?.titre}</strong><br />
            <span style={{ color: 'var(--gray-400)', fontSize: 12 }}>
              Départ : {res.voyage_detail?.date_depart} · {res.nb_personnes} personne(s)
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          <div style={{ flex: 1, background: 'var(--gray-50)', borderRadius: 8, padding: 10 }}>
            <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>STATUT</div>
            <span className={`badge ${STATUT[res.statut]?.cls}`}>{STATUT[res.statut]?.label}</span>
          </div>
          <div style={{ flex: 1, background: 'var(--gray-50)', borderRadius: 8, padding: 10 }}>
            <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>TOTAL</div>
            <div style={{ fontWeight: 700 }}>{Number(res.prix_total).toLocaleString('fr-FR')} F</div>
          </div>
          <div style={{ flex: 1, background: restant > 0 ? '#fef2f2' : '#f0fdf4', borderRadius: 8, padding: 10 }}>
            <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>RESTANT</div>
            <div style={{ fontWeight: 700, color: restant > 0 ? 'var(--red)' : 'var(--green)' }}>
              {restant.toLocaleString('fr-FR')} F
            </div>
          </div>
        </div>

        {restant > 0 && (
          <div className="form-group">
            <label className="form-label">Enregistrer un paiement</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input type="number" placeholder="Montant (F CFA)" value={montant} onChange={e => setMontant(e.target.value)} />
              <button className="btn btn-primary" disabled={loading}
                onClick={() => {
                  if (!montant || isNaN(montant)) return toast.error('Montant invalide')
                  run(() => reservationService.paiement(res.id, montant), 'Paiement enregistré')
                }}>
                Valider
              </button>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
          {res.statut === 'en_attente' && (
            <button className="btn btn-primary" disabled={loading}
              onClick={() => run(() => reservationService.confirmer(res.id), 'Réservation confirmée')}>
              ✅ Confirmer
            </button>
          )}
          {!['annule', 'termine'].includes(res.statut) && (
            <button className="btn btn-sm" disabled={loading}
              style={{ background: 'var(--red-light)', color: 'var(--red)', border: 'none' }}
              onClick={() => run(() => reservationService.annuler(res.id), 'Réservation annulée')}>
              Annuler
            </button>
          )}
          <button className="btn btn-secondary" onClick={onClose}>Fermer</button>
        </div>
      </div>
    </div>
  )
}

export default function AgentReservations() {
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statutFilter, setStatutFilter] = useState('')
  const [selected, setSelected] = useState(null)

  const fetch = () => {
    setLoading(true)
    reservationService.list()
      .then(({ data }) => setReservations(data.results || data))
      .catch(() => toast.error('Erreur de chargement'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetch() }, [])

  const filtered = reservations.filter(r => {
    const q = search.toLowerCase()
    const matchSearch = !q ||
      r.numero?.toLowerCase().includes(q) ||
      r.client_detail?.full_name?.toLowerCase().includes(q) ||
      r.voyage_detail?.titre?.toLowerCase().includes(q)
    return matchSearch && (!statutFilter || r.statut === statutFilter)
  })

  return (
    <div>
      <div className="page-header">
        <h1>Réservations</h1>
        <p>Gérez et suivez les réservations de vos clients</p>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <input style={{ flex: 1 }} placeholder="🔍 Rechercher…"
          value={search} onChange={e => setSearch(e.target.value)} />
        <select style={{ width: 180 }} value={statutFilter} onChange={e => setStatutFilter(e.target.value)}>
          <option value="">Tous les statuts</option>
          {Object.entries(STATUT).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between' }}>
          <span className="card-title">Liste des réservations</span>
          <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>{filtered.length} résultat(s)</span>
        </div>
        {loading ? (
          <div style={{ padding: 40, display: 'flex', justifyContent: 'center' }}><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">Aucune réservation trouvée</div>
        ) : (
          <table>
            <thead>
              <tr><th>N°</th><th>Client</th><th>Voyage</th><th>Départ</th><th>Montant</th><th>Paiement</th><th>Statut</th><th>Action</th></tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 600, color: 'var(--blue)', fontSize: 12 }}>{r.numero}</td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{r.client_detail?.full_name || '—'}</div>
                    <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{r.client_detail?.telephone}</div>
                  </td>
                  <td style={{ fontSize: 13 }}>{r.voyage_detail?.titre || '—'}</td>
                  <td style={{ fontSize: 12, color: 'var(--gray-500)' }}>{r.voyage_detail?.date_depart || '—'}</td>
                  <td style={{ fontWeight: 600, fontSize: 13 }}>{Number(r.prix_total).toLocaleString('fr-FR')} F</td>
                  <td><span className={`badge ${PAIEMENT[r.statut_paiement]?.cls}`}>{PAIEMENT[r.statut_paiement]?.label}</span></td>
                  <td><span className={`badge ${STATUT[r.statut]?.cls}`}>{STATUT[r.statut]?.label}</span></td>
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={() => setSelected(r)}>Gérer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selected && <ActionModal res={selected} onClose={() => setSelected(null)} onRefresh={fetch} />}
    </div>
  )
}
