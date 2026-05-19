<script setup>
import { onMounted, reactive, ref } from 'vue'
import { RefreshCw, Trash2 } from 'lucide-vue-next'
import { api, formatMoney, pageList, roomStatusLabel, roomStatuses, roomTypeLabel, roomTypes } from '@shared'
import PageHeader from '@/components/PageHeader.vue'
import StatusBadge from '@/components/StatusBadge.vue'

const emptyForm = () => ({
  id: null,
  room_number: '',
  type: 'standard',
  capacity: 2,
  floor: 1,
  price_per_night: 300,
  status: 'vacant',
  description: ''
})

const rooms = ref([])
const page = ref(1)
const total = ref(0)
const form = reactive(emptyForm())
const error = ref('')
const success = ref('')

function resetForm() {
  Object.assign(form, emptyForm())
}

function edit(room) {
  Object.assign(form, {
    id: room.id,
    room_number: room.room_number,
    type: room.type || 'standard',
    capacity: room.capacity || 1,
    floor: room.floor || 1,
    price_per_night: room.price_per_night || 0,
    status: room.status || 'vacant',
    description: room.description || ''
  })
}

function tone(status) {
  if (status === 'vacant') return 'good'
  if (status === 'reserved') return 'warn'
  return 'neutral'
}

async function load() {
  error.value = ''
  try {
    const payload = pageList(await api.listRooms({ page: page.value, page_size: 12 }))
    rooms.value = payload.list
    total.value = payload.total
  } catch (err) {
    error.value = err.message || '客房加载失败'
  }
}

async function save() {
  error.value = ''
  success.value = ''
  const body = {
    room_number: form.room_number,
    type: form.type,
    capacity: Number(form.capacity),
    floor: Number(form.floor),
    price_per_night: Number(form.price_per_night),
    status: form.status,
    description: form.description
  }
  try {
    if (form.id) {
      await api.updateRoom(form.id, body)
      success.value = '客房已更新。'
    } else {
      await api.createRoom(body)
      success.value = '客房已创建。'
    }
    resetForm()
    await load()
  } catch (err) {
    error.value = err.message || '保存失败'
  }
}

async function remove(room) {
  if (!window.confirm(`确认删除 ${room.room_number} 房？`)) return
  try {
    await api.deleteRoom(room.id)
    await load()
  } catch (err) {
    error.value = err.message || '删除失败'
  }
}

onMounted(load)
</script>

<template>
  <PageHeader title="客房管理" subtitle="维护房型、价格和房态。">
    <button class="ghost-button" type="button" @click="load">
      <RefreshCw :size="17" />
      刷新
    </button>
  </PageHeader>

  <p v-if="error" class="error-text">{{ error }}</p>
  <p v-if="success" class="success-text">{{ success }}</p>

  <section class="grid content-grid">
    <div>
      <table class="data-table">
        <thead>
          <tr>
            <th>房号</th>
            <th>房型</th>
            <th>容量</th>
            <th>楼层</th>
            <th>价格</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="room in rooms" :key="room.id">
            <td>{{ room.room_number }}</td>
            <td>{{ roomTypeLabel(room.type) }}</td>
            <td>{{ room.capacity }}</td>
            <td>{{ room.floor }}</td>
            <td>{{ formatMoney(room.price_per_night) }}</td>
            <td><StatusBadge :tone="tone(room.status)">{{ roomStatusLabel(room.status) }}</StatusBadge></td>
            <td>
              <div class="button-row">
                <button class="small-button" type="button" @click="edit(room)">编辑</button>
                <button class="danger-button" type="button" @click="remove(room)">
                  <Trash2 :size="16" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="!rooms.length" class="empty">暂无客房</div>
      <div class="pagination">
        <button class="ghost-button" type="button" :disabled="page <= 1" @click="page--; load()">上一页</button>
        <span>第 {{ page }} 页 / 共 {{ total }} 条</span>
        <button class="ghost-button" type="button" :disabled="page * 12 >= total" @click="page++; load()">下一页</button>
      </div>
    </div>

    <form class="card" @submit.prevent="save">
      <h2>{{ form.id ? '编辑客房' : '新增客房' }}</h2>
      <div class="form-grid form-two">
        <label class="field">
          <span>房号</span>
          <input v-model.trim="form.room_number" required />
        </label>
        <label class="field">
          <span>房型</span>
          <select v-model="form.type">
            <option v-for="type in roomTypes" :key="type.value" :value="type.value">{{ type.label }}</option>
          </select>
        </label>
        <label class="field">
          <span>容量</span>
          <input v-model.number="form.capacity" type="number" min="1" />
        </label>
        <label class="field">
          <span>楼层</span>
          <input v-model.number="form.floor" type="number" min="1" />
        </label>
        <label class="field">
          <span>每晚价格</span>
          <input v-model.number="form.price_per_night" type="number" min="0" step="0.01" />
        </label>
        <label class="field">
          <span>状态</span>
          <select v-model="form.status">
            <option v-for="status in roomStatuses" :key="status.value" :value="status.value">{{ status.label }}</option>
          </select>
        </label>
      </div>
      <label class="field" style="margin-top: 12px">
        <span>描述</span>
        <textarea v-model.trim="form.description" />
      </label>
      <div class="button-row" style="margin-top: 14px">
        <button class="primary-button" type="submit">保存</button>
        <button class="ghost-button" type="button" @click="resetForm">清空</button>
      </div>
    </form>
  </section>
</template>
