<template>
  <div class="invoice-details-view" data-testid="invoice-details-view">
    <div
      v-if="loading"
      data-testid="loading-spinner"
      class="loading-state"
    >
      <div class="spinner" />
      <p>Loading invoice...</p>
    </div>

    <div
      v-else-if="error"
      data-testid="error-message"
      class="error-state"
    >
      <p>{{ error }}</p>
      <button
        class="back-btn"
        @click="goBack"
      >
        Back to Invoices
      </button>
    </div>

    <template v-else-if="invoice">
      <div class="details-header">
        <button
          data-testid="back-button"
          class="back-btn"
          @click="goBack"
        >
          ← Back to Invoices
        </button>
        <h2>Invoice {{ invoice.invoice_number }}</h2>
      </div>

      <div class="details-content">
        <div class="info-section">
          <h3>Customer Information</h3>
          <div class="info-grid">
            <div class="info-item">
              <label>Email</label>
              <span>{{ invoice.user_email }}</span>
            </div>
            <div class="info-item">
              <label>Name</label>
              <span>{{ invoice.user_name }}</span>
            </div>
          </div>
        </div>

        <div class="info-section">
          <h3>Invoice Information</h3>
          <div class="info-grid">
            <div class="info-item">
              <label>Invoice Number</label>
              <span>{{ invoice.invoice_number }}</span>
            </div>
            <div class="info-item">
              <label>Status</label>
              <span
                :data-testid="`status-${invoice.status}`"
                class="status-badge"
                :class="invoice.status"
              >
                {{ formatStatus(invoice.status) }}
              </span>
            </div>
            <div class="info-item">
              <label>Amount</label>
              <span class="amount">{{ formatAmount(invoice.amount, invoice.currency) }}</span>
            </div>
            <div class="info-item">
              <label>Due Date</label>
              <span>{{ formatDate(invoice.due_date) }}</span>
            </div>
            <div
              v-if="invoice.paid_at"
              class="info-item"
            >
              <label>Paid At</label>
              <span>{{ formatDate(invoice.paid_at) }}</span>
            </div>
            <div class="info-item">
              <label>Created</label>
              <span>{{ formatDate(invoice.created_at) }}</span>
            </div>
          </div>
        </div>

        <div
          class="info-section"
          data-testid="line-items"
        >
          <h3>Line Items</h3>
          <table
            v-if="invoice.line_items?.length"
            class="line-items-table"
          >
            <thead>
              <tr>
                <th>Description</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in invoice.line_items"
                :key="item.id || item.description"
              >
                <td>{{ item.description }}</td>
                <td>{{ item.quantity || 1 }}</td>
                <td>{{ formatAmount(item.unit_price || item.amount, invoice.currency) }}</td>
                <td>{{ formatAmount(item.amount, invoice.currency) }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td
                  colspan="3"
                  class="total-label"
                >
                  Total
                </td>
                <td class="total-amount">
                  {{ formatAmount(invoice.amount, invoice.currency) }}
                </td>
              </tr>
            </tfoot>
          </table>
          <p
            v-else
            class="no-items"
          >
            No line items
          </p>
        </div>

        <div
          v-if="invoice.plan_name"
          class="info-section"
          data-testid="plan-info"
        >
          <h3>Plan Information</h3>
          <div class="info-grid">
            <div class="info-item">
              <label>Plan Name</label>
              <span>{{ invoice.plan_name }}</span>
            </div>
            <div
              v-if="invoice.plan_description"
              class="info-item"
            >
              <label>Description</label>
              <span>{{ invoice.plan_description }}</span>
            </div>
            <div
              v-if="invoice.plan_billing_period"
              class="info-item"
            >
              <label>Billing Period</label>
              <span>{{ invoice.plan_billing_period }}</span>
            </div>
            <div
              v-if="invoice.plan_price"
              class="info-item"
            >
              <label>Plan Price</label>
              <span>{{ formatAmount(parseFloat(invoice.plan_price), invoice.currency) }}</span>
            </div>
          </div>
        </div>

        <div
          v-if="invoice.subscription_id"
          class="info-section"
          data-testid="subscription-info"
        >
          <h3>Subscription Information</h3>
          <div class="info-grid">
            <div
              v-if="invoice.subscription_status"
              class="info-item"
            >
              <label>Status</label>
              <span
                class="status-badge"
                :class="invoice.subscription_status"
              >
                {{ invoice.subscription_status }}
              </span>
            </div>
            <div
              v-if="invoice.subscription_start_date"
              class="info-item"
            >
              <label>Start Date</label>
              <span>{{ formatDate(invoice.subscription_start_date) }}</span>
            </div>
            <div
              v-if="invoice.subscription_end_date"
              class="info-item"
            >
              <label>End Date</label>
              <span>{{ formatDate(invoice.subscription_end_date) }}</span>
            </div>
            <div class="info-item">
              <label>Trial</label>
              <span>{{ invoice.subscription_is_trial ? 'Yes' : 'No' }}</span>
            </div>
            <div
              v-if="invoice.subscription_trial_end"
              class="info-item"
            >
              <label>Trial End Date</label>
              <span>{{ formatDate(invoice.subscription_trial_end) }}</span>
            </div>
          </div>
        </div>

        <div
          v-if="invoice.billing_address"
          class="info-section"
          data-testid="billing-address"
        >
          <h3>Billing Address</h3>
          <div class="address">
            <p v-if="invoice.billing_address.line1">
              {{ invoice.billing_address.line1 }}
            </p>
            <p v-if="invoice.billing_address.line2">
              {{ invoice.billing_address.line2 }}
            </p>
            <p>
              {{ invoice.billing_address.city }}<span v-if="invoice.billing_address.state">, {{ invoice.billing_address.state }}</span>
              {{ invoice.billing_address.postal_code }}
            </p>
            <p v-if="invoice.billing_address.country">
              {{ invoice.billing_address.country }}
            </p>
          </div>
        </div>

        <div class="actions-section">
          <button
            data-testid="duplicate-button"
            class="action-btn duplicate-btn"
            :disabled="processing"
            @click="handleDuplicate"
          >
            {{ processing ? 'Duplicating...' : 'Duplicate Invoice' }}
          </button>
          <button
            data-testid="resend-button"
            class="action-btn resend-btn"
            :disabled="processing"
            @click="handleResend"
          >
            {{ processing ? 'Sending...' : 'Resend Invoice' }}
          </button>
          <button
            v-if="invoice.status === 'pending'"
            data-testid="mark-paid-button"
            class="action-btn mark-paid-btn"
            :disabled="processing"
            @click="handleMarkPaid"
          >
            {{ processing ? 'Processing...' : 'Mark as Paid' }}
          </button>
          <button
            v-if="invoice.status === 'pending'"
            data-testid="void-button"
            class="action-btn void-btn"
            :disabled="processing"
            @click="handleVoid"
          >
            {{ processing ? 'Processing...' : 'Void Invoice' }}
          </button>
          <button
            v-if="invoice.status === 'paid'"
            data-testid="refund-button"
            class="action-btn refund-btn"
            :disabled="processing"
            @click="handleRefund"
          >
            {{ processing ? 'Processing...' : 'Refund' }}
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useInvoicesStore } from '@/stores/invoices';

