import { defineStore } from 'pinia';
import { api } from '@/api';

export interface Plan {
  id: string;
  name: string;
  price: string;
  features: string[];
  popular: boolean;
}

export const usePlansStore = defineStore('plans', {
  state: () => ({
    plans: [] as Plan[],
    selectedPlan: null as Plan | null,
    loading: false,
    error: null as string | null
  }),

  actions: {
    async fetchPlans() {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.get('/tarif-plans') as { plans: Plan[] };
        this.plans = response.plans;
        return response;
      } catch (error) {
        this.error = (error as Error).message || 'Failed to fetch plans';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    selectPlan(planId: string) {
      this.selectedPlan = this.plans.find(p => p.id === planId) || null;
    },

    getPlanById(planId: string): Plan | undefined {
      return this.plans.find(p => p.id === planId);
    },

    async subscribe(planId: string) {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.post('/tarif-plans/subscribe', { planId });
        return response as { subscriptionId: string; checkoutUrl: string };
      } catch (error) {
        this.error = (error as Error).message || 'Failed to subscribe';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    reset() {
      this.plans = [];
      this.selectedPlan = null;
      this.error = null;
      this.loading = false;
    }
  }
});
