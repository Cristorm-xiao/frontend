<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@shared'

const router = useRouter()
const form = reactive({
  username: '',
  password: '',
  name: '',
  phone: '',
  email: ''
})
const loading = ref(false)
const error = ref('')
const success = ref('')

async function submit() {
  loading.value = true
  error.value = ''
  success.value = ''
  try {
    await api.register(form)
    success.value = '注册成功，请登录。'
    setTimeout(() => router.push('/login'), 700)
  } catch (err) {
    error.value = err.message || '注册失败'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="auth-page">
    <form class="auth-card" @submit.prevent="submit">
      <h1>注册住客账号</h1>
      <p>创建账号后即可在线预订客房。</p>

      <div class="form-grid">
        <label class="field">
          <span>用户名</span>
          <input v-model.trim="form.username" minlength="3" maxlength="64" required />
        </label>
        <label class="field">
          <span>密码</span>
          <input v-model="form.password" type="password" minlength="6" required />
        </label>
        <label class="field">
          <span>姓名</span>
          <input v-model.trim="form.name" />
        </label>
        <label class="field">
          <span>手机</span>
          <input v-model.trim="form.phone" />
        </label>
        <label class="field">
          <span>邮箱</span>
          <input v-model.trim="form.email" type="email" />
        </label>
        <button class="primary-button" type="submit" :disabled="loading">
          {{ loading ? '提交中...' : '注册' }}
        </button>
      </div>

      <p v-if="error" class="error-text">{{ error }}</p>
      <p v-if="success" class="success-text">{{ success }}</p>
      <div class="link-row">
        <span>已有账号？</span>
        <RouterLink to="/login">返回登录</RouterLink>
      </div>
    </form>
  </section>
</template>
