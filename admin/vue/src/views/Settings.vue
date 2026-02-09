<template>
  <div class="settings-view">
    <div class="settings-header">
      <h2>{{ $t('settings.title') }}</h2>
    </div>

    <!-- Main Tabs -->
    <div
      class="tabs-container"
      data-testid="settings-tabs"
    >
      <button
        data-testid="tab-core-settings"
        class="tab-btn"
        :class="{ active: activeTab === 'core' }"
        @click="activeTab = 'core'"
      >
        {{ $t('settings.tabs.coreSettings') }}
      </button>
      <button
        data-testid="tab-tokens"
        class="tab-btn"
        :class="{ active: activeTab === 'tokens' }"
        @click="activeTab = 'tokens'"
      >
        {{ $t('settings.tabs.tokens') }}
      </button>
    </div>

    <!-- Loading State -->
    <div
      v-if="loading"
      data-testid="loading-spinner"
      class="loading-state"
    >
      <div class="spinner" />
      <p>{{ $t('common.loading') }}</p>
    </div>

    <!-- Error State -->
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
        {{ $t('common.retry') }}
      </button>
    </div>

    <!-- Tab Content -->
    <div
      v-else
      class="tab-content"
    >
      <!-- Success/Error Messages -->
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

      <!-- Core Settings Tab -->
      <div
        v-show="activeTab === 'core'"
        data-testid="core-settings-content"
        class="settings-form"
      >
        <!-- Service Provider Information -->
        <div class="form-section">
          <h3>{{ $t('settings.coreSettings.title') }}</h3>

          <div class="form-group">
            <label for="provider-name">{{ $t('settings.coreSettings.providerName') }}</label>
            <input
              id="provider-name"
              v-model="coreSettingsData.provider_name"
              data-testid="provider-name-input"
              type="text"
              class="form-input"
              :placeholder="$t('settings.coreSettings.providerNamePlaceholder')"
            >
          </div>

          <div class="form-group">
            <label for="contact-email">{{ $t('settings.coreSettings.contactEmail') }}</label>
            <input
              id="contact-email"
              v-model="coreSettingsData.contact_email"
              data-testid="contact-email-input"
              type="email"
              class="form-input"
              :placeholder="$t('settings.coreSettings.contactEmailPlaceholder')"
            >
          </div>

          <div class="form-group">
            <label for="website-url">{{ $t('settings.coreSettings.websiteUrl') }}</label>
            <input
              id="website-url"
              v-model="coreSettingsData.website_url"
              data-testid="website-url-input"
              type="url"
              class="form-input"
              :placeholder="$t('settings.coreSettings.websiteUrlPlaceholder')"
            >
          </div>

          <div class="form-group">
            <label for="other-links">{{ $t('settings.coreSettings.otherLinks') }}</label>
            <textarea
              id="other-links"
              v-model="coreSettingsData.other_links"
              data-testid="other-links-input"
              class="form-textarea"
              rows="3"
              :placeholder="$t('settings.coreSettings.otherLinksPlaceholder')"
            />
          </div>
        </div>

        <!-- Address -->
        <div class="form-section">
          <h3>{{ $t('settings.coreSettings.address') }}</h3>

          <div class="form-group">
            <label for="street">{{ $t('settings.coreSettings.street') }}</label>
            <input
              id="street"
              v-model="coreSettingsData.address_street"
              data-testid="street-input"
              type="text"
              class="form-input"
              :placeholder="$t('settings.coreSettings.streetPlaceholder')"
            >
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="city">{{ $t('settings.coreSettings.city') }}</label>
              <input
                id="city"
                v-model="coreSettingsData.address_city"
                data-testid="city-input"
                type="text"
                class="form-input"
                :placeholder="$t('settings.coreSettings.cityPlaceholder')"
              >
            </div>
            <div class="form-group">
              <label for="postal-code">{{ $t('settings.coreSettings.postalCode') }}</label>
              <input
                id="postal-code"
                v-model="coreSettingsData.address_postal_code"
                data-testid="postal-code-input"
                type="text"
                class="form-input"
                :placeholder="$t('settings.coreSettings.postalCodePlaceholder')"
              >
            </div>
          </div>

          <div class="form-group">
            <label for="country">{{ $t('settings.coreSettings.country') }}</label>
            <input
              id="country"
              v-model="coreSettingsData.address_country"
              data-testid="country-input"
              type="text"
              class="form-input"
              :placeholder="$t('settings.coreSettings.countryPlaceholder')"
            >
          </div>
        </div>

        <!-- Bank Account -->
        <div class="form-section">
          <h3>{{ $t('settings.coreSettings.bankAccount') }}</h3>

          <div class="form-group">
            <label for="bank-name">{{ $t('settings.coreSettings.bankName') }}</label>
            <input
              id="bank-name"
              v-model="coreSettingsData.bank_name"
              data-testid="bank-name-input"
              type="text"
              class="form-input"
              :placeholder="$t('settings.coreSettings.bankNamePlaceholder')"
            >
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="iban">{{ $t('settings.coreSettings.iban') }}</label>
              <input
                id="iban"
                v-model="coreSettingsData.bank_iban"
                data-testid="iban-input"
                type="text"
                class="form-input"
                :placeholder="$t('settings.coreSettings.ibanPlaceholder')"
              >
            </div>
            <div class="form-group">
              <label for="bic">{{ $t('settings.coreSettings.bic') }}</label>
              <input
                id="bic"
                v-model="coreSettingsData.bank_bic"
                data-testid="bic-input"
                type="text"
                class="form-input"
                :placeholder="$t('settings.coreSettings.bicPlaceholder')"
              >
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button
            type="button"
            data-testid="save-core-settings-button"
            class="save-btn"
            :disabled="saving"
            @click="handleSaveCoreSettings"
          >
            {{ saving ? $t('settings.saving') : $t('settings.saveSettings') }}
          </button>
        </div>
      </div>

      <!-- Tokens Tab -->
      <div
        v-show="activeTab === 'tokens'"
        data-testid="tokens-content"
        class="tokens-tab"
      >
        <div class="form-section token-bundles-section">
          <div class="section-header">
            <div>
              <h3>{{ $t('settings.tokens.title') }}</h3>
              <p class="section-description">
                {{ $t('settings.tokens.description') }}
              </p>
            </div>
            <router-link
              to="/admin/settings/token-bundles/new"
              class="create-btn"
              data-testid="create-bundle-btn"
            >
              {{ $t('tokenBundles.createBundle') }}
            </router-link>
          </div>

          <!-- Loading State -->
          <div
            v-if="bundlesLoading"
            class="bundles-loading"
            data-testid="bundles-loading"
          >
            <div class="spinner" />
            <p>{{ $t('common.loading') }}</p>
          </div>

          <!-- Error State -->
          <div
            v-else-if="bundlesError"
            class="bundles-error"
            data-testid="bundles-error"
          >
            <p>{{ bundlesError }}</p>
            <button
              class="retry-btn"
              @click="loadTokenBundles()"
            >
              {{ $t('common.retry') }}
            </button>
          </div>

          <!-- Empty State -->
          <div
            v-else-if="tokenBundles.length === 0"
            class="empty-state"
            data-testid="no-bundles"
          >
            <p>{{ $t('tokenBundles.noBundles') }}</p>
            <p class="empty-hint">
              {{ $t('tokenBundles.createFirst') }}
            </p>
          </div>

          <!-- Token Bundles Table -->
          <div
            v-else
            class="bundles-table-container"
          >
            <table
              class="bundles-table"
              data-testid="token-bundles-table"
            >
              <thead>
                <tr>
                  <th>{{ $t('tokenBundles.name') }}</th>
                  <th>{{ $t('tokenBundles.tokens') }}</th>
                  <th>{{ $t('tokenBundles.price') }}</th>
                  <th>{{ $t('common.status') }}</th>
                  <th>{{ $t('common.actions') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="bundle in tokenBundles"
                  :key="bundle.id"
                  data-testid="bundle-row"
                >
                  <td class="bundle-name">
                    <router-link :to="`/admin/settings/token-bundles/${bundle.id}`">
                      {{ bundle.name }}
                    </router-link>
                    <span
                      v-if="bundle.description"
                      class="bundle-description"
                    >
                      {{ bundle.description }}
                    </span>
                  </td>
                  <td class="bundle-tokens">
                    {{ formatNumber(bundle.token_amount) }}
                  </td>
                  <td class="bundle-price">
                    {{ formatPrice(bundle.price) }}
                  </td>
                  <td>
                    <span
                      class="status-badge"
                      :class="{ active: bundle.is_active, inactive: !bundle.is_active }"
                    >
                      {{ bundle.is_active ? $t('common.active') : $t('common.inactive') }}
                    </span>
                  </td>
                  <td class="actions-cell">
                    <router-link
                      :to="`/admin/settings/token-bundles/${bundle.id}`"
                      class="action-btn edit-btn"
                      data-testid="edit-bundle-btn"
                    >
                      {{ $t('common.edit') }}
                    </router-link>
                    <button
                      v-if="bundle.is_active"
                      class="action-btn deactivate-btn"
                      data-testid="deactivate-bundle-btn"
                      @click="handleDeactivate(bundle.id)"
                    >
                      {{ $t('tokenBundles.deactivate') }}
                    </button>
                    <button
                      v-else
                      class="action-btn activate-btn"
                      data-testid="activate-bundle-btn"
                      @click="handleActivate(bundle.id)"
                    >
                      {{ $t('tokenBundles.activate') }}
                    </button>
                    <button
                      class="action-btn delete-btn"
                      data-testid="delete-bundle-btn"
                      @click="handleDelete(bundle.id)"
                    >
                      {{ $t('common.delete') }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Pagination -->
            <div
              v-if="bundlesPagination.pages > 1"
              class="pagination"
              data-testid="bundles-pagination"
            >
              <button
                class="page-btn"
                :disabled="bundlesPagination.page <= 1"
                @click="changePage(bundlesPagination.page - 1)"
              >
                {{ $t('common.previous') }}
              </button>
              <span class="page-info">
                {{ $t('common.page') }} {{ bundlesPagination.page }} {{ $t('common.of') }} {{ bundlesPagination.pages }}
              </span>
              <button
                class="page-btn"
                :disabled="bundlesPagination.page >= bundlesPagination.pages"
                @click="changePage(bundlesPagination.page + 1)"
              >
                {{ $t('common.next') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { api } from '@/api';
import { useTokenBundlesStore } from '@/stores/tokenBundles';

const { t } = useI18n();
const tokenBundlesStore = useTokenBundlesStore();

// Tab state
type MainTab = 'core' | 'tokens';

const activeTab = ref<MainTab>('core');

// Loading/error states
const loading = ref(true);
const saving = ref(false);
const fetchError = ref<string | null>(null);
const saveError = ref<string | null>(null);
const successMessage = ref<string | null>(null);

// Core Settings form data
interface CoreSettings {
  provider_name: string;
  contact_email: string;
  website_url: string;
  other_links: string;
  address_street: string;
  address_city: string;
  address_postal_code: string;
  address_country: string;
  bank_name: string;
  bank_iban: string;
  bank_bic: string;
}

const coreSettingsData = reactive<CoreSettings>({
  provider_name: '',
  contact_email: '',
  website_url: '',
  other_links: '',
  address_street: '',
  address_city: '',
  address_postal_code: '',
  address_country: '',
  bank_name: '',
  bank_iban: '',
  bank_bic: '',
});

async function fetchSettings(): Promise<void> {
  loading.value = true;
  fetchError.value = null;

  try {
    const response = await api.get('/admin/settings') as { settings: Record<string, unknown> };
    const settings = response.settings || {};

    // Map settings to core settings form
    coreSettingsData.provider_name = (settings.provider_name as string) || (settings.company_name as string) || '';
    coreSettingsData.contact_email = (settings.contact_email as string) || (settings.company_email as string) || '';
    coreSettingsData.website_url = (settings.website_url as string) || '';
    coreSettingsData.other_links = (settings.other_links as string) || '';
    coreSettingsData.address_street = (settings.address_street as string) || '';
    coreSettingsData.address_city = (settings.address_city as string) || '';
    coreSettingsData.address_postal_code = (settings.address_postal_code as string) || '';
    coreSettingsData.address_country = (settings.address_country as string) || '';
    coreSettingsData.bank_name = (settings.bank_name as string) || '';
    coreSettingsData.bank_iban = (settings.bank_iban as string) || '';
    coreSettingsData.bank_bic = (settings.bank_bic as string) || '';
  } catch (error) {
    fetchError.value = (error as Error).message || 'Failed to load settings';
  } finally {
    loading.value = false;
  }
}

async function handleSaveCoreSettings(): Promise<void> {
  saving.value = true;
  saveError.value = null;
  successMessage.value = null;

  try {
    await api.put('/admin/settings', {
      provider_name: coreSettingsData.provider_name,
      company_name: coreSettingsData.provider_name, // For backward compatibility
      contact_email: coreSettingsData.contact_email,
      company_email: coreSettingsData.contact_email, // For backward compatibility
      website_url: coreSettingsData.website_url,
      other_links: coreSettingsData.other_links,
      address_street: coreSettingsData.address_street,
      address_city: coreSettingsData.address_city,
      address_postal_code: coreSettingsData.address_postal_code,
      address_country: coreSettingsData.address_country,
      bank_name: coreSettingsData.bank_name,
      bank_iban: coreSettingsData.bank_iban,
      bank_bic: coreSettingsData.bank_bic,
    });
    successMessage.value = t('settings.settingsSaved');
    setTimeout(() => {
      successMessage.value = null;
    }, 3000);
  } catch (error) {
    saveError.value = (error as Error).message || 'Failed to save settings';
  } finally {
    saving.value = false;
  }
}

// Token Bundles
const bundlesLoading = ref(false);
const bundlesError = ref<string | null>(null);
const bundlesLoaded = ref(false);

const tokenBundles = computed(() => tokenBundlesStore.bundles || []);
const bundlesPagination = computed(() => tokenBundlesStore.pagination || { page: 1, perPage: 20, total: 0, pages: 0 });

async function loadTokenBundles(page = 1): Promise<void> {
  bundlesLoading.value = true;
  bundlesError.value = null;

  try {
    await tokenBundlesStore.fetchBundles(page, 20, true);
    bundlesLoaded.value = true;
  } catch (error) {
    bundlesError.value = (error as Error).message || t('tokenBundles.loadError');
  } finally {
    bundlesLoading.value = false;
  }
}

function changePage(page: number): void {
  loadTokenBundles(page);
}

async function handleActivate(bundleId: string): Promise<void> {
  try {
    await tokenBundlesStore.activateBundle(bundleId);
    await loadTokenBundles(bundlesPagination.value.page);
  } catch (error) {
    saveError.value = (error as Error).message || 'Failed to activate bundle';
  }
}

async function handleDeactivate(bundleId: string): Promise<void> {
  try {
    await tokenBundlesStore.deactivateBundle(bundleId);
    await loadTokenBundles(bundlesPagination.value.page);
  } catch (error) {
    saveError.value = (error as Error).message || 'Failed to deactivate bundle';
  }
}

async function handleDelete(bundleId: string): Promise<void> {
  if (!confirm(t('tokenBundles.confirmDelete'))) {
    return;
  }

  try {
    await tokenBundlesStore.deleteBundle(bundleId);
    await loadTokenBundles(bundlesPagination.value.page);
  } catch (error) {
    saveError.value = (error as Error).message || t('tokenBundles.deleteError');
  }
}

function formatNumber(value: number): string {
  return value.toLocaleString();
}

function formatPrice(price: string | number): string {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(numPrice);
}

// Load token bundles when tokens tab is selected
watch(activeTab, (newTab) => {
  if (newTab === 'tokens' && !bundlesLoaded.value) {
    loadTokenBundles();
  }
});

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
  margin-bottom: 20px;
}

.settings-header h2 {
  margin: 0;
  color: #2c3e50;
}

/* Main Tabs */
.tabs-container {
  display: flex;
  gap: 0;
  border-bottom: 2px solid #e9ecef;
  margin-bottom: 20px;
}

.tab-btn {
  padding: 12px 24px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  transition: all 0.2s;
}

.tab-btn:hover {
  color: #3498db;
}

.tab-btn.active {
  color: #3498db;
  border-bottom-color: #3498db;
}

/* Loading/Error States */
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

/* Tab Content */
.tab-content {
  padding: 10px 0;
}

.settings-form {
  max-width: 700px;
}

/* Messages */
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

/* Form Sections */
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

.section-description {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 20px;
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
.form-select,
.form-textarea {
  width: 100%;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-textarea {
  resize: vertical;
  font-family: inherit;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3498db;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

/* Form Actions */
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

/* Empty/Placeholder States */
.empty-state,
.placeholder-content {
  text-align: center;
  padding: 40px;
  color: #666;
  background: #f8f9fa;
  border-radius: 8px;
}

.placeholder-content p {
  margin: 0;
}

/* Tokens Tab */
.tokens-tab .form-section {
  max-width: 100%;
}

.token-bundles-section {
  padding: 20px;
}

.token-bundles-section .section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.token-bundles-section .section-header h3 {
  margin: 0 0 8px 0;
  border-bottom: none;
  padding-bottom: 0;
}

.token-bundles-section .section-header .section-description {
  margin-bottom: 0;
}

.create-btn {
  padding: 10px 20px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
}

.create-btn:hover {
  background: #218838;
}

/* Bundles Table */
.bundles-table-container {
  overflow-x: auto;
}

.bundles-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.bundles-table th,
.bundles-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.bundles-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #2c3e50;
}

.bundles-table tbody tr:hover {
  background: #f8f9fa;
}

.bundle-name {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.bundle-name a {
  color: #3498db;
  text-decoration: none;
  font-weight: 500;
}

.bundle-name a:hover {
  text-decoration: underline;
}

.bundle-description {
  font-size: 0.85rem;
  color: #666;
}

.bundle-tokens {
  font-weight: 500;
  color: #2c3e50;
}

.bundle-price {
  font-weight: 500;
  color: #28a745;
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
  color: #666;
}

.actions-cell {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.action-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  text-decoration: none;
}

.action-btn.edit-btn {
  background: #e3f2fd;
  color: #1976d2;
}

.action-btn.edit-btn:hover {
  background: #bbdefb;
}

.action-btn.activate-btn {
  background: #e8f5e9;
  color: #388e3c;
}

.action-btn.activate-btn:hover {
  background: #c8e6c9;
}

.action-btn.deactivate-btn {
  background: #fff3e0;
  color: #f57c00;
}

.action-btn.deactivate-btn:hover {
  background: #ffe0b2;
}

.action-btn.delete-btn {
  background: #ffebee;
  color: #d32f2f;
}

.action-btn.delete-btn:hover {
  background: #ffcdd2;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.page-btn {
  padding: 8px 16px;
  background: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.page-btn:hover:not(:disabled) {
  background: #e9ecef;
}

.page-btn:disabled {
  background: #f8f9fa;
  color: #aaa;
  cursor: not-allowed;
}

.page-info {
  font-size: 14px;
  color: #666;
}

/* Bundles Loading/Error States */
.bundles-loading,
.bundles-error {
  text-align: center;
  padding: 40px;
  color: #666;
}

.bundles-error {
  background: #fff5f5;
  border-radius: 8px;
}

.empty-hint {
  margin-top: 10px;
  font-size: 0.9rem;
  color: #999;
}
</style>
