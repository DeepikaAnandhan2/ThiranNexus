// src/admin/adminApi.js
// Central API layer for all admin dashboard data fetching.
// Used by every admin page component.

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// ── Token helpers ─────────────────────────────────────────
const getToken = () => localStorage.getItem('admin_token')

const headers = {
  'Content-Type': 'application/json',
}

async function req(method, path, body) {
  const res = await fetch(`${BASE}/api/admin${path}`, {
    method,
    headers,
    ...(body ? { body: JSON.stringify(body) } : {}),
  })

  const data = await res.json()

  if (!res.ok) {
    console.error("API ERROR:", data.error)
    throw new Error(data.error || "Request failed")
  }

  return data
}

// ════════════════════════════════════════════════════════
// AUTH
// ════════════════════════════════════════════════════════
export const adminAuth = {
  login:  (email, password) => req('POST', '/auth/login', { email, password }),
  me:     ()                => req('GET',  '/auth/me'),
  logout: ()                => localStorage.removeItem('admin_token'),
}

// ════════════════════════════════════════════════════════
// DASHBOARD
// ════════════════════════════════════════════════════════
export const adminDashboard = {
  getOverview: () => req('GET', '/dashboard/overview'),
}

// ════════════════════════════════════════════════════════
// USERS
// ════════════════════════════════════════════════════════
export const adminUsers = {
  getAll:  (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return req('GET', `/users?${qs}`)
  },
  getById: (id)           => req('GET',    `/users/${id}`),
  update:  (id, data)     => req('PUT',    `/users/${id}`, data),
  delete:  (id)           => req('DELETE', `/users/${id}`),
}

// ════════════════════════════════════════════════════════
// ANALYTICS
// ════════════════════════════════════════════════════════
export const adminAnalytics = {
  get: () => req('GET', '/analytics'),
}

// ════════════════════════════════════════════════════════
// CONTENT
// ════════════════════════════════════════════════════════
export const adminContent = {
  getSchemes:    (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return req('GET', `/content/schemes?${qs}`)
  },
  createScheme:  (data)        => req('POST',   '/content/schemes',     data),
  updateScheme:  (id, data)    => req('PUT',     `/content/schemes/${id}`, data),
  deleteScheme:  (id)          => req('DELETE',  `/content/schemes/${id}`),
  getGameStats:  ()            => req('GET',     '/content/game-stats'),
}

// ════════════════════════════════════════════════════════
// ALERTS
// ════════════════════════════════════════════════════════
export const adminAlerts = {
  getAll:   (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return req('GET', `/alerts?${qs}`)
  },
  resolve:  (id)          => req('PUT',    `/alerts/${id}/resolve`),
  create:   (data)        => req('POST',   '/alerts',    data),
  delete:   (id)          => req('DELETE', `/alerts/${id}`),
}

// ════════════════════════════════════════════════════════
// FEEDBACK
// ════════════════════════════════════════════════════════
export const adminFeedback = {
  getAll:       (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return req('GET', `/feedback?${qs}`)
  },
  getById:      (id)          => req('GET',  `/feedback/${id}`),
  reply:        (id, message) => req('POST', `/feedback/${id}/reply`, { message }),
  updateStatus: (id, status)  => req('PUT',  `/feedback/${id}/status`, { status }),
}

// ════════════════════════════════════════════════════════
// REWARDS
// ════════════════════════════════════════════════════════
export const adminRewards = {
  getLeaderboard: (limit = 20) => req('GET', `/rewards/leaderboard?limit=${limit}`),
  getBadgeStats:  ()            => req('GET', '/rewards/badges'),
}

// ════════════════════════════════════════════════════════
// SETTINGS
// ════════════════════════════════════════════════════════
export const adminSettings = {
  getAdmins:       ()           => req('GET',    '/settings/admins'),
  createAdmin:     (data)       => req('POST',   '/settings/admins',       data),
  updateAdmin:     (id, data)   => req('PUT',    `/settings/admins/${id}`, data),
  deleteAdmin:     (id)         => req('DELETE', `/settings/admins/${id}`),
  changePassword:  (id, pw)     => req('PUT',    `/settings/admins/${id}/password`, { newPassword: pw }),
  getPlatformInfo: ()           => req('GET',    '/settings/platform'),
}