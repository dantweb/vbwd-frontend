<template>
  <div
    class="countries-view"
    data-testid="countries-view"
  >
    <div class="page-header">
      <h2>{{ $t('countriesConfig.title') }}</h2>
    </div>

    <p class="description">
      {{ $t('countriesConfig.description') }}
    </p>

    <div
      v-if="loading && !hasData"
      class="loading-state"
    >
      {{ $t('common.loading') }}
    </div>

    <div
      v-else-if="error"
      class="error-state"
    >
      <p>{{ error }}</p>
      <button
        class="btn btn-secondary"
        @click="loadCountries"
      >
        {{ $t('common.retry') }}
      </button>
    </div>

    <div
      v-else
      class="countries-layout"
    >
      <!-- Enabled Countries (Drag & Drop) -->
      <div class="countries-panel enabled-panel">
        <div class="panel-header">
          <h3>{{ $t('countriesConfig.enabledCountries') }}</h3>
          <span class="count-badge">{{ enabledCountries.length }}</span>
        </div>

        <div
          v-if="enabledCountries.length === 0"
          class="empty-panel"
        >
          {{ $t('countriesConfig.noEnabledCountries') }}
        </div>

        <ul
          v-else
          class="country-list sortable-list"
          data-testid="enabled-countries-list"
          @dragover.prevent
          @drop="handleDrop"
        >
          <li
            v-for="(country, index) in enabledCountries"
            :key="country.code"
            class="country-item enabled-item"
            :data-testid="`enabled-country-${country.code}`"
            draggable="true"
            :class="{ 'drag-over': dragOverIndex === index }"
            @dragstart="handleDragStart($event, index)"
            @dragenter="handleDragEnter($event, index)"
            @dragleave="handleDragLeave"
            @dragend="handleDragEnd"
          >
            <span class="drag-handle">&#x2630;</span>
            <span class="country-flag">{{ getFlagEmoji(country.code) }}</span>
            <span class="country-name">{{ country.name }}</span>
            <span class="country-code">{{ country.code }}</span>
            <button
              class="btn btn-sm btn-warning"
              :disabled="actionLoading === country.code"
              :title="$t('countriesConfig.disable')"
              @click="handleDisable(country.code)"
            >
              {{ $t('countriesConfig.disable') }}
            </button>
          </li>
        </ul>
      </div>

      <!-- Disabled Countries -->
      <div class="countries-panel disabled-panel">
        <div class="panel-header">
          <h3>{{ $t('countriesConfig.disabledCountries') }}</h3>
          <span class="count-badge">{{ disabledCountries.length }}</span>
        </div>

        <div class="search-box">
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="$t('common.search')"
            class="search-input"
            data-testid="country-search"
          >
        </div>

        <div
          v-if="filteredDisabledCountries.length === 0"
          class="empty-panel"
        >
          {{ searchQuery ? $t('common.noResults') : $t('countriesConfig.noDisabledCountries') }}
        </div>

        <ul
          v-else
          class="country-list"
          data-testid="disabled-countries-list"
        >
          <li
            v-for="country in filteredDisabledCountries"
            :key="country.code"
            class="country-item disabled-item"
            :data-testid="`disabled-country-${country.code}`"
          >
            <span class="country-flag">{{ getFlagEmoji(country.code) }}</span>
            <span class="country-name">{{ country.name }}</span>
            <span class="country-code">{{ country.code }}</span>
            <button
              class="btn btn-sm btn-success"
              :disabled="actionLoading === country.code"
              :title="$t('countriesConfig.enable')"
              @click="handleEnable(country.code)"
            >
              {{ $t('countriesConfig.enable') }}
            </button>
          </li>
        </ul>
      </div>
    </div>

    <div
      v-if="successMessage"
      class="success-message"
    >
      {{ successMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useCountriesStore } from '@/stores/countries';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const store = useCountriesStore();

const loading = ref(false);
const error = ref<string | null>(null);
const actionLoading = ref<string | null>(null);
const successMessage = ref<string | null>(null);
const searchQuery = ref('');

// Drag and drop state
const draggedIndex = ref<number | null>(null);
const dragOverIndex = ref<number | null>(null);

const enabledCountries = computed(() => store.sortedEnabled);
const disabledCountries = computed(() => store.sortedDisabled);
const hasData = computed(() => store.countries.length > 0);

const filteredDisabledCountries = computed(() => {
  if (!searchQuery.value) {
    return disabledCountries.value;
  }
  const query = searchQuery.value.toLowerCase();
  return disabledCountries.value.filter(
    c => c.name.toLowerCase().includes(query) || c.code.toLowerCase().includes(query)
  );
});

// Convert country code to flag emoji
function getFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

async function loadCountries(): Promise<void> {
  loading.value = true;
  error.value = null;
  try {
    await store.fetchAllCountries();
  } catch (e) {
    error.value = (e as Error).message || t('countriesConfig.loadError');
  } finally {
    loading.value = false;
  }
}

async function handleEnable(code: string): Promise<void> {
  actionLoading.value = code;
  try {
    await store.enableCountry(code);
    showSuccess(t('countriesConfig.countryEnabled'));
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    actionLoading.value = null;
  }
}

async function handleDisable(code: string): Promise<void> {
  actionLoading.value = code;
  try {
    await store.disableCountry(code);
    showSuccess(t('countriesConfig.countryDisabled'));
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    actionLoading.value = null;
  }
}

// Drag and drop handlers
function handleDragStart(event: DragEvent, index: number): void {
  draggedIndex.value = index;
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', String(index));
  }
}

