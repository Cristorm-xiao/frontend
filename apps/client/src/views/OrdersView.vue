<script setup>
import { onMounted, reactive, ref } from 'vue'
import { RefreshCw } from 'lucide-vue-next'
import { api, formatMoney, orderStatusLabel, pageList } from '@shared'
import PageHeader from '@/components/PageHeader.vue'
import StatusBadge from '@/components/StatusBadge.vue'

const orders = ref([])
const page = ref(1)
const total = ref(0)
const loading = ref(false)
const error = ref('')
const success = ref('')
const cancelForm = reactive({ code: '', reason: '' })

function orderTone(status) {
  if (status === 'confirmed') return 'good'
  if (status === 'cancelled') return 'danger'
  return 'warn'
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const payload = pageList(await api.listOrders({ page: page.value, page_size: 10 }))
    orders.value = payload.list
    total.value = payload.total
  } catch (err) {
    error.value = err.message || '订单加载失败'
  } finally {
    loading.value = false
  }
}

function pickCancel(order) {
  cancelForm.code = order.id
  cancelForm.reason = ''
}

function canCancel(order) {
  return order.status === 'pending' || order.status === 'confirmed'
}

function cancelActionLabel(order) {
  return order.status === 'confirmed' ? '申请取消' : '取消订单'
}

async function cancelOrder() {
  error.value = ''
  success.value = ''
  try {
    const result = await api.cancelOrder(cancelForm.code, { reason: cancelForm.reason })
    success.value = result.auto_cancelled ? '订单已自动取消。' : '取消申请已提交，等待工作人员审核。'
    cancelForm.code = ''
    cancelForm.reason = ''
    await load()
  } catch (err) {
    error.value = err.message || '取消失败'
  }
}

onMounted(load)
</script>

<template>
  <PageHeader title="我的订单" subtitle="查看预订进度，待确认订单可提交取消申请。">
    <button class="ghost-button" type="button" @click="load">
      <RefreshCw :size="17" />
      刷新
    </button>
  </PageHeader>

  <p v-if="error" class="error-text">{{ error }}</p>
  <p v-if="success" class="success-text">{{ success }}</p>

  <section class="grid content-grid">
    <div>
      <div v-if="loading" class="empty">加载中...</div>
      <table v-else class="data-table">
        <thead>
          <tr>
            <th>订单号</th>
            <th>房间</th>
            <th>日期</th>
            <th>金额</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in orders" :key="order.id">
            <td>{{ order.id }}</td>
            <td>{{ order.room?.room_number || order.room_id }}</td>
            <td>{{ order.check_in_date }} 至 {{ order.check_out_date }}</td>
            <td>{{ formatMoney(order.total_price) }}</td>
            <td><StatusBadge :tone="orderTone(order.status)">{{ orderStatusLabel(order.status) }}</StatusBadge></td>
            <td>
              <div class="button-row">
                <button class="small-button" type="button" :disabled="!canCancel(order)" @click="pickCancel(order)">
                  {{ cancelActionLabel(order) }}
                </button>
                <RouterLink class="small-button" :to="{ path: '/appeals', query: { order_id: order.id } }">申诉</RouterLink>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="!orders.length && !loading" class="empty">暂无订单</div>

      <div class="pagination">
        <button class="ghost-button" type="button" :disabled="page <= 1" @click="page--; load()">上一页</button>
        <span>第 {{ page }} 页 / 共 {{ total }} 条</span>
        <button class="ghost-button" type="button" :disabled="page * 10 >= total" @click="page++; load()">下一页</button>
      </div>
    </div>

    <form class="card" @submit.prevent="cancelOrder">
      <h2>取消订单</h2>
      <div class="form-grid">
        <label class="field">
          <span>订单号</span>
          <input v-model.trim="cancelForm.code" required />
        </label>
        <label class="field">
          <span>取消原因</span>
          <textarea v-model.trim="cancelForm.reason" required minlength="2" />
        </label>
        <button class="danger-button" type="submit">提交取消</button>
      </div>
    </form>
  </section>
</template>
