<template>
  <div class="plans-view" data-testid="plans-view">
    <div class="plans-header">
      <h2>Plans</h2>
      <button
        data-testid="create-plan-button"
        class="create-btn"
        @click="navigateToCreate"
      >
        + Create Plan
      </button>
    </div>

    <div class="plans-filters">
      <input
        v-model="searchQuery"
        type="text"
        data-testid="search-input"
        placeholder="Search by name..."
        class="search-input"
        @input="handleSearch"
      >
      <label class="checkbox-label">
        <input
          v-model="includeArchived"
          type="checkbox"
          data-testid="include-archived"
          @change="fetchPlans"
        >
        Include archived plans
      </label>
    </div>

    <div
      v-if="loading"
      data-testid="loading-spinner"
      class="loading-state"
    >
      <div class="spinner" />
      <p>Loading plans...</p>
    </div>

    <div
      v-else-if="error"
      data-testid="error-message"
      class="error-state"
    >
      <p>{{ error }}</p>
      <button
        class="retry-btn"
        @click="fetchPlans"
      >
        Retry
      </button>
    </div>

    <div
      v-else-if="plans.length === 0"
      data-testid="empty-state"
      class="empty-state"
    >
      <p>No plans found</p>
      <button
        class="create-btn"
        @click="navigateToCreate"
      >
        Create your first plan
      </button>
    </div>

    <table
      v-else
      data-testid="plans-table"
      class="plans-table"
    >
      <thead>
        <tr>
          <th
            class="sortable"
            :class="{ sorted: sortColumn === 'name', 'sort-asc': sortColumn === 'name' && sortDirection === 'asc', 'sort-desc': sortColumn === 'name' && sortDirection === 'desc' }"
            data-sortable="name"
            @click="handleSort('name')"
          >
            Name
            <span class="sort-indicator">{{ getSortIndicator('name') }}</span>
          </th>
          <th
            class="sortable"
            :class="{ sorted: sortColumn === 'price', 'sort-asc': sortColumn === 'price' && sortDirection === 'asc', 'sort-desc': sortColumn === 'price' && sortDirection === 'desc' }"
            data-sortable="price"
            @click="handleSort('price')"
          >
            Price
            <span class="sort-indicator">{{ getSortIndicator('price') }}</span>
          </th>
          <th
            class="sortable"
            :class="{ sorted: sortColumn === 'billing_period', 'sort-asc': sortColumn === 'billing_period' && sortDirection === 'asc', 'sort-desc': sortColumn === 'billing_period' && sortDirection === 'desc' }"
            data-sortable="billing_period"
            @click="handleSort('billing_period')"
          >
            Billing
            <span class="sort-indicator">{{ getSortIndicator('billing_period') }}</span>
          </th>
          <th
            class="sortable"
            :class="{ sorted: sortColumn === 'subscriber_count', 'sort-asc': sortColumn === 'subscriber_count' && sortDirection === 'asc', 'sort-desc': sortColumn === 'subscriber_count' && sortDirection === 'desc' }"
            data-sortable="subscriber_count"
            @click="handleSort('subscriber_count')"
          >
            Subscribers
            <span class="sort-indicator">{{ getSortIndicator('subscriber_count') }}</span>
          </th>
          <th
            class="sortable"
            :class="{ sorted: sortColumn === 'status', 'sort-asc': sortColumn === 'status' && sortDirection === 'asc', 'sort-desc': sortColumn === 'status' && sortDirection === 'desc' }"
            data-sortable="status"
            @click="handleSort('status')"
          >
            Status
            <span class="sort-indicator">{{ getSortIndicator('status') }}</span>
          </th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="plan in sortedPlans"
          :key="plan.id"
          :data-testid="`plan-row-${plan.id}`"
          class="plan-row"
          @click="navigateToPlan(plan.id)"
        >
          <td>{{ plan.name }}</td>
          <td>{{ formatPrice(plan.price_float, typeof plan.price === 'object' ? plan.price?.currency_code : undefined) }}</td>
          <td>{{ plan.billing_period }}</td>
          <td>{{ plan.subscriber_count ?? 0 }}</td>
          <td>
            <span
              v-if="plan.is_active"
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
          <td @click.stop>
            <button
              v-if="plan.is_active"
              :data-testid="`archive-plan-${plan.id}`"
              class="action-btn archive"
              @click="handleArchive(plan.id)"
            >
              Archive
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { usePlanAdminStore } from '@/stores/planAdmin';

const router = useRouter();
const planStore = usePlanAdminStore();

