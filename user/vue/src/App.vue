<template>
  <div id="app">
    <UserLayout v-if="isAuthenticated">
      <router-view />
    </UserLayout>
    <router-view v-else />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import UserLayout from './layouts/UserLayout.vue';

const route = useRoute();
const isAuthenticated = computed(() => {
  return route.meta.requiresAuth !== false && localStorage.getItem('auth_token');
});
</script>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f5f5f5;
  color: #333;
}

#app {
  min-height: 100vh;
}
</style>
