<template>
  <div class="subscription">
    <h1>Subscription</h1>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state" data-testid="subscription-loading">
      <div class="spinner" />
      <p>Loading subscription...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state" data-testid="subscription-error">
      <p>{{ error }}</p>
      <button class="retry-btn" @click="loadData">Retry</button>
    </div>

    <div v-else class="subscription-content">
      <!-- Current Subscription Card -->
      <div class="card subscription-card" data-testid="current-subscription">
        <h2>Current Plan</h2>
        <div v-if="subscription" class="plan-info">
          <div class="plan-header">
            <span class="plan-name" data-testid="plan-name">{{ subscription.plan?.name || 'No Plan' }}</span>
            <span
              class="plan-status"
              :class="subscription.status"
              data-testid="plan-status"
            >
              {{ formatStatus(subscription.status) }}
            </span>
          </div>
          <p v-if="subscription.plan?.description" class="plan-description">
            {{ subscription.plan.description }}
          </p>
          <div class="plan-details">
            <div class="detail-row">
              <span class="label">Price</span>
              <span class="value">{{ formatPrice(subscription.plan?.price) }} / {{ subscription.plan?.billing_period || 'month' }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Current Period</span>
              <span class="value">
                {{ formatDate(subscription.started_at) }} - {{ formatDate(subscription.expires_at) }}
              </span>
            </div>
            <div class="detail-row">
              <span class="label">Next Billing Date</span>
              <span class="value">{{ formatDate(subscription.expires_at) }}</span>
            </div>
          </div>
        </div>
        <div v-else class="no-subscription" data-testid="no-subscription">
          <p>You don't have an active subscription.</p>
          <router-link to="/plans" class="btn primary">Browse Plans</router-link>
        </div>
      </div>

      <!-- Token Balance Card -->
      <div class="card token-card" data-testid="token-balance-card">
        <h2>Token Balance</h2>
        <div class="token-info">
          <div class="balance-display">
            <span class="balance-amount" data-testid="token-balance">{{ formatNumber(tokenBalance) }}</span>
            <span class="balance-label">TKN</span>
          </div>
          <p class="balance-desc">Use tokens for API calls, features, and more.</p>
          <button class="btn primary" data-testid="purchase-tokens-btn" @click="goToPurchaseTokens">
            Purchase Tokens
          </button>
        </div>
      </div>

      <!-- Subscription Actions -->
      <div v-if="subscription" class="card actions-card">
        <h2>Manage Subscription</h2>
        <div class="actions">
          <router-link to="/plans" class="btn primary" data-testid="change-plan">
            Change Plan
          </router-link>
          <button
            v-if="subscription.status === 'active'"
            class="btn danger"
            data-testid="cancel-subscription"
            @click="showCancelModal = true"
          >
            Cancel Subscription
          </button>
        </div>
      </div>

      <!-- Invoices Section -->
      <div class="card invoices-card" data-testid="invoices-section">
        <div class="section-header">
          <h2>Invoices</h2>
          <div class="search-box">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search invoices..."
              data-testid="invoice-search"
            />
          </div>
        </div>

        <div v-if="filteredInvoices.length > 0" class="invoices-table-container">
          <table class="invoices-table" data-testid="invoices-table">
            <thead>
              <tr>
                <th @click="sortBy('invoice_number')" class="sortable">
                  Invoice #
                  <span v-if="sortField === 'invoice_number'" class="sort-icon">{{ sortDirection === 'asc' ? '↑' : '↓' }}</span>
                </th>
                <th @click="sortBy('invoiced_at')" class="sortable">
                  Date
                  <span v-if="sortField === 'invoiced_at'" class="sort-icon">{{ sortDirection === 'asc' ? '↑' : '↓' }}</span>
                </th>
                <th @click="sortBy('amount')" class="sortable">
                  Amount
                  <span v-if="sortField === 'amount'" class="sort-icon">{{ sortDirection === 'asc' ? '↑' : '↓' }}</span>
                </th>
                <th @click="sortBy('status')" class="sortable">
                  Status
                  <span v-if="sortField === 'status'" class="sort-icon">{{ sortDirection === 'asc' ? '↑' : '↓' }}</span>
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="invoice in paginatedInvoices"
                :key="invoice.id"
                data-testid="invoice-row"
              >
                <td class="invoice-number">{{ invoice.invoice_number }}</td>
                <td>{{ formatDate(invoice.invoiced_at) }}</td>
                <td class="invoice-amount">{{ formatPrice(invoice.amount) }}</td>
                <td>
                  <span class="status-badge" :class="invoice.status">
                    {{ invoice.status }}
                  </span>
                </td>
                <td class="actions-cell">
                  <button
                    class="action-btn view"
                    data-testid="view-invoice"
                    @click="viewInvoice(invoice)"
                  >
                    View
                  </button>
                  <button
                    class="action-btn download"
                    data-testid="download-invoice"
                    @click="downloadInvoice(invoice.id)"
                  >
                    PDF
                  </button>
                  <button
                    v-if="invoice.status === 'pending'"
                    class="action-btn pay"
                    data-testid="pay-invoice"
                    @click="payInvoice(invoice)"
                  >
                    Pay
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="pagination" data-testid="invoices-pagination">
            <button
              class="page-btn"
              :disabled="currentPage <= 1"
              @click="currentPage--"
            >
              Previous
            </button>
            <span class="page-info">Page {{ currentPage }} of {{ totalPages }}</span>
            <button
              class="page-btn"
              :disabled="currentPage >= totalPages"
              @click="currentPage++"
            >
              Next
            </button>
          </div>
        </div>

        <div v-else class="no-invoices" data-testid="no-invoices">
          <p>{{ searchQuery ? 'No invoices found matching your search.' : 'No invoices yet.' }}</p>
        </div>
      </div>
    </div>

    <!-- Cancel Modal -->
    <div v-if="showCancelModal" class="modal-overlay">
      <div class="modal" data-testid="cancel-modal">
        <h3>Cancel Subscription</h3>
        <p>Are you sure you want to cancel your subscription?</p>
        <p class="warning">Your access will continue until {{ formatDate(subscription?.expires_at) }}.</p>
        <div class="modal-actions">
          <button class="btn" @click="showCancelModal = false">Keep Subscription</button>
          <button
            class="btn danger"
            data-testid="confirm-cancel"
            :disabled="cancelling"
            @click="confirmCancel"
          >
            {{ cancelling ? 'Cancelling...' : 'Confirm Cancellation' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Invoice Detail Modal -->
    <div v-if="selectedInvoice" class="modal-overlay">
      <div class="modal invoice-modal" data-testid="invoice-modal">
        <h3>Invoice {{ selectedInvoice.invoice_number }}</h3>
        <div class="invoice-detail">
          <div class="detail-row">
            <span class="label">Date</span>
            <span class="value">{{ formatDate(selectedInvoice.invoiced_at || selectedInvoice.created_at) }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Status</span>
            <span class="value">
              <span class="status-badge" :class="selectedInvoice.status">
                {{ selectedInvoice.status }}
              </span>
            </span>
          </div>
          <div class="detail-row">
            <span class="label">Amount</span>
            <span class="value amount">{{ formatPrice(selectedInvoice.amount) }}</span>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn" @click="selectedInvoice = null">Close</button>
          <button class="btn primary" @click="downloadInvoice(selectedInvoice.id)">
            Download PDF
          </button>
        </div>
      </div>
    </div>

    <!-- Success/Error Toast -->
    <div v-if="successMessage" class="toast success">
      {{ successMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useSubscriptionStore } from '../stores/subscription';
import { useInvoicesStore, type Invoice } from '../stores/invoices';
import { api } from '@/api';

const router = useRouter();
const subscriptionStore = useSubscriptionStore();
const invoicesStore = useInvoicesStore();

const loading = ref(true);
const error = ref<string | null>(null);
const showCancelModal = ref(false);
const cancelling = ref(false);
const successMessage = ref('');
const selectedInvoice = ref<Invoice | null>(null);
const tokenBalance = ref(0);

// Search and sorting
const searchQuery = ref('');
const sortField = ref<string>('invoiced_at');
const sortDirection = ref<'asc' | 'desc'>('desc');
const currentPage = ref(1);
const pageSize = 10;

// Computed
const subscription = computed(() => subscriptionStore.subscription);

const filteredInvoices = computed(() => {
  let result = [...invoicesStore.invoices];

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(inv =>
      inv.invoice_number.toLowerCase().includes(query) ||
      inv.status.toLowerCase().includes(query)
    );
  }

  // Sort
  result.sort((a, b) => {
    let aVal: string | number = '';
    let bVal: string | number = '';

    switch (sortField.value) {
      case 'invoice_number':
        aVal = a.invoice_number;
        bVal = b.invoice_number;
        break;
      case 'invoiced_at':
        aVal = a.invoiced_at || '';
        bVal = b.invoiced_at || '';
        break;
      case 'amount':
        aVal = parseFloat(a.amount) || 0;
        bVal = parseFloat(b.amount) || 0;
        break;
      case 'status':
        aVal = a.status;
        bVal = b.status;
        break;
    }

    if (sortDirection.value === 'asc') {
      return aVal > bVal ? 1 : -1;
    }
    return aVal < bVal ? 1 : -1;
  });

  return result;
});

const totalPages = computed(() => Math.ceil(filteredInvoices.value.length / pageSize));

const paginatedInvoices = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filteredInvoices.value.slice(start, start + pageSize);
});

// Methods
async function loadData(): Promise<void> {
  loading.value = true;
  error.value = null;

  try {
    await Promise.all([
      subscriptionStore.fetchSubscription().catch(() => null),
      invoicesStore.fetchInvoices().catch(() => null),
      fetchTokenBalance(),
    ]);
  } catch (err) {
    error.value = (err as Error).message || 'Failed to load subscription data';
  } finally {
    loading.value = false;
  }
}

async function fetchTokenBalance(): Promise<void> {
  try {
    const response = await api.get('/user/tokens/balance') as { balance: number };
    tokenBalance.value = response.balance || 0;
  } catch {
    // Token balance is optional, don't fail the page load
    tokenBalance.value = 0;
  }
}

function sortBy(field: string): void {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortField.value = field;
    sortDirection.value = 'desc';
  }
  currentPage.value = 1;
}

async function confirmCancel(): Promise<void> {
  cancelling.value = true;

  try {
    await subscriptionStore.cancelSubscription();
    showCancelModal.value = false;
    showSuccess('Subscription cancelled successfully');
  } catch (err) {
    error.value = (err as Error).message || 'Failed to cancel subscription';
  } finally {
    cancelling.value = false;
  }
}

function viewInvoice(invoice: Invoice): void {
  router.push(`/invoices/${invoice.id}`);
}

async function downloadInvoice(invoiceId: string): Promise<void> {
  try {
    const result = await invoicesStore.downloadInvoice(invoiceId);
    if (result?.downloadUrl) {
      window.open(result.downloadUrl, '_blank');
    } else {
      showSuccess('Invoice download initiated');
    }
  } catch (err) {
    error.value = (err as Error).message || 'Failed to download invoice';
  }
}

function payInvoice(invoice: Invoice): void {
  // Navigate to invoice payment page
  router.push(`/invoices/${invoice.id}/pay`);
}

function goToPurchaseTokens(): void {
  // Navigate to plans page where users can select token bundles during checkout
  router.push('/plans');
}

function showSuccess(message: string): void {
  successMessage.value = message;
  setTimeout(() => {
    successMessage.value = '';
  }, 3000);
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
  loadData();
});
</script>

