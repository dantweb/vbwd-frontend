<template>
  <div class="user-layout">
    <aside class="sidebar">
      <div class="logo">
        <h2>VBWD</h2>
      </div>
      <nav class="nav-menu">
        <router-link to="/dashboard" class="nav-item">
          Dashboard
        </router-link>
        <router-link to="/profile" class="nav-item">
          Profile
        </router-link>
        <router-link to="/subscription" class="nav-item">
          Subscription
        </router-link>
        <router-link to="/invoices" class="nav-item">
          Invoices
        </router-link>
        <router-link to="/plans" class="nav-item">
          Plans
        </router-link>
      </nav>
      <div class="user-menu" data-testid="user-menu" @click="toggleUserMenu">
        <span>{{ userEmail }}</span>
        <div v-if="showUserMenu" class="user-dropdown">
          <button data-testid="logout-button" @click="logout">Logout</button>
        </div>
      </div>
    </aside>
    <main class="main-content">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const showUserMenu = ref(false);

const userEmail = computed(() => {
  const user = localStorage.getItem('user');
  if (user) {
    try {
      return JSON.parse(user).email || 'User';
    } catch {
      return 'User';
    }
  }
  return 'User';
});

function toggleUserMenu() {
  showUserMenu.value = !showUserMenu.value;
}

function logout() {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
  router.push('/login');
}
</script>

<style scoped>
.user-layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 250px;
  background-color: #2c3e50;
  color: white;
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
}

.logo {
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo h2 {
  margin: 0;
  font-size: 1.5rem;
}

.nav-menu {
  flex: 1;
  padding: 20px 0;
}

.nav-item {
  display: block;
  padding: 12px 20px;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: all 0.2s;
}

.nav-item:hover,
.nav-item.router-link-active {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
}

.user-menu {
  padding: 15px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  position: relative;
}

.user-dropdown {
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  background-color: #34495e;
  padding: 10px;
}

.user-dropdown button {
  width: 100%;
  padding: 10px;
  background-color: #e74c3c;
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 4px;
}

.user-dropdown button:hover {
  background-color: #c0392b;
}

.main-content {
  flex: 1;
  margin-left: 250px;
  padding: 30px;
  background-color: #f5f5f5;
  min-height: 100vh;
}
</style>
