<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@shared'
import { setSession } from '@/stores/session'

const router = useRouter()
const form = reactive({ username: '', password: '', mode: 'staff' })
const loading = ref(false)
const error = ref('')

async function submit() {
  loading.value = true
  error.value = ''
  try {
    const login = form.mode === 'admin' ? api.adminLogin : api.staffLogin
    const payload = await login({ username: form.username, password: form.password })
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
      <h1>工作人员管理端</h1>
      <p>员工、服务员和管理员使用同一入口登录。</p>

      <div class="form-grid">
        <label class="field">
          <span>登录方式</span>
          <select v-model="form.mode">
            <option value="staff">员工/管理员/服务员</option>
            <option value="admin">仅管理员</option>
          </select>
        </label>
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
      <p class="link-row">默认管理员：admin / admin123</p>
    </form>
  </section>
</template>
