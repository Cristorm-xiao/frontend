import { API_BASE } from './constants'

let tokenGetter = () => ''

export function configureApi(options = {}) {
  tokenGetter = options.getToken || tokenGetter
}

function buildUrl(path, query) {
  const url = new URL(`${API_BASE}${path}`, window.location.origin)
  Object.entries(query || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value)
    }
  })
  return url.pathname + url.search
}

export async function request(path, options = {}) {
  const headers = new Headers(options.headers || {})
  const token = tokenGetter()

  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(buildUrl(path, options.query), {
    ...options,
    headers,
    body: options.body && !(options.body instanceof FormData) ? JSON.stringify(options.body) : options.body
  })

  let payload = null
  try {
    payload = await response.json()
  } catch {
    payload = null
  }

  if (!response.ok || (payload && payload.code !== 0)) {
    const message = payload?.message || `请求失败：${response.status}`
    const error = new Error(message)
    error.status = response.status
    error.code = payload?.code
    throw error
  }

  return payload?.data ?? null
}

export const api = {
  login: (body) => request('/auth/login', { method: 'POST', body }),
  staffLogin: (body) => request('/auth/staff-login', { method: 'POST', body }),
  adminLogin: (body) => request('/auth/admin-login', { method: 'POST', body }),
  register: (body) => request('/auth/register', { method: 'POST', body }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  deleteAccount: () => request('/auth/account', { method: 'DELETE' }),

  listRooms: (query) => request('/rooms', { query }),
  createRoom: (body) => request('/rooms', { method: 'POST', body }),
  updateRoom: (id, body) => request(`/rooms/${id}`, { method: 'PUT', body }),
  deleteRoom: (id) => request(`/rooms/${id}`, { method: 'DELETE' }),

  listOrders: (query) => request('/orders', { query }),
  createOrder: (body) => request('/orders', { method: 'POST', body }),
  cancelOrder: (code, body) => request(`/orders/${code}/cancel`, { method: 'POST', body }),
  approveCancelOrder: (code) => request(`/orders/${code}/approve-cancel`, { method: 'POST' }),
  rejectCancelOrder: (code, body) => request(`/orders/${code}/reject-cancel`, { method: 'POST', body }),
  confirmOrder: (code) => request(`/orders/${code}/confirm`, { method: 'POST' }),
  updateOrder: (code, body) => request(`/orders/${code}`, { method: 'PUT', body }),
  deleteOrder: (code) => request(`/orders/${code}`, { method: 'DELETE' }),
  listCancelRequests: (query) => request('/orders/cancel-requests', { query }),

  listCheckins: (query) => request('/checkins', { query }),
  createCheckin: (body) => request('/checkins', { method: 'POST', body }),
  checkout: (id) => request(`/checkins/${id}/checkout`, { method: 'PUT' }),
  deleteCheckin: (id) => request(`/checkins/${id}`, { method: 'DELETE' }),
  serviceRequest: (id, body) => request(`/checkins/${id}/service-request`, { method: 'POST', body }),

  listGuests: (query) => request('/guests', { query }),
  createGuest: (body) => request('/guests', { method: 'POST', body }),
  updateGuest: (id, body) => request(`/guests/${id}`, { method: 'PUT', body }),
  deleteGuest: (id) => request(`/guests/${id}`, { method: 'DELETE' }),

  listEmployees: (query) => request('/employees', { query }),
  createEmployee: (body) => request('/employees', { method: 'POST', body }),
  updateEmployee: (id, body) => request(`/employees/${id}`, { method: 'PUT', body }),
  deleteEmployee: (id) => request(`/employees/${id}`, { method: 'DELETE' }),

  listAdmins: (query) => request('/admins', { query }),
  createAdmin: (body) => request('/admins', { method: 'POST', body }),
  updateAdmin: (id, body) => request(`/admins/${id}`, { method: 'PUT', body }),
  deleteAdmin: (id) => request(`/admins/${id}`, { method: 'DELETE' }),

  listWaiters: (query) => request('/waiters', { query }),
  createWaiter: (body) => request('/waiters', { method: 'POST', body }),
  updateWaiter: (id, body) => request(`/waiters/${id}`, { method: 'PUT', body }),
  deleteWaiter: (id) => request(`/waiters/${id}`, { method: 'DELETE' }),
  completeService: (id) => request(`/waiters/${id}/complete-service`, { method: 'POST' }),

  listNotifications: (query) => request('/notifications', { query }),
  unreadCount: () => request('/notifications/unread'),
  markNotificationRead: (id) => request(`/notifications/${id}/read`, { method: 'PUT' }),

  listAuditLogs: (query) => request('/audit-logs', { query })
}

export function createNotificationSocket(token, onMessage) {
  if (!token) return null
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const url = `${protocol}//${window.location.host}${API_BASE}/ws?token=${encodeURIComponent(token)}`
  const socket = new WebSocket(url)
  socket.addEventListener('message', (event) => {
    try {
      onMessage?.(JSON.parse(event.data))
    } catch {
      onMessage?.({ title: '新通知', content: event.data })
    }
  })
  return socket
}
