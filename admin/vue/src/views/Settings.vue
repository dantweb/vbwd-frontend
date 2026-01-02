<template>
  <div class="settings-view">
    <div class="settings-header">
      <h2>Settings</h2>
    </div>

    <div
      v-if="loading"
      data-testid="loading-spinner"
      class="loading-state"
    >
      <div class="spinner" />
      <p>Loading settings...</p>
    </div>

    <div
      v-else-if="fetchError"
      data-testid="fetch-error"
      class="error-state"
    >
      <p>{{ fetchError }}</p>
      <button
        class="retry-btn"
        @click="fetchSettings"
      >
        Retry
      </button>
    </div>

    <div
      v-else
      data-testid="settings-form"
      class="settings-form"
    >
      <div
        v-if="successMessage"
        data-testid="success-message"
        class="success-message"
      >
        {{ successMessage }}
      </div>

      <div
        v-if="saveError"
        data-testid="error-message"
        class="error-message"
      >
        {{ saveError }}
      </div>

      <div class="form-section">
        <h3>Company Information</h3>
        <div class="form-group">
          <label for="company-name">Company Name</label>
          <input
            id="company-name"
            v-model="formData.company_name"
            data-testid="company-name-input"
            type="text"
            class="form-input"
          >
        </div>
        <div class="form-group">
          <label for="company-email">Company Email</label>
          <input
            id="company-email"
            v-model="formData.company_email"
            data-testid="company-email-input"
            type="email"
            class="form-input"
          >
        </div>
        <div class="form-group">
          <label for="support-email">Support Email</label>
          <input
            id="support-email"
            v-model="formData.support_email"
            data-testid="support-email-input"
            type="email"
            class="form-input"
          >
        </div>
      </div>

      <div class="form-section">
        <h3>Billing</h3>
        <div class="form-row">
          <div class="form-group">
            <label for="currency">Default Currency</label>
            <select
              id="currency"
              v-model="formData.default_currency"
              data-testid="currency-select"
              class="form-select"
            >
              <option value="USD">
                USD - US Dollar
              </option>
              <option value="EUR">
                EUR - Euro
              </option>
              <option value="GBP">
                GBP - British Pound
              </option>
            </select>
          </div>
          <div class="form-group">
            <label for="tax-rate">Tax Rate (%)</label>
            <input
              id="tax-rate"
              v-model.number="formData.tax_rate"
              data-testid="tax-rate-input"
              type="number"
              min="0"
              max="100"
              step="0.1"
              class="form-input"
            >
          </div>
        </div>
      </div>

      <div
        class="form-section"
        data-testid="notification-preferences"
      >
        <h3>Notification Preferences</h3>
        <div class="checkbox-group">
          <label class="checkbox-label">
            <input
              v-model="formData.notification_preferences.email_on_new_subscription"
              type="checkbox"
            >
            <span>Email on new subscription</span>
          </label>
          <label class="checkbox-label">
            <input
              v-model="formData.notification_preferences.email_on_cancellation"
              type="checkbox"
            >
            <span>Email on cancellation</span>
          </label>
          <label class="checkbox-label">
            <input
              v-model="formData.notification_preferences.email_on_payment_failed"
              type="checkbox"
            >
            <span>Email on failed payment</span>
          </label>
        </div>
      </div>

      <div class="form-actions">
        <button
          type="button"
          data-testid="save-button"
          class="save-btn"
          :disabled="saving"
          @click="handleSave"
        >
          {{ saving ? 'Saving...' : 'Save Settings' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { api } from '@/api';

interface Settings {
  company_name: string;
  company_email: string;
  default_currency: string;
  tax_rate: number;
  support_email: string;
  notification_preferences: {
    email_on_new_subscription: boolean;
    email_on_cancellation: boolean;
    email_on_payment_failed: boolean;
  };
}

const loading = ref(true);
const saving = ref(false);
const fetchError = ref<string | null>(null);
const saveError = ref<string | null>(null);
const successMessage = ref<string | null>(null);

const formData = reactive<Settings>({
  company_name: '',
  company_email: '',
  default_currency: 'USD',
  tax_rate: 0,
  support_email: '',
  notification_preferences: {
    email_on_new_subscription: true,
    email_on_cancellation: true,
    email_on_payment_failed: true
  }
});

async function fetchSettings(): Promise<void> {
  loading.value = true;
  fetchError.value = null;

  try {
    const response = await api.get('/admin/settings') as { settings: Settings };
    Object.assign(formData, response.settings);
  } catch (error) {
    fetchError.value = (error as Error).message || 'Failed to load settings';
  } finally {
    loading.value = false;
  }
}

async function handleSave(): Promise<void> {
  saving.value = true;
  saveError.value = null;
  successMessage.value = null;

  try {
    await api.put('/admin/settings', formData);
    successMessage.value = 'Settings saved successfully';
    setTimeout(() => {
      successMessage.value = null;
    }, 3000);
  } catch (error) {
    saveError.value = (error as Error).message || 'Failed to save settings';
  } finally {
    saving.value = false;
  }
}

onMounted(() => {
  fetchSettings();
});
</script>

<style scoped>
.settings-view {
  background: white;
  padding: 20px;
  border-radius: 8px;
}

.settings-header {
  margin-bottom: 30px;
}

.settings-header h2 {
  margin: 0;
  color: #2c3e50;
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
  padding: 10px 20px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.settings-form {
  max-width: 600px;
}

.success-message {
  background: #d4edda;
  color: #155724;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.error-message {
  background: #f8d7da;
  color: #721c24;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.form-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
}

.form-section h3 {
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 1rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #666;
  font-size: 0.9rem;
  font-weight: 500;
}

.form-input,
.form-select {
  width: 100%;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #3498db;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.checkbox-label input {
  width: 18px;
  height: 18px;
}

.checkbox-label span {
  color: #2c3e50;
}

.form-actions {
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.save-btn {
  padding: 12px 30px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.save-btn:hover:not(:disabled) {
  background: #218838;
}

.save-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>
