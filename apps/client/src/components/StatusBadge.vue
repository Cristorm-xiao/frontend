<script setup>
defineProps({
  tone: {
    type: String,
    default: 'neutral'
  }
})
</script>

<template>
  <span class="status-badge" :class="`tone-${tone}`">
    <slot />
  </span>
</template>
