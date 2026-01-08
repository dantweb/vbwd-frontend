<template>
  <div class="user-edit-view" data-testid="user-edit-view">
    <div class="form-header">
      <button
        data-testid="back-button"
        class="back-btn"
        @click="goBack"
      >
        &larr; Back to Users
      </button>
    </div>

    <div
      v-if="loadingUser"
      data-testid="loading-spinner"
      class="loading-state"
    >
      <div class="spinner" />
      <p>Loading user...</p>
    </div>

    <div
      v-else-if="loadError"
      data-testid="load-error"
      class="error-state"
    >
      <p>{{ loadError }}</p>
      <button
        class="retry-btn"
        @click="fetchUser"
      >
        Retry
      </button>
    </div>

    <form
      v-else
      data-testid="user-form"
      class="user-form"
      @submit.prevent="handleSubmit"
    >
      <h2 data-testid="form-title">
        Edit User
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

      <!-- Account Section -->
      <section class="form-section">
        <h3>Account</h3>

        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="formData.email"
            name="email"
            type="email"
            class="form-input readonly"
            readonly
            disabled
          >
          <small class="help-text">Email cannot be changed</small>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="status">Status</label>
            <select
              id="status"
              v-model="formData.is_active"
              name="status"
              data-testid="status-select"
              class="form-select"
            >
              <option :value="true">
                Active
              </option>
              <option :value="false">
                Inactive
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="role">Role</label>
            <select
              id="role"
              v-model="selectedRole"
              name="role"
              data-testid="role-select"
              class="form-select"
            >
              <option value="user">
                User
              </option>
              <option value="admin">
                Admin
              </option>
              <option value="vendor">
                Vendor
              </option>
            </select>
          </div>
        </div>
      </section>

      <!-- Personal Details Section -->
      <section class="form-section">
        <h3>Personal Details</h3>

        <div class="form-row">
          <div class="form-group">
            <label for="firstName">First Name</label>
            <input
              id="firstName"
              v-model="formData.first_name"
              name="firstName"
              type="text"
              placeholder="John"
              class="form-input"
            >
          </div>

          <div class="form-group">
            <label for="lastName">Last Name</label>
            <input
              id="lastName"
              v-model="formData.last_name"
              name="lastName"
              type="text"
              placeholder="Doe"
              class="form-input"
            >
          </div>
        </div>
      </section>

      <!-- Form Actions -->
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
          type="submit"
          data-testid="submit-button"
          class="submit-btn"
          :disabled="submitting"
        >
          {{ submitting ? 'Saving...' : 'Save Changes' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUsersStore } from '@/stores/users';

const route = useRoute();
const router = useRouter();
const usersStore = useUsersStore();

const loadingUser = ref(true);
const loadError = ref<string | null>(null);
const validationError = ref<string | null>(null);
const submitError = ref<string | null>(null);
const submitting = ref(false);

interface FormData {
  email: string;
  is_active: boolean;
  first_name: string;
  last_name: string;
}

const formData = ref<FormData>({
  email: '',
  is_active: true,
  first_name: '',
  last_name: '',
});

// Role is handled separately as a single value
const selectedRole = ref<string>('user');
const originalRole = ref<string>('user');

const userId = route.params.id as string;

async function fetchUser(): Promise<void> {
  loadingUser.value = true;
  loadError.value = null;

  try {
    const user = await usersStore.fetchUser(userId);

    // Populate form with existing data
    // Handle role - get first role from array or use single role value
    const userRole = Array.isArray(user.roles) ? user.roles[0] : ((user as unknown as { role?: string }).role || 'user');

    // Store original role to detect changes later
    originalRole.value = userRole;
    selectedRole.value = userRole;

    formData.value = {
      email: user.email,
      is_active: user.is_active,
      first_name: extractName(user.name, 'first'),
      last_name: extractName(user.name, 'last'),
    };
  } catch (error) {
    loadError.value = (error as Error).message || 'Failed to load user';
  } finally {
    loadingUser.value = false;
  }
}

function extractName(fullName: string | undefined, part: 'first' | 'last'): string {
  if (!fullName) return '';
  const parts = fullName.trim().split(/\s+/);
  if (part === 'first') return parts[0] || '';
  return parts.slice(1).join(' ') || '';
}

function validateForm(): boolean {
  validationError.value = null;

  if (!selectedRole.value) {
    validationError.value = 'Role is required';
    return false;
  }

  return true;
}

async function handleSubmit(): Promise<void> {
  if (!validateForm()) return;

  submitError.value = null;
  submitting.value = true;

  try {
    // Build name from first/last
    const name = [formData.value.first_name, formData.value.last_name]
      .filter(Boolean)
      .join(' ') || undefined;

    await usersStore.updateUser(userId, {
      is_active: formData.value.is_active,
      name,
    });

    // Update role separately if changed
    if (originalRole.value !== selectedRole.value) {
      await usersStore.updateUserRoles(userId, [selectedRole.value]);
    }

    router.push('/admin/users');
  } catch (error) {
    submitError.value = (error as Error).message || 'Failed to update user';
  } finally {
    submitting.value = false;
  }
}

function goBack(): void {
  router.push('/admin/users');
}

onMounted(() => {
  fetchUser();
});
</script>

<style scoped>
.user-edit-view {
  background: white;
  padding: 20px;
  border-radius: 8px;
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

.user-form h2 {
  margin: 0 0 25px 0;
  color: #2c3e50;
}

.form-section {
  margin-bottom: 30px;
}

.form-section h3 {
  margin: 0 0 15px 0;
  color: #2c3e50;
  font-size: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
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
  margin-bottom: 15px;
}

.form-row {
  display: flex;
  gap: 15px;
}

.form-row .form-group {
  flex: 1;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #2c3e50;
  font-size: 14px;
}

.form-input,
.form-select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-input:focus,
.form-select:focus {
  border-color: #3498db;
  outline: none;
}

.form-input.readonly {
  background: #f5f5f5;
  color: #666;
}

.help-text {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: #666;
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
  background: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

.submit-btn:hover:not(:disabled) {
  background: #2980b9;
}

.submit-btn:disabled {
  background: #95a5a6;
  cursor: not-allowed;
}
</style>
