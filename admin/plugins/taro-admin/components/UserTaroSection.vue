<template>
  <div v-if="taroLimits" class="section user-taro-section">
    <h3>🔮 {{ $t('taro.title', 'Taro Sessions') }}</h3>
    <div class="info-grid">
      <div class="info-item">
        <label>{{ $t('taro.dailySessions', 'Daily Sessions') }}</label>
        <span>
          <strong>{{ taroLimits.daily_used }}</strong>
          /
          {{ taroLimits.daily_total }}
        </span>
      </div>
    </div>
    <div class="taro-actions">
      <button
        data-testid="reset-taro-sessions-button"
        class="action-btn secondary"
        :disabled="taroResetting || mainLoading"
        @click="handleResetTaroSessions"
      >
        <span v-if="!taroResetting">
          {{ $t('taro.resetSessions', 'Reset Sessions') }}
        </span>
        <span v-else>
          {{ $t('taro.resettingSession', 'Resetting...') }}
        </span>
      </button>
    </div>
    <p
      v-if="taroResetSuccess"
      class="success-message"
      data-testid="taro-success-message"
    >
      ✅ {{ $t('taro.resetSuccess', 'Taro sessions reset successfully') }}
    </p>
    <p
      v-if="taroResetError"
      class="error-message"
      data-testid="taro-error-message"
    >
      ❌ {{ taroResetError }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useUsersStore } from '@/stores/users';
import { api } from '@/api';
import type { UserDetail } from '@/stores/users';

interface Props {
  user: UserDetail | null;
  loading: boolean;
  userId: string;
}

interface TaroLimits {
  daily_total: number;
  daily_remaining: number;
  daily_used: number;
}

const props = defineProps<Props>();
const usersStore = useUsersStore();

const taroLimits = ref<TaroLimits | null>(null);
const taroResetting = ref(false);
const taroResetSuccess = ref(false);
const taroResetError = ref<string | null>(null);

const mainLoading = computed(() => props.loading);

/**
 * Fetch taro session limits and usage for this user from the taro plugin (admin endpoint)
 */
async function fetchTaroLimits(): Promise<void> {
  try {
    const response = await api.get(`/taro/admin/users/${props.userId}/sessions`) as {
      success: boolean;
      daily_limit: number;
      daily_remaining: number;
      daily_used: number;
      can_create: boolean;
    };

    if (response.success) {
      taroLimits.value = {
        daily_total: response.daily_limit,
        daily_remaining: response.daily_remaining,
        daily_used: response.daily_used,
      };
    }
  } catch (error) {
    // Silently fail - user might not have taro plugin or be an admin user
    console.warn('Failed to fetch taro limits:', error);
    taroLimits.value = null;
  }
}

/**
 * Handle reset taro sessions button click
 */
async function handleResetTaroSessions(): Promise<void> {
  taroResetting.value = true;
  taroResetSuccess.value = false;
  taroResetError.value = null;

  try {
    await usersStore.resetTaroSessions(props.userId);
    taroResetSuccess.value = true;

    // Refresh the taro limits
    await fetchTaroLimits();

    // Clear success message after 5 seconds
    setTimeout(() => {
      taroResetSuccess.value = false;
    }, 5000);
  } catch (err) {
    taroResetError.value = (err as Error).message || 'Failed to reset Taro sessions';
    // Clear error message after 5 seconds
    setTimeout(() => {
      taroResetError.value = null;
    }, 5000);
  } finally {
    taroResetting.value = false;
  }
}

// Fetch taro limits when component mounts
onMounted(() => {
  fetchTaroLimits();
});
</script>

<style scoped>
.user-taro-section {
  background: linear-gradient(135deg, #f0e6ff 0%, #f8f9fa 100%);
  border-left: 4px solid #8b5cf6;
  border-radius: 8px;
  padding: 20px;
}

.user-taro-section h3 {
  margin: 0 0 15px 0;
  color: #2c3e50;
  font-size: 1.1rem;
  font-weight: 600;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 15px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.info-item label {
  font-size: 0.8rem;
  color: #666;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-item span {
  font-size: 0.95rem;
  color: #2c3e50;
  font-weight: 500;
}

.info-item strong {
  color: #8b5cf6;
  font-size: 1.2rem;
}

.taro-actions {
  margin-top: 15px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.action-btn {
  padding: 10px 20px;
  border: 1px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.action-btn.secondary {
  background: #e9d5ff;
  color: #6d28d9;
  border-color: #c4b5fd;
}

.action-btn.secondary:hover:not(:disabled) {
  background: #d8b4fe;
  border-color: #a78bfa;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.15);
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.success-message {
  margin-top: 15px;
  padding: 12px 15px;
  background: #f0fdf4;
  color: #166534;
  border: 1px solid #dcfce7;
  border-left: 4px solid #22c55e;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 500;
}

.error-message {
  margin-top: 15px;
  padding: 12px 15px;
  background: #fef2f2;
  color: #7f1d1d;
  border: 1px solid #fee2e2;
  border-left: 4px solid #ef4444;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 500;
}
</style>
