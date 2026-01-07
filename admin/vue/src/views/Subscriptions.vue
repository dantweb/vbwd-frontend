<template>
  <div class="subscriptions-view" data-testid="subscriptions-view">
    <div class="subscriptions-header">
      <div class="header-left">
        <h2>Subscriptions</h2>
        <span
          v-if="!loading && !error"
          class="total-count"
        >{{ total }} total</span>
      </div>
      <button
        data-testid="create-subscription-button"
        class="create-btn"
        @click="navigateToCreate"
      >
        Create Subscription
      </button>
    </div>

    <div class="subscriptions-filters">
      <select
        v-model="statusFilter"
        data-testid="status-filter"
        class="filter-select"
        @change="handleFilterChange"
      >
        <option value="">
          All Status
        </option>
        <option value="active">
          Active
        </option>
        <option value="canceled">
          Canceled
        </option>
        <option value="past_due">
          Past Due
        </option>
        <option value="trialing">
          Trialing
        </option>
        <option value="paused">
          Paused
        </option>
      </select>
      <select
        v-model="planFilter"
        data-testid="plan-filter"
        class="filter-select"
        @change="handleFilterChange"
      >
        <option value="">
          All Plans
        </option>
        <option value="Free">
          Free
        </option>
        <option value="Pro">
          Pro
        </option>
        <option value="Enterprise">
          Enterprise
        </option>
      </select>
    </div>

    <div
      v-if="loading"
      data-testid="loading-spinner"
      class="loading-state"
    >
      <div class="spinner" />
      <p>Loading subscriptions...</p>
    </div>

    <div
      v-else-if="error"
      data-testid="error-message"
      class="error-state"
    >
      <p>{{ error }}</p>
      <button
        class="retry-btn"
        @click="fetchSubscriptions"
      >
        Retry
      </button>
    </div>

    <div
      v-else-if="subscriptions.length === 0"
      data-testid="empty-state"
      class="empty-state"
    >
      <p>No subscriptions found</p>
    </div>

    <table
      v-else
      data-testid="subscriptions-table"
      class="subscriptions-table"
    >
      <thead>
        <tr>
          <th>User</th>
          <th>Plan</th>
          <th>Status</th>
          <th>Created</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="subscription in subscriptions"
          :key="subscription.id"
          :data-testid="`subscription-row-${subscription.id}`"
          class="subscription-row"
          @click="navigateToSubscription(subscription.id)"
        >
          <td>{{ subscription.user_email }}</td>
          <td>{{ subscription.plan_name }}</td>
          <td>
            <span
              :data-testid="`status-${subscription.status}`"
              class="status-badge"
              :class="subscription.status"
            >
              {{ formatStatus(subscription.status) }}
            </span>
          </td>
          <td>{{ formatDate(subscription.created_at) }}</td>
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
import { useSubscriptionsStore } from '@/stores/subscriptions';

const router = useRouter();
const subscriptionsStore = useSubscriptionsStore();

const statusFilter = ref('');
const planFilter = ref('');
const page = ref(1);
const perPage = ref(20);

const subscriptions = computed(() => subscriptionsStore.subscriptions);
const total = computed(() => subscriptionsStore.total);
const loading = computed(() => subscriptionsStore.loading);
const error = computed(() => subscriptionsStore.error);
const totalPages = computed(() => Math.ceil(total.value / perPage.value));

async function fetchSubscriptions(): Promise<void> {
  try {
    await subscriptionsStore.fetchSubscriptions({
      page: page.value,
      per_page: perPage.value,
      status: statusFilter.value,
      plan: planFilter.value
    });
  } catch {
    // Error is already set in the store
  }
}

function handleFilterChange(): void {
  page.value = 1;
  fetchSubscriptions();
}

function changePage(newPage: number): void {
  page.value = newPage;
  fetchSubscriptions();
}

function navigateToSubscription(subscriptionId: string): void {
  router.push(`/admin/subscriptions/${subscriptionId}`);
}

function navigateToCreate(): void {
  router.push('/admin/subscriptions/create');
}

function formatStatus(status: string): string {
  const statusMap: Record<string, string> = {
    active: 'Active',
    canceled: 'Canceled',
    past_due: 'Past Due',
    trialing: 'Trialing',
    paused: 'Paused'
  };
  return statusMap[status] || status;
}

function formatDate(dateString?: string): string {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString();
}

onMounted(() => {
  fetchSubscriptions();
});
</script>

<style scoped>
.subscriptions-view {
  background: white;
  padding: 20px;
  border-radius: 8px;
}

.subscriptions-header {
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

.subscriptions-header h2 {
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

.subscriptions-filters {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.filter-select {
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

.subscriptions-table {
  width: 100%;
  border-collapse: collapse;
}

.subscriptions-table th,
.subscriptions-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.subscriptions-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #2c3e50;
}

.subscription-row {
  cursor: pointer;
  transition: background-color 0.2s;
}

.subscription-row:hover {
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

.status-badge.canceled {
  background: #f8d7da;
  color: #721c24;
}

.status-badge.past_due {
  background: #fff3cd;
  color: #856404;
}

.status-badge.trialing {
  background: #cce5ff;
  color: #004085;
}

.status-badge.paused {
  background: #e9ecef;
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
