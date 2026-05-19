<script setup>
import { reactive, ref } from 'vue'
import { api } from '@shared'
import PageHeader from '@/components/PageHeader.vue'
import { session } from '@/stores/session'

const form = reactive({ waiterId: session.user?.id || '' })
const error = ref('')
const success = ref('')

async function complete() {
  error.value = ''
  success.value = ''
  try {
    await api.completeService(form.waiterId)
    success.value = '服务任务已完成，服务员状态已恢复空闲。'
  } catch (err) {
    error.value = err.message || '操作失败'
  }
}
</script>

<template>
  <PageHeader title="服务任务" subtitle="服务员或管理员可完成当前服务任务。" />

  <section class="grid content-grid">
    <form class="card" @submit.prevent="complete">
      <h2>完成服务</h2>
      <div class="form-grid">
        <label class="field">
          <span>服务员 ID</span>
          <input v-model.trim="form.waiterId" required />
        </label>
        <button class="primary-button" type="submit">标记完成</button>
      </div>
      <p v-if="error" class="error-text">{{ error }}</p>
      <p v-if="success" class="success-text">{{ success }}</p>
    </form>

    <article class="card">
      <h2>当前账号</h2>
      <div class="form-grid">
        <div class="field">
          <span>用户名</span>
          <strong>{{ session.user?.username }}</strong>
        </div>
        <div class="field">
          <span>角色</span>
          <strong>{{ session.role }}</strong>
        </div>
      </div>
    </article>
  </section>
</template>