<style scoped>
.subscription {
  max-width: 1000px;
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

.subscription-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card {
  background: white;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.card h2 {
  margin-bottom: 20px;
  color: #2c3e50;
  font-size: 1.2rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

/* Subscription Card */
.plan-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.plan-name {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
}

.plan-status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
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

.plan-description {
  color: #666;
  margin-bottom: 20px;
}

.plan-details,
.invoice-detail {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-row .label {
  color: #666;
}

.detail-row .value {
  font-weight: 500;
  color: #2c3e50;
}

.no-subscription {
  text-align: center;
  padding: 30px;
  color: #666;
}

/* Token Card */
.token-info {
  text-align: center;
}

.balance-display {
  margin-bottom: 15px;
}

.balance-amount {
  font-size: 2.5rem;
  font-weight: 700;
  color: #27ae60;
}

.balance-label {
  font-size: 1.2rem;
  color: #666;
  margin-left: 5px;
}

.balance-desc {
  color: #666;
  margin-bottom: 20px;
}

/* Actions */
.actions {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  text-align: center;
  transition: all 0.2s;
}

.btn.primary {
  background-color: #3498db;
  color: white;
}

.btn.primary:hover {
  background-color: #2980b9;
}

.btn.secondary {
  background-color: #6c757d;
  color: white;
}

.btn.secondary:hover:not(:disabled) {
  background-color: #5a6268;
}

.btn.danger {
  background-color: #e74c3c;
  color: white;
}

.btn.danger:hover:not(:disabled) {
  background-color: #c0392b;
}

.btn:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
}

/* Invoices Section */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.section-header h2 {
  margin: 0;
  border: none;
  padding: 0;
}

.search-box input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  width: 200px;
}

.invoices-table-container {
  overflow-x: auto;
}

.invoices-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
}

.invoices-table th,
.invoices-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.invoices-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #2c3e50;
}

