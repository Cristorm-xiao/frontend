<script setup>
import { ShieldAlert, Trash2 } from 'lucide-vue-next'
import { api } from '@shared'
import PageHeader from '@/components/PageHeader.vue'
import { clearSession, session } from '@/stores/session'
import { useRouter } from 'vue-router'
import { ref } from 'vue'

const router = useRouter()
const error = ref('')

async function deleteAccount() {
  if (!window.confirm('确认注销当前住客账号？')) return
  error.value = ''
  try {
    await api.deleteAccount()
    clearSession()
    router.push('/login')
  } catch (err) {
    error.value = err.message || '注销失败'
  }
}
</script>

<template>
  <PageHeader title="账户信息" subtitle="查看当前登录身份并管理账号。" />

  <section class="grid content-grid">
    <article class="card">
      <h2>{{ session.user?.name || session.user?.username }}</h2>
      <div class="form-grid">
        <div class="field">
          <span>用户名</span>
          <strong>{{ session.user?.username }}</strong>
        </div>
        <div class="field">
          <span>用户 ID</span>
          <strong>{{ session.user?.id }}</strong>
        </div>
        <div class="field">
          <span>角色</span>
          <strong>住客</strong>
        </div>
      </div>
    </article>

    <article class="card">
      <h2>账号操作</h2>
      <p class="table-meta" style="margin: 10px 0 16px">
        <ShieldAlert :size="17" />
        注销会删除当前住客账号。
      </p>
      <button class="danger-button" type="button" @click="deleteAccount">
        <Trash2 :size="17" />
        注销账号
      </button>
      <p v-if="error" class="error-text">{{ error }}</p>
    </article>
  </section>
</template>
