<template>
  <aside class="admin-sidebar">
    <div class="sidebar-brand">
      <h2>VBWD Admin</h2>
    </div>
    <nav
      class="sidebar-nav"
      data-testid="sidebar-nav"
    >
      <router-link
        to="/admin/dashboard"
        class="nav-item"
        data-testid="nav-dashboard"
      >
        {{ $t('nav.dashboard') }}
      </router-link>
      <router-link
        to="/admin/users"
        class="nav-item"
        data-testid="nav-users"
      >
        {{ $t('nav.users') }}
      </router-link>
      <router-link
        to="/admin/plans"
        class="nav-item"
        data-testid="nav-plans"
      >
        {{ $t('nav.plans') }}
      </router-link>
      <router-link
        to="/admin/subscriptions"
        class="nav-item"
        data-testid="nav-subscriptions"
      >
        {{ $t('nav.subscriptions') }}
      </router-link>
      <router-link
        to="/admin/invoices"
        class="nav-item"
        data-testid="nav-invoices"
      >
        {{ $t('nav.invoices') }}
      </router-link>

      <router-link
        to="/admin/settings"
        class="nav-item"
        data-testid="nav-settings"
      >
        {{ $t('nav.settings') }}
      </router-link>
    </nav>
    <div class="sidebar-footer">
      <div
        class="user-menu"
        data-testid="user-menu"
        @click="toggleUserMenu"
      >
        <div class="user-info">
          <span class="user-email">{{ userEmail }}</span>
          <span class="user-role">{{ $t('users.roles.admin') }}</span>
        </div>
        <span class="menu-arrow">{{ userMenuOpen ? '▲' : '▼' }}</span>
      </div>
      <div
        v-if="userMenuOpen"
        class="user-dropdown"
      >
        <router-link
          to="/admin/profile"
          class="dropdown-item"
          data-testid="profile-link"
          @click="userMenuOpen = false"
        >
          {{ $t('nav.profile') }}
        </router-link>
        <button
          data-testid="logout-button"
          class="dropdown-item logout-item"
          @click="handleLogout"
        >
          {{ $t('nav.logout') }}
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const userMenuOpen = ref(false);

const userEmail = computed((): string => {
  return authStore.user?.email || 'Admin';
});

function toggleUserMenu(): void {
  userMenuOpen.value = !userMenuOpen.value;
}

async function handleLogout(): Promise<void> {
  await authStore.logout();
  router.push('/admin/login');
}
</script>

<style scoped>
.admin-sidebar {
  width: 250px;
  background-color: #2c3e50;
  color: white;
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  left: 0;
  top: 0;
}

.sidebar-brand {
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-brand h2 {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 600;
}

.sidebar-nav {
  flex: 1;
  padding: 15px 0;
  overflow-y: auto;
}

.nav-item {
  display: block;
  padding: 12px 20px;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
}

.nav-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
  color: white;
}

.nav-item.router-link-active {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  border-left-color: #3498db;
}

.sidebar-footer {
  padding: 15px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.user-info {
  margin-bottom: 12px;
}

.user-email {
  display: block;
  font-size: 0.9rem;
  color: white;
  margin-bottom: 2px;
}

.user-role {
  display: block;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
}

.logout-btn {
  width: 100%;
  padding: 10px;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s ease;
}

.logout-btn:hover {
  background-color: #c0392b;
}

.user-menu {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  padding: 10px;
  margin: -10px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.user-menu:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.menu-arrow {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.5);
}

.user-dropdown {
  margin-top: 10px;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  overflow: hidden;
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: 10px 15px;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  text-align: left;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s ease;
}

.dropdown-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
}

.logout-item {
  color: #e74c3c;
}

.logout-item:hover {
  background-color: rgba(231, 76, 60, 0.2);
  color: #e74c3c;
}
</style>
