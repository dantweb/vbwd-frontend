<template>
  <div class="dashboard">
    <h1>{{ $t('dashboard.title') }}</h1>

    <!-- Loading State -->
    <div
      v-if="loading"
      class="loading-state"
      data-testid="dashboard-loading"
    >
      <div class="spinner" />
      <p>{{ $t('dashboard.loading') }}</p>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="error-state"
      data-testid="dashboard-error"
    >
      <p>{{ error }}</p>
      <button
        class="retry-btn"
        @click="loadDashboardData"
      >
        {{ $t('common.retry') }}
      </button>
    </div>

    <!-- Dashboard Content -->
    <div
      v-else
      class="dashboard-grid"
    >
      <!-- Profile Summary Card -->
      <div
        class="card profile-card"
        data-testid="profile-summary"
      >
        <h3>{{ $t('dashboard.profileCard.title') }}</h3>
        <div class="profile-info">
          <div class="avatar">
            {{ userInitials }}
          </div>
          <div class="profile-details">
            <span
              class="user-name"
              data-testid="user-name"
            >{{ userName }}</span>
            <span
              class="user-email"
              data-testid="user-email"
            >{{ userEmail }}</span>
            <span
              class="user-status"
              :class="userStatus"
              data-testid="user-status"
            >
              {{ userStatus }}
            </span>
          </div>
        </div>
        <router-link
          to="/profile"
          class="card-link"
        >
          {{ $t('dashboard.profileCard.viewProfile') }} →
        </router-link>
      </div>

      <!-- Subscription Card -->
      <div
        class="card subscription-card"
        data-testid="subscription-summary"
      >
        <h3>{{ $t('dashboard.subscriptionCard.title') }}</h3>
        <div
          v-if="subscription"
          class="subscription-info"
        >
          <div class="plan-header">
            <span
              class="plan-name"
              data-testid="plan-name"
            >{{ subscription.plan?.name || $t('dashboard.subscriptionCard.noPlan') }}</span>
            <span
              class="plan-status"
              :class="subscription.status"
              data-testid="subscription-status"
            >
              {{ formatStatus(subscription.status) }}
            </span>
          </div>
          <div class="subscription-details">
            <div class="detail-item">
              <span class="label">{{ $t('dashboard.subscriptionCard.billingPeriod') }}</span>
              <span class="value">{{ subscription.plan?.billing_period || '-' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">{{ $t('dashboard.subscriptionCard.nextBilling') }}</span>
              <span class="value">{{ formatDate(subscription.expires_at) }}</span>
            </div>
            <div
              class="detail-item token-balance"
              data-testid="token-balance"
            >
              <span class="label">{{ $t('dashboard.subscriptionCard.tokenBalance') }}</span>
              <span class="value highlight">{{ formatNumber(tokenBalance) }} {{ $t('common.tokenUnit') }}</span>
            </div>
          </div>
        </div>
        <div
          v-else
          class="no-subscription"
        >
          <p>{{ $t('dashboard.subscriptionCard.noActiveSubscription') }}</p>
          <router-link
            to="/plans"
            class="btn primary"
          >
            {{ $t('common.browsePlans') }}
          </router-link>
        </div>
        <router-link
          v-if="subscription"
          to="/subscription"
          class="card-link"
        >
          {{ $t('dashboard.subscriptionCard.manageSubscription') }} →
        </router-link>
      </div>

      <!-- Recent Invoices Card -->
      <div
        class="card invoices-card"
        data-testid="recent-invoices"
      >
        <h3>{{ $t('dashboard.invoicesCard.title') }}</h3>
        <div
          v-if="recentInvoices.length > 0"
          class="invoices-list"
        >
          <div
            v-for="invoice in recentInvoices"
            :key="invoice.id"
            class="invoice-item"
            data-testid="invoice-item"
          >
            <div class="invoice-info">
              <span class="invoice-number">{{ invoice.invoice_number }}</span>
              <span class="invoice-date">{{ formatDate(invoice.invoiced_at) }}</span>
            </div>
            <div class="invoice-right">
              <span class="invoice-amount">{{ formatPrice(invoice.amount) }}</span>
              <span
                class="invoice-status"
                :class="invoice.status"
              >
                {{ invoice.status }}
              </span>
            </div>
          </div>
        </div>
        <div
          v-else
          class="no-invoices"
        >
          <p>{{ $t('dashboard.invoicesCard.noInvoices') }}</p>
        </div>
        <router-link
          to="/invoices"
          class="card-link"
        >
          {{ $t('dashboard.invoicesCard.viewAllInvoices') }} →
        </router-link>
      </div>

      <!-- Quick Actions Card -->
      <div class="card actions-card">
        <h3>{{ $t('dashboard.quickActions.title') }}</h3>
        <div class="actions">
          <router-link
            to="/profile"
            class="action-btn"
          >
            {{ $t('dashboard.quickActions.editProfile') }}
          </router-link>
          <router-link
            to="/subscription"
            class="action-btn"
          >
            {{ $t('dashboard.quickActions.manageSubscription') }}
          </router-link>
          <router-link
            to="/plans"
            class="action-btn"
          >
            {{ $t('dashboard.quickActions.browsePlans') }}
          </router-link>
          <router-link
            to="/invoices"
            class="action-btn"
          >
            {{ $t('dashboard.quickActions.viewInvoices') }}
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useProfileStore } from '../stores/profile';
import { useSubscriptionStore } from '../stores/subscription';
import { useInvoicesStore } from '../stores/invoices';
import { api } from '@/api';

const { t } = useI18n();
const profileStore = useProfileStore();
const subscriptionStore = useSubscriptionStore();
const invoicesStore = useInvoicesStore();

const loading = ref(true);
const error = ref<string | null>(null);

// Profile computed
const userName = computed(() => profileStore.profile?.name || 'User');
const userEmail = computed(() => profileStore.profile?.email || '');
const userStatus = computed(() => 'active'); // Could come from profile
const userInitials = computed(() => {
  const name = userName.value;
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
});

// Subscription computed
const subscription = computed(() => subscriptionStore.subscription);
const tokenBalance = ref(0);

async function fetchTokenBalance(): Promise<void> {
  try {
    const response = await api.get('/user/tokens/balance') as { balance: number };
    tokenBalance.value = response.balance || 0;
  } catch {
    tokenBalance.value = 0;
  }
}

// Invoices computed
const recentInvoices = computed(() => {
  return invoicesStore.invoices.slice(0, 5);
});

async function loadDashboardData(): Promise<void> {
  loading.value = true;
  error.value = null;

  try {
    await Promise.all([
      profileStore.fetchProfile(),
      subscriptionStore.fetchSubscription().catch(() => null), // Don't fail if no subscription
      invoicesStore.fetchInvoices().catch(() => null), // Don't fail if no invoices
      fetchTokenBalance(),
    ]);
  } catch (err) {
    error.value = (err as Error).message || t('dashboard.errors.failedToLoad');
  } finally {
    loading.value = false;
  }
}

function formatStatus(status: string): string {
  return status ? status.charAt(0).toUpperCase() + status.slice(1) : '-';
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function formatPrice(amount: string | number | null | undefined): string {
  if (amount === null || amount === undefined) return '-';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(num);
}

function formatNumber(num: number): string {
  return num.toLocaleString();
}

onMounted(() => {
  loadDashboardData();
});
</script>

<style scoped>
.dashboard {
  max-width: 1200px;
}

h1 {
  margin-bottom: 30px;
  color: #2c3e50;
}

.loading-state,
.error-state {
  text-align: center;
  padding: 60px 20px;
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

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}

.card {
  background: white;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.card h3 {
  margin-bottom: 20px;
  color: #2c3e50;
  font-size: 1.1rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.card-link {
  display: block;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #eee;
  color: #3498db;
  text-decoration: none;
  font-size: 0.9rem;
}

.card-link:hover {
  text-decoration: underline;
}

/* Profile Card */
.profile-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.avatar {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: 600;
}

.profile-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
}

.user-email {
  font-size: 0.9rem;
  color: #666;
}

.user-status {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 0.75rem;
  text-transform: capitalize;
  width: fit-content;
}

.user-status.active {
  background: #d4edda;
  color: #155724;
}

/* Subscription Card */
.plan-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
}

.plan-name {
  font-size: 1.3rem;
  font-weight: 600;
  color: #2c3e50;
}

.plan-status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  text-transform: capitalize;
}

.plan-status.active {
  background: #d4edda;
  color: #155724;
}

.plan-status.cancelled,
.plan-status.cancelling {
  background: #f8d7da;
  color: #721c24;
}

.plan-status.trial {
  background: #fff3cd;
  color: #856404;
}

.subscription-details {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
}

.detail-item .label {
  color: #666;
  font-size: 0.9rem;
}

.detail-item .value {
  font-weight: 500;
  color: #2c3e50;
}

.detail-item .value.highlight {
  color: #27ae60;
  font-weight: 600;
}

.token-balance {
  padding-top: 10px;
  border-top: 1px solid #eee;
  margin-top: 5px;
}

.no-subscription {
  text-align: center;
  padding: 20px;
  color: #666;
}

.no-subscription .btn {
  margin-top: 15px;
  display: inline-block;
  padding: 10px 20px;
  background: #3498db;
  color: white;
  text-decoration: none;
  border-radius: 4px;
}

/* Invoices Card */
.invoices-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.invoice-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 4px;
}

.invoice-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.invoice-number {
  font-weight: 500;
  color: #2c3e50;
}

.invoice-date {
  font-size: 0.8rem;
  color: #666;
}

.invoice-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.invoice-amount {
  font-weight: 600;
  color: #2c3e50;
}

.invoice-status {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 0.7rem;
  text-transform: capitalize;
}

.invoice-status.paid {
  background: #d4edda;
  color: #155724;
}

.invoice-status.pending {
  background: #fff3cd;
  color: #856404;
}

.invoice-status.overdue {
  background: #f8d7da;
  color: #721c24;
}

.no-invoices {
  text-align: center;
  padding: 20px;
  color: #666;
}

/* Actions Card */
.actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.action-btn {
  display: block;
  padding: 12px 15px;
  background-color: #f8f9fa;
  color: #2c3e50;
  text-decoration: none;
  border-radius: 4px;
  text-align: center;
  transition: all 0.2s;
  font-size: 0.9rem;
}

.action-btn:hover {
  background-color: #3498db;
  color: white;
}
</style>
