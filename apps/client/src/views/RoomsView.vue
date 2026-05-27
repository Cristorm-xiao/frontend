<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { BedDouble, RefreshCw } from 'lucide-vue-next'
import { api, formatMoney, pageList, roomStatusLabel, roomTypeLabel, roomTypes } from '@shared'
import PageHeader from '@/components/PageHeader.vue'
import StatusBadge from '@/components/StatusBadge.vue'

const rooms = ref([])
const total = ref(0)
const page = ref(1)
const loading = ref(false)
const error = ref('')
const success = ref('')
const selectedRoom = ref(null)
const filters = reactive({ type: '' })
const booking = reactive({
  guest_count: 2,
  room_type_preference: 'standard',
  check_in_date: '',
  check_out_date: ''
})

const today = new Date().toISOString().split('T')[0]

const filteredRooms = computed(() =>
  rooms.value.filter((room) => {
    const byType = !filters.type || room.type === filters.type
    return byType
  })
)

function roomTone(status) {
  if (status === 'vacant') return 'good'
  if (status === 'reserved') return 'warn'
  return 'neutral'
}

function daysBetween(start, end) {
  const startDate = new Date(start)
  const endDate = new Date(end)
  const day = 24 * 60 * 60 * 1000
  const diff = Math.ceil((endDate - startDate) / day)
  return diff > 0 ? diff : 1
}

function estimateTotal(room) {
  if (!room || !booking.check_in_date || !booking.check_out_date) return 0
  return daysBetween(booking.check_in_date, booking.check_out_date) * Number(room.price_per_night || 0)
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const payload = pageList(await api.listRooms({ page: page.value, page_size: 12 }))
    rooms.value = payload.list
    total.value = payload.total
  } catch (err) {
    error.value = err.message || '房态加载失败'
  } finally {
    loading.value = false
  }
}

async function createOrder(autoAssign = false) {
  error.value = ''
  success.value = ''
  const room = autoAssign ? null : selectedRoom.value
  const body = {
    check_in_date: booking.check_in_date,
    check_out_date: booking.check_out_date,
    total_price: room ? estimateTotal(room) : 0
  }
  if (room) {
    body.room_id = room.id
  } else {
    body.guest_count = Number(booking.guest_count || 1)
    body.room_type_preference = booking.room_type_preference
  }

  try {
    const order = await api.createOrder(body)
    success.value = `预订已提交，订单号：${order.id}`
    selectedRoom.value = null
    await load()
  } catch (err) {
    error.value = err.message || '预订失败'
  }
}

onMounted(load)
</script>

<template>
  <PageHeader title="客房预订" subtitle="查看房态，选择房间或让系统自动分配。">
    <button class="ghost-button" type="button" @click="load">
      <RefreshCw :size="17" />
      刷新
    </button>
  </PageHeader>

  <div class="toolbar">
    <label class="field">
      <span>房型</span>
      <select v-model="filters.type">
        <option value="">全部</option>
        <option v-for="type in roomTypes" :key="type.value" :value="type.value">{{ type.label }}</option>
      </select>
    </label>
  </div>

  <p v-if="error" class="error-text">{{ error }}</p>
  <p v-if="success" class="success-text">{{ success }}</p>

  <section class="grid content-grid">
    <div>
      <div v-if="loading" class="empty">加载中...</div>
      <div v-else-if="!filteredRooms.length" class="empty">没有匹配的房间</div>
      <div v-else class="room-grid">
        <article v-for="room in filteredRooms" :key="room.id" class="room-card">
          <div>
            <h3>{{ room.room_number }} 房</h3>
            <div class="room-meta">
              <span>{{ roomTypeLabel(room.type) }}</span>
              <span>{{ room.capacity || 1 }} 人</span>
              <span>{{ room.floor || '-' }} 层</span>
            </div>
          </div>
          <p>{{ room.description || '暂无描述' }}</p>
          <StatusBadge :tone="roomTone(room.status)">{{ roomStatusLabel(room.status) }}</StatusBadge>
          <strong>{{ formatMoney(room.price_per_night) }} / 晚</strong>
          <button class="small-button" type="button" :disabled="room.status !== 'vacant'" @click="selectedRoom = room">
            <BedDouble :size="16" />
            选择
          </button>
        </article>
      </div>

      <div class="pagination">
        <button class="ghost-button" type="button" :disabled="page <= 1" @click="page--; load()">上一页</button>
        <span>第 {{ page }} 页 / 共 {{ total }} 条</span>
        <button class="ghost-button" type="button" :disabled="page * 12 >= total" @click="page++; load()">下一页</button>
      </div>
    </div>

    <form class="card" @submit.prevent="createOrder(false)">
      <h2>提交预订</h2>
      <p class="table-meta" style="margin-top: 8px">
        {{ selectedRoom ? `已选 ${selectedRoom.room_number} 房` : '未选择房间时可使用自动分配' }}
      </p>
      <div class="form-grid">
        <label class="field">
          <span>入住日期</span>
          <input v-model="booking.check_in_date" type="date" :min="today" required />
        </label>
        <label class="field">
          <span>退房日期</span>
          <input v-model="booking.check_out_date" type="date" :min="booking.check_in_date || today" required />
        </label>
        <label class="field">
          <span>入住人数</span>
          <input v-model.number="booking.guest_count" type="number" min="1" />
        </label>
        <label class="field">
          <span>偏好房型</span>
          <select v-model="booking.room_type_preference">
            <option v-for="type in roomTypes" :key="type.value" :value="type.value">{{ type.label }}</option>
          </select>
        </label>
        <button class="primary-button" type="submit" :disabled="!selectedRoom">预订所选房间</button>
        <button class="ghost-button" type="button" @click="createOrder(true)">自动分配房间</button>
      </div>
    </form>
  </section>
</template>
