// frontend/src/services/dashboardService.js
import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const api = axios.create({ baseURL: BASE })

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('tn_token') // ← was 'token', must be 'tn_token'
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

export const dashboardService = {
  getSummary:   () => api.get('/api/dashboard/summary').then(r => r.data),
  getGames:     (limit = 10) => api.get(`/api/dashboard/games?limit=${limit}`).then(r => r.data),
  getEducation: () => api.get('/api/dashboard/education').then(r => r.data),
}