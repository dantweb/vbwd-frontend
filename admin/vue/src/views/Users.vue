<template>
  <div
    class="users-view"
    data-testid="users-view"
  >
    <div class="users-header">
      <div class="header-left">
        <h2>{{ $t('users.title') }}</h2>
        <span
          v-if="!loading && !error"
          class="total-count"
        >{{ total }} {{ $t('common.entries') }}</span>
      </div>
      <button
        data-testid="create-user-button"
        class="create-btn"
        @click="navigateToCreate"
      >
        {{ $t('users.createUser') }}
      </button>
    </div>

    <div class="users-filters">
      <input
        v-model="searchQuery"
        type="text"
        data-testid="search-input"
        :placeholder="$t('common.search')"
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
          {{ $t('common.all') }} {{ $t('common.status') }}
        </option>
        <option value="active">
          {{ $t('common.active') }}
        </option>
        <option value="inactive">
          {{ $t('common.inactive') }}
        </option>
      </select>
    </div>

    <div
      v-if="loading"
      data-testid="loading-spinner"
      class="loading-state"
    >
      <div class="spinner" />
      <p>{{ $t('common.loading') }}</p>
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
        {{ $t('common.retry') }}
      </button>
    </div>

    <div
      v-else-if="users.length === 0"
      data-testid="empty-state"
      class="empty-state"
    >
      <p>{{ $t('common.noResults') }}</p>
    </div>

    <table
      v-else
      data-testid="users-table"
      class="users-table"
    >
      <thead>
        <tr>
          <th
            class="sortable"
            :class="{ sorted: sortColumn === 'email', 'sort-asc': sortColumn === 'email' && sortDirection === 'asc', 'sort-desc': sortColumn === 'email' && sortDirection === 'desc' }"
            data-sortable="email"
            @click="handleSort('email')"
          >
            {{ $t('users.email') }}
            <span class="sort-indicator">{{ getSortIndicator('email') }}</span>
          </th>
          <th
            class="sortable"
            :class="{ sorted: sortColumn === 'name', 'sort-asc': sortColumn === 'name' && sortDirection === 'asc', 'sort-desc': sortColumn === 'name' && sortDirection === 'desc' }"
            data-sortable="name"
            @click="handleSort('name')"
          >
            {{ $t('users.name') }}
            <span class="sort-indicator">{{ getSortIndicator('name') }}</span>
          </th>
          <th
            class="sortable"
            :class="{ sorted: sortColumn === 'status', 'sort-asc': sortColumn === 'status' && sortDirection === 'asc', 'sort-desc': sortColumn === 'status' && sortDirection === 'desc' }"
            data-sortable="status"
            @click="handleSort('status')"
          >
            {{ $t('users.status') }}
            <span class="sort-indicator">{{ getSortIndicator('status') }}</span>
          </th>
          <th>{{ $t('users.role') }}</th>
          <th
            class="sortable"
            :class="{ sorted: sortColumn === 'created_at', 'sort-asc': sortColumn === 'created_at' && sortDirection === 'asc', 'sort-desc': sortColumn === 'created_at' && sortDirection === 'desc' }"
            data-sortable="created_at"
            @click="handleSort('created_at')"
          >
            {{ $t('users.createdAt') }}
            <span class="sort-indicator">{{ getSortIndicator('created_at') }}</span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="user in sortedUsers"
          :key="user.id"
          :data-testid="`user-row-${user.id}`"
          class="user-row"
          @click="navigateToEdit(user.id)"
        >
          <td>{{ user.email }}</td>
          <td>{{ user.name || '-' }}</td>
          <td>
            <span
              v-if="user.is_active"
              data-testid="status-active"
              class="status-badge active"
            >
              {{ $t('users.active') }}
            </span>
            <span
              v-else
              data-testid="status-inactive"
              class="status-badge inactive"
            >
              {{ $t('users.inactive') }}
            </span>
          </td>
          <td>
            <span
              v-for="role in (user.roles || ['user'])"
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
        {{ $t('common.previous') }}
      </button>
      <span class="pagination-info">{{ $t('common.page') }} {{ page }} {{ $t('common.of') }} {{ totalPages }}</span>
      <button
        data-testid="pagination-next"
        :disabled="page >= totalPages"
        class="pagination-btn"
        @click="changePage(page + 1)"
      >
        {{ $t('common.next') }}
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

// Sorting state
type SortColumn = 'email' | 'name' | 'status' | 'created_at' | null;
type SortDirection = 'asc' | 'desc';

const sortColumn = ref<SortColumn>(null);
const sortDirection = ref<SortDirection>('asc');

const users = computed(() => usersStore.users);
const total = computed(() => usersStore.total);
const loading = computed(() => usersStore.loading);
const error = computed(() => usersStore.error);
const totalPages = computed(() => Math.ceil(total.value / perPage.value));

// Sorted users computed property
const sortedUsers = computed(() => {
  if (!sortColumn.value) return users.value;

  return [...users.value].sort((a, b) => {
    let aVal: string | boolean | undefined;
    let bVal: string | boolean | undefined;

    switch (sortColumn.value) {
      case 'email':
        aVal = a.email?.toLowerCase() || '';
        bVal = b.email?.toLowerCase() || '';
        break;
      case 'name':
        aVal = a.name?.toLowerCase() || '';
        bVal = b.name?.toLowerCase() || '';
        break;
      case 'status':
        aVal = a.is_active;
        bVal = b.is_active;
        break;
      case 'created_at':
        aVal = a.created_at || '';
        bVal = b.created_at || '';
        break;
      default:
        return 0;
    }

    let comparison = 0;
    if (typeof aVal === 'boolean' && typeof bVal === 'boolean') {
      comparison = aVal === bVal ? 0 : aVal ? -1 : 1;
    } else {
      comparison = String(aVal).localeCompare(String(bVal));
    }

    return sortDirection.value === 'asc' ? comparison : -comparison;
  });
});

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

function handleSort(column: SortColumn): void {
  if (sortColumn.value === column) {
    // Toggle direction
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    // New column, default to ascending
    sortColumn.value = column;
    sortDirection.value = 'asc';
  }
}

function getSortIndicator(column: SortColumn): string {
  if (sortColumn.value !== column) return '';
  return sortDirection.value === 'asc' ? '▲' : '▼';
}

function changePage(newPage: number): void {
  page.value = newPage;
  fetchUsers();
}

function navigateToEdit(userId: string): void {
  router.push(`/admin/users/${userId}/edit`);
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

.users-table th.sortable {
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s;
}

.users-table th.sortable:hover {
  background: #e9ecef;
}

.users-table th.sorted {
  background: #e3f2fd;
}

.sort-indicator {
  margin-left: 5px;
  font-size: 0.75rem;
  color: #3498db;
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
