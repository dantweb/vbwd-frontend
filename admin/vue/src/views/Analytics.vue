<template>
  <div class="analytics-view">
    <div class="analytics-header">
      <h2>Analytics</h2>
      <button
        data-testid="refresh-button"
        class="refresh-btn"
        :disabled="loading"
        @click="refreshData"
      >
        Refresh
      </button>
    </div>

    <div
      v-if="loading"
      data-testid="loading-spinner"
      class="loading-state"
    >
      <div class="spinner" />
      <p>Loading analytics...</p>
    </div>

    <div
      v-else-if="error"
      data-testid="error-message"
      class="error-state"
    >
      <p>{{ error }}</p>
      <button
        class="retry-btn"
        @click="refreshData"
      >
        Retry
      </button>
    </div>

    <div
      v-else
      data-testid="analytics-dashboard"
      class="analytics-dashboard"
    >
      <div class="metrics-grid">
        <div
          data-testid="metric-mrr"
          class="metric-card"
        >
          <div class="metric-header">
            <span class="metric-label">Monthly Recurring Revenue</span>
          </div>
          <div class="metric-value">
            ${{ formatNumber(dashboard?.mrr?.total || 0) }}
          </div>
          <div
            v-if="dashboard?.mrr?.change_percent !== undefined"
            class="metric-change"
            :class="getChangeClass(dashboard.mrr.change_percent)"
          >
            {{ formatChange(dashboard.mrr.change_percent) }}
          </div>
        </div>

        <div
          data-testid="metric-revenue"
          class="metric-card"
        >
          <div class="metric-header">
            <span class="metric-label">Total Revenue</span>
          </div>
          <div class="metric-value">
            ${{ formatNumber(dashboard?.revenue?.total || 0) }}
          </div>
          <div
            v-if="dashboard?.revenue?.change_percent !== undefined"
            class="metric-change"
            :class="getChangeClass(dashboard.revenue.change_percent)"
          >
            {{ formatChange(dashboard.revenue.change_percent) }}
          </div>
        </div>

        <div
          data-testid="metric-user-growth"
          class="metric-card"
        >
          <div class="metric-header">
            <span class="metric-label">New Users</span>
          </div>
          <div class="metric-value">
            {{ formatNumber(dashboard?.user_growth?.total || 0) }}
          </div>
          <div
            v-if="dashboard?.user_growth?.change_percent !== undefined"
            class="metric-change"
            :class="getChangeClass(dashboard.user_growth.change_percent)"
          >
            {{ formatChange(dashboard.user_growth.change_percent) }}
          </div>
        </div>

        <div
          data-testid="metric-churn"
          class="metric-card"
        >
          <div class="metric-header">
            <span class="metric-label">Churn Rate</span>
          </div>
          <div class="metric-value">
            {{ dashboard?.churn?.total || 0 }}%
          </div>
          <div
            v-if="dashboard?.churn?.change_percent !== undefined"
            class="metric-change"
            :class="getChurnChangeClass(dashboard.churn.change_percent)"
          >
            {{ formatChange(dashboard.churn.change_percent) }}
          </div>
        </div>
      </div>

      <div class="dashboard-sections">
        <div
          data-testid="plan-distribution"
          class="section plan-distribution"
        >
          <h3>Plan Distribution</h3>
          <div class="distribution-list">
            <div
              v-for="(count, planName) in planDistribution"
              :key="planName"
              class="distribution-item"
            >
              <span class="plan-name">{{ planName }}</span>
              <span class="plan-count">{{ formatNumber(count) }}</span>
            </div>
          </div>
        </div>

        <div
          data-testid="activity-feed"
          class="section activity-feed"
        >
          <h3>Recent Activity</h3>
          <div class="activity-list">
            <div
              v-for="(item, index) in activity"
              :key="index"
              class="activity-item"
            >
              <div
                class="activity-icon"
                :class="item.type"
              >
                {{ getActivityIcon(item.type) }}
              </div>
              <div class="activity-content">
                <span class="activity-user">{{ item.user }}</span>
                <span class="activity-details">{{ item.details }}</span>
                <span class="activity-time">{{ formatTime(item.timestamp) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAnalyticsStore } from '@/stores/analytics';
import type { ActivityItem } from '@/stores/analytics';

const analyticsStore = useAnalyticsStore();

const loading = computed(() => analyticsStore.loading);
const error = ref<string | null>(null);
const dashboard = computed(() => analyticsStore.dashboard);
const planDistribution = computed(() => analyticsStore.planDistribution);
const activity = ref<ActivityItem[]>([]);

async function fetchData(): Promise<void> {
  error.value = null;
  try {
    await Promise.all([
      analyticsStore.fetchDashboard(),
      analyticsStore.fetchPlanDistribution(),
      analyticsStore.fetchRecentActivity().then(data => {
        activity.value = data;
      })
    ]);
  } catch (err) {
    error.value = (err as Error).message || 'Failed to load analytics';
  }
}

async function refreshData(): Promise<void> {
  await fetchData();
}

function formatNumber(value: number): string {
  return value.toLocaleString();
}

function formatChange(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value}%`;
}

function getChangeClass(value: number): string {
  return value >= 0 ? 'change-positive' : 'change-negative';
}

function getChurnChangeClass(value: number): string {
  // For churn, negative change is good (churn decreased)
  return value <= 0 ? 'change-negative' : 'change-positive';
}

function getActivityIcon(type: string): string {
  const icons: Record<string, string> = {
    subscription: '↑',
    payment: '$',
    signup: '+'
  };
  return icons[type] || '•';
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleString();
}

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.analytics-view {
  background: white;
  padding: 20px;
  border-radius: 8px;
}

.analytics-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.analytics-header h2 {
  margin: 0;
  color: #2c3e50;
}

.refresh-btn {
  padding: 8px 16px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.refresh-btn:hover:not(:disabled) {
  background: #2980b9;
}

.refresh-btn:disabled {
  background: #95a5a6;
  cursor: not-allowed;
}

.loading-state,
.error-state {
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

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.metric-card {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
}

.metric-header {
  margin-bottom: 10px;
}

.metric-label {
  font-size: 0.85rem;
  color: #666;
  text-transform: uppercase;
}

.metric-value {
  font-size: 1.8rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
}

.metric-change {
  font-size: 0.9rem;
  font-weight: 500;
}

.change-positive {
  color: #27ae60;
}

.change-negative {
  color: #e74c3c;
}

.dashboard-sections {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 25px;
}

@media (max-width: 768px) {
  .dashboard-sections {
    grid-template-columns: 1fr;
  }
}

.section {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
}

.section h3 {
  margin: 0 0 15px 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.distribution-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.distribution-item {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  background: white;
  border-radius: 4px;
}

.plan-name {
  font-weight: 500;
  color: #2c3e50;
}

.plan-count {
  color: #666;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.activity-item {
  display: flex;
  gap: 12px;
  padding: 10px;
  background: white;
  border-radius: 4px;
}

.activity-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
}

.activity-icon.subscription {
  background: #d4edda;
  color: #155724;
}

.activity-icon.payment {
  background: #cce5ff;
  color: #004085;
}

.activity-icon.signup {
  background: #fff3cd;
  color: #856404;
}

.activity-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.activity-user {
  font-weight: 500;
  color: #2c3e50;
  font-size: 0.9rem;
}

.activity-details {
  color: #666;
  font-size: 0.85rem;
}

.activity-time {
  color: #999;
  font-size: 0.75rem;
}
</style>
