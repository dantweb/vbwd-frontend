import { defineStore } from 'pinia';
import { api } from '../api';

export interface TokenBundle {
  id: string;
  name: string;
  description: string | null;
  token_amount: number;
  price: string;
  is_active: boolean;
  sort_order: number;
  created_at: string | null;
  updated_at: string | null;
}

export interface CreateTokenBundleData {
  name: string;
  description?: string;
  token_amount: number;
  price: number;
  is_active?: boolean;
  sort_order?: number;
}

export interface UpdateTokenBundleData {
  name?: string;
  description?: string;
  token_amount?: number;
  price?: number;
  is_active?: boolean;
  sort_order?: number;
}

export interface TokenBundleListResponse {
  items: TokenBundle[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

export const useTokenBundlesStore = defineStore('tokenBundles', {
  state: () => ({
    bundles: [] as TokenBundle[],
    selectedBundle: null as TokenBundle | null,
    loading: false,
    error: null as string | null,
    pagination: {
      page: 1,
      perPage: 20,
      total: 0,
      pages: 0,
    },
  }),

  actions: {
    async fetchBundles(page = 1, perPage = 20, includeInactive = true): Promise<TokenBundleListResponse> {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.get('/admin/token-bundles', {
          params: {
            page,
            per_page: perPage,
            include_inactive: includeInactive,
          },
        }) as TokenBundleListResponse;

        this.bundles = response.items;
        this.pagination = {
          page: response.page,
          perPage: response.per_page,
          total: response.total,
          pages: response.pages,
        };

        return response;
      } catch (error) {
        this.error = (error as Error).message || 'Failed to fetch token bundles';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchBundle(bundleId: string): Promise<TokenBundle> {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.get(`/admin/token-bundles/${bundleId}`) as { bundle: TokenBundle };
        this.selectedBundle = response.bundle;
        return response.bundle;
      } catch (error) {
        this.error = (error as Error).message || 'Failed to fetch token bundle';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createBundle(data: CreateTokenBundleData): Promise<TokenBundle> {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.post('/admin/token-bundles', data) as { bundle: TokenBundle };
        return response.bundle;
      } catch (error) {
        this.error = (error as Error).message || 'Failed to create token bundle';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateBundle(bundleId: string, data: UpdateTokenBundleData): Promise<TokenBundle> {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.put(`/admin/token-bundles/${bundleId}`, data) as { bundle: TokenBundle };
        return response.bundle;
      } catch (error) {
        this.error = (error as Error).message || 'Failed to update token bundle';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteBundle(bundleId: string): Promise<void> {
      this.loading = true;
      this.error = null;

      try {
        await api.delete(`/admin/token-bundles/${bundleId}`);
      } catch (error) {
        this.error = (error as Error).message || 'Failed to delete token bundle';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async activateBundle(bundleId: string): Promise<TokenBundle> {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.post(`/admin/token-bundles/${bundleId}/activate`) as { bundle: TokenBundle };
        return response.bundle;
      } catch (error) {
        this.error = (error as Error).message || 'Failed to activate token bundle';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deactivateBundle(bundleId: string): Promise<TokenBundle> {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.post(`/admin/token-bundles/${bundleId}/deactivate`) as { bundle: TokenBundle };
        return response.bundle;
      } catch (error) {
        this.error = (error as Error).message || 'Failed to deactivate token bundle';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    reset() {
      this.bundles = [];
      this.selectedBundle = null;
      this.error = null;
      this.loading = false;
      this.pagination = {
        page: 1,
        perPage: 20,
        total: 0,
        pages: 0,
      };
    },
  },
});
