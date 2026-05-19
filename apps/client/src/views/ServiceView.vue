<script setup>
import { reactive, ref } from 'vue'
import { api } from '@shared'
import PageHeader from '@/components/PageHeader.vue'

const form = reactive({ checkinId: '', content: '', note: '' })
const error = ref('')
const success = ref('')
const assigned = ref(null)

async function submit() {
  error.value = ''
  success.value = ''
  assigned.value = null
  try {
    assigned.value = await api.serviceRequest(form.checkinId, { content: form.content, note: form.note })
    success.value = assigned.value?.name ? `已分配服务员：${assigned.value.name}` : '服务请求已提交。'
    form.content = ''
    form.note = ''
  } catch (err) {
    error.value = err.message || '服务请求失败'
  }
}
</script>

<template>
  <PageHeader title="客房服务" subtitle="已入住住客可凭入住记录 ID 发起服务请求。" />

  <section class="grid content-grid">
    <form class="card" @submit.prevent="submit">
      <h2>发起服务请求</h2>
      <div class="form-grid">
        <label class="field">
          <span>入住记录 ID</span>
          <input v-model.trim="form.checkinId" required />
        </label>
        <label class="field">
          <span>服务内容</span>
          <input v-model.trim="form.content" placeholder="如：送水、打扫房间" required />
        </label>
        <label class="field">
          <span>备注</span>
          <textarea v-model.trim="form.note" />
        </label>
        <button class="primary-button" type="submit">提交</button>
      </div>
      <p v-if="error" class="error-text">{{ error }}</p>
      <p v-if="success" class="success-text">{{ success }}</p>
    </form>

    <article class="card">
      <h2>当前分配</h2>
      <div v-if="assigned" class="notice-card" style="margin-top: 14px">
        <strong>{{ assigned.name || '服务员' }}</strong>
        <span>{{ assigned.phone || '暂无联系电话' }}</span>
        <span>服务房间 ID：{{ assigned.serving_room_id || '-' }}</span>
      </div>
      <div v-else class="empty">提交后将在这里显示分配结果</div>
    </article>
  </section>
</template>
