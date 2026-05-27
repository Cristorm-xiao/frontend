<script setup>
import { computed, onMounted, ref } from 'vue'
import { api, formatMoney, orderStatusLabel, pageList, roomStatusLabel, roomTypeLabel } from '@shared'
import PageHeader from '@/components/PageHeader.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import { session } from '@/stores/session'

const rooms = ref([])
const orders = ref([])
const unread = ref(0)
const loading = ref(true)
const error = ref('')

const vacantRooms = computed(() => rooms.value.filter((room) => room.status === 'vacant').length)
const activeOrders = computed(() => orders.value.filter((order) => order.status === 'pending').length)

function roomTone(status) {
  if (status === 'vacant') return 'good'
  if (status === 'reserved') return 'warn'
  return 'neutral'
}

function orderTone(status) {
  if (status === 'confirmed') return 'good'
  if (status === 'cancelled') return 'danger'
  return 'warn'
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const [roomPayload, orderPayload, unreadPayload] = await Promise.all([
      api.listRooms({ page: 1, page_size: 6 }),
      api.listOrders({ page: 1, page_size: 5 }),
      api.unreadCount()
    ])
    rooms.value = pageList(roomPayload).list
    orders.value = pageList(orderPayload).list
    unread.value = unreadPayload?.count || 0
  } catch (err) {
    error.value = err.message || '数据加载失败'
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <PageHeader title="住客概览" :subtitle="`欢迎回来，${session.user?.name || session.user?.username}`" />

  <p v-if="error" class="error-text">{{ error }}</p>

  <section class="grid stats-grid">
    <article class="card">
      <span>当前可订房</span>
      <div class="stat-value">{{ vacantRooms }}</div>
    </article>
    <article class="card">
      <span>待确认订单</span>
      <div class="stat-value">{{ activeOrders }}</div>
    </article>
    <article class="card">
      <span>未读通知</span>
      <div class="stat-value">{{ unread }}</div>
    </article>
  </section>

  <section class="grid content-grid" style="margin-top: 16px">
    <article class="card">
      <h2>推荐房间</h2>
      <div v-if="loading" class="empty">加载中...</div>
      <div v-else class="room-grid" style="margin-top: 14px">
        <div v-for="room in rooms" :key="room.id" class="room-card">
          <div>
            <h3>{{ room.room_number }} 房</h3>
            <div class="room-meta">
              <span>{{ roomTypeLabel(room.type) }}</span>
              <span>{{ room.capacity || 1 }} 人</span>
              <span>{{ room.floor || '-' }} 层</span>
            </div>
          </div>
          <StatusBadge :tone="roomTone(room.status)">{{ roomStatusLabel(room.status) }}</StatusBadge>
          <strong>{{ formatMoney(room.price_per_night) }} / 晚</strong>
          <RouterLink class="small-button" to="/rooms">去预订</RouterLink>
        </div>
      </div>
    </article>

    <article class="card">
      <h2>最近订单</h2>
      <div v-if="!orders.length && !loading" class="empty">暂无订单</div>
      <div v-for="order in orders" :key="order.id" class="notice-card" style="margin-top: 12px">
        <strong>订单 {{ order.id }}</strong>
        <span>{{ order.check_in_date }} 至 {{ order.check_out_date }}</span>
        <StatusBadge :tone="orderTone(order.status)">{{ orderStatusLabel(order.status) }}</StatusBadge>
      </div>
    </article>
  </section>
</template>
