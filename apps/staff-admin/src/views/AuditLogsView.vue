<script setup>
import { onMounted, ref } from 'vue'
import { RefreshCw } from 'lucide-vue-next'
import { api, formatDateTime, pageList } from '@shared'
import PageHeader from '@/components/PageHeader.vue'

const logs = ref([])
const page = ref(1)
const total = ref(0)
const error = ref('')

async function load() {
  error.value = ''
  try {
    const payload = pageList(await api.listAuditLogs({ page: page.value, page_size: 12 }))
    logs.value = payload.list
    total.value = payload.total
  } catch (err) {
    error.value = err.message || '审计日志加载失败'
  }
}

function compact(value) {
  if (!value) return '-'
  if (typeof value === 'string') return value
  return JSON.stringify(value)
}

onMounted(load)
</script>

<template>
  <PageHeader title="审计日志" subtitle="查看后端记录的数据变更轨迹。">
    <button class="ghost-button" type="button" @click="load">
      <RefreshCw :size="17" />
      刷新
    </button>
  </PageHeader>

  <p v-if="error" class="error-text">{{ error }}</p>

  <table class="data-table">
    <thead>
      <tr>
        <th>ID</th>
        <th>操作人</th>
        <th>动作</th>
        <th>对象</th>
        <th>时间</th>
        <th>变更前</th>
        <th>变更后</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="log in logs" :key="log.id">
        <td>{{ log.id }}</td>
        <td>{{ log.user?.username || log.user_id || '-' }}</td>
        <td>{{ log.action || '-' }}</td>
        <td>{{ log.resource || log.table_name || '-' }}</td>
        <td>{{ formatDateTime(log.created_at) }}</td>
        <td>{{ compact(log.old_value || log.before) }}</td>
        <td>{{ compact(log.new_value || log.after) }}</td>
      </tr>
    </tbody>
  </table>
  <div v-if="!logs.length" class="empty">暂无审计日志</div>

  <div class="pagination">
    <button class="ghost-button" type="button" :disabled="page <= 1" @click="page--; load()">上一页</button>
    <span>第 {{ page }} 页 / 共 {{ total }} 条</span>
    <button class="ghost-button" type="button" :disabled="page * 12 >= total" @click="page++; load()">下一页</button>
  </div>
</template>