function handleDragEnter(_event: DragEvent, index: number): void {
  if (draggedIndex.value !== null && draggedIndex.value !== index) {
    dragOverIndex.value = index;
  }
}

function handleDragLeave(): void {
  dragOverIndex.value = null;
}

function handleDragEnd(): void {
  draggedIndex.value = null;
  dragOverIndex.value = null;
}

async function handleDrop(): Promise<void> {
  if (draggedIndex.value === null || dragOverIndex.value === null) {
    return;
  }

  const fromIndex = draggedIndex.value;
  const toIndex = dragOverIndex.value;

  if (fromIndex === toIndex) {
    draggedIndex.value = null;
    dragOverIndex.value = null;
    return;
  }

  // Reorder locally first (optimistic update)
  const countries = [...enabledCountries.value];
  const [movedCountry] = countries.splice(fromIndex, 1);
  countries.splice(toIndex, 0, movedCountry);

  // Update store optimistically
  store.updateEnabledOrder(countries);

  // Reset drag state
  draggedIndex.value = null;
  dragOverIndex.value = null;

  // Persist to backend
  try {
    const codes = countries.map(c => c.code);
    await store.reorderCountries(codes);
    showSuccess(t('countriesConfig.orderSaved'));
  } catch (e) {
    // Revert on error
    await loadCountries();
    error.value = (e as Error).message;
  }
}

function showSuccess(message: string): void {
  successMessage.value = message;
  setTimeout(() => {
    successMessage.value = null;
  }, 3000);
}

onMounted(() => {
  loadCountries();
});
</script>

<style scoped>
.countries-view {
  background: white;
  padding: 20px;
  border-radius: 8px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.page-header h2 {
  margin: 0;
  color: #2c3e50;
}

.description {
  color: #666;
  margin-bottom: 20px;
}

.loading-state,
.error-state {
  text-align: center;
  padding: 40px 20px;
  color: #666;
}

.error-state {
  color: #e74c3c;
}

.countries-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

@media (max-width: 768px) {
  .countries-layout {
    grid-template-columns: 1fr;
  }
}

.countries-panel {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
  color: #495057;
}

.count-badge {
  background: #6c757d;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.enabled-panel .count-badge {
  background: #28a745;
}

.search-box {
  padding: 10px;
  background: #fff;
  border-bottom: 1px solid #e9ecef;
}

.search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
}

.search-input:focus {
  outline: none;
  border-color: #80bdff;
  box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
}

.empty-panel {
  padding: 40px 20px;
  text-align: center;
  color: #6c757d;
}

.country-list {
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 500px;
  overflow-y: auto;
}

.country-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid #e9ecef;
  transition: background-color 0.15s;
}

.country-item:last-child {
  border-bottom: none;
}

.country-item:hover {
  background: #f8f9fa;
}

.enabled-item {
  cursor: grab;
}

.enabled-item:active {
  cursor: grabbing;
}

.enabled-item.drag-over {
  background: #e3f2fd;
  border-top: 2px solid #2196f3;
}

.drag-handle {
  color: #adb5bd;
  cursor: grab;
  font-size: 14px;
}

.country-flag {
  font-size: 20px;
}

.country-name {
  flex: 1;
  color: #212529;
}

.country-code {
  color: #6c757d;
  font-family: monospace;
  font-size: 12px;
  background: #e9ecef;
  padding: 2px 6px;
  border-radius: 3px;
}

.btn {
  display: inline-block;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  text-decoration: none;
  font-size: 14px;
  transition: background-color 0.2s;
}

.btn-sm {
  padding: 4px 8px;
  font-size: 12px;
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn-success:hover {
  background: #218838;
}

.btn-warning {
  background: #ffc107;
  color: #212529;
}

.btn-warning:hover {
  background: #e0a800;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.success-message {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: #28a745;
  color: white;
  padding: 12px 20px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  z-index: 1000;
}
</style>
