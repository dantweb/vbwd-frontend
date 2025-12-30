import { defineStore } from 'pinia';
import { ApiClient } from '@vbwd/view-component';

export interface MetricPoint {
  date: string;
  value: number;
}

export interface MetricData {
  total: number;
  change_percent?: number;
  data?: MetricPoint[];
}

export interface DashboardData {
  mrr?: MetricData;
  revenue?: MetricData;
  churn?: MetricData;
  user_growth?: MetricData;
  conversion?: MetricData;
  arpu?: MetricData;
}

export interface ActivityItem {
  type: string;
  user: string;
  timestamp: string;
  details?: string;
}

export interface DateRange {
  start?: string;
  end?: string;
}

// Create API client instance
const api = new ApiClient({
  baseURL: import.meta.env.VITE_API_URL || '/api'
});

export const useAnalyticsStore = defineStore('analytics', {
  state: () => ({
    dashboard: null as DashboardData | null,
    planDistribution: null as Record<string, number> | null,
    loading: false,
    error: null as string | null
  }),

  actions: {
    async fetchDashboard(dateRange?: DateRange) {
      this.loading = true;
      this.error = null;

      try {
        const config = dateRange ? { params: dateRange } : undefined;
        const response = await api.get('/admin/analytics/dashboard', config) as DashboardData;
        this.dashboard = response;
        return response;
      } catch (error) {
        this.error = (error as Error).message || 'Failed to fetch dashboard';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchMRR() {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.get('/admin/analytics/mrr') as MetricData;
        return response;
      } catch (error) {
        this.error = (error as Error).message || 'Failed to fetch MRR';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchRevenue(start: string, end: string) {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.get('/admin/analytics/revenue', {
          params: { start, end }
        }) as MetricData;
        return response;
      } catch (error) {
        this.error = (error as Error).message || 'Failed to fetch revenue';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchChurn(start: string, end: string) {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.get('/admin/analytics/churn', {
          params: { start, end }
        }) as MetricData;
        return response;
      } catch (error) {
        this.error = (error as Error).message || 'Failed to fetch churn';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchUserGrowth(start: string, end: string) {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.get('/admin/analytics/users/growth', {
          params: { start, end }
        }) as MetricData;
        return response;
      } catch (error) {
        this.error = (error as Error).message || 'Failed to fetch user growth';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchPlanDistribution() {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.get('/admin/analytics/plans/distribution') as Record<string, number>;
        this.planDistribution = response;
        return response;
      } catch (error) {
        this.error = (error as Error).message || 'Failed to fetch plan distribution';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchRecentActivity() {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.get('/admin/analytics/activity') as { activity: ActivityItem[] };
        return response.activity;
      } catch (error) {
        this.error = (error as Error).message || 'Failed to fetch activity';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    reset() {
      this.dashboard = null;
      this.planDistribution = null;
      this.error = null;
      this.loading = false;
    }
  }
});

// Export api for testing
export { api };
