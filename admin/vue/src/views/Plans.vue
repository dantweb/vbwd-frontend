<template>
  <div class="plans-view">
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
          <th>Name</th>
          <th>Price</th>
          <th>Billing</th>
          <th>Subscribers</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="plan in plans"
          :key="plan.id"
          :data-testid="`plan-row-${plan.id}`"
          class="plan-row"
          @click="navigateToPlan(plan.id)"
        >
          <td>{{ plan.name }}</td>
          <td>{{ formatPrice(plan.price, plan.currency) }}</td>
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

const plans = computed(() => planStore.plans);
const loading = computed(() => planStore.loading);
const error = computed(() => planStore.error);

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
  router.push(`/admin/plans/${planId}`);
}

async function handleArchive(planId: string): Promise<void> {
  try {
    await planStore.archivePlan(planId);
    await fetchPlans();
  } catch {
    // Error is already set in the store
  }
}

function formatPrice(price: number, currency?: string): string {
  const currencySymbol = currency === 'USD' ? '$' : currency || '';
  if (price === 0) return 'Free';
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
  margin-bottom: 20px;
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
