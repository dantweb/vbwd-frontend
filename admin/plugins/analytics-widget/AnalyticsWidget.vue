<template>
  <div
    class="stat-card plugin-widget"
    data-testid="analytics-widget"
  >
    <h3>Active Sessions</h3>
    <div
      v-if="loading"
      class="stat-value"
    >
      ...
    </div>
    <div
      v-else
      class="stat-value"
      data-testid="active-sessions-count"
    >
      {{ count }}
    </div>
    <div class="stat-label">
      from plugin
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '@/api'

const count = ref(0)
const loading = ref(true)

onMounted(async () => {
  try {
    const response = await api.get('/plugins/analytics/active-sessions') as { count: number }
    count.value = response.count || 0
  } catch {
    count.value = 0
  } finally {
    loading.value = false
  }
})
</script>
