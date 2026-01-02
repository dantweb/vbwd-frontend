<template>
  <header class="admin-topbar">
    <div class="topbar-title">
      <h1>{{ pageTitle }}</h1>
    </div>
    <div class="topbar-actions">
      <slot name="actions" />
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const pageTitle = computed((): string => {
  const titles: Record<string, string> = {
    'dashboard': 'Dashboard',
    'users': 'User Management',
    'plans': 'Plan Management',
    'subscriptions': 'Subscriptions',
    'invoices': 'Invoices',
    'analytics': 'Analytics',
    'webhooks': 'Webhooks',
    'settings': 'Settings'
  };

  const routeName = route.name as string;
  return titles[routeName] || 'Admin';
});
</script>

<style scoped>
.admin-topbar {
  background-color: white;
  padding: 20px 30px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.topbar-title h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
}

.topbar-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}
</style>
