import React, { useState, useEffect } from 'react'
import { destinationService } from '../../services/api'
import toast from 'react-hot-toast'

const ICONS = ['🗼', '🏙️', '🕌', '🎡', '🌴', '⛩️', '🏔️', '🌊', '🏛️', '🎭']

function DestModal({ dest, onClose, onSave }) {
  const [form, setForm] = useState({
    nom: dest?.nom || '',
    pays: dest?.pays || '',
    description: dest?.description || '',
    is_active: dest?.is_active ?? true,
  })
  const [saving, setSaving] = useState(false)

  const handle = e => setForm(f => ({
    ...f,
    [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value
  }))

  const submit = async () => {
    if (!form.nom || !form.pays) return toast.error('Nom et pays requis')
    setSaving(true)
    try {
      if (dest) await destinationService.update(dest.id, form)
      else await destinationService.create(form)
      toast.success(dest ? 'Destination mise à jour' : 'Destination créée')
      onSave()
    } catch {
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{dest ? 'Modifier la destination' : 'Nouvelle destination'}</span>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Nom de la ville *</label>
            <input name="nom" value={form.nom} onChange={handle} placeholder="Ex: Paris" />
          </div>
          <div className="form-group">
            <label className="form-label">Pays *</label>
            <input name="pays" value={form.pays} onChange={handle} placeholder="Ex: France" />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea name="description" value={form.description} onChange={handle}
            rows={4} placeholder="Décrivez cette destination…" style={{ resize: 'vertical' }} />
        </div>
        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input id="dest_active" name="is_active" type="checkbox" checked={form.is_active}
            onChange={handle} style={{ width: 'auto' }} />
          <label htmlFor="dest_active" className="form-label" style={{ margin: 0 }}>Destination active</label>
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

export default function AdminDestinations() {
  const [destinations, setDestinations] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [search, setSearch] = useState('')

  const fetch = () => {
    setLoading(true)
    destinationService.list()
      .then(({ data }) => setDestinations(data.results || data))
      .catch(() => toast.error('Erreur de chargement'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetch() }, [])

  const filtered = destinations.filter(d =>
    !search || d.nom.toLowerCase().includes(search.toLowerCase()) ||
    d.pays.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette destination ?')) return
    try {
      await destinationService.delete(id)
      toast.success('Destination supprimée')
      fetch()
    } catch {
      toast.error('Erreur lors de la suppression')
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Destinations</h1>
        <p>Gérez les destinations proposées par l'agence</p>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <input style={{ flex: 1 }} placeholder="🔍 Rechercher une destination…"
          value={search} onChange={e => setSearch(e.target.value)} />
        <button className="btn btn-primary" onClick={() => setModal('create')}>
          + Nouvelle destination
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div className="spinner" />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {filtered.map((d, i) => (
            <div key={d.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {/* Header coloré */}
              <div style={{
                height: 80, background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36
              }}>
                {ICONS[i % ICONS.length]}
              </div>
              <div style={{ padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{d.nom}</div>
                    <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>{d.pays}</div>
                  </div>
                  <span className={`badge ${d.is_active ? 'badge-success' : 'badge-danger'}`}>
                    {d.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                {d.description && (
                  <p style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 12, lineHeight: 1.5,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {d.description}
                  </p>
                )}
                <div style={{ display: 'flex', gap: 8, borderTop: '1px solid var(--gray-100)', paddingTop: 12 }}>
                  <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => setModal(d)}>
                    ✏️ Modifier
                  </button>
                  <button className="btn btn-sm" onClick={() => handleDelete(d.id)}
                    style={{ background: 'var(--red-light)', color: 'var(--red)', border: 'none' }}>
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div style={{ gridColumn: '1/-1' }}>
              <div className="empty-state">Aucune destination trouvée</div>
            </div>
          )}
        </div>
      )}

      {modal && (
        <DestModal
          dest={modal === 'create' ? null : modal}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); fetch() }}
        />
      )}
    </div>
  )
}
