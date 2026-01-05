<template>
  <div class="users-view">
    <div class="users-header">
      <div class="header-left">
        <h2>Users</h2>
        <span
          v-if="!loading && !error"
          class="total-count"
        >{{ total }} total</span>
      </div>
      <button
        data-testid="create-user-button"
        class="create-btn"
        @click="navigateToCreate"
      >
        Create User
      </button>
    </div>

    <div class="users-filters">
      <input
        v-model="searchQuery"
        type="text"
        data-testid="search-input"
        placeholder="Search by email or name..."
        class="search-input"
        @keyup.enter="handleSearch"
      >
      <select
        v-model="statusFilter"
        data-testid="status-filter"
        class="status-filter"
        @change="handleStatusChange"
      >
        <option value="">
          All Status
        </option>
        <option value="active">
          Active
        </option>
        <option value="inactive">
          Inactive
        </option>
      </select>
    </div>

    <div
      v-if="loading"
      data-testid="loading-spinner"
      class="loading-state"
    >
      <div class="spinner" />
      <p>Loading users...</p>
    </div>

    <div
      v-else-if="error"
      data-testid="error-message"
      class="error-state"
    >
      <p>{{ error }}</p>
      <button
        class="retry-btn"
        @click="fetchUsers"
      >
        Retry
      </button>
    </div>

    <div
      v-else-if="users.length === 0"
      data-testid="empty-state"
      class="empty-state"
    >
      <p>No users found</p>
    </div>

    <table
      v-else
      data-testid="users-table"
      class="users-table"
    >
      <thead>
        <tr>
          <th>Email</th>
          <th>Name</th>
          <th>Status</th>
          <th>Roles</th>
          <th>Created</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="user in users"
          :key="user.id"
          :data-testid="`user-row-${user.id}`"
          class="user-row"
          @click="navigateToUser(user.id)"
        >
          <td>{{ user.email }}</td>
          <td>{{ user.name }}</td>
          <td>
            <span
              v-if="user.is_active"
              data-testid="status-active"
              class="status-badge active"
            >
              Active
            </span>
            <span
              v-else
              data-testid="status-inactive"
              class="status-badge inactive"
            >
              Inactive
            </span>
          </td>
          <td>
            <span
              v-for="role in user.roles"
              :key="role"
              class="role-badge"
            >
              {{ role }}
            </span>
          </td>
          <td>{{ formatDate(user.created_at) }}</td>
        </tr>
      </tbody>
    </table>

    <div
      v-if="totalPages > 1"
      data-testid="pagination"
      class="pagination"
    >
      <button
        data-testid="pagination-prev"
        :disabled="page === 1"
        class="pagination-btn"
        @click="changePage(page - 1)"
      >
        Previous
      </button>
      <span class="pagination-info">Page {{ page }} of {{ totalPages }}</span>
      <button
        data-testid="pagination-next"
        :disabled="page >= totalPages"
        class="pagination-btn"
        @click="changePage(page + 1)"
      >
        Next
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUsersStore } from '@/stores/users';

const router = useRouter();
const usersStore = useUsersStore();

const searchQuery = ref('');
const statusFilter = ref('');
const page = ref(1);
const perPage = ref(20);

const users = computed(() => usersStore.users);
const total = computed(() => usersStore.total);
const loading = computed(() => usersStore.loading);
const error = computed(() => usersStore.error);
const totalPages = computed(() => Math.ceil(total.value / perPage.value));

async function fetchUsers(): Promise<void> {
  try {
    await usersStore.fetchUsers({
      page: page.value,
      per_page: perPage.value,
      search: searchQuery.value,
      status: statusFilter.value
    });
  } catch {
    // Error is already set in the store
  }
}

function handleSearch(): void {
  page.value = 1;
  fetchUsers();
}

function handleStatusChange(): void {
  page.value = 1;
  fetchUsers();
}

function changePage(newPage: number): void {
  page.value = newPage;
  fetchUsers();
}

function navigateToUser(userId: string): void {
  router.push(`/admin/users/${userId}`);
}

function navigateToCreate(): void {
  router.push('/admin/users/create');
}

function formatDate(dateString?: string): string {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString();
}

onMounted(() => {
  fetchUsers();
});
</script>

<style scoped>
.users-view {
  background: white;
  padding: 20px;
  border-radius: 8px;
}

.users-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.users-header h2 {
  margin: 0;
  color: #2c3e50;
}

.total-count {
  color: #666;
  font-size: 0.9rem;
}

.create-btn {
  padding: 10px 20px;
  background: #27ae60;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

.create-btn:hover {
  background: #1e8449;
}

.users-filters {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.search-input {
  flex: 1;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.status-filter {
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  min-width: 150px;
}

.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 40px;
  color: #666;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.retry-btn {
  margin-top: 15px;
  padding: 10px 20px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.retry-btn:hover {
  background: #2980b9;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th,
.users-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.users-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #2c3e50;
}

.user-row {
  cursor: pointer;
  transition: background-color 0.2s;
}

.user-row:hover {
  background-color: #f8f9fa;
}

.status-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-badge.active {
  background: #d4edda;
  color: #155724;
}

.status-badge.inactive {
  background: #f8d7da;
  color: #721c24;
}

.role-badge {
  display: inline-block;
  padding: 2px 8px;
  margin-right: 5px;
  background: #e9ecef;
  border-radius: 4px;
  font-size: 0.75rem;
  color: #495057;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.pagination-btn {
  padding: 8px 16px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.pagination-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.pagination-btn:hover:not(:disabled) {
  background: #2980b9;
}

.pagination-info {
  color: #666;
  font-size: 0.9rem;
}
</style>
