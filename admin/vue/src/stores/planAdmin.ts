import { defineStore } from 'pinia';
import { api } from '../api';

export interface AdminPlanPrice {
  price_decimal: string;
  price_float: number;
  currency_code?: string;
  currency_symbol?: string;
}

export interface AdminPlan {
  id: string;
  name: string;
  price?: AdminPlanPrice | number;
  price_float?: number;
  currency?: string;
  billing_period: 'monthly' | 'yearly' | 'quarterly' | 'weekly' | 'one_time';
  features?: string[] | Record<string, unknown>;
  limits?: Record<string, number>;
  is_active: boolean;
  subscriber_count?: number;
  created_at?: string;
}

export interface CreatePlanData {
  name: string;
  price: number;
  billing_period: string;
  features?: string[] | Record<string, unknown>;
  limits?: Record<string, number>;
}

export const usePlanAdminStore = defineStore('planAdmin', {
  state: () => ({
    plans: [] as AdminPlan[],
    selectedPlan: null as AdminPlan | null,
    loading: false,
    error: null as string | null
  }),

  actions: {
    async fetchPlans(includeArchived = false) {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.get('/admin/tarif-plans', {
          params: { include_archived: includeArchived }
        }) as { plans: AdminPlan[] };

        this.plans = response.plans;
        return response.plans;
      } catch (error) {
        this.error = (error as Error).message || 'Failed to fetch plans';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchPlan(planId: string): Promise<AdminPlan> {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.get(`/admin/tarif-plans/${planId}`) as { plan: AdminPlan };
        this.selectedPlan = response.plan;
        return response.plan;
      } catch (error) {
        this.error = (error as Error).message || 'Failed to fetch plan';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createPlan(data: CreatePlanData) {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.post('/admin/tarif-plans', data);
        return response as { plan_id: string };
      } catch (error) {
        this.error = (error as Error).message || 'Failed to create plan';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updatePlan(planId: string, data: Partial<AdminPlan>) {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.put(`/admin/tarif-plans/${planId}`, data);
        return response;
      } catch (error) {
        this.error = (error as Error).message || 'Failed to update plan';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async archivePlan(planId: string) {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.post(`/admin/tarif-plans/${planId}/archive`);
        return response;
      } catch (error) {
        this.error = (error as Error).message || 'Failed to archive plan';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async getSubscriberCount(planId: string): Promise<number> {
      try {
        const response = await api.get(`/admin/tarif-plans/${planId}/subscribers/count`) as { count: number };
        return response.count;
      } catch (error) {
        this.error = (error as Error).message || 'Failed to get subscriber count';
        throw error;
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
