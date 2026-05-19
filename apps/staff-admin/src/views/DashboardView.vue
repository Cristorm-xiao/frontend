<script setup>
import { computed, onMounted, ref } from 'vue'
import { api, formatMoney, orderStatusLabel, pageList, roleLabel, roomStatusLabel } from '@shared'
import PageHeader from '@/components/PageHeader.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import { session } from '@/stores/session'

const rooms = ref([])
const orders = ref([])
const cancelRequests = ref([])
const unread = ref(0)
const error = ref('')

const vacantRooms = computed(() => rooms.value.filter((room) => room.status === 'vacant').length)
const pendingOrders = computed(() => orders.value.filter((order) => order.status === 'pending').length)

function statusTone(status) {
  if (['vacant', 'confirmed'].includes(status)) return 'good'
  if (['cancelled'].includes(status)) return 'danger'
  return 'warn'
}

async function load() {
  error.value = ''
  try {
    const tasks = [api.unreadCount()]
    if (session.isStaff) {
      tasks.push(api.listRooms({ page: 1, page_size: 8 }))
      tasks.push(api.listOrders({ page: 1, page_size: 8 }))
      tasks.push(api.listCancelRequests({ page: 1, page_size: 5 }))
    }
    const [unreadPayload, roomPayload, orderPayload, cancelPayload] = await Promise.all(tasks)
    unread.value = unreadPayload?.count || 0
    rooms.value = roomPayload ? pageList(roomPayload).list : []
    orders.value = orderPayload ? pageList(orderPayload).list : []
    cancelRequests.value = cancelPayload ? pageList(cancelPayload).list : []
  } catch (err) {
    error.value = err.message || '工作台加载失败'
  }
}

onMounted(load)
</script>

<template>
  <PageHeader
    title="工作台"
    :subtitle="`${session.user?.name || session.user?.username}，当前身份：${roleLabel(session.role)}`"
  />

  <p v-if="error" class="error-text">{{ error }}</p>

  <section class="grid stats-grid">
    <article class="card">
      <span>空闲房间</span>
      <div class="stat-value">{{ vacantRooms }}</div>
    </article>
    <article class="card">
      <span>待处理订单</span>
      <div class="stat-value">{{ pendingOrders }}</div>
    </article>
    <article class="card">
      <span>取消审核</span>
      <div class="stat-value">{{ cancelRequests.length }}</div>
    </article>
    <article class="card">
      <span>未读通知</span>
      <div class="stat-value">{{ unread }}</div>
    </article>
  </section>

  <section class="grid content-grid" style="margin-top: 16px">
    <article class="card">
      <h2>近期订单</h2>
      <table v-if="orders.length" class="data-table" style="margin-top: 14px">
        <thead>
          <tr>
            <th>订单号</th>
            <th>房间</th>
            <th>日期</th>
            <th>金额</th>
            <th>状态</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in orders" :key="order.id">
            <td>{{ order.id }}</td>
            <td>{{ order.room?.room_number || order.room_id }}</td>
            <td>{{ order.check_in_date }} 至 {{ order.check_out_date }}</td>
            <td>{{ formatMoney(order.total_price) }}</td>
            <td><StatusBadge :tone="statusTone(order.status)">{{ orderStatusLabel(order.status) }}</StatusBadge></td>
          </tr>
        </tbody>
      </table>
      <div v-else class="empty">暂无订单数据</div>
    </article>

    <article class="card">
      <h2>房态摘要</h2>
      <div v-for="room in rooms.slice(0, 6)" :key="room.id" class="notice-card" style="margin-top: 12px">
        <strong>{{ room.room_number }} 房 · {{ formatMoney(room.price_per_night) }}</strong>
        <StatusBadge :tone="statusTone(room.status)">{{ roomStatusLabel(room.status) }}</StatusBadge>
      </div>
      <div v-if="!rooms.length" class="empty">暂无房态数据</div>
    </article>
  </section>
</template>
