import axios from 'axios'

// Ligne 4 : Détection automatique et sécurisée de l'adresse de l'API
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://127.0.0'
  : 'https://onrender.com'; // <-- Assurez-vous qu'il y a bien "/api" à la fin


// L'URL de base de l'API Django
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
})


// Intercepteur : ajoute le token JWT à chaque requête
api.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Intercepteur : si le token expire (401), tente de le rafraîchir
api.interceptors.response.use(
  res => res,
  async err => {
    const original = err.config
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const refresh = localStorage.getItem('refresh_token')
       const { data } = await axios.post(`${API_BASE_URL}/auth/refresh/`, { refresh })
        localStorage.setItem('access_token', data.access)
        original.headers.Authorization = `Bearer ${data.access}`
        return api(original)
      } catch {
        localStorage.clear()
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authService = {
  login: (credentials) => api.post('/auth/login/', credentials),
  register: (data) => api.post('/auth/register/', data),
  getMe: () => api.get('/auth/users/me/'),
  updateMe: (data) => api.patch('/auth/users/me/', data),
}

// ─── Users (Admin) ────────────────────────────────────────────────────────────
export const userService = {
  list: (params) => api.get('/auth/users/', { params }),
  get: (id) => api.get(`/auth/users/${id}/`),
  create: (data) => api.post('/auth/users/', data),
  update: (id, data) => api.patch(`/auth/users/${id}/`, data),
  delete: (id) => api.delete(`/auth/users/${id}/`),
  stats: () => api.get('/auth/users/stats/'),
}

// ─── Destinations ─────────────────────────────────────────────────────────────
export const destinationService = {
  list: () => api.get('/destinations/'),
  get: (id) => api.get(`/destinations/${id}/`),
  create: (data) => api.post('/destinations/', data),
  update: (id, data) => api.patch(`/destinations/${id}/`, data),
  delete: (id) => api.delete(`/destinations/${id}/`),
}

// ─── Voyages ──────────────────────────────────────────────────────────────────
export const voyageService = {
  list: (params) => api.get('/voyages/', { params }),
  get: (id) => api.get(`/voyages/${id}/`),
  create: (data) => api.post('/voyages/', data),
  update: (id, data) => api.patch(`/voyages/${id}/`, data),
  delete: (id) => api.delete(`/voyages/${id}/`),
}

// ─── Réservations ─────────────────────────────────────────────────────────────
export const reservationService = {
  list: (params) => api.get('/reservations/', { params }),
  get: (id) => api.get(`/reservations/${id}/`),
  create: (data) => api.post('/reservations/', data),
  confirmer: (id) => api.post(`/reservations/${id}/confirmer/`),
  annuler: (id) => api.post(`/reservations/${id}/annuler/`),
  paiement: (id, montant) => api.post(`/reservations/${id}/paiement/`, { montant }),
  dashboardStats: () => api.get('/reservations/dashboard_stats/'),
}

export default api
