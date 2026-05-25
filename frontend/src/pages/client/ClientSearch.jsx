import React, { useState, useEffect } from 'react'
import { voyageService, reservationService } from '../../services/api'
import toast from 'react-hot-toast'

const ICONS = ['🗼', '🏙️', '🕌', '🎡', '🌴', '⛩️', '🏔️', '🌊', '🏛️', '🎭']

function VoyageDetail({ voyage, idx, onClose, onReserve }) {
  const [nb, setNb] = useState(1)
  const [loading, setLoading] = useState(false)
  const inclus = voyage.inclus ? voyage.inclus.split('\n').filter(Boolean) : []
  const total = Number(voyage.prix_par_personne) * nb

  const handleReserver = async () => {
    setLoading(true)
    try {
      await reservationService.create({ voyage: voyage.id, nb_personnes: nb, notes: '' })
      toast.success('🎉 Réservation effectuée avec succès !')
      onReserve()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.detail || err.response?.data?.[0] || 'Erreur lors de la réservation')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 540, maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{
          height: 100, background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 48, borderRadius: '12px 12px 0 0', margin: '-24px -24px 20px'
        }}>
          {ICONS[idx % ICONS.length]}
        </div>

        <div className="modal-header" style={{ marginBottom: 12 }}>
          <span className="modal-title">{voyage.titre}</span>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>

        <div style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 12 }}>
          📍 {voyage.destination_nom}, {voyage.destination_pays}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
          {[
            { label: 'DÉPART', val: voyage.date_depart },
            { label: 'RETOUR', val: voyage.date_retour },
            { label: 'DURÉE', val: `${voyage.duree_jours} jours` },
          ].map(item => (
            <div key={item.label} style={{ background: 'var(--gray-50)', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: 'var(--gray-400)', marginBottom: 3 }}>{item.label}</div>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{item.val}</div>
            </div>
          ))}
        </div>

        {voyage.description && (
          <p style={{ fontSize: 13, color: 'var(--gray-600)', lineHeight: 1.6, marginBottom: 14 }}>
            {voyage.description}
          </p>
        )}

        {inclus.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>✅ Inclus dans le voyage</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {inclus.map((item, i) => (
                <div key={i} style={{ fontSize: 13, color: 'var(--gray-600)', display: 'flex', gap: 6 }}>
                  <span style={{ color: 'var(--green)' }}>✓</span> {item}
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ background: 'var(--blue-light)', borderRadius: 10, padding: 14, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 13, color: 'var(--gray-600)' }}>Prix par personne</span>
            <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--blue)' }}>
              {Number(voyage.prix_par_personne).toLocaleString('fr-FR')} F
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 13, color: 'var(--gray-600)' }}>Nombre de personnes</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setNb(n => Math.max(1, n - 1))}>−</button>
              <span style={{ fontWeight: 700, minWidth: 20, textAlign: 'center' }}>{nb}</span>
              <button className="btn btn-secondary btn-sm"
                onClick={() => setNb(n => Math.min(voyage.places_disponibles, n + 1))}>+</button>
            </div>
          </div>
          <div style={{ borderTop: '1px solid #dbeafe', paddingTop: 10, display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 600 }}>Total</span>
            <span style={{ fontWeight: 700, fontSize: 18, color: 'var(--blue)' }}>
              {total.toLocaleString('fr-FR')} F
            </span>
          </div>
        </div>

        <div style={{ fontSize: 12, color: 'var(--gray-400)', marginBottom: 14 }}>
          💺 {voyage.places_disponibles} place(s) disponible(s)
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onClose}>Annuler</button>
          <button className="btn btn-primary" onClick={handleReserver} disabled={loading || voyage.places_disponibles === 0}>
            {loading ? 'Réservation…' : '✈️ Réserver maintenant'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ClientSearch() {
  const [voyages, setVoyages] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [prixMax, setPrixMax] = useState('')
  const [selected, setSelected] = useState(null)
  const [selectedIdx, setSelectedIdx] = useState(0)

  const fetchVoyages = (params = {}) => {
    setLoading(true)
    voyageService.list(params)
      .then(({ data }) => setVoyages(data.results || data))
      .catch(() => toast.error('Erreur de chargement des voyages'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchVoyages() }, [])

  const handleSearch = () => {
    const params = {}
    if (search) params.search = search
    if (prixMax) params.prix_max = prixMax
    fetchVoyages(params)
  }

  const filtered = voyages.filter(v => v.statut !== 'annule' && v.statut !== 'termine')

  return (
    <div>
      <div className="page-header">
        <h1>Trouver un voyage ✈️</h1>
        <p>Découvrez nos offres et réservez en quelques clics</p>
      </div>

      {/* Barre de recherche */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 12, alignItems: 'end' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Destination</label>
            <input placeholder="Paris, Dubaï, Istanbul…" value={search} onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()} />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Budget max (F CFA)</label>
            <input type="number" placeholder="Ex: 1 000 000" value={prixMax} onChange={e => setPrixMax(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={handleSearch} style={{ height: 38 }}>
            🔍 Rechercher
          </button>
        </div>
      </div>

      {/* Résultats */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 36, marginBottom: 8 }}>🔍</div>
          Aucun voyage disponible pour ces critères.
        </div>
      ) : (
        <>
          <div style={{ fontSize: 13, color: 'var(--gray-400)', marginBottom: 14 }}>
            {filtered.length} voyage(s) disponible(s)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {filtered.map((v, i) => (
              <div key={v.id} className="card" style={{ padding: 0, overflow: 'hidden', cursor: 'pointer' }}
                onClick={() => { setSelected(v); setSelectedIdx(i) }}>
                <div style={{
                  height: 100, background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44
                }}>
                  {ICONS[i % ICONS.length]}
                </div>
                <div style={{ padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, flex: 1, marginRight: 8 }}>{v.titre}</div>
                    <span className={v.statut === 'complet' ? 'badge badge-danger' : v.places_disponibles <= 5 ? 'badge badge-warning' : 'badge badge-success'}>
                      {v.statut === 'complet' ? 'Complet' : v.places_disponibles <= 5 ? `${v.places_disponibles} places` : 'Disponible'}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--gray-400)', marginBottom: 12 }}>
                    📍 {v.destination_nom}, {v.destination_pays}
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                    <div style={{ flex: 1, background: 'var(--gray-50)', borderRadius: 6, padding: '6px 8px', textAlign: 'center' }}>
                      <div style={{ fontSize: 10, color: 'var(--gray-400)' }}>DÉPART</div>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{v.date_depart}</div>
                    </div>
                    <div style={{ flex: 1, background: 'var(--gray-50)', borderRadius: 6, padding: '6px 8px', textAlign: 'center' }}>
                      <div style={{ fontSize: 10, color: 'var(--gray-400)' }}>DURÉE</div>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{v.duree_jours} jours</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--blue)' }}>
                        {Number(v.prix_par_personne).toLocaleString('fr-FR')} F
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>par personne</div>
                    </div>
                    <button className="btn btn-primary btn-sm"
                      disabled={v.statut === 'complet'}
                      onClick={e => { e.stopPropagation(); setSelected(v); setSelectedIdx(i) }}>
                      {v.statut === 'complet' ? 'Complet' : 'Réserver'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {selected && (
        <VoyageDetail
          voyage={selected}
          idx={selectedIdx}
          onClose={() => setSelected(null)}
          onReserve={() => fetchVoyages()}
        />
      )}
    </div>
  )
}
