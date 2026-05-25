import React, { useState, useEffect } from 'react'
import { reservationService } from '../../services/api'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

const STATUT = {
  en_attente: { label: 'En attente',  cls: 'badge-warning', icon: '⏳' },
  confirme:   { label: 'Confirmé',    cls: 'badge-success', icon: '✅' },
  en_cours:   { label: 'En cours',    cls: 'badge-info',    icon: '✈️' },
  termine:    { label: 'Terminé',     cls: 'badge-gray',    icon: '🏁' },
  annule:     { label: 'Annulé',      cls: 'badge-danger',  icon: '✕'  },
}

const PAIEMENT = {
  non_paye:  { label: 'Non payé',  cls: 'badge-danger'  },
  partiel:   { label: 'Partiel',   cls: 'badge-warning' },
  complet:   { label: 'Complet',   cls: 'badge-success' },
  rembourse: { label: 'Remboursé', cls: 'badge-gray'    },
}

const ICONS = ['🗼', '🏙️', '🕌', '🎡', '🌴', '⛩️', '🏔️', '🌊', '🏛️', '🎭']

function ReservationDetail({ res, idx, onClose, onAnnuler }) {
  const [loading, setLoading] = useState(false)
  const restant = Number(res.prix_total) - Number(res.montant_paye)
  const inclus = res.voyage_detail?.inclus?.split('\n').filter(Boolean) || []

  const handleAnnuler = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) return
    setLoading(true)
    try {
      await reservationService.annuler(res.id)
      toast.success('Réservation annulée')
      onAnnuler()
      onClose()
    } catch {
      toast.error('Impossible d\'annuler cette réservation')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 500, maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{
          height: 90, background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 44, borderRadius: '12px 12px 0 0', margin: '-24px -24px 20px'
        }}>
          {ICONS[idx % ICONS.length]}
        </div>

        <div className="modal-header">
          <span className="modal-title">{res.numero}</span>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>

        <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>
          {res.voyage_detail?.titre || '—'}
        </div>
        <div style={{ fontSize: 13, color: 'var(--gray-400)', marginBottom: 16 }}>
          📍 {res.voyage_detail?.destination_nom}, {res.voyage_detail?.destination_pays}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          {[
            { label: 'DÉPART',    val: res.voyage_detail?.date_depart },
            { label: 'RETOUR',    val: res.voyage_detail?.date_retour },
            { label: 'DURÉE',     val: `${res.voyage_detail?.duree_jours || '—'} jours` },
            { label: 'PERSONNES', val: res.nb_personnes },
          ].map(item => (
            <div key={item.label} style={{ background: 'var(--gray-50)', borderRadius: 8, padding: '8px 12px' }}>
              <div style={{ fontSize: 10, color: 'var(--gray-400)', marginBottom: 2 }}>{item.label}</div>
              <div style={{ fontWeight: 600 }}>{item.val || '—'}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          <div style={{ flex: 1, background: 'var(--gray-50)', borderRadius: 8, padding: 10 }}>
            <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>STATUT</div>
            <span className={`badge ${STATUT[res.statut]?.cls}`}>{STATUT[res.statut]?.label}</span>
          </div>
          <div style={{ flex: 1, background: 'var(--gray-50)', borderRadius: 8, padding: 10 }}>
            <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>PAIEMENT</div>
            <span className={`badge ${PAIEMENT[res.statut_paiement]?.cls}`}>{PAIEMENT[res.statut_paiement]?.label}</span>
          </div>
        </div>

        <div style={{ background: '#eff6ff', borderRadius: 10, padding: 14, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 13, color: 'var(--gray-600)' }}>Prix total</span>
            <span style={{ fontWeight: 700 }}>{Number(res.prix_total).toLocaleString('fr-FR')} F</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 13, color: 'var(--gray-600)' }}>Payé</span>
            <span style={{ fontWeight: 600, color: 'var(--green)' }}>{Number(res.montant_paye).toLocaleString('fr-FR')} F</span>
          </div>
          {restant > 0 && (
            <div style={{ borderTop: '1px solid #dbeafe', paddingTop: 8, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, color: 'var(--gray-600)' }}>Reste à payer</span>
              <span style={{ fontWeight: 700, color: 'var(--red)' }}>{restant.toLocaleString('fr-FR')} F</span>
            </div>
          )}
        </div>

        {inclus.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>✅ Inclus dans votre voyage</div>
            {inclus.map((item, i) => (
              <div key={i} style={{ fontSize: 13, color: 'var(--gray-600)', display: 'flex', gap: 6, marginBottom: 4 }}>
                <span style={{ color: 'var(--green)' }}>✓</span> {item}
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          {['en_attente', 'confirme'].includes(res.statut) && (
            <button className="btn btn-sm" disabled={loading}
              style={{ background: 'var(--red-light)', color: 'var(--red)', border: 'none' }}
              onClick={handleAnnuler}>
              Annuler la réservation
            </button>
          )}
          <button className="btn btn-secondary" onClick={onClose}>Fermer</button>
        </div>
      </div>
    </div>
  )
}

export default function ClientReservations() {
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('all')

  const fetch = () => {
    setLoading(true)
    reservationService.list()
      .then(({ data }) => setReservations(data.results || data))
      .catch(() => toast.error('Erreur de chargement'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetch() }, [])

  const filtered = filter === 'all' ? reservations : reservations.filter(r => r.statut === filter)

  return (
    <div>
      <div className="page-header">
        <h1>Mes réservations</h1>
        <p>Suivez l'état de toutes vos réservations</p>
      </div>

      {/* Filtres rapides */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { key: 'all', label: 'Toutes' },
          { key: 'en_attente', label: '⏳ En attente' },
          { key: 'confirme', label: '✅ Confirmées' },
          { key: 'termine', label: '🏁 Terminées' },
          { key: 'annule', label: '✕ Annulées' },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`btn btn-sm ${filter === f.key ? 'btn-primary' : 'btn-secondary'}`}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 36, marginBottom: 12 }}>✈️</div>
          {reservations.length === 0
            ? <><p style={{ marginBottom: 12 }}>Vous n'avez encore aucune réservation.</p>
                <Link to="/client" className="btn btn-primary">Explorer les voyages</Link></>
            : 'Aucune réservation pour ce filtre.'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map((r, i) => {
            const s = STATUT[r.statut]
            const p = PAIEMENT[r.statut_paiement]
            const restant = Number(r.prix_total) - Number(r.montant_paye)
            return (
              <div key={r.id} className="card" style={{ cursor: 'pointer', transition: 'box-shadow .15s' }}
                onClick={() => setSelected({ res: r, idx: i })}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,.1)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = ''}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: 10,
                    background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 26, flexShrink: 0
                  }}>
                    {ICONS[i % ICONS.length]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>
                      {r.voyage_detail?.titre || '—'}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>
                      📍 {r.voyage_detail?.destination_nom} · ✈️ Départ {r.voyage_detail?.date_depart}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>
                      N° {r.numero} · {r.nb_personnes} personne(s)
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--blue)', marginBottom: 4 }}>
                      {Number(r.prix_total).toLocaleString('fr-FR')} F
                    </div>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <span className={`badge ${s?.cls}`}>{s?.icon} {s?.label}</span>
                      <span className={`badge ${p?.cls}`}>{p?.label}</span>
                    </div>
                    {restant > 0 && (
                      <div style={{ fontSize: 11, color: 'var(--red)', marginTop: 4 }}>
                        Reste : {restant.toLocaleString('fr-FR')} F
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {selected && (
        <ReservationDetail
          res={selected.res}
          idx={selected.idx}
          onClose={() => setSelected(null)}
          onAnnuler={fetch}
        />
      )}
    </div>
  )
}