const route = useRoute();
const router = useRouter();
const invoicesStore = useInvoicesStore();

const processing = ref(false);

const invoice = computed(() => invoicesStore.selectedInvoice);
const loading = computed(() => invoicesStore.loading);
const error = computed(() => invoicesStore.error);

async function fetchInvoice(): Promise<void> {
  const invoiceId = route.params.id as string;
  try {
    await invoicesStore.fetchInvoice(invoiceId);
  } catch {
    // Error is already set in the store
  }
}

async function handleResend(): Promise<void> {
  if (!invoice.value) return;

  processing.value = true;
  try {
    await invoicesStore.resendInvoice(invoice.value.id);
  } catch {
    // Error is already set in the store
  } finally {
    processing.value = false;
  }
}

async function handleVoid(): Promise<void> {
  if (!invoice.value) return;

  processing.value = true;
  try {
    await invoicesStore.voidInvoice(invoice.value.id);
    await fetchInvoice();
  } catch {
    // Error is already set in the store
  } finally {
    processing.value = false;
  }
}

async function handleMarkPaid(): Promise<void> {
  if (!invoice.value) return;

  processing.value = true;
  try {
    await invoicesStore.markPaid(invoice.value.id);
    await fetchInvoice();
  } catch {
    // Error is already set in the store
  } finally {
    processing.value = false;
  }
}