const includeArchived = ref(false);
const searchQuery = ref('');

// Sorting state
type SortColumn = 'name' | 'price' | 'billing_period' | 'subscriber_count' | 'status' | null;
type SortDirection = 'asc' | 'desc';

const sortColumn = ref<SortColumn>(null);
const sortDirection = ref<SortDirection>('asc');

const plans = computed(() => planStore.plans);
const loading = computed(() => planStore.loading);
const error = computed(() => planStore.error);

// Filtered and sorted plans computed property
const sortedPlans = computed(() => {
  // First filter by search query
  let filtered = plans.value;
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    filtered = plans.value.filter(plan =>
      plan.name?.toLowerCase().includes(query)
    );
  }

  if (!sortColumn.value) return filtered;

  return [...filtered].sort((a, b) => {
    let aVal: string | number | boolean | undefined;
    let bVal: string | number | boolean | undefined;

    switch (sortColumn.value) {
      case 'name':
        aVal = a.name?.toLowerCase() || '';
        bVal = b.name?.toLowerCase() || '';
        break;
      case 'price':
        aVal = a.price_float ?? 0;
        bVal = b.price_float ?? 0;
        break;
      case 'billing_period':
        aVal = a.billing_period?.toLowerCase() || '';
        bVal = b.billing_period?.toLowerCase() || '';
        break;
      case 'subscriber_count':
        aVal = a.subscriber_count ?? 0;
        bVal = b.subscriber_count ?? 0;
        break;
      case 'status':
        aVal = a.is_active;
        bVal = b.is_active;
        break;
      default:
        return 0;
    }

    let comparison = 0;
    if (typeof aVal === 'boolean' && typeof bVal === 'boolean') {
      comparison = aVal === bVal ? 0 : aVal ? -1 : 1;
    } else if (typeof aVal === 'number' && typeof bVal === 'number') {
      comparison = aVal - bVal;
    } else {
      comparison = String(aVal).localeCompare(String(bVal));
    }

    return sortDirection.value === 'asc' ? comparison : -comparison;
  });
});

function handleSort(column: SortColumn): void {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortColumn.value = column;
    sortDirection.value = 'asc';
  }
}

function getSortIndicator(column: SortColumn): string {
  if (sortColumn.value !== column) return '';
  return sortDirection.value === 'asc' ? '▲' : '▼';
}

function handleSearch(): void {
  // Client-side filtering is handled by the computed property
  // This function is here for consistency and future server-side search
}

async function fetchPlans(): Promise<void> {
  try {
    await planStore.fetchPlans(includeArchived.value);
  } catch {
    // Error is already set in the store
  }
}

function navigateToCreate(): void {
  router.push('/admin/plans/new');
}

function navigateToPlan(planId: string): void {
  router.push(`/admin/plans/${planId}/edit`);
}

async function handleArchive(planId: string): Promise<void> {
  try {
    await planStore.archivePlan(planId);
    await fetchPlans();
  } catch {
    // Error is already set in the store
  }
}

function formatPrice(price: number | undefined, currency?: string): string {
  if (price === undefined || price === null) return 'N/A';
  if (price === 0) return 'Free';
  const currencySymbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency || '€';
  return `${currencySymbol}${price.toFixed(2)}`;
}

onMounted(() => {
  fetchPlans();
});
</script>

<style scoped>
.plans-view {
  background: white;
  padding: 20px;
  border-radius: 8px;
}

.plans-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.plans-header h2 {
  margin: 0;
  color: #2c3e50;
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

.plans-filters {
  display: flex;
  gap: 15px;
  align-items: center;
  margin-bottom: 20px;
}

.search-input {
  flex: 1;
  max-width: 300px;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.search-input:focus {
  outline: none;
  border-color: #3498db;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #666;
  font-size: 14px;
}

.checkbox-label input {
  cursor: pointer;
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

.plans-table {
  width: 100%;
  border-collapse: collapse;
}

.plans-table th,
.plans-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.plans-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #2c3e50;
}

.plans-table th.sortable {
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s;
}

.plans-table th.sortable:hover {
  background: #e9ecef;
}

.plans-table th.sorted {
  background: #e3f2fd;
}

.sort-indicator {
  margin-left: 5px;
  font-size: 0.75rem;
  color: #3498db;
}

.plan-row {
  cursor: pointer;
  transition: background-color 0.2s;
}

.plan-row:hover {
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

.action-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.action-btn.archive {
  background: #ffc107;
  color: #212529;
}

.action-btn.archive:hover {
  background: #e0a800;
}
</style>
