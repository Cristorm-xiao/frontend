<script setup>
import {
  Bell,
  ClipboardList,
  ConciergeBell,
  FileClock,
  Home,
  LogOut,
  Shield,
  UserCog,
  Users,
  Warehouse
} from 'lucide-vue-next'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { api, roleLabel } from '@shared'
import { clearSession, session } from '@/stores/session'

const router = useRouter()

const navItems = computed(() => [
  { to: '/', label: '工作台', icon: Home, show: true },
  { to: '/rooms', label: '客房', icon: Warehouse, show: session.isStaff },
  { to: '/orders', label: '订单', icon: ClipboardList, show: session.isStaff },
  { to: '/checkins', label: '入住', icon: FileClock, show: session.isStaff },
  { to: '/guests', label: '住客', icon: Users, show: true },
  { to: '/employees', label: '员工', icon: UserCog, show: session.isStaff },
  { to: '/admins', label: '管理员', icon: Shield, show: session.isAdmin },
  { to: '/waiters', label: '服务员', icon: ConciergeBell, show: session.isAdmin },
  { to: '/waiter-work', label: '服务任务', icon: ConciergeBell, show: true },
  { to: '/notifications', label: '通知', icon: Bell, show: true },
  { to: '/audit-logs', label: '审计', icon: FileClock, show: session.isStaff }
])

async function logout() {
  try {
    await api.logout()
  } catch {
    // The local session is cleared even if the server token is already invalid.
  }
  clearSession()
  router.push('/login')
}
</script>

<template>
  <div class="shell">
    <aside class="sidebar">
      <div class="brand">
        <span class="brand-mark">M</span>
        <div>
          <strong>管理端</strong>
          <small>{{ session.user?.name || session.user?.username }} · {{ roleLabel(session.role) }}</small>
        </div>
      </div>

      <nav class="nav-list">
        <RouterLink v-for="item in navItems.filter((nav) => nav.show)" :key="item.to" :to="item.to">
          <component :is="item.icon" :size="18" />
          <span>{{ item.label }}</span>
        </RouterLink>
      </nav>

      <button class="nav-logout" type="button" @click="logout">
        <LogOut :size="18" />
        <span>退出登录</span>
      </button>
    </aside>

    <main class="main-panel">
      <slot />
    </main>
  </div>
</template>
