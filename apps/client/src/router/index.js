import { createRouter, createWebHistory } from 'vue-router'
import { session } from '@/stores/session'
import DashboardView from '@/views/DashboardView.vue'
import LoginView from '@/views/LoginView.vue'
import NotificationsView from '@/views/NotificationsView.vue'
import OrdersView from '@/views/OrdersView.vue'
import ProfileView from '@/views/ProfileView.vue'
import RegisterView from '@/views/RegisterView.vue'
import RoomsView from '@/views/RoomsView.vue'
import ServiceView from '@/views/ServiceView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', name: 'login', component: LoginView, meta: { public: true } },
    { path: '/register', name: 'register', component: RegisterView, meta: { public: true } },
    { path: '/', name: 'dashboard', component: DashboardView },
    { path: '/rooms', name: 'rooms', component: RoomsView },
    { path: '/orders', name: 'orders', component: OrdersView },
    { path: '/service', name: 'service', component: ServiceView },
    { path: '/notifications', name: 'notifications', component: NotificationsView },
    { path: '/profile', name: 'profile', component: ProfileView }
  ]
})

router.beforeEach((to) => {
  if (!to.meta.public && !session.isAuthenticated) return '/login'
  if (to.meta.public && session.isAuthenticated) return '/'
  return true
})

export default router
