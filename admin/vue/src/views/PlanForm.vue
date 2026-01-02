<template>
  <div class="plan-form-view">
    <div class="form-header">
      <button
        data-testid="back-button"
        class="back-btn"
        @click="goBack"
      >
        &larr; Back to Plans
      </button>
    </div>

    <div
      v-if="loading && isEdit"
      data-testid="loading-spinner"
      class="loading-state"
    >
      <div class="spinner" />
      <p>Loading plan...</p>
    </div>

    <div
      v-else-if="fetchError"
      data-testid="error-message"
      class="error-state"
    >
      <p>{{ fetchError }}</p>
      <button
        class="retry-btn"
        @click="fetchPlan"
      >
        Retry
      </button>
    </div>

    <form
      v-else
      data-testid="plan-form"
      class="plan-form"
      @submit.prevent="handleSubmit"
    >
      <h2 data-testid="form-title">
        {{ isEdit ? 'Edit Plan' : 'Create Plan' }}
      </h2>

      <div
        v-if="validationError"
        data-testid="validation-error"
        class="validation-error"
      >
        {{ validationError }}
      </div>

      <div
        v-if="submitError"
        data-testid="submit-error"
        class="submit-error"
      >
        {{ submitError }}
      </div>

      <div class="form-group">
        <label for="plan-name">Name *</label>
        <input
          id="plan-name"
          v-model="formData.name"
          data-testid="plan-name"
          type="text"
          placeholder="Enter plan name"
          class="form-input"
        >
      </div>

      <div class="form-group">
        <label for="plan-price">Price *</label>
        <input
          id="plan-price"
          v-model.number="formData.price"
          data-testid="plan-price"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          class="form-input"
        >
      </div>

      <div class="form-group">
        <label for="plan-billing">Billing Period *</label>
        <select
          id="plan-billing"
          v-model="formData.billing_period"
          data-testid="plan-billing"
          class="form-select"
        >
          <option value="">
            Select billing period
          </option>
          <option value="monthly">
            Monthly
          </option>
          <option value="yearly">
            Yearly
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="plan-features">Features (one per line)</label>
        <textarea
          id="plan-features"
          v-model="featuresText"
          data-testid="plan-features"
          rows="4"
          placeholder="Enter features, one per line"
          class="form-textarea"
        />
      </div>

      <div class="form-actions">
        <button
          type="button"
          data-testid="cancel-button"
          class="cancel-btn"
          @click="goBack"
        >
          Cancel
        </button>
        <button
          type="button"
          data-testid="submit-button"
          class="submit-btn"
          :disabled="submitting"
          @click="handleSubmit"
        >
          {{ submitting ? 'Saving...' : (isEdit ? 'Update Plan' : 'Create Plan') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { usePlanAdminStore } from '@/stores/planAdmin';

const route = useRoute();
const router = useRouter();
const planStore = usePlanAdminStore();

const isEdit = computed(() => route.params.id && route.params.id !== 'new');
const planId = computed(() => route.params.id as string);

const loading = computed(() => planStore.loading);
const fetchError = ref<string | null>(null);
const validationError = ref<string | null>(null);
const submitError = ref<string | null>(null);
const submitting = ref(false);

const formData = ref({
  name: '',
  price: 0,
  billing_period: '' as string,
  features: [] as string[] | Record<string, unknown>
});

const featuresText = computed({
  get: () => {
    const features = formData.value.features;
    // Handle features as object (from API) or array
    if (Array.isArray(features)) {
      return features.join('\n');
    } else if (features && typeof features === 'object') {
      // Convert object to "key: value" lines
      return Object.entries(features)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');
    }
    return '';
  },
  set: (value: string) => {
    const lines = value.split('\n').filter(f => f.trim());
    // Check if input looks like "key: value" format
    const hasKeyValue = lines.some(line => line.includes(':'));
    if (hasKeyValue) {
      // Parse as object
      const obj: Record<string, string | number | boolean> = {};
      lines.forEach(line => {
        const [key, ...rest] = line.split(':');
        if (key && rest.length) {
          const val = rest.join(':').trim();
          // Try to parse as number or boolean
          if (val === 'true') obj[key.trim()] = true;
          else if (val === 'false') obj[key.trim()] = false;
          else if (!isNaN(Number(val))) obj[key.trim()] = Number(val);
          else obj[key.trim()] = val;
        }
      });
      formData.value.features = obj as unknown as string[];
    } else {
      formData.value.features = lines;
    }
  }
});

async function fetchPlan(): Promise<void> {
  if (!isEdit.value) return;

  fetchError.value = null;
  try {
    const response = await planStore.fetchPlan(planId.value);
    if (response) {
      // Extract price as number (handle both price_float and price object)
      let priceValue = 0;
      if (typeof response.price_float === 'number') {
        priceValue = response.price_float;
      } else if (typeof response.price === 'number') {
        priceValue = response.price;
      } else if (response.price && typeof response.price === 'object' && 'price_float' in response.price) {
        priceValue = (response.price as { price_float: number }).price_float;
      }

      formData.value = {
        name: response.name || '',
        price: priceValue,
        billing_period: response.billing_period || '',
        features: response.features || []
      };
    }
  } catch (error) {
    fetchError.value = (error as Error).message || 'Failed to load plan';
  }
}

function validateForm(): boolean {
  validationError.value = null;

  if (!formData.value.name.trim()) {
    validationError.value = 'Plan name is required';
    return false;
  }

  if (formData.value.price < 0) {
    validationError.value = 'Price must be 0 or greater';
    return false;
  }

  if (!formData.value.billing_period) {
    validationError.value = 'Billing period is required';
    return false;
  }

  return true;
}

async function handleSubmit(): Promise<void> {
  if (!validateForm()) return;

  submitError.value = null;
  submitting.value = true;

  try {
    // Type guard ensures billing_period is not empty after validation
    const billingPeriod = formData.value.billing_period as 'monthly' | 'yearly';
    const data = {
      name: formData.value.name,
      price: formData.value.price,
      billing_period: billingPeriod,
      features: formData.value.features
    };

    if (isEdit.value) {
      await planStore.updatePlan(planId.value, data);
    } else {
      await planStore.createPlan(data);
    }

    router.push('/admin/plans');
  } catch (error) {
    submitError.value = (error as Error).message || 'Failed to save plan';
  } finally {
    submitting.value = false;
  }
}

function goBack(): void {
  router.push('/admin/plans');
}

onMounted(() => {
  if (isEdit.value) {
    fetchPlan();
  }
});
</script>

<style scoped>
.plan-form-view {
  background: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 600px;
}

.form-header {
  margin-bottom: 20px;
}

.back-btn {
  background: none;
  border: none;
  color: #3498db;
  cursor: pointer;
  font-size: 14px;
  padding: 0;
}

.back-btn:hover {
  text-decoration: underline;
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
  margin-top: 15px;
  padding: 10px 20px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.plan-form h2 {
  margin: 0 0 25px 0;
  color: #2c3e50;
}

.validation-error,
.submit-error {
  background: #f8d7da;
  color: #721c24;
  padding: 12px 15px;
  border-radius: 4px;
  margin-bottom: 20px;
  font-size: 14px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #2c3e50;
  font-size: 14px;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  border-color: #3498db;
  outline: none;
}

.form-textarea {
  resize: vertical;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.cancel-btn {
  padding: 10px 20px;
  background: #e9ecef;
  color: #495057;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.cancel-btn:hover {
  background: #dee2e6;
}

.submit-btn {
  padding: 10px 20px;
  background: #27ae60;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

.submit-btn:hover:not(:disabled) {
  background: #1e8449;
}

.submit-btn:disabled {
  background: #95a5a6;
  cursor: not-allowed;
}
</style>
