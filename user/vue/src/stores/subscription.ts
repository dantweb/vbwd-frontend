import { defineStore } from 'pinia';
import { api } from '@/api';

export interface Plan {
  id: string;
  name: string;
  slug: string;
  price: number;
  billing_period: string;
  description?: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  tarif_plan_id: string;
  pending_plan_id: string | null;
  status: 'active' | 'cancelling' | 'cancelled' | 'paused' | 'expired';
  is_valid: boolean;
  days_remaining: number;
  started_at: string | null;
  expires_at: string | null;
  cancelled_at: string | null;
  paused_at: string | null;
  plan?: Plan;
  pending_plan?: Plan;
}

export interface Usage {
  apiCalls: { used: number; limit: number };
  storage: { used: number; limit: number; unit: string };
}

export const useSubscriptionStore = defineStore('subscription', {
  state: () => ({
    subscription: null as Subscription | null,
    usage: null as Usage | null,
    loading: false,
    error: null as string | null
  }),

  getters: {
    currentPeriodEnd(): string | null {
      return this.subscription?.expires_at || null;
    },
    planName(): string {
      return this.subscription?.plan?.name || 'No Plan';
    },
    planId(): string | null {
      return this.subscription?.plan?.id || this.subscription?.tarif_plan_id || null;
    }
  },

  actions: {
    async fetchSubscription() {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.get('/user/subscriptions/active') as { subscription: Subscription | null };
        this.subscription = response.subscription;
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
        // Refetch subscription to get updated status
        await this.fetchSubscription();
        return response as { subscription: Subscription; message: string };
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
        // Refetch subscription to get updated data
        await this.fetchSubscription();
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
