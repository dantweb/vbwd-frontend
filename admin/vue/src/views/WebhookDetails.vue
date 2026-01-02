<template>
  <div class="webhook-details-view">
    <div
      v-if="loading"
      data-testid="loading-spinner"
      class="loading-state"
    >
      <div class="spinner" />
      <p>Loading webhook...</p>
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
        Back to Webhooks
      </button>
    </div>

    <template v-else-if="webhook">
      <div class="details-header">
        <button
          data-testid="back-button"
          class="back-btn"
          @click="goBack"
        >
          ← Back to Webhooks
        </button>
        <h2>Webhook Details</h2>
      </div>

      <div class="details-content">
        <div class="info-section">
          <h3>Configuration</h3>
          <div class="info-grid">
            <div class="info-item full-width">
              <label>URL</label>
              <span class="url">{{ webhook.url }}</span>
            </div>
            <div class="info-item">
              <label>Status</label>
              <span
                :data-testid="`status-${webhook.status}`"
                class="status-badge"
                :class="webhook.status"
              >
                {{ formatStatus(webhook.status) }}
              </span>
            </div>
            <div class="info-item">
              <label>Created</label>
              <span>{{ formatDate(webhook.created_at) }}</span>
            </div>
            <div
              v-if="webhook.last_triggered_at"
              class="info-item"
            >
              <label>Last Triggered</label>
              <span>{{ formatDate(webhook.last_triggered_at) }}</span>
            </div>
          </div>
        </div>

        <div class="info-section">
          <h3>Events</h3>
          <div class="events-grid">
            <span
              v-for="event in webhook.events"
              :key="event"
              class="event-tag"
            >
              {{ event }}
            </span>
          </div>
        </div>

        <div
          v-if="webhook.secret"
          class="info-section"
        >
          <h3>Secret</h3>
          <div class="secret-display">
            <code>{{ webhook.secret }}</code>
          </div>
        </div>

        <div
          class="info-section"
          data-testid="delivery-history"
        >
          <h3>Delivery History</h3>
          <table
            v-if="webhook.delivery_history?.length"
            class="delivery-table"
          >
            <thead>
              <tr>
                <th>Event</th>
                <th>Status</th>
                <th>Response</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="delivery in webhook.delivery_history"
                :key="delivery.id"
              >
                <td>{{ delivery.event_type }}</td>
                <td>
                  <span
                    class="delivery-status"
                    :class="delivery.status"
                  >
                    {{ delivery.status }}
                  </span>
                </td>
                <td>{{ delivery.response_code || '-' }}</td>
                <td>{{ formatDate(delivery.created_at) }}</td>
              </tr>
            </tbody>
          </table>
          <p
            v-else
            class="no-history"
          >
            No delivery history
          </p>
        </div>

        <div class="actions-section">
          <button
            data-testid="test-button"
            class="action-btn test-btn"
            :disabled="processing"
            @click="handleTest"
          >
            {{ processing ? 'Sending...' : 'Send Test Event' }}
          </button>
          <button
            data-testid="toggle-button"
            class="action-btn toggle-btn"
            :disabled="processing"
            @click="handleToggle"
          >
            {{ webhook.status === 'active' ? 'Disable' : 'Enable' }}
          </button>
          <button
            data-testid="delete-button"
            class="action-btn delete-btn"
            :disabled="processing"
            @click="handleDelete"
          >
            Delete
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useWebhooksStore } from '@/stores/webhooks';

const route = useRoute();
const router = useRouter();
const webhooksStore = useWebhooksStore();

const processing = ref(false);

const webhook = computed(() => webhooksStore.selectedWebhook);
const loading = computed(() => webhooksStore.loading);
const error = computed(() => webhooksStore.error);

async function fetchWebhook(): Promise<void> {
  const webhookId = route.params.id as string;
  try {
    await webhooksStore.fetchWebhook(webhookId);
  } catch {
    // Error is already set in the store
  }
}

async function handleTest(): Promise<void> {
  if (!webhook.value) return;

  processing.value = true;
  try {
    await webhooksStore.testWebhook(webhook.value.id);
    await fetchWebhook();
  } catch {
    // Error is already set in the store
  } finally {
    processing.value = false;
  }
}

async function handleToggle(): Promise<void> {
  if (!webhook.value) return;

  processing.value = true;
  try {
    await webhooksStore.toggleWebhook(webhook.value.id);
  } catch {
    // Error is already set in the store
  } finally {
    processing.value = false;
  }
}

async function handleDelete(): Promise<void> {
  if (!webhook.value) return;

  processing.value = true;
  try {
    await webhooksStore.deleteWebhook(webhook.value.id);
    router.push('/admin/webhooks');
  } catch {
    // Error is already set in the store
    processing.value = false;
  }
}

function goBack(): void {
  router.push('/admin/webhooks');
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
  fetchWebhook();
});
</script>

<style scoped>
.webhook-details-view {
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

.info-item.full-width {
  grid-column: 1 / -1;
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

.url {
  font-family: monospace;
  word-break: break-all;
}

.status-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  width: fit-content;
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

.events-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.event-tag {
  padding: 6px 12px;
  background: #e9ecef;
  border-radius: 4px;
  font-size: 0.9rem;
  font-family: monospace;
}

.secret-display {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 4px;
}

.secret-display code {
  font-family: monospace;
  word-break: break-all;
}

.delivery-table {
  width: 100%;
  border-collapse: collapse;
}

.delivery-table th,
.delivery-table td {
  padding: 10px 15px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.delivery-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #2c3e50;
}

.delivery-status {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 500;
}

.delivery-status.success {
  background: #d4edda;
  color: #155724;
}

.delivery-status.failed {
  background: #f8d7da;
  color: #721c24;
}

.delivery-status.pending {
  background: #fff3cd;
  color: #856404;
}

.no-history {
  color: #666;
  font-style: italic;
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

.test-btn {
  background: #3498db;
  color: white;
}

.test-btn:hover:not(:disabled) {
  background: #2980b9;
}

.toggle-btn {
  background: #ffc107;
  color: #212529;
}

.toggle-btn:hover:not(:disabled) {
  background: #e0a800;
}

.delete-btn {
  background: #dc3545;
  color: white;
}

.delete-btn:hover:not(:disabled) {
  background: #c82333;
}
</style>
