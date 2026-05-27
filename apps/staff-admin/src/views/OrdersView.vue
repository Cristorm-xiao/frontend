<script setup>
import { onMounted, reactive, ref } from 'vue'
import { RefreshCw, Trash2 } from 'lucide-vue-next'
import { api, formatMoney, orderStatusLabel, orderStatuses, pageList } from '@shared'
import PageHeader from '@/components/PageHeader.vue'
import StatusBadge from '@/components/StatusBadge.vue'

const orders = ref([])
const cancelRequests = ref([])
const page = ref(1)
const total = ref(0)
const error = ref('')
const success = ref('')
const editForm = reactive({ code: '', check_in_date: '', check_out_date: '', total_price: 0, status: 'pending' })
const editableOrderStatuses = orderStatuses.filter((status) => !['cancel_requested', 'cancelled'].includes(status.value))

const today = new Date().toISOString().split('T')[0]

function tone(status) {
  if (status === 'confirmed') return 'good'
  if (status === 'cancelled') return 'danger'
  return 'warn'
}

function edit(order) {
  Object.assign(editForm, {
    code: order.id,
    check_in_date: order.check_in_date,
    check_out_date: order.check_out_date,
    total_price: order.total_price,
    status: order.status
  })
}

function clearEdit() {
  Object.assign(editForm, { code: '', check_in_date: '', check_out_date: '', total_price: 0, status: 'pending' })
}

function isEditableStatus(status) {
  return editableOrderStatuses.some((item) => item.value === status)
}

async function load() {
  error.value = ''
  try {
    const [orderPayload, cancelPayload] = await Promise.all([
      api.listOrders({ page: page.value, page_size: 10 }),
      api.listCancelRequests({ page: 1, page_size: 6 })
    ])
    const orderPage = pageList(orderPayload)
    orders.value = orderPage.list
    total.value = orderPage.total
    cancelRequests.value = pageList(cancelPayload).list
  } catch (err) {
    error.value = err.message || '订单加载失败'
  }
}

async function confirm(order) {
  await runAction(() => api.confirmOrder(order.id), '订单已确认。')
}

async function approveCancel(order) {
  await runAction(() => api.approveCancelOrder(order.id), '取消申请已通过。')
}

async function rejectCancel(order) {
  await runAction(() => api.rejectCancelOrder(order.id, {}), '取消申请已驳回。')
}

async function saveEdit() {
  const body = {
    check_in_date: editForm.check_in_date,
    check_out_date: editForm.check_out_date,
    total_price: Number(editForm.total_price)
  }
  if (isEditableStatus(editForm.status)) {
    body.status = editForm.status
  }
  await runAction(
    () => api.updateOrder(editForm.code, body),
    '订单已更新。'
  )
  clearEdit()
}

async function remove(order) {
  if (!window.confirm(`确认删除订单 ${order.id}？`)) return
  await runAction(() => api.deleteOrder(order.id), '订单已删除。')
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
    try { await load() } catch {}
  }
}

onMounted(load)
</script>

<template>
  <PageHeader title="订单管理" subtitle="确认入住订单，处理取消审核，维护订单状态。">
    <button class="ghost-button" type="button" @click="load">
      <RefreshCw :size="17" />
      刷新
    </button>
  </PageHeader>

  <p v-if="error" class="error-text">{{ error }}</p>
  <p v-if="success" class="success-text">{{ success }}</p>

  <section class="grid content-grid">
    <div>
      <article v-if="cancelRequests.length" class="card" style="margin-bottom: 16px">
        <h2>待审核取消申请</h2>
        <table class="data-table" style="margin-top: 12px">
          <thead>
            <tr>
              <th>订单号</th>
              <th>房间</th>
              <th>原因</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in cancelRequests" :key="order.id">
              <td>{{ order.id }}</td>
              <td>{{ order.room?.room_number || order.room_id }}</td>
              <td>{{ order.cancel_reason || '-' }}</td>
              <td>
                <div class="button-row">
                  <button class="small-button" type="button" @click="approveCancel(order)">通过</button>
                  <button class="ghost-button" type="button" @click="rejectCancel(order)">驳回</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </article>

      <table class="data-table">
        <thead>
          <tr>
            <th>订单号</th>
            <th>住客</th>
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
            <td>{{ order.user?.username || order.user_id }}</td>
            <td>{{ order.room?.room_number || order.room_id }}</td>
            <td>{{ order.check_in_date }} 至 {{ order.check_out_date }}</td>
            <td>{{ formatMoney(order.total_price) }}</td>
            <td><StatusBadge :tone="tone(order.status)">{{ orderStatusLabel(order.status) }}</StatusBadge></td>
            <td>
              <div class="button-row">
                <button class="small-button" type="button" :disabled="order.status !== 'pending'" @click="confirm(order)">
                  确认
                </button>
                <button class="ghost-button" type="button" @click="edit(order)">编辑</button>
                <button class="danger-button" type="button" @click="remove(order)">
                  <Trash2 :size="16" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="!orders.length" class="empty">暂无订单</div>
      <div class="pagination">
        <button class="ghost-button" type="button" :disabled="page <= 1" @click="page--; load()">上一页</button>
        <span>第 {{ page }} 页 / 共 {{ total }} 条</span>
        <button class="ghost-button" type="button" :disabled="page * 10 >= total" @click="page++; load()">下一页</button>
      </div>
    </div>

    <form class="card" @submit.prevent="saveEdit">
      <h2>编辑订单</h2>
      <div class="form-grid">
        <label class="field">
          <span>订单号</span>
          <input v-model.trim="editForm.code" required />
        </label>
        <label class="field">
          <span>入住日期</span>
          <input v-model="editForm.check_in_date" type="date" :min="today" />
        </label>
        <label class="field">
          <span>退房日期</span>
          <input v-model="editForm.check_out_date" type="date" :min="editForm.check_in_date || today" />
        </label>
        <label class="field">
          <span>总价</span>
          <input v-model.number="editForm.total_price" type="number" min="0" step="0.01" />
        </label>
        <label class="field">
          <span>状态</span>
          <select v-model="editForm.status">
            <option v-for="status in editableOrderStatuses" :key="status.value" :value="status.value">{{ status.label }}</option>
          </select>
        </label>
        <button class="primary-button" type="submit">保存订单</button>
      </div>
    </form>
  </section>
</template>
