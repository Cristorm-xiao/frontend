import { reactive } from 'vue'
import { configureApi, createSessionStorage } from '@shared'

const storage = createSessionStorage('hotel.staff.session')
const saved = storage.read()

export const session = reactive({
  user: saved?.user || null,
  token: saved?.token || '',
  get isAuthenticated() {
    return Boolean(this.token)
  },
  get role() {
    return this.user?.role || ''
  },
  get isAdmin() {
    return this.role === 'admin'
  },
  get isStaff() {
    return this.role === 'employee' || this.role === 'admin'
  }
})

configureApi({
  getToken: () => session.token
})

export function setSession(loginPayload) {
  session.token = loginPayload.access_token
  session.user = {
    id: loginPayload.user_id,
    username: loginPayload.username,
    role: loginPayload.role,
    name: loginPayload.name
  }
  storage.write({ token: session.token, user: session.user })
}

export function clearSession() {
  session.user = null
  session.token = ''
  storage.clear()
}
