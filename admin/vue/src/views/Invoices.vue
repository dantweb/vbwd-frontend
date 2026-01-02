<template>
  <div class="invoices-view">
    <div class="invoices-header">
      <h2>Invoices</h2>
      <span
        v-if="!loading && !error"
        class="total-count"
      >{{ total }} total</span>
    </div>

    <div class="invoices-filters">
      <select
        v-model="statusFilter"
        data-testid="status-filter"
        class="filter-select"
        @change="handleFilterChange"
      >
        <option value="">
          All Status
        </option>
        <option value="draft">
          Draft
        </option>
        <option value="open">
          Open
        </option>
        <option value="paid">
          Paid
        </option>
        <option value="void">
          Void
        </option>
        <option value="uncollectible">
          Uncollectible
        </option>
      </select>
    </div>

    <div
      v-if="loading"
      data-testid="loading-spinner"
      class="loading-state"
    >
      <div class="spinner" />
      <p>Loading invoices...</p>
    </div>

    <div
      v-else-if="error"
      data-testid="error-message"
      class="error-state"
    >
      <p>{{ error }}</p>
      <button
        class="retry-btn"
        @click="fetchInvoices"
      >
        Retry
      </button>
    </div>

    <div
      v-else-if="invoices.length === 0"
      data-testid="empty-state"
      class="empty-state"
    >
      <p>No invoices found</p>
    </div>

    <table
      v-else
      data-testid="invoices-table"
      class="invoices-table"
    >
      <thead>
        <tr>
          <th>Invoice #</th>
          <th>Customer</th>
          <th>Amount</th>
          <th>Status</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="invoice in invoices"
          :key="invoice.id"
          :data-testid="`invoice-row-${invoice.id}`"
          class="invoice-row"
          @click="navigateToInvoice(invoice.id)"
        >
          <td>{{ invoice.invoice_number }}</td>
          <td>{{ invoice.user_email }}</td>
          <td>{{ formatAmount(invoice.amount, invoice.currency) }}</td>
          <td>
            <span
              :data-testid="`status-${invoice.status}`"
              class="status-badge"
              :class="invoice.status"
            >
              {{ formatStatus(invoice.status) }}
            </span>
          </td>
          <td>{{ formatDate(invoice.created_at) }}</td>
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
import { useInvoicesStore } from '@/stores/invoices';

const router = useRouter();
const invoicesStore = useInvoicesStore();

const statusFilter = ref('');
const page = ref(1);
const perPage = ref(20);

const invoices = computed(() => invoicesStore.invoices);
const total = computed(() => invoicesStore.total);
const loading = computed(() => invoicesStore.loading);
const error = computed(() => invoicesStore.error);
const totalPages = computed(() => Math.ceil(total.value / perPage.value));

async function fetchInvoices(): Promise<void> {
  try {
    await invoicesStore.fetchInvoices({
      page: page.value,
      per_page: perPage.value,
      status: statusFilter.value
    });
  } catch {
    // Error is already set in the store
  }
}

function handleFilterChange(): void {
  page.value = 1;
  fetchInvoices();
}

function changePage(newPage: number): void {
  page.value = newPage;
  fetchInvoices();
}

function navigateToInvoice(invoiceId: string): void {
  router.push(`/admin/invoices/${invoiceId}`);
}

function formatStatus(status: string): string {
  const statusMap: Record<string, string> = {
    draft: 'Draft',
    open: 'Open',
    paid: 'Paid',
    void: 'Void',
    uncollectible: 'Uncollectible'
  };
  return statusMap[status] || status;
}

function formatDate(dateString?: string): string {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString();
}

function formatAmount(amount: number, currency?: string): string {
  const currencyCode = currency || 'USD';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode
  }).format(amount);
}

onMounted(() => {
  fetchInvoices();
});
</script>

<style scoped>
.invoices-view {
  background: white;
  padding: 20px;
  border-radius: 8px;
}

.invoices-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.invoices-header h2 {
  margin: 0;
  color: #2c3e50;
}

.total-count {
  color: #666;
  font-size: 0.9rem;
}

.invoices-filters {
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

.invoices-table {
  width: 100%;
  border-collapse: collapse;
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

.invoice-row {
  cursor: pointer;
  transition: background-color 0.2s;
}

.invoice-row:hover {
  background-color: #f8f9fa;
}

.status-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-badge.paid {
  background: #d4edda;
  color: #155724;
}

.status-badge.open {
  background: #cce5ff;
  color: #004085;
}

.status-badge.draft {
  background: #e9ecef;
  color: #495057;
}

.status-badge.void {
  background: #f8d7da;
  color: #721c24;
}

.status-badge.uncollectible {
  background: #fff3cd;
  color: #856404;
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
