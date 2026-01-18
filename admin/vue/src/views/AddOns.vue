<template>
  <div class="add-ons-view">
    <div class="page-header">
      <h2>{{ $t('addOns.title') }}</h2>
    </div>

    <!-- Tab Navigation -->
    <div
      class="tabs-container"
      data-testid="addons-tabs"
    >
      <button
        data-testid="addons-tab1"
        class="tab-btn"
        :class="{ active: activeTab === 'tab1' }"
        @click="activeTab = 'tab1'"
      >
        {{ $t('addOns.tab1') }}
      </button>
      <button
        data-testid="addons-tab2"
        class="tab-btn"
        :class="{ active: activeTab === 'tab2' }"
        @click="activeTab = 'tab2'"
      >
        {{ $t('addOns.tab2') }}
      </button>
    </div>

    <!-- Tab Content -->
    <div class="tab-content">
      <!-- Tab 1 Content -->
      <div
        v-show="activeTab === 'tab1'"
        data-testid="addons-tab1-content"
        class="tab-pane"
      >
        <div class="placeholder-content">
          <p>{{ $t('addOns.tab1Placeholder') }}</p>
        </div>
      </div>

      <!-- Tab 2 Content -->
      <div
        v-show="activeTab === 'tab2'"
        data-testid="addons-tab2-content"
        class="tab-pane"
      >
        <div class="placeholder-content">
          <p>{{ $t('addOns.tab2Placeholder') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

type TabType = 'tab1' | 'tab2';

const activeTab = ref<TabType>('tab1');
</script>

<style scoped>
.add-ons-view {
  background: white;
  padding: 20px;
  border-radius: 8px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  color: #2c3e50;
}

/* Tabs */
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

/* Tab Content */
.tab-content {
  padding: 20px 0;
}

.tab-pane {
  min-height: 200px;
}

/* Placeholder */
.placeholder-content {
  text-align: center;
  padding: 60px 20px;
  color: #666;
  background: #f8f9fa;
  border-radius: 8px;
}

.placeholder-content p {
  margin: 0;
  font-size: 1rem;
}
</style>
