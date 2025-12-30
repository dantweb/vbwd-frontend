<template>
  <div class="subscription">
    <h1>Subscription</h1>

    <div class="card">
      <h2>Current Plan</h2>
      <div class="plan-info">
        <span class="plan-name" data-testid="plan-name">Free Plan</span>
        <span class="plan-status" data-testid="plan-status">Active</span>
      </div>
    </div>

    <div class="card">
      <h2>Usage</h2>
      <div class="usage-grid">
        <div class="usage-item">
          <span class="usage-label">API Calls</span>
          <span class="usage-value" data-testid="usage-api">0 / 1000</span>
        </div>
        <div class="usage-item">
          <span class="usage-label">Storage</span>
          <span class="usage-value" data-testid="usage-storage">0 MB / 100 MB</span>
        </div>
      </div>
    </div>

    <div class="actions">
      <router-link to="/plans" class="btn primary" data-testid="change-plan">
        Change Plan
      </router-link>
      <button class="btn danger" data-testid="cancel-subscription" @click="showCancelModal = true">
        Cancel Subscription
      </button>
    </div>

    <!-- Cancel Modal -->
    <div v-if="showCancelModal" class="modal-overlay">
      <div class="modal" data-testid="cancel-modal">
        <h3>Cancel Subscription</h3>
        <p>Are you sure you want to cancel your subscription?</p>
        <div class="modal-actions">
          <button class="btn" @click="showCancelModal = false">Keep Subscription</button>
          <button class="btn danger" data-testid="confirm-cancel" @click="confirmCancel">
            Confirm Cancellation
          </button>
        </div>
      </div>
    </div>

    <div v-if="cancelled" class="notice" data-testid="cancellation-notice">
      Your subscription has been cancelled. It will remain active until the end of the billing period.
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const showCancelModal = ref(false);
const cancelled = ref(false);

function confirmCancel() {
  showCancelModal.value = false;
  cancelled.value = true;
}
</script>

<style scoped>
.subscription {
  max-width: 800px;
}

h1 {
  margin-bottom: 30px;
  color: #2c3e50;
}

.card {
  background: white;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}

.card h2 {
  margin-bottom: 15px;
  color: #2c3e50;
  font-size: 1.1rem;
}

.plan-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.plan-name {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
}

.plan-status {
  padding: 4px 12px;
  background-color: #27ae60;
  color: white;
  border-radius: 20px;
  font-size: 0.85rem;
}

.usage-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.usage-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.usage-label {
  color: #666;
  font-size: 0.9rem;
}

.usage-value {
  font-size: 1.2rem;
  font-weight: 500;
  color: #2c3e50;
}

.actions {
  display: flex;
  gap: 15px;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s;
}

.btn.primary {
  background-color: #3498db;
  color: white;
}

.btn.primary:hover {
  background-color: #2980b9;
}

.btn.danger {
  background-color: #e74c3c;
  color: white;
}

.btn.danger:hover {
  background-color: #c0392b;
}

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
  max-width: 400px;
  width: 100%;
}

.modal h3 {
  margin-bottom: 15px;
  color: #2c3e50;
}

.modal p {
  color: #666;
  margin-bottom: 20px;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.notice {
  margin-top: 20px;
  padding: 15px;
  background-color: #fff3cd;
  color: #856404;
  border-radius: 4px;
}
</style>
