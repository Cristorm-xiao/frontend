<script setup>
import { onMounted, reactive, ref } from 'vue'
import { RefreshCw, Trash2 } from 'lucide-vue-next'
import { api, checkinStatusLabel, formatDateTime, pageList } from '@shared'
import PageHeader from '@/components/PageHeader.vue'
import StatusBadge from '@/components/StatusBadge.vue'

const checkins = ref([])
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

function toRFC3339(value) {
  if (!value) return ''
  return new Date(value).toISOString()
}

async function createCheckin() {
  error.value = ''
  success.value = ''
  const body = {
    user_id: Number(form.user_id),
    expected_checkout_time: toRFC3339(form.expected_checkout_time)
  }
  if (form.order_id) body.order_id = Number(form.order_id)
  if (form.room_id) body.room_id = Number(form.room_id)

  try {
    await api.createCheckin(body)
    success.value = '入住已办理。'
    Object.assign(form, { order_id: '', user_id: '', room_id: '', expected_checkout_time: '' })
    await load()
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
  } catch (err) {
    error.value = err.message || '操作失败'
  }
}

onMounted(load)
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
          <tr v-for="row in checkins" :key="row.id">
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
      <div v-if="!checkins.length" class="empty">暂无入住记录</div>
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
          <span>住客用户 ID</span>
          <input v-model.trim="form.user_id" required />
        </label>
        <label class="field">
          <span>房间 ID（可选）</span>
          <input v-model.trim="form.room_id" />
        </label>
        <label class="field">
          <span>预计退房时间</span>
          <input v-model="form.expected_checkout_time" type="datetime-local" required />
        </label>
        <button class="primary-button" type="submit">办理入住</button>
      </div>
    </form>
  </section>
</template>
