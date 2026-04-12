// frontend/src/services/parentService.js
import axios from 'axios'
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const api = axios.create({ baseURL: BASE })
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('tn_token') || localStorage.getItem('token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})
export const parentService = {
  getChildren:   ()   => api.get('/api/parent/children').then(r => r.data),
  getOverview:   (id) => api.get(`/api/parent/overview/${id}`).then(r => r.data),
  getActivity:   (id) => api.get(`/api/parent/activity/${id}`).then(r => r.data),
  getEducation:  (id) => api.get(`/api/parent/education/${id}`).then(r => r.data),
  getSchemes:    (id) => api.get(`/api/parent/schemes/${id}`).then(r => r.data),
  getAlerts:     (id) => api.get(`/api/parent/alerts/${id}`).then(r => r.data),
  getSupport:    ()   => api.get('/api/parent/support').then(r => r.data),
  submitSupport: (d)  => api.post('/api/parent/support', d).then(r => r.data),
}