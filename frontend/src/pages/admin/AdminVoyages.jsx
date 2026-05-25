import React, { useState, useEffect } from 'react'
import { voyageService, destinationService } from '../../services/api'
import toast from 'react-hot-toast'

const STATUT_CONFIG = {
  disponible: { label: 'Disponible', class: 'badge-success' },
  complet: { label: 'Complet', class: 'badge-danger' },
  annule: { label: 'Annulé', class: 'badge-gray' },
  termine: { label: 'Terminé', class: 'badge-gray' },
}

const ICONS = ['🗼', '🏙️', '🕌', '🎡', '🌴', '⛩️', '🏔️', '🌊', '🏛️', '🎭']

function VoyageModal({ voyage, destinations, onClose, onSave }) {
  const [form, setForm] = useState({
    titre: voyage?.titre || '',
    destination: voyage?.destination || '',
    description: voyage?.description || '',
    date_depart: voyage?.date_depart || '',
    date_retour: voyage?.date_retour || '',
    prix_par_personne: voyage?.prix_par_personne || '',
    places_total: voyage?.places_total || '',
    places_disponibles: voyage?.places_disponibles || '',
    statut: voyage?.statut || 'disponible',
    inclus: voyage?.inclus || '',
    is_active: voyage?.is_active ?? true,
  })
  const [saving, setSaving] = useState(false)

  const handle = e => setForm(f => ({
    ...f,
    [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value
  }))

  const submit = async () => {
    if (!form.titre || !form.destination || !form.date_depart || !form.date_retour || !form.prix_par_personne)
      return toast.error('Remplissez tous les champs obligatoires')
    setSaving(true)
    try {
      if (voyage) await voyageService.update(voyage.id, form)
      else await voyageService.create(form)
      toast.success(voyage ? 'Voyage mis à jour' : 'Voyage créé')
      onSave()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{voyage ? 'Modifier le voyage' : 'Nouveau voyage'}</span>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>

        <div className="form-group">
          <label className="form-label">Titre du voyage *</label>
          <input name="titre" value={form.titre} onChange={handle} placeholder="Ex: Séjour romantique à Paris" />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Destination *</label>
            <select name="destination" value={form.destination} onChange={handle}>
              <option value="">Sélectionner…</option>
              {destinations.map(d => (
                <option key={d.id} value={d.id}>{d.nom}, {d.pays}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Statut</label>
            <select name="statut" value={form.statut} onChange={handle}>
              <option value="disponible">Disponible</option>
              <option value="complet">Complet</option>
              <option value="annule">Annulé</option>
              <option value="termine">Terminé</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Date de départ *</label>
            <input name="date_depart" type="date" value={form.date_depart} onChange={handle} />
          </div>
          <div className="form-group">
            <label className="form-label">Date de retour *</label>
            <input name="date_retour" type="date" value={form.date_retour} onChange={handle} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Prix / personne (F CFA) *</label>
            <input name="prix_par_personne" type="number" value={form.prix_par_personne} onChange={handle} placeholder="850000" />
          </div>
          <div className="form-group">
            <label className="form-label">Places totales</label>
            <input name="places_total" type="number" value={form.places_total} onChange={handle} placeholder="20" />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Places disponibles</label>
          <input name="places_disponibles" type="number" value={form.places_disponibles} onChange={handle} placeholder="20" />
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea name="description" value={form.description} onChange={handle}
            rows={3} placeholder="Décrivez ce voyage…" style={{ resize: 'vertical' }} />
        </div>

        <div className="form-group">
          <label className="form-label">Ce qui est inclus (un élément par ligne)</label>
          <textarea name="inclus" value={form.inclus} onChange={handle}
            rows={3} placeholder={"Vol aller-retour\nHôtel 4 étoiles\nPetit-déjeuner inclus"} style={{ resize: 'vertical' }} />
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
          <button className="btn btn-secondary" onClick={onClose}>Annuler</button>
          <button className="btn btn-primary" onClick={submit} disabled={saving}>
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminVoyages() {
  const [voyages, setVoyages] = useState([])
  const [destinations, setDestinations] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statutFilter, setStatutFilter] = useState('')
  const [modal, setModal] = useState(null)

  const fetchAll = () => {
    setLoading(true)
    Promise.all([voyageService.list(), destinationService.list()])
      .then(([v, d]) => {
        setVoyages(v.data.results || v.data)
        setDestinations(d.data.results || d.data)
      })
      .catch(() => toast.error('Erreur de chargement'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchAll() }, [])

  const filtered = voyages.filter(v => {
    const q = search.toLowerCase()
    const matchSearch = !q || v.titre?.toLowerCase().includes(q) ||
      v.destination_nom?.toLowerCase().includes(q) || v.destination_pays?.toLowerCase().includes(q)
    const matchStatut = !statutFilter || v.statut === statutFilter
    return matchSearch && matchStatut
  })

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce voyage ?')) return
    try {
      await voyageService.delete(id)
      toast.success('Voyage supprimé')
      fetchAll()
    } catch {
      toast.error('Erreur lors de la suppression')
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Voyages</h1>
        <p>Gérez le catalogue des offres de voyage</p>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <input style={{ flex: 1 }} placeholder="🔍 Rechercher par titre, destination…"
          value={search} onChange={e => setSearch(e.target.value)} />
        <select style={{ width: 160 }} value={statutFilter} onChange={e => setStatutFilter(e.target.value)}>
          <option value="">Tous les statuts</option>
          <option value="disponible">Disponible</option>
          <option value="complet">Complet</option>
          <option value="annule">Annulé</option>
          <option value="termine">Terminé</option>
        </select>
        <button className="btn btn-primary" onClick={() => setModal('create')}>
          + Nouveau voyage
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div className="spinner" />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {filtered.map((v, i) => (
            <div key={v.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{
                height: 90, background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40
              }}>
                {ICONS[i % ICONS.length]}
              </div>
              <div style={{ padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, flex: 1, marginRight: 8 }}>{v.titre}</div>
                  <span className={`badge ${STATUT_CONFIG[v.statut]?.class}`}>
                    {STATUT_CONFIG[v.statut]?.label}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--gray-400)', marginBottom: 10 }}>
                  📍 {v.destination_nom}, {v.destination_pays}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                  <div style={{ background: 'var(--gray-50)', borderRadius: 6, padding: '6px 10px' }}>
                    <div style={{ fontSize: 10, color: 'var(--gray-400)' }}>DÉPART</div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{v.date_depart}</div>
                  </div>
                  <div style={{ background: 'var(--gray-50)', borderRadius: 6, padding: '6px 10px' }}>
                    <div style={{ fontSize: 10, color: 'var(--gray-400)' }}>DURÉE</div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{v.duree_jours} jours</div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--blue)' }}>
                      {Number(v.prix_par_personne).toLocaleString('fr-FR')} F
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>par personne</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{v.places_disponibles}</div>
                    <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>places dispo</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, borderTop: '1px solid var(--gray-100)', paddingTop: 12 }}>
                  <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => setModal(v)}>
                    ✏️ Modifier
                  </button>
                  <button className="btn btn-sm" onClick={() => handleDelete(v.id)}
                    style={{ background: 'var(--red-light)', color: 'var(--red)', border: 'none' }}>
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div style={{ gridColumn: '1/-1' }}>
              <div className="empty-state">Aucun voyage trouvé</div>
            </div>
          )}
        </div>
      )}

      {modal && (
        <VoyageModal
          voyage={modal === 'create' ? null : modal}
          destinations={destinations}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); fetchAll() }}
        />
      )}
    </div>
  )
}
