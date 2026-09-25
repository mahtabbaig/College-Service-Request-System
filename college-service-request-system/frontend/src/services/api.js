import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export const api = axios.create({ baseURL })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('csr_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem('csr_token')
      localStorage.removeItem('csr_user')
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

// ---- Auth ----
export const loginRequest = (email, password, role) => api.post('/api/auth/login-json', { email, password, role })
export const registerRequest = (payload) => api.post('/api/auth/register', payload)
export const meRequest = () => api.get('/api/auth/me')

// ---- Services / categories ----
export const getServiceCategories = () => api.get('/api/services')
export const getDepartments = () => api.get('/api/departments')

// ---- Requests ----
export const createServiceRequest = (payload) => api.post('/api/requests', payload)
export const listServiceRequests = (params) => api.get('/api/requests', { params })
export const getServiceRequest = (id) => api.get(`/api/requests/${id}`)
export const changeRequestStatus = (id, payload) => api.patch(`/api/requests/${id}/status`, payload)
export const assignStaff = (id, payload) => api.patch(`/api/requests/${id}/assign`, payload)
export const setWorkaround = (id, payload) => api.patch(`/api/requests/${id}/workaround`, payload)
export const confirmResolution = (id, payload) => api.patch(`/api/requests/${id}/confirm`, payload)
export const getRequestAudit = (id) => api.get(`/api/requests/${id}/audit`)

// ---- Comments ----
export const listComments = (requestId) => api.get(`/api/comments/${requestId}`)
export const addComment = (requestId, message) => api.post(`/api/comments/${requestId}`, { message })

// ---- Notifications ----
export const listNotifications = () => api.get('/api/notifications')
export const markNotificationRead = (id) => api.patch(`/api/notifications/${id}/read`)
export const markAllNotificationsRead = () => api.patch('/api/notifications/read-all')

// ---- Users / staff ----
export const listStaff = (department) => api.get('/api/users/staff', { params: { department } })
export const listUsers = (params) => api.get('/api/users', { params })
export const createUser = (payload) => api.post('/api/users', payload)
export const deleteUser = (id) => api.delete(`/api/users/${id}`)

// ---- Dashboard ----
export const getDashboardSummary = () => api.get('/api/dashboard/summary')
export const getDashboardCharts = () => api.get('/api/dashboard/charts')

// ---- Impact / SLA ----
export const previewImpact = (params) => api.get('/api/impact/preview', { params })

// ---- Heatmap / recurring / audit ----
export const getHeatmap = (params) => api.get('/api/heatmap', { params })
export const getRecurring = (params) => api.get('/api/recurring', { params })
export const getAuditLogs = () => api.get('/api/audit')
