<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { RefreshCw, Trash2 } from 'lucide-vue-next'
import { api, checkinStatusLabel, checkinStatuses, formatDateTime, formatMoney, pageList, roomStatusLabel, roomStatuses, roomTypeLabel } from '@shared'
import PageHeader from '@/components/PageHeader.vue'
import StatusBadge from '@/components/StatusBadge.vue'

const checkins = ref([])
const guests = ref([])
const rooms = ref([])
const page = ref(1)
const total = ref(0)
const error = ref('')
const success = ref('')
const form = reactive({
  order_id: '',
  user_id: '',
  room_id: '',
  expected_checkout_time: ''
})

const today = new Date().toISOString().slice(0, 16)

const roomFilter = ref('')

const filteredRooms = computed(() => {
  if (!roomFilter.value) return rooms.value
  return rooms.value.filter((room) => room.status === roomFilter.value)
})

const checkinFilter = ref('')

const filteredCheckins = computed(() => {
  if (!checkinFilter.value) return checkins.value
  return checkins.value.filter((row) => row.status === checkinFilter.value)
})

function tone(status) {
  return status === 'active' ? 'good' : 'neutral'
}

async function load() {
  error.value = ''
  try {
    const payload = pageList(await api.listCheckins({ page: page.value, page_size: 10 }))
    checkins.value = payload.list
    total.value = payload.total
  } catch (err) {
    error.value = err.message || '入住记录加载失败'
  }
}

async function loadGuests() {
  try {
    const payload = pageList(await api.listGuests({ page: 1, page_size: 100 }))
    guests.value = payload.list
  } catch (err) {
    console.error('加载住户失败:', err)
  }
}

async function loadRooms() {
  try {
    const payload = pageList(await api.listRooms({ page: 1, page_size: 100 }))
    rooms.value = payload.list
  } catch (err) {
    console.error('加载房间失败:', err)
  }
}

function toRFC3339(value) {
  if (!value) return ''
  return new Date(value).toISOString()
}

async function createCheckin() {
  error.value = ''
  success.value = ''
  const body = {
    user_id: Number(form.user_id),
    room_id: Number(form.room_id),
    expected_checkout_time: toRFC3339(form.expected_checkout_time)
  }
  if (form.order_id) body.order_id = Number(form.order_id)

  try {
    await api.createCheckin(body)
    success.value = '入住已办理。'
    Object.assign(form, { order_id: '', user_id: '', room_id: '', expected_checkout_time: '' })
    await load()
    await loadRooms()
  } catch (err) {
    error.value = err.message || '办理入住失败'
  }
}

async function checkout(row) {
  await runAction(() => api.checkout(row.id), '退房已办理。')
}

async function remove(row) {
  if (!window.confirm(`确认删除入住记录 ${row.id}？`)) return
  await runAction(() => api.deleteCheckin(row.id), '入住记录已删除。')
}

async function runAction(action, message) {
  error.value = ''
  success.value = ''
  try {
    await action()
    success.value = message
    await load()
    await loadRooms()
  } catch (err) {
    error.value = err.message || '操作失败'
  }
}

onMounted(() => {
  load()
  loadGuests()
  loadRooms()
})
</script>

<template>
  <PageHeader title="入住管理" subtitle="办理入住、退房和维护入住记录。">
    <button class="ghost-button" type="button" @click="load">
      <RefreshCw :size="17" />
      刷新
    </button>
  </PageHeader>

  <p v-if="error" class="error-text">{{ error }}</p>
  <p v-if="success" class="success-text">{{ success }}</p>

  <section class="grid content-grid">
    <div>
      <div class="toolbar">
        <label class="field" style="min-width: 160px;">
          <span>状态</span>
          <select v-model="checkinFilter">
            <option value="">全部</option>
            <option v-for="s in checkinStatuses" :key="s.value" :value="s.value">
              {{ s.label }}
            </option>
          </select>
        </label>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>住客</th>
            <th>房间</th>
            <th>入住</th>
            <th>预计退房</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in filteredCheckins" :key="row.id">
            <td>{{ row.id }}</td>
            <td>{{ row.user?.username || row.user_id }}</td>
            <td>{{ row.room?.room_number || row.room_id }}</td>
            <td>{{ formatDateTime(row.check_in_time) }}</td>
            <td>{{ formatDateTime(row.expected_checkout_time) }}</td>
            <td><StatusBadge :tone="tone(row.status)">{{ checkinStatusLabel(row.status) }}</StatusBadge></td>
            <td>
              <div class="button-row">
                <button class="small-button" type="button" :disabled="row.status !== 'active'" @click="checkout(row)">
                  退房
                </button>
                <button class="danger-button" type="button" @click="remove(row)">
                  <Trash2 :size="16" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="!filteredCheckins.length" class="empty">暂无入住记录</div>
      <div class="pagination">
        <button class="ghost-button" type="button" :disabled="page <= 1" @click="page--; load()">上一页</button>
        <span>第 {{ page }} 页 / 共 {{ total }} 条</span>
        <button class="ghost-button" type="button" :disabled="page * 10 >= total" @click="page++; load()">下一页</button>
      </div>
    </div>

    <form class="card" @submit.prevent="createCheckin">
      <h2>办理入住</h2>
      <div class="form-grid">
        <label class="field">
          <span>订单 ID（可选）</span>
          <input v-model.trim="form.order_id" />
        </label>
        <label class="field">
          <span>住客</span>
          <select v-model="form.user_id" required>
            <option value="" disabled>请选择住户</option>
            <option v-for="guest in guests" :key="guest.id" :value="guest.user_id">
              {{ guest.name || guest.user?.username || guest.user_id }} ({{ guest.user?.username || guest.user_id }})
            </option>
          </select>
        </label>
        <label class="field">
          <span>房间</span>
          <select v-model="form.room_id" required>
            <option value="" disabled>请选择房间</option>
            <option v-for="room in rooms" :key="room.id" :value="room.id">
              {{ room.room_number }} - {{ room.type || '标准' }} ({{ room.status === 'vacant' ? '空闲' : room.status }})
            </option>
          </select>
        </label>
        <label class="field">
          <span>预计退房时间</span>
          <input v-model="form.expected_checkout_time" type="datetime-local" :min="today" required />
        </label>
        <button class="primary-button" type="submit">办理入住</button>
      </div>
    </form>
  </section>

  <section class="card" style="margin-top: 20px;">
    <div class="page-header">
      <h2>房间状态</h2>
      <div class="field" style="min-width: 160px;">
        <select v-model="roomFilter">
          <option value="">全部</option>
          <option v-for="s in roomStatuses" :key="s.value" :value="s.value">
            {{ s.label }}
          </option>
        </select>
      </div>
    </div>
    <div v-if="filteredRooms.length" class="grid" style="grid-template-columns: repeat(4, minmax(0, 1fr));">
      <div v-for="room in filteredRooms" :key="room.id" class="card">
        <h3>{{ room.room_number }}</h3>
        <p>类型：{{ roomTypeLabel(room.type) }}</p>
        <p>容量：{{ room.capacity }} 人</p>
        <p>楼层：{{ room.floor }}</p>
        <p>价格：{{ formatMoney(room.price) }}</p>
        <p>状态：<StatusBadge :tone="room.status === 'vacant' ? 'good' : room.status === 'reserved' ? 'warn' : 'neutral'">{{ roomStatusLabel(room.status) }}</StatusBadge></p>
      </div>
    </div>
    <div v-else class="empty">暂无房间</div>
  </section>
</template>