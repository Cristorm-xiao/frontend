<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { RefreshCw, MessageSquarePlus } from 'lucide-vue-next'
import { api, formatDateTime, pageList } from '@shared'
import PageHeader from '@/components/PageHeader.vue'
import StatusBadge from '@/components/StatusBadge.vue'

const route = useRoute()
const appeals = ref([])
const page = ref(1)
const total = ref(0)
const error = ref('')
const success = ref('')
const form = reactive({ orderId: String(route.query.order_id || ''), reason: '' })

function appealTone(status) {
  if (status === 'approved') return 'good'
  if (status === 'rejected') return 'danger'
  return 'warn'
}

function appealLabel(status) {
  const map = { pending: '审核中', approved: '已通过', rejected: '已驳回' }
  return map[status] || status || '-'
}

async function load() {
  error.value = ''
  try {
    const payload = pageList(await api.listAppeals({ page: page.value, page_size: 10 }))
    appeals.value = payload.list
    total.value = payload.total
  } catch (err) {
    error.value = err.message || '申诉记录加载失败'
  }
}

async function submitAppeal() {
  error.value = ''
  success.value = ''
  try {
    await api.submitAppeal(form.orderId, { reason: form.reason })
    success.value = '申诉已提交，请等待工作人员审核。'
    form.orderId = ''
    form.reason = ''
    await load()
  } catch (err) {
    error.value = err.message || '提交申诉失败'
  }
}

onMounted(load)
</script>

<template>
  <PageHeader title="申诉中心" subtitle="对驳回的取消申请提起申诉，并查看申诉进度。">
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
            <th>申诉编号</th>
            <th>订单号</th>
            <th>申诉理由</th>
            <th>审核备注</th>
            <th>状态</th>
            <th>提交时间</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="appeal in appeals" :key="appeal.id">
            <td>{{ appeal.id }}</td>
            <td>{{ appeal.order_id }}</td>
            <td>{{ appeal.reason || '-' }}</td>
            <td>{{ appeal.review_note || '-' }}</td>
            <td><StatusBadge :tone="appealTone(appeal.status)">{{ appealLabel(appeal.status) }}</StatusBadge></td>
            <td>{{ formatDateTime(appeal.created_at) }}</td>
          </tr>
        </tbody>
      </table>
      <div v-if="!appeals.length" class="empty">暂无申诉记录</div>

      <div class="pagination">
        <button class="ghost-button" type="button" :disabled="page <= 1" @click="page--; load()">上一页</button>
        <span>第 {{ page }} 页 / 共 {{ total }} 条</span>
        <button class="ghost-button" type="button" :disabled="page * 10 >= total" @click="page++; load()">下一页</button>
      </div>
    </div>

    <form class="card" @submit.prevent="submitAppeal">
      <h2>提交申诉</h2>
      <p class="table-meta" style="margin: 8px 0 14px">
        <MessageSquarePlus :size="17" />
        对已驳回的取消申请提交申诉，工作人员将人工审核。
      </p>
      <div class="form-grid">
        <label class="field">
          <span>订单号</span>
          <input v-model.trim="form.orderId" required />
        </label>
        <label class="field">
          <span>申诉理由</span>
          <textarea v-model.trim="form.reason" required minlength="2" placeholder="请详细说明申诉理由" />
        </label>
        <button class="primary-button" type="submit">提交申诉</button>
      </div>
    </form>
  </section>
</template>