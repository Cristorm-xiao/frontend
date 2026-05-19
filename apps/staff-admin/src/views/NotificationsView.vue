<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { RefreshCw } from 'lucide-vue-next'
import { api, formatDateTime, pageList } from '@shared'
import PageHeader from '@/components/PageHeader.vue'
import StatusBadge from '@/components/StatusBadge.vue'

const notices = ref([])
const page = ref(1)
const total = ref(0)
const error = ref('')

async function load() {
  error.value = ''
  try {
    const payload = pageList(await api.listNotifications({ page: page.value, page_size: 12 }))
    notices.value = payload.list
    total.value = payload.total
  } catch (err) {
    error.value = err.message || '通知加载失败'
  }
}

async function markRead(notice) {
  try {
    await api.markNotificationRead(notice.id)
    notice.is_read = true
  } catch (err) {
    error.value = err.message || '标记失败'
  }
}

function onRealtime(event) {
  notices.value = [event.detail, ...notices.value]
}

onMounted(() => {
  load()
  window.addEventListener('hotel-notification', onRealtime)
})
onBeforeUnmount(() => window.removeEventListener('hotel-notification', onRealtime))
</script>

<template>
  <PageHeader title="通知中心" subtitle="接收订单审核、超时退房和服务调度消息。">
    <button class="ghost-button" type="button" @click="load">
      <RefreshCw :size="17" />
      刷新
    </button>
  </PageHeader>

  <p v-if="error" class="error-text">{{ error }}</p>

  <section class="grid">
    <article v-for="notice in notices" :key="notice.id || notice.created_at" class="notice-card">
      <div class="page-header" style="margin-bottom: 0">
        <div>
          <h3>{{ notice.title || '新通知' }}</h3>
          <p>{{ formatDateTime(notice.created_at) }}</p>
        </div>
        <StatusBadge :tone="notice.is_read ? 'neutral' : 'warn'">{{ notice.is_read ? '已读' : '未读' }}</StatusBadge>
      </div>
      <p>{{ notice.content }}</p>
      <button v-if="notice.id && !notice.is_read" class="small-button" type="button" @click="markRead(notice)">标记已读</button>
    </article>
    <div v-if="!notices.length" class="empty">暂无通知</div>
  </section>

  <div class="pagination">
    <button class="ghost-button" type="button" :disabled="page <= 1" @click="page--; load()">上一页</button>
    <span>第 {{ page }} 页 / 共 {{ total }} 条</span>
    <button class="ghost-button" type="button" :disabled="page * 12 >= total" @click="page++; load()">下一页</button>
  </div>
</template>
