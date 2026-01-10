<template>
  <div
    class="dashboard"
    data-testid="dashboard-view"
  >
    <h1>{{ $t('dashboard.title') }}</h1>

    <div
      v-if="analyticsStore.loading"
      class="loading"
    >
      {{ $t('common.loading') }}
    </div>
    <div
      v-else-if="analyticsStore.error"
      class="error"
    >
      {{ analyticsStore.error }}
    </div>

    <div
      v-else
      class="stats-grid"
    >
      <div class="stat-card">
        <h3>{{ $t('dashboard.mrr') }}</h3>
        <div class="stat-value">
          ${{ formatNumber(dashboard?.mrr?.total || 0) }}
        </div>
        <div
          v-if="dashboard?.mrr?.change_percent"
          class="stat-change"
          :class="changeClass(dashboard.mrr.change_percent)"
        >
          {{ formatPercent(dashboard.mrr.change_percent) }}
        </div>
      </div>
      <div class="stat-card">
        <h3>{{ $t('dashboard.totalRevenue') }}</h3>
        <div class="stat-value">
          ${{ formatNumber(dashboard?.revenue?.total || 0) }}
        </div>
        <div
          v-if="dashboard?.revenue?.change_percent"
          class="stat-change"
          :class="changeClass(dashboard.revenue.change_percent)"
        >
          {{ formatPercent(dashboard.revenue.change_percent) }}
        </div>
      </div>
      <div class="stat-card">
        <h3>{{ $t('dashboard.userGrowth') }}</h3>
        <div class="stat-value">
          {{ formatNumber(dashboard?.user_growth?.total || 0) }}
        </div>
        <div
          v-if="dashboard?.user_growth?.change_percent"
          class="stat-change"
          :class="changeClass(dashboard.user_growth.change_percent)"
        >
          {{ formatPercent(dashboard.user_growth.change_percent) }}
        </div>
      </div>
      <div class="stat-card">
        <h3>{{ $t('dashboard.churnRate') }}</h3>
        <div class="stat-value">
          {{ formatPercent(dashboard?.churn?.total || 0) }}
        </div>
        <div
          v-if="dashboard?.churn?.change_percent"
          class="stat-change"
          :class="changeClass(-dashboard.churn.change_percent)"
        >
          {{ formatPercent(dashboard.churn.change_percent) }}
        </div>
      </div>
      <div class="stat-card">
        <h3>{{ $t('dashboard.arpu') }}</h3>
        <div class="stat-value">
          ${{ formatNumber(dashboard?.arpu?.total || 0) }}
        </div>
        <div
          v-if="dashboard?.arpu?.change_percent"
          class="stat-change"
          :class="changeClass(dashboard.arpu.change_percent)"
        >
          {{ formatPercent(dashboard.arpu.change_percent) }}
        </div>
      </div>
      <div class="stat-card">
        <h3>{{ $t('dashboard.conversionRate') }}</h3>
        <div class="stat-value">
          {{ formatPercent(dashboard?.conversion?.total || 0) }}
        </div>
        <div
          v-if="dashboard?.conversion?.change_percent"
          class="stat-change"
          :class="changeClass(dashboard.conversion.change_percent)"
        >
          {{ formatPercent(dashboard.conversion.change_percent) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useAnalyticsStore } from '../stores/analytics'

const analyticsStore = useAnalyticsStore()

const dashboard = computed(() => analyticsStore.dashboard)

function formatNumber(value: number): string {
  return value.toLocaleString('en-US', { maximumFractionDigits: 2 })
}

function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(1)}%`
}

function changeClass(value: number): string {
  if (value > 0) return 'positive'
  if (value < 0) return 'negative'
  return 'neutral'
}

onMounted(async () => {
  try {
    await analyticsStore.fetchDashboard()
  } catch (error) {
    console.error('Failed to load dashboard:', error)
  }
})
</script>

<style scoped>
.dashboard h1 {
  margin-bottom: 30px;
}

.loading, .error {
  padding: 20px;
  text-align: center;
}

.error {
  color: #dc3545;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stat-card h3 {
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #333;
}

.stat-change {
  font-size: 12px;
  margin-top: 5px;
}

.stat-change.positive { color: #28a745; }
.stat-change.negative { color: #dc3545; }
.stat-change.neutral { color: #6c757d; }
</style>
