import React, { useState, useEffect } from 'react'
import { reservationService } from '../../services/api'
import toast from 'react-hot-toast'

const STATUT = {
  en_attente: { label: 'En attente',  cls: 'badge-warning' },
  confirme:   { label: 'Confirmé',    cls: 'badge-success' },
  en_cours:   { label: 'En cours',    cls: 'badge-info'    },
  termine:    { label: 'Terminé',     cls: 'badge-gray'    },
  annule:     { label: 'Annulé',      cls: 'badge-danger'  },
}

const PAIEMENT = {
  non_paye:  { label: 'Non payé',    cls: 'badge-danger'  },
  partiel:   { label: 'Partiel',     cls: 'badge-warning' },
  complet:   { label: 'Complet',     cls: 'badge-success' },
  rembourse: { label: 'Remboursé',   cls: 'badge-gray'    },
}

function DetailModal({ res, onClose, onRefresh }) {
  const [paiement, setPaiement] = useState('')
  const [loading, setLoading] = useState(false)

  const action = async (fn, msg) => {
    setLoading(true)
    try {
      await fn()
      toast.success(msg)
      onRefresh()
      onClose()
    } catch {
      toast.error('Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  const handlePaiement = () => {
    if (!paiement || isNaN(paiement)) return toast.error('Montant invalide')
    action(() => reservationService.paiement(res.id, paiement), 'Paiement enregistré')
  }

  const restant = Number(res.prix_total) - Number(res.montant_paye)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Réservation {res.numero}</span>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>

        {/* Infos client + voyage */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          <div style={{ background: 'var(--gray-50)', borderRadius: 8, padding: 12 }}>
            <div style={{ fontSize: 11, color: 'var(--gray-400)', marginBottom: 4 }}>CLIENT</div>
            <div style={{ fontWeight: 600 }}>{res.client_detail?.full_name || '—'}</div>
            <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>{res.client_detail?.email}</div>
            <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>{res.client_detail?.telephone}</div>
          </div>
          <div style={{ background: 'var(--gray-50)', borderRadius: 8, padding: 12 }}>
            <div style={{ fontSize: 11, color: 'var(--gray-400)', marginBottom: 4 }}>VOYAGE</div>
            <div style={{ fontWeight: 600 }}>{res.voyage_detail?.titre || '—'}</div>
            <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>
              {res.voyage_detail?.destination_nom} · {res.voyage_detail?.date_depart}
            </div>
            <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>{res.nb_personnes} personne(s)</div>
          </div>
        </div>

        {/* Statuts */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <div style={{ flex: 1, background: 'var(--gray-50)', borderRadius: 8, padding: 12 }}>
            <div style={{ fontSize: 11, color: 'var(--gray-400)', marginBottom: 6 }}>STATUT</div>
            <span className={`badge ${STATUT[res.statut]?.cls}`}>{STATUT[res.statut]?.label}</span>
          </div>
          <div style={{ flex: 1, background: 'var(--gray-50)', borderRadius: 8, padding: 12 }}>
            <div style={{ fontSize: 11, color: 'var(--gray-400)', marginBottom: 6 }}>PAIEMENT</div>
            <span className={`badge ${PAIEMENT[res.statut_paiement]?.cls}`}>{PAIEMENT[res.statut_paiement]?.label}</span>
          </div>
        </div>

        {/* Montants */}
        <div style={{ background: 'var(--gray-50)', borderRadius: 8, padding: 12, marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ color: 'var(--gray-500)', fontSize: 13 }}>Prix total</span>
            <span style={{ fontWeight: 600 }}>{Number(res.prix_total).toLocaleString('fr-FR')} F</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ color: 'var(--gray-500)', fontSize: 13 }}>Montant payé</span>
            <span style={{ fontWeight: 600, color: 'var(--green)' }}>{Number(res.montant_paye).toLocaleString('fr-FR')} F</span>
          </div>
          <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: 6, display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--gray-500)', fontSize: 13 }}>Reste à payer</span>
            <span style={{ fontWeight: 700, color: restant > 0 ? 'var(--red)' : 'var(--green)' }}>
              {restant.toLocaleString('fr-FR')} F
            </span>
          </div>
        </div>

        {/* Enregistrer un paiement */}
        {restant > 0 && (
          <div style={{ marginBottom: 20 }}>
            <label className="form-label">Enregistrer un paiement (F CFA)</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input type="number" placeholder="Montant reçu…" value={paiement}
                onChange={e => setPaiement(e.target.value)} />
              <button className="btn btn-primary" onClick={handlePaiement} disabled={loading}>
                Valider
              </button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          {res.statut === 'en_attente' && (
            <button className="btn btn-primary" disabled={loading}
              onClick={() => action(() => reservationService.confirmer(res.id), 'Réservation confirmée')}>
              ✅ Confirmer
            </button>
          )}
          {!['annule', 'termine'].includes(res.statut) && (
            <button className="btn btn-sm" disabled={loading}
              style={{ background: 'var(--red-light)', color: 'var(--red)', border: 'none' }}
              onClick={() => action(() => reservationService.annuler(res.id), 'Réservation annulée')}>
              ✕ Annuler
            </button>
          )}
          <button className="btn btn-secondary" onClick={onClose}>Fermer</button>
        </div>
      </div>
    </div>
  )
}

export default function AdminReservations() {
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
    const matchStatut = !statutFilter || r.statut === statutFilter
    return matchSearch && matchStatut
  })

  return (
    <div>
      <div className="page-header">
        <h1>Réservations</h1>
        <p>Suivi et gestion de toutes les réservations</p>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <input style={{ flex: 1 }} placeholder="🔍 Rechercher par N°, client, voyage…"
          value={search} onChange={e => setSearch(e.target.value)} />
        <select style={{ width: 180 }} value={statutFilter} onChange={e => setStatutFilter(e.target.value)}>
          <option value="">Tous les statuts</option>
          {Object.entries(STATUT).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between' }}>
          <span className="card-title">Toutes les réservations</span>
          <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>{filtered.length} résultat(s)</span>
        </div>

        {loading ? (
          <div style={{ padding: 40, display: 'flex', justifyContent: 'center' }}><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">Aucune réservation trouvée</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>N°</th>
                <th>Client</th>
                <th>Voyage</th>
                <th>Départ</th>
                <th>Personnes</th>
                <th>Montant</th>
                <th>Paiement</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 600, color: 'var(--blue)', fontSize: 12 }}>{r.numero}</td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{r.client_detail?.full_name || '—'}</div>
                    <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{r.client_detail?.email}</div>
                  </td>
                  <td style={{ fontSize: 13 }}>{r.voyage_detail?.titre || '—'}</td>
                  <td style={{ fontSize: 12, color: 'var(--gray-500)' }}>{r.voyage_detail?.date_depart || '—'}</td>
                  <td style={{ textAlign: 'center' }}>{r.nb_personnes}</td>
                  <td style={{ fontWeight: 600, fontSize: 13 }}>
                    {Number(r.prix_total).toLocaleString('fr-FR')} F
                  </td>
                  <td>
                    <span className={`badge ${PAIEMENT[r.statut_paiement]?.cls}`}>
                      {PAIEMENT[r.statut_paiement]?.label}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${STATUT[r.statut]?.cls}`}>
                      {STATUT[r.statut]?.label}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={() => setSelected(r)}>
                      👁️ Détail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selected && (
        <DetailModal res={selected} onClose={() => setSelected(null)} onRefresh={fetch} />
      )}
    </div>
  )
}
