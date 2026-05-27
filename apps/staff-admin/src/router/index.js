import { createRouter, createWebHistory } from 'vue-router'
import { session } from '@/stores/session'
import AppealsView from '@/views/AppealsView.vue'
import AuditLogsView from '@/views/AuditLogsView.vue'
import CheckinsView from '@/views/CheckinsView.vue'
import DashboardView from '@/views/DashboardView.vue'
import LoginView from '@/views/LoginView.vue'
import NotificationsView from '@/views/NotificationsView.vue'
import OrdersView from '@/views/OrdersView.vue'
import PeopleView from '@/views/PeopleView.vue'
import RoomsView from '@/views/RoomsView.vue'
import WaiterWorkView from '@/views/WaiterWorkView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', component: LoginView, meta: { public: true } },
    { path: '/', component: DashboardView },
    { path: '/rooms', component: RoomsView, meta: { staff: true } },
    { path: '/orders', component: OrdersView, meta: { staff: true } },
    { path: '/checkins', component: CheckinsView, meta: { staff: true } },
    { path: '/guests', component: PeopleView, props: { type: 'guests' } },
    { path: '/employees', component: PeopleView, props: { type: 'employees' }, meta: { staff: true } },
    { path: '/admins', component: PeopleView, props: { type: 'admins' }, meta: { admin: true } },
    { path: '/waiters', component: PeopleView, props: { type: 'waiters' }, meta: { admin: true } },
    { path: '/waiter-work', component: WaiterWorkView },
    { path: '/notifications', component: NotificationsView },
    { path: '/appeals', component: AppealsView, meta: { staff: true } },
    { path: '/audit-logs', component: AuditLogsView, meta: { staff: true } }
  ]
})

router.beforeEach((to) => {
  if (!to.meta.public && !session.isAuthenticated) return '/login'
  if (to.meta.public && session.isAuthenticated) return '/'
  if (to.meta.admin && !session.isAdmin) return '/'
  if (to.meta.staff && !session.isStaff) return '/'
  return true
})

export default router