.invoices-table th.sortable {
  cursor: pointer;
  user-select: none;
}

.invoices-table th.sortable:hover {
  background: #e9ecef;
}

.sort-icon {
  margin-left: 5px;
}

.invoices-table tbody tr:hover {
  background: #f8f9fa;
}

.invoice-number {
  font-weight: 500;
  color: #3498db;
}

.invoice-amount {
  font-weight: 500;
}

.status-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
  text-transform: capitalize;
}

.status-badge.paid {
  background: #d4edda;
  color: #155724;
}

.status-badge.pending {
  background: #fff3cd;
  color: #856404;
}

.status-badge.overdue {
  background: #f8d7da;
  color: #721c24;
}

.actions-cell {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
}

.action-btn.view {
  background: #e3f2fd;
  color: #1976d2;
}

.action-btn.download {
  background: #e8f5e9;
  color: #388e3c;
}

.action-btn.pay {
  background: #fff3e0;
  color: #f57c00;
}

.action-btn:hover {
  opacity: 0.8;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.page-btn {
  padding: 8px 16px;
  background: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.page-btn:hover:not(:disabled) {
  background: #e9ecef;
}

.page-btn:disabled {
  color: #aaa;
  cursor: not-allowed;
}

.no-invoices {
  text-align: center;
  padding: 30px;
  color: #666;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 30px;
  border-radius: 8px;
  max-width: 450px;
  width: 90%;
}

.modal h3 {
  margin-bottom: 15px;
  color: #2c3e50;
}

.modal p {
  color: #666;
  margin-bottom: 10px;
}

.modal .warning {
  color: #856404;
  background: #fff3cd;
  padding: 10px;
  border-radius: 4px;
  font-size: 0.9rem;
}

.invoice-modal .invoice-detail {
  margin: 20px 0;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 4px;
}

.invoice-modal .amount {
  font-size: 1.2rem;
  color: #27ae60;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}

/* Toast */
.toast {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 15px 25px;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 1001;
}

.toast.success {
  background-color: #27ae60;
  color: white;
}
</style>
