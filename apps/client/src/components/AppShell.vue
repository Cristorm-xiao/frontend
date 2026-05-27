<script setup>
import { Bell, BedDouble, CalendarCheck, ConciergeBell, Home, LogOut, MessageSquareDot, UserRound } from 'lucide-vue-next'
import { api } from '@shared'
import { clearSession, session } from '@/stores/session'
import { useRouter } from 'vue-router'

const router = useRouter()

async function logout() {
  try {
    await api.logout()
  } catch {
    // Local logout still matters when the token has already expired.
  }
  clearSession()
  router.push('/login')
}

const navItems = [
  { to: '/', label: '概览', icon: Home },
  { to: '/rooms', label: '订房', icon: BedDouble },
  { to: '/orders', label: '订单', icon: CalendarCheck },
  { to: '/appeals', label: '申诉', icon: MessageSquareDot },
  { to: '/service', label: '服务', icon: ConciergeBell },
  { to: '/notifications', label: '通知', icon: Bell },
  { to: '/profile', label: '账户', icon: UserRound }
]
</script>

<template>
  <div class="shell">
    <aside class="sidebar">
      <div class="brand">
        <span class="brand-mark">H</span>
        <div>
          <strong>住客端</strong>
          <small>{{ session.user?.name || session.user?.username }}</small>
        </div>
      </div>

      <nav class="nav-list">
        <RouterLink v-for="item in navItems" :key="item.to" :to="item.to">
          <component :is="item.icon" :size="18" />
          <span>{{ item.label }}</span>
        </RouterLink>
      </nav>

      <button class="ghost-button nav-logout" type="button" @click="logout">
        <LogOut :size="18" />
        <span>退出</span>
      </button>
    </aside>

    <main class="main-panel">
      <slot />
    </main>
  </div>
</template>
