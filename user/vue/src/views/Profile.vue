<template>
  <div class="profile">
    <h1>Profile</h1>

    <div v-if="loading" class="loading" data-testid="profile-loading">
      <div class="spinner" />
      <p>Loading profile...</p>
    </div>

    <div v-else-if="error" class="error" data-testid="profile-error">
      {{ error }}
      <button class="retry-btn" @click="loadProfile">Retry</button>
    </div>

    <div v-else class="profile-content">
      <!-- Account Info Card -->
      <div class="card">
        <h2>Account Information</h2>
        <div class="info-grid">
          <div class="info-item">
            <label>Email</label>
            <span data-testid="profile-email">{{ userEmail }}</span>
          </div>
          <div class="info-item">
            <label>Account Status</label>
            <span class="status-badge active" data-testid="account-status">Active</span>
          </div>
          <div class="info-item">
            <label>Token Balance</label>
            <span class="balance" data-testid="token-balance">{{ formatNumber(tokenBalance) }} TKN</span>
          </div>
        </div>
      </div>

      <!-- Personal Information Card -->
      <div class="card">
        <h2>Personal Information</h2>
        <form @submit.prevent="handleUpdateProfile">
          <div class="form-row">
            <div class="form-group">
              <label for="firstName">First Name</label>
              <input
                id="firstName"
                v-model="formData.first_name"
                type="text"
                data-testid="first-name-input"
                placeholder="John"
              />
            </div>
            <div class="form-group">
              <label for="lastName">Last Name</label>
              <input
                id="lastName"
                v-model="formData.last_name"
                type="text"
                data-testid="last-name-input"
                placeholder="Doe"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="company">Company</label>
              <input
                id="company"
                v-model="formData.company"
                type="text"
                data-testid="company-input"
                placeholder="Acme Inc."
              />
            </div>
            <div class="form-group">
              <label for="taxNumber">Tax Number / VAT ID</label>
              <input
                id="taxNumber"
                v-model="formData.tax_number"
                type="text"
                data-testid="tax-number-input"
                placeholder="DE123456789"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="phone">Phone</label>
            <input
              id="phone"
              v-model="formData.phone"
              type="tel"
              data-testid="phone-input"
              placeholder="+49 123 456 7890"
            />
          </div>

          <h3>Address</h3>

          <div class="form-group">
            <label for="addressLine1">Address Line 1</label>
            <input
              id="addressLine1"
              v-model="formData.address_line_1"
              type="text"
              data-testid="address-line1-input"
              placeholder="123 Main Street"
            />
          </div>

          <div class="form-group">
            <label for="addressLine2">Address Line 2</label>
            <input
              id="addressLine2"
              v-model="formData.address_line_2"
              type="text"
              data-testid="address-line2-input"
              placeholder="Apt 4B"
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="city">City</label>
              <input
                id="city"
                v-model="formData.city"
                type="text"
                data-testid="city-input"
                placeholder="Berlin"
              />
            </div>
            <div class="form-group">
              <label for="postalCode">Postal Code</label>
              <input
                id="postalCode"
                v-model="formData.postal_code"
                type="text"
                data-testid="postal-code-input"
                placeholder="10115"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="country">Country</label>
            <input
              id="country"
              v-model="formData.country"
              type="text"
              data-testid="country-input"
              placeholder="Germany"
            />
          </div>

          <div class="form-actions">
            <button
              type="submit"
              class="btn primary"
              data-testid="save-profile"
              :disabled="saving"
            >
              {{ saving ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Change Password Card -->
      <div class="card">
        <h2>Change Password</h2>
        <form @submit.prevent="handleChangePassword">
          <div class="form-group">
            <label for="currentPassword">Current Password</label>
            <input
              id="currentPassword"
              v-model="passwordData.currentPassword"
              type="password"
              data-testid="current-password"
              required
            />
          </div>
          <div class="form-group">
            <label for="newPassword">New Password</label>
            <input
              id="newPassword"
              v-model="passwordData.newPassword"
              type="password"
              data-testid="new-password"
              required
            />
          </div>
          <div class="form-group">
            <label for="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              v-model="passwordData.confirmPassword"
              type="password"
              data-testid="confirm-password"
              required
            />
          </div>
          <div v-if="passwordError" class="field-error">
            {{ passwordError }}
          </div>
          <div class="form-actions">
            <button
              type="submit"
              class="btn secondary"
              data-testid="change-password"
              :disabled="changingPassword"
            >
              {{ changingPassword ? 'Changing...' : 'Change Password' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Success Toast -->
    <div v-if="successMessage" class="toast success" data-testid="success-toast">
      {{ successMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useProfileStore } from '../stores/profile';
import { api } from '../api';

const profileStore = useProfileStore();

const loading = ref(true);
const error = ref<string | null>(null);
const saving = ref(false);
const changingPassword = ref(false);
const successMessage = ref('');
const passwordError = ref('');

interface FormData {
  first_name: string;
  last_name: string;
  company: string;
  tax_number: string;
  phone: string;
  address_line_1: string;
  address_line_2: string;
  city: string;
  postal_code: string;
  country: string;
}

const formData = reactive<FormData>({
  first_name: '',
  last_name: '',
  company: '',
  tax_number: '',
  phone: '',
  address_line_1: '',
  address_line_2: '',
  city: '',
  postal_code: '',
  country: '',
});

const passwordData = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
});

const userEmail = computed(() => profileStore.profile?.email || '');
const tokenBalance = computed(() => 0); // Will be fetched from user details

async function loadProfile(): Promise<void> {
  loading.value = true;
  error.value = null;

  try {
    // Fetch full profile with details
    const response = await api.get('/user/profile') as {
      user: { id: string; email: string };
      details: {
        first_name?: string;
        last_name?: string;
        company?: string;
        tax_number?: string;
        phone?: string;
        address_line_1?: string;
        address_line_2?: string;
        city?: string;
        postal_code?: string;
        country?: string;
        balance?: number;
      } | null;
    };

    // Update profile store
    await profileStore.fetchProfile();

    // Populate form with details
    if (response.details) {
      formData.first_name = response.details.first_name || '';
      formData.last_name = response.details.last_name || '';
      formData.company = response.details.company || '';
      formData.tax_number = response.details.tax_number || '';
      formData.phone = response.details.phone || '';
      formData.address_line_1 = response.details.address_line_1 || '';
      formData.address_line_2 = response.details.address_line_2 || '';
      formData.city = response.details.city || '';
      formData.postal_code = response.details.postal_code || '';
      formData.country = response.details.country || '';
    }
  } catch (err) {
    error.value = (err as Error).message || 'Failed to load profile';
  } finally {
    loading.value = false;
  }
}

async function handleUpdateProfile(): Promise<void> {
  saving.value = true;
  error.value = null;

  try {
    await api.put('/user/details', {
      first_name: formData.first_name,
      last_name: formData.last_name,
      company: formData.company,
      tax_number: formData.tax_number,
      phone: formData.phone,
      address_line_1: formData.address_line_1,
      address_line_2: formData.address_line_2,
      city: formData.city,
      postal_code: formData.postal_code,
      country: formData.country,
    });

    // Refresh profile store
    await profileStore.fetchProfile();

    showSuccess('Profile updated successfully');
  } catch (err) {
    error.value = (err as Error).message || 'Failed to update profile';
  } finally {
    saving.value = false;
  }
}

async function handleChangePassword(): Promise<void> {
  passwordError.value = '';

  if (passwordData.newPassword !== passwordData.confirmPassword) {
    passwordError.value = 'Passwords do not match';
    return;
  }

  if (passwordData.newPassword.length < 8) {
    passwordError.value = 'Password must be at least 8 characters';
    return;
  }

  changingPassword.value = true;

  try {
    await profileStore.changePassword(
      passwordData.currentPassword,
      passwordData.newPassword
    );

    // Clear form
    passwordData.currentPassword = '';
    passwordData.newPassword = '';
    passwordData.confirmPassword = '';

    showSuccess('Password changed successfully');
  } catch (err) {
    passwordError.value = (err as Error).message || 'Failed to change password';
  } finally {
    changingPassword.value = false;
  }
}

function showSuccess(message: string): void {
  successMessage.value = message;
  setTimeout(() => {
    successMessage.value = '';
  }, 3000);
}

function formatNumber(num: number): string {
  return num.toLocaleString();
}

onMounted(() => {
  loadProfile();
});
</script>

<style scoped>
.profile {
  max-width: 800px;
}

h1 {
  margin-bottom: 30px;
  color: #2c3e50;
}

.loading {
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
  margin-left: 15px;
  padding: 8px 16px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.profile-content {
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

.card h3 {
  margin: 20px 0 15px;
  color: #2c3e50;
  font-size: 1rem;
}

/* Account Info */
.info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

@media (max-width: 600px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.info-item label {
  font-size: 0.85rem;
  color: #666;
}

.info-item span {
  font-size: 1rem;
  font-weight: 500;
  color: #2c3e50;
}

.status-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.85rem;
  width: fit-content;
}

.status-badge.active {
  background: #d4edda;
  color: #155724;
}

.balance {
  color: #27ae60 !important;
  font-weight: 600 !important;
}

/* Form */
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

@media (max-width: 500px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: #666;
  font-size: 0.9rem;
}

.form-group input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #3498db;
}

.form-group input::placeholder {
  color: #aaa;
}

.field-error {
  color: #dc3545;
  font-size: 0.9rem;
  margin-bottom: 15px;
}

.form-actions {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
}

.btn.primary {
  background-color: #3498db;
  color: white;
}

.btn.primary:hover:not(:disabled) {
  background-color: #2980b9;
}

.btn.secondary {
  background-color: #6c757d;
  color: white;
}

.btn.secondary:hover:not(:disabled) {
  background-color: #5a6268;
}

.btn:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
}

.error {
  background-color: #f8d7da;
  color: #721c24;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.toast {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 15px 25px;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 1000;
}

.toast.success {
  background-color: #27ae60;
  color: white;
}
</style>
