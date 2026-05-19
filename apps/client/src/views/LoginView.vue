<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@shared'
import { setSession } from '@/stores/session'

const router = useRouter()
const form = reactive({ username: '', password: '' })
const loading = ref(false)
const error = ref('')

async function submit() {
  loading.value = true
  error.value = ''
  try {
    const payload = await api.login(form)
    setSession(payload)
    router.push('/')
  } catch (err) {
    error.value = err.message || '登录失败'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="auth-page">
    <form class="auth-card" @submit.prevent="submit">
      <h1>住客登录</h1>
      <p>使用住客账号查看房态、预订和通知。</p>

      <div class="form-grid">
        <label class="field">
          <span>用户名</span>
          <input v-model.trim="form.username" autocomplete="username" required />
        </label>
        <label class="field">
          <span>密码</span>
          <input v-model="form.password" type="password" autocomplete="current-password" required />
        </label>
        <button class="primary-button" type="submit" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </div>

      <p v-if="error" class="error-text">{{ error }}</p>
      <div class="link-row">
        <span>还没有账号？</span>
        <RouterLink to="/register">注册住客账号</RouterLink>
      </div>
    </form>
  </section>
</template>
