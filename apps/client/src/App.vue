<script setup>
import { onBeforeUnmount, watch } from 'vue'
import { createNotificationSocket } from '@shared'
import AppShell from '@/components/AppShell.vue'
import { session } from '@/stores/session'

let socket = null

watch(
  () => session.token,
  (token) => {
    socket?.close()
    socket = token
      ? createNotificationSocket(token, (message) => {
          window.dispatchEvent(new CustomEvent('hotel-notification', { detail: message }))
        })
      : null
  },
  { immediate: true }
)

onBeforeUnmount(() => socket?.close())
</script>

<template>
  <AppShell v-if="session.isAuthenticated">
    <RouterView />
  </AppShell>
  <RouterView v-else />
</template>
