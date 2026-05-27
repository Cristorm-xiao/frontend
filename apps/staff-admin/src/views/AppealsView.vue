<script setup>
import { onMounted, reactive, ref } from 'vue'
import { RefreshCw } from 'lucide-vue-next'
import { api, formatDateTime, pageList } from '@shared'
import PageHeader from '@/components/PageHeader.vue'
import StatusBadge from '@/components/StatusBadge.vue'

const appeals = ref([])
const page = ref(1)
const total = ref(0)
const error = ref('')
const success = ref('')
const reviewForm = reactive({ code: '', action: 'approved', review_note: '' })

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

function pickReview(appeal) {
  reviewForm.code = appeal.id
  reviewForm.action = 'approved'
  reviewForm.review_note = ''
}

async function submitReview() {
  error.value = ''
  success.value = ''
  try {
    const result = await api.reviewAppeal(reviewForm.code, {
      action: reviewForm.action,
      review_note: reviewForm.review_note
    })
    const statusText = result.status === 'approved' ? '已通过' : '已驳回'
    success.value = `申诉 ${statusText}。`
    reviewForm.code = ''
    reviewForm.review_note = ''
    await load()
  } catch (err) {
    error.value = err.message || '审核失败'
  }
}

onMounted(load)
</script>

<template>
  <PageHeader title="申诉审核" subtitle="处理住客提交的申诉，审核通过则取消订单并释放房间。">
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
            <th>住客</th>
            <th>申诉理由</th>
            <th>审核人</th>
            <th>状态</th>
            <th>提交时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="appeal in appeals" :key="appeal.id">
            <td>{{ appeal.id }}</td>
            <td>{{ appeal.order_id }}</td>
            <td>{{ appeal.user?.username || appeal.user_id }}</td>
            <td>{{ appeal.reason || '-' }}</td>
            <td>{{ appeal.reviewer_id || '-' }}</td>
            <td><StatusBadge :tone="appealTone(appeal.status)">{{ appealLabel(appeal.status) }}</StatusBadge></td>
            <td>{{ formatDateTime(appeal.created_at) }}</td>
            <td>
              <button class="small-button" type="button" :disabled="appeal.status !== 'pending'" @click="pickReview(appeal)">
                审核
              </button>
            </td>
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

    <form class="card" @submit.prevent="submitReview">
      <h2>审核申诉</h2>
      <div class="form-grid">
        <label class="field">
          <span>申诉编号</span>
          <input v-model.trim="reviewForm.code" required />
        </label>
        <label class="field">
          <span>审核决定</span>
          <select v-model="reviewForm.action">
            <option value="approved">通过（取消订单）</option>
            <option value="rejected">驳回</option>
          </select>
        </label>
        <label class="field">
          <span>审核备注</span>
          <textarea v-model.trim="reviewForm.review_note" placeholder="可选填审核备注" />
        </label>
        <div class="button-row">
          <button class="small-button" type="submit" @click="reviewForm.action = 'approved'">通过</button>
          <button class="danger-button" type="submit" @click="reviewForm.action = 'rejected'">驳回</button>
        </div>
      </div>
    </form>
  </section>
</template>