async function handleRefund(): Promise<void> {
  if (!invoice.value) return;

  processing.value = true;
  try {
    await invoicesStore.refundInvoice(invoice.value.id);
    await fetchInvoice();
  } catch {
    // Error is already set in the store
  } finally {
    processing.value = false;
  }
}

async function handleDuplicate(): Promise<void> {
  if (!invoice.value) return;

  processing.value = true;
  try {
    const newInvoice = await invoicesStore.duplicateInvoice(invoice.value.id);
    // Navigate to the new invoice
    router.push(`/admin/invoices/${newInvoice.id}`);
  } catch {
    // Error is already set in the store
  } finally {
    processing.value = false;
  }
}

function goBack(): void {
  router.push('/admin/invoices');
}

function formatStatus(status: string): string {
  const statusMap: Record<string, string> = {
    pending: 'Pending',
    paid: 'Paid',
    failed: 'Failed',
    cancelled: 'Cancelled',
    refunded: 'Refunded'
  };
  return statusMap[status] || status;
}

function formatDate(dateString?: string): string {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString();
}

function formatAmount(amount?: number, currency?: string): string {
  if (amount === undefined) return '-';
  const currencyCode = currency || 'USD';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode
  }).format(amount);
}

onMounted(() => {
  fetchInvoice();
});
</script>

<style scoped>
.invoice-details-view {
  background: white;
  padding: 20px;
  border-radius: 8px;
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

.details-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
}

.details-header h2 {
  margin: 0;
  color: #2c3e50;
}

.back-btn {
  padding: 8px 16px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.back-btn:hover {
  background: #5a6268;
}

.details-content {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.info-section {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 20px;
}

.info-section h3 {
  margin: 0 0 15px 0;
  color: #2c3e50;
  font-size: 1rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.info-item label {
  font-size: 0.8rem;
  color: #666;
  font-weight: 500;
}

.info-item span {
  font-size: 1rem;
  color: #2c3e50;
}

.amount {
  font-weight: 600;
  font-size: 1.1rem;
}

.status-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  width: fit-content;
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

.line-items-table {
  width: 100%;
  border-collapse: collapse;
}

.line-items-table th,
.line-items-table td {
  padding: 10px 15px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.line-items-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #2c3e50;
}

.line-items-table tfoot td {
  font-weight: 600;
  border-top: 2px solid #eee;
}

.total-label {
  text-align: right;
}

.total-amount {
  color: #2c3e50;
}

.no-items {
  color: #666;
  font-style: italic;
}

.address p {
  margin: 5px 0;
  color: #2c3e50;
}

.actions-section {
  display: flex;
  gap: 15px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.action-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.resend-btn {
  background: #3498db;
  color: white;
}

.resend-btn:hover:not(:disabled) {
  background: #2980b9;
}

.void-btn {
  background: #dc3545;
  color: white;
}

.void-btn:hover:not(:disabled) {
  background: #c82333;
}

.mark-paid-btn {
  background: #28a745;
  color: white;
}

.mark-paid-btn:hover:not(:disabled) {
  background: #218838;
}

.refund-btn {
  background: #ffc107;
  color: #212529;
}

.refund-btn:hover:not(:disabled) {
  background: #e0a800;
}

.duplicate-btn {
  background: #6c757d;
  color: white;
}

.duplicate-btn:hover:not(:disabled) {
  background: #5a6268;
}
</style>
