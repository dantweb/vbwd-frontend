import { defineStore } from 'pinia';
import { ApiClient } from '@vbwd/view-component';

export interface Subscription {
  id: string;
  planId: string;
  planName: string;
  status: 'active' | 'cancelling' | 'cancelled' | 'past_due';
  currentPeriodEnd: string;
}

export interface Usage {
  apiCalls: { used: number; limit: number };
  storage: { used: number; limit: number; unit: string };
}

// Create API client instance
const api = new ApiClient({
  baseURL: import.meta.env.VITE_API_URL || '/api'
});

export const useSubscriptionStore = defineStore('subscription', {
  state: () => ({
    subscription: null as Subscription | null,
    usage: null as Usage | null,
    loading: false,
    error: null as string | null
  }),

  actions: {
    async fetchSubscription() {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.get('/user/subscriptions/active');
        this.subscription = response as Subscription;
        return response;
      } catch (error) {
        this.error = (error as Error).message || 'Failed to fetch subscription';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchUsage() {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.get('/user/usage');
        this.usage = response as Usage;
        return response;
      } catch (error) {
        this.error = (error as Error).message || 'Failed to fetch usage';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async cancelSubscription() {
      if (!this.subscription?.id) {
        throw new Error('No active subscription to cancel');
      }

      this.loading = true;
      this.error = null;

      try {
        const response = await api.post(`/user/subscriptions/${this.subscription.id}/cancel`);
        if (this.subscription) {
          this.subscription.status = 'cancelling';
        }
        return response as { success: boolean; cancellationDate: string };
      } catch (error) {
        this.error = (error as Error).message || 'Failed to cancel subscription';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async changePlan(planId: string) {
      if (!this.subscription?.id) {
        throw new Error('No active subscription to change');
      }

      this.loading = true;
      this.error = null;

      try {
        const response = await api.post(`/user/subscriptions/${this.subscription.id}/upgrade`, { plan_id: planId });
        this.subscription = response as Subscription;
        return response;
      } catch (error) {
        this.error = (error as Error).message || 'Failed to change plan';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    reset() {
      this.subscription = null;
      this.usage = null;
      this.error = null;
      this.loading = false;
    }
  }
});

// Export api for testing
export { api };
