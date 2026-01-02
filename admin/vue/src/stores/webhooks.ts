import { defineStore } from 'pinia';
import { api } from '../api';

export interface Webhook {
  id: string;
  url: string;
  events: string[];
  status: 'active' | 'inactive' | 'failed';
  secret?: string;
  created_at?: string;
  last_triggered_at?: string;
}

export interface WebhookDetail extends Webhook {
  delivery_history?: WebhookDelivery[];
}

export interface WebhookDelivery {
  id: string;
  event_type: string;
  status: 'success' | 'failed' | 'pending';
  response_code?: number;
  response_body?: string;
  created_at: string;
}

export interface FetchWebhooksParams {
  page: number;
  per_page: number;
  status?: string;
}

export interface FetchWebhooksResponse {
  webhooks: Webhook[];
  total: number;
  page: number;
  per_page: number;
}

export interface CreateWebhookParams {
  url: string;
  events: string[];
}

export const useWebhooksStore = defineStore('webhooks', {
  state: () => ({
    webhooks: [] as Webhook[],
    selectedWebhook: null as WebhookDetail | null,
    total: 0,
    page: 1,
    perPage: 20,
    loading: false,
    error: null as string | null
  }),

  getters: {
    hasWebhooks: (state): boolean => state.webhooks.length > 0,
    totalPages: (state): number => Math.ceil(state.total / state.perPage)
  },

  actions: {
    async fetchWebhooks(params: FetchWebhooksParams): Promise<FetchWebhooksResponse> {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.get('/admin/webhooks', {
          params: {
            page: params.page,
            per_page: params.per_page,
            status: params.status || ''
          }
        }) as FetchWebhooksResponse;

        this.webhooks = response.webhooks;
        this.total = response.total;
        this.page = response.page;
        this.perPage = response.per_page;
        return response;
      } catch (error) {
        this.error = (error as Error).message || 'Failed to fetch webhooks';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchWebhook(webhookId: string): Promise<WebhookDetail> {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.get(`/admin/webhooks/${webhookId}`) as { webhook: WebhookDetail };
        this.selectedWebhook = response.webhook;
        return response.webhook;
      } catch (error) {
        this.error = (error as Error).message || 'Failed to fetch webhook';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createWebhook(params: CreateWebhookParams): Promise<Webhook> {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.post('/admin/webhooks', params) as { webhook: Webhook };
        this.webhooks.unshift(response.webhook);
        this.total++;
        return response.webhook;
      } catch (error) {
        this.error = (error as Error).message || 'Failed to create webhook';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateWebhook(webhookId: string, params: Partial<CreateWebhookParams>): Promise<Webhook> {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.put(`/admin/webhooks/${webhookId}`, params) as { webhook: Webhook };

        const index = this.webhooks.findIndex(w => w.id === webhookId);
        if (index !== -1) {
          this.webhooks[index] = response.webhook;
        }
        if (this.selectedWebhook?.id === webhookId) {
          this.selectedWebhook = { ...this.selectedWebhook, ...response.webhook };
        }
        return response.webhook;
      } catch (error) {
        this.error = (error as Error).message || 'Failed to update webhook';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteWebhook(webhookId: string): Promise<void> {
      this.loading = true;
      this.error = null;

      try {
        await api.delete(`/admin/webhooks/${webhookId}`);

        this.webhooks = this.webhooks.filter(w => w.id !== webhookId);
        this.total--;
        if (this.selectedWebhook?.id === webhookId) {
          this.selectedWebhook = null;
        }
      } catch (error) {
        this.error = (error as Error).message || 'Failed to delete webhook';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async toggleWebhook(webhookId: string): Promise<void> {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.post(`/admin/webhooks/${webhookId}/toggle`, {}) as { webhook: Webhook };

        const index = this.webhooks.findIndex(w => w.id === webhookId);
        if (index !== -1) {
          this.webhooks[index].status = response.webhook.status;
        }
        if (this.selectedWebhook?.id === webhookId) {
          this.selectedWebhook.status = response.webhook.status;
        }
      } catch (error) {
        this.error = (error as Error).message || 'Failed to toggle webhook';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async testWebhook(webhookId: string): Promise<void> {
      this.loading = true;
      this.error = null;

      try {
        await api.post(`/admin/webhooks/${webhookId}/test`, {});
      } catch (error) {
        this.error = (error as Error).message || 'Failed to test webhook';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    clearSelectedWebhook(): void {
      this.selectedWebhook = null;
    },

    reset(): void {
      this.webhooks = [];
      this.selectedWebhook = null;
      this.total = 0;
      this.page = 1;
      this.error = null;
      this.loading = false;
    }
  }
});
