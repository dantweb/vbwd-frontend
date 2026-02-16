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
  background: #fff8f0;
  border-left: 4px solid #9b59b6;
}

.taro-actions {
  margin-top: 15px;
  display: flex;
  gap: 10px;
}

.action-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

.action-btn.secondary {
  background: #95a5a6;
  color: white;
}

.action-btn.secondary:hover:not(:disabled) {
  background: #7f8c8d;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.success-message {
  margin-top: 15px;
  padding: 12px 15px;
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
  border-radius: 4px;
  font-size: 0.95rem;
}

.error-message {
  margin-top: 15px;
  padding: 12px 15px;
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  font-size: 0.95rem;
}
</style>
