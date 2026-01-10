<template>
  <div
    class="invoices-view"
    data-testid="invoices-view"
  >
    <div class="invoices-header">
      <h2>{{ $t('invoices.title') }}</h2>
      <span
        v-if="!loading && !error"
        class="total-count"
      >{{ total }} {{ $t('common.entries') }}</span>
    </div>

    <div class="invoices-filters">
      <input
        v-model="searchQuery"
        type="text"
        data-testid="search-input"
        :placeholder="$t('common.search')"
        class="search-input"
        @input="handleSearch"
      >
      <select
        v-model="statusFilter"
        data-testid="status-filter"
        class="filter-select"
        @change="handleFilterChange"
      >
        <option value="">
          {{ $t('common.all') }} {{ $t('common.status') }}
        </option>
        <option value="pending">
          {{ $t('invoices.statuses.pending') }}
        </option>
        <option value="paid">
          {{ $t('invoices.statuses.paid') }}
        </option>
        <option value="failed">
          {{ $t('invoices.statuses.failed') }}
        </option>
        <option value="cancelled">
          {{ $t('invoices.statuses.cancelled') }}
        </option>
        <option value="refunded">
          {{ $t('invoices.statuses.refunded') }}
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
        @click="fetchInvoices"
      >
        {{ $t('common.retry') }}
      </button>
    </div>

    <div
      v-else-if="invoices.length === 0"
      data-testid="empty-state"
      class="empty-state"
    >
      <p>{{ $t('invoices.noInvoices') }}</p>
    </div>

    <table
      v-else
      data-testid="invoices-table"
      class="invoices-table"
    >
      <thead>
        <tr>
          <th
            class="sortable"
            :class="{ sorted: sortColumn === 'invoice_number', 'sort-asc': sortColumn === 'invoice_number' && sortDirection === 'asc', 'sort-desc': sortColumn === 'invoice_number' && sortDirection === 'desc' }"
            data-sortable="invoice_number"
            @click="handleSort('invoice_number')"
          >
            {{ $t('invoices.invoiceNumber') }}
            <span class="sort-indicator">{{ getSortIndicator('invoice_number') }}</span>
          </th>
          <th
            class="sortable"
            :class="{ sorted: sortColumn === 'user_email', 'sort-asc': sortColumn === 'user_email' && sortDirection === 'asc', 'sort-desc': sortColumn === 'user_email' && sortDirection === 'desc' }"
            data-sortable="user_email"
            @click="handleSort('user_email')"
          >
            {{ $t('invoices.user') }}
            <span class="sort-indicator">{{ getSortIndicator('user_email') }}</span>
          </th>
          <th
            class="sortable"
            :class="{ sorted: sortColumn === 'amount', 'sort-asc': sortColumn === 'amount' && sortDirection === 'asc', 'sort-desc': sortColumn === 'amount' && sortDirection === 'desc' }"
            data-sortable="amount"
            @click="handleSort('amount')"
          >
            {{ $t('invoices.amount') }}
            <span class="sort-indicator">{{ getSortIndicator('amount') }}</span>
          </th>
          <th
            class="sortable"
            :class="{ sorted: sortColumn === 'status', 'sort-asc': sortColumn === 'status' && sortDirection === 'asc', 'sort-desc': sortColumn === 'status' && sortDirection === 'desc' }"
            data-sortable="status"
            @click="handleSort('status')"
          >
            {{ $t('invoices.status') }}
            <span class="sort-indicator">{{ getSortIndicator('status') }}</span>
          </th>
          <th
            class="sortable"
            :class="{ sorted: sortColumn === 'created_at', 'sort-asc': sortColumn === 'created_at' && sortDirection === 'asc', 'sort-desc': sortColumn === 'created_at' && sortDirection === 'desc' }"
            data-sortable="created_at"
            @click="handleSort('created_at')"
          >
            {{ $t('invoices.date') }}
            <span class="sort-indicator">{{ getSortIndicator('created_at') }}</span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="invoice in sortedInvoices"
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
import { useI18n } from 'vue-i18n';
import { useInvoicesStore } from '@/stores/invoices';

const { t } = useI18n();

const router = useRouter();
const invoicesStore = useInvoicesStore();

const statusFilter = ref('');
const searchQuery = ref('');
const page = ref(1);
const perPage = ref(20);

// Sorting state
type SortColumn = 'invoice_number' | 'user_email' | 'amount' | 'status' | 'created_at' | null;
type SortDirection = 'asc' | 'desc';
const sortColumn = ref<SortColumn>(null);
const sortDirection = ref<SortDirection>('asc');

const invoices = computed(() => invoicesStore.invoices);

// Filtered and sorted invoices for display
const sortedInvoices = computed(() => {
  // First filter by search query
  let filtered = invoices.value;
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    filtered = invoices.value.filter(inv =>
      inv.user_email?.toLowerCase().includes(query) ||
      inv.invoice_number?.toLowerCase().includes(query)
    );
  }

  if (!sortColumn.value) return filtered;

  return [...filtered].sort((a, b) => {
    const column = sortColumn.value as SortColumn;
    if (!column) return 0;

    let aVal = a[column];
    let bVal = b[column];

    // Handle null/undefined
    if (aVal == null) aVal = '';
    if (bVal == null) bVal = '';

    // Numeric comparison for amount
    if (column === 'amount') {
      const aNum = Number(aVal) || 0;
      const bNum = Number(bVal) || 0;
      return sortDirection.value === 'asc' ? aNum - bNum : bNum - aNum;
    }

    // String comparison
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      const comparison = aVal.localeCompare(bVal);
      return sortDirection.value === 'asc' ? comparison : -comparison;
    }

    // Fallback for other types
    if (aVal < bVal) return sortDirection.value === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection.value === 'asc' ? 1 : -1;
    return 0;
  });
});
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

function handleSearch(): void {
  // Client-side filtering is handled by the computed property
  // This function is here for consistency and future server-side search
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
    pending: t('invoices.statuses.pending'),
    paid: t('invoices.statuses.paid'),
    failed: t('invoices.statuses.failed'),
    cancelled: t('invoices.statuses.cancelled'),
    refunded: t('invoices.statuses.refunded')
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

function handleSort(column: SortColumn): void {
  if (sortColumn.value === column) {
    // Toggle direction
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    // New column
    sortColumn.value = column;
    sortDirection.value = 'asc';
  }
}

function getSortIndicator(column: SortColumn): string {
  if (sortColumn.value !== column) return '';
  return sortDirection.value === 'asc' ? '▲' : '▼';
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

.status-badge.pending {
  background: #cce5ff;
  color: #004085;
}

.status-badge.failed {
  background: #f8d7da;
  color: #721c24;
}

.status-badge.cancelled {
  background: #e9ecef;
  color: #495057;
}

.status-badge.refunded {
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

/* Sortable columns */
.sortable {
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s;
}

.sortable:hover {
  background-color: #e9ecef;
}

.sortable.sorted {
  background-color: #e3f2fd;
}

.sort-indicator {
  margin-left: 5px;
  font-size: 0.8em;
  color: #3498db;
}
</style>
