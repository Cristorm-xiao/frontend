<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { RefreshCw, Trash2 } from 'lucide-vue-next'
import { api, pageList } from '@shared'
import PageHeader from '@/components/PageHeader.vue'
import { session } from '@/stores/session'

const props = defineProps({
  type: {
    type: String,
    required: true
  }
})

const configs = {
  guests: {
    title: '住客管理',
    subtitle: '维护住客资料，必要时可创建住客账号。',
    list: api.listGuests,
    create: api.createGuest,
    update: api.updateGuest,
    remove: api.deleteGuest
  },
  employees: {
    title: '员工管理',
    subtitle: '维护工作人员账号和联系方式。',
    list: api.listEmployees,
    create: api.createEmployee,
    update: api.updateEmployee,
    remove: api.deleteEmployee
  },
  admins: {
    title: '管理员管理',
    subtitle: '仅管理员可维护管理员账号。',
    list: api.listAdmins,
    create: api.createAdmin,
    update: api.updateAdmin,
    remove: api.deleteAdmin
  },
  waiters: {
    title: '服务员管理',
    subtitle: '维护服务员账号，并查看当前服务房间。',
    list: api.listWaiters,
    create: api.createWaiter,
    update: api.updateWaiter,
    remove: api.deleteWaiter
  }
}

const config = computed(() => configs[props.type])
const rows = ref([])
const page = ref(1)
const total = ref(0)
const error = ref('')
const success = ref('')
const form = reactive({ id: null, username: '', password: '', name: '', phone: '', email: '' })

function resetForm() {
  Object.assign(form, { id: null, username: '', password: '', name: '', phone: '', email: '' })
}

function edit(row) {
  Object.assign(form, {
    id: row.id,
    username: row.user?.username || '',
    password: '',
    name: row.name || '',
    phone: row.phone || '',
    email: row.email || ''
  })
}

async function load() {
  error.value = ''
  try {
    const payload = pageList(await config.value.list({ page: page.value, page_size: 10 }))
    rows.value = payload.list
    total.value = payload.total
  } catch (err) {
    error.value = err.message || '数据加载失败'
  }
}

async function save() {
  error.value = ''
  success.value = ''
  const body = { name: form.name, phone: form.phone, email: form.email }
  if (!form.id) {
    body.username = form.username
    body.password = form.password
  }
  try {
    if (form.id) {
      await config.value.update(form.id, body)
      success.value = '资料已更新。'
    } else {
      await config.value.create(body)
      success.value = '账号已创建。'
    }
    resetForm()
    await load()
  } catch (err) {
    error.value = err.message || '保存失败'
  }
}

async function remove(row) {
  if (!window.confirm(`确认删除 ${row.name || row.user?.username || row.id}？`)) return
  try {
    await config.value.remove(row.id)
    await load()
  } catch (err) {
    error.value = err.message || '删除失败'
  }
}

watch(
  () => props.type,
  () => {
    page.value = 1
    resetForm()
    load()
  }
)

onMounted(load)
</script>

<template>
  <PageHeader :title="config.title" :subtitle="config.subtitle">
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
            <th>ID</th>
            <th>用户名</th>
            <th>姓名</th>
            <th>电话</th>
            <th>邮箱</th>
            <th v-if="type === 'waiters'">服务房间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.id">
            <td>{{ row.id }}</td>
            <td>{{ row.user?.username || '-' }}</td>
            <td>{{ row.name || '-' }}</td>
            <td>{{ row.phone || '-' }}</td>
            <td>{{ row.email || '-' }}</td>
            <td v-if="type === 'waiters'">{{ row.serving_room_id || '-' }}</td>
            <td>
              <div class="button-row">
                <button class="small-button" type="button" @click="edit(row)">编辑</button>
                <button
                  class="danger-button"
                  type="button"
                  :disabled="type === 'admins' && row.user_id === session.user?.id"
                  @click="remove(row)"
                >
                  <Trash2 :size="16" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="!rows.length" class="empty">暂无数据</div>
      <div class="pagination">
        <button class="ghost-button" type="button" :disabled="page <= 1" @click="page--; load()">上一页</button>
        <span>第 {{ page }} 页 / 共 {{ total }} 条</span>
        <button class="ghost-button" type="button" :disabled="page * 10 >= total" @click="page++; load()">下一页</button>
      </div>
    </div>

    <form class="card" @submit.prevent="save">
      <h2>{{ form.id ? '编辑资料' : '新增账号' }}</h2>
      <div class="form-grid">
        <label v-if="!form.id" class="field">
          <span>用户名</span>
          <input v-model.trim="form.username" minlength="3" required />
        </label>
        <label v-if="!form.id" class="field">
          <span>初始密码</span>
          <input v-model="form.password" type="password" minlength="6" required />
        </label>
        <label class="field">
          <span>姓名</span>
          <input v-model.trim="form.name" />
        </label>
        <label class="field">
          <span>电话</span>
          <input v-model.trim="form.phone" />
        </label>
        <label class="field">
          <span>邮箱</span>
          <input v-model.trim="form.email" type="email" />
        </label>
        <div class="button-row">
          <button class="primary-button" type="submit">保存</button>
          <button class="ghost-button" type="button" @click="resetForm">清空</button>
        </div>
      </div>
    </form>
  </section>
</template>
