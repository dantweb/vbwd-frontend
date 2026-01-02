<template>
  <div class="webhooks-view">
    <div class="webhooks-header">
      <div class="header-left">
        <h2>Webhooks</h2>
        <span
          v-if="!loading && !error"
          class="total-count"
        >{{ total }} total</span>
      </div>
      <button
        data-testid="create-webhook-button"
        class="create-btn"
        @click="showCreateModal = true"
      >
        + Create Webhook
      </button>
    </div>

    <div
      v-if="loading"
      data-testid="loading-spinner"
      class="loading-state"
    >
      <div class="spinner" />
      <p>Loading webhooks...</p>
    </div>

    <div
      v-else-if="error"
      data-testid="error-message"
      class="error-state"
    >
      <p>{{ error }}</p>
      <button
        class="retry-btn"
        @click="fetchWebhooks"
      >
        Retry
      </button>
    </div>

    <div
      v-else-if="webhooks.length === 0"
      data-testid="empty-state"
      class="empty-state"
    >
      <p>No webhooks found</p>
      <p class="empty-hint">
        Create a webhook to receive event notifications
      </p>
    </div>

    <table
      v-else
      data-testid="webhooks-table"
      class="webhooks-table"
    >
      <thead>
        <tr>
          <th>URL</th>
          <th>Events</th>
          <th>Status</th>
          <th>Created</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="webhook in webhooks"
          :key="webhook.id"
          :data-testid="`webhook-row-${webhook.id}`"
          class="webhook-row"
          @click="navigateToWebhook(webhook.id)"
        >
          <td class="url-cell">
            {{ webhook.url }}
          </td>
          <td>
            <span class="events-list">
              {{ webhook.events.slice(0, 2).join(', ') }}
              <span
                v-if="webhook.events.length > 2"
                class="more-events"
              >
                +{{ webhook.events.length - 2 }} more
              </span>
            </span>
          </td>
          <td>
            <span
              :data-testid="`status-${webhook.status}`"
              class="status-badge"
              :class="webhook.status"
            >
              {{ formatStatus(webhook.status) }}
            </span>
          </td>
          <td>{{ formatDate(webhook.created_at) }}</td>
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
import { useWebhooksStore } from '@/stores/webhooks';

const router = useRouter();
const webhooksStore = useWebhooksStore();

const showCreateModal = ref(false);
const page = ref(1);
const perPage = ref(20);

const webhooks = computed(() => webhooksStore.webhooks);
const total = computed(() => webhooksStore.total);
const loading = computed(() => webhooksStore.loading);
const error = computed(() => webhooksStore.error);
const totalPages = computed(() => Math.ceil(total.value / perPage.value));

async function fetchWebhooks(): Promise<void> {
  try {
    await webhooksStore.fetchWebhooks({
      page: page.value,
      per_page: perPage.value
    });
  } catch {
    // Error is already set in the store
  }
}

function changePage(newPage: number): void {
  page.value = newPage;
  fetchWebhooks();
}

function navigateToWebhook(webhookId: string): void {
  router.push(`/admin/webhooks/${webhookId}`);
}

function formatStatus(status: string): string {
  const statusMap: Record<string, string> = {
    active: 'Active',
    inactive: 'Inactive',
    failed: 'Failed'
  };
  return statusMap[status] || status;
}

function formatDate(dateString?: string): string {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString();
}

onMounted(() => {
  fetchWebhooks();
});
</script>

<style scoped>
.webhooks-view {
  background: white;
  padding: 20px;
  border-radius: 8px;
}

.webhooks-header {
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

.webhooks-header h2 {
  margin: 0;
  color: #2c3e50;
}

.total-count {
  color: #666;
  font-size: 0.9rem;
}

.create-btn {
  padding: 10px 20px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.create-btn:hover {
  background: #218838;
}

.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 40px;
  color: #666;
}

.empty-hint {
  font-size: 0.9rem;
  margin-top: 10px;
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

.webhooks-table {
  width: 100%;
  border-collapse: collapse;
}

.webhooks-table th,
.webhooks-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.webhooks-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #2c3e50;
}

.webhook-row {
  cursor: pointer;
  transition: background-color 0.2s;
}

.webhook-row:hover {
  background-color: #f8f9fa;
}

.url-cell {
  font-family: monospace;
  font-size: 0.9rem;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.events-list {
  font-size: 0.9rem;
}

.more-events {
  color: #666;
  font-style: italic;
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
  background: #e9ecef;
  color: #495057;
}

.status-badge.failed {
  background: #f8d7da;
  color: #721c24;
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

.pagination-info {
  color: #666;
  font-size: 0.9rem;
}
</style>
