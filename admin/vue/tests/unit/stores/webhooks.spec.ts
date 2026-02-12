import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useWebhooksStore } from '@/stores/webhooks';
import { api } from '@/api';

vi.mock('@/api', () => ({
  api: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    setToken: vi.fn(),
    clearToken: vi.fn()
  },
  initializeApi: vi.fn(),
  clearApiAuth: vi.fn()
}));

describe('webhooks store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe('fetchWebhooks', () => {
    it('fetches webhooks with pagination', async () => {
      const mockResponse = {
        webhooks: [
          { id: '1', url: 'https://example.com/webhook', events: ['payment.completed'], status: 'active' }
        ],
        total: 1,
        page: 1,
        per_page: 20
      };
      vi.mocked(api.get).mockResolvedValue(mockResponse);

      const store = useWebhooksStore();
      await store.fetchWebhooks({ page: 1, per_page: 20 });

      expect(api.get).toHaveBeenCalledWith('/admin/webhooks', {
        params: { page: 1, per_page: 20, status: '' }
      });
      expect(store.webhooks).toEqual(mockResponse.webhooks);
      expect(store.total).toBe(1);
    });

    it('sets loading state during fetch', async () => {
      vi.mocked(api.get).mockImplementation(() => new Promise(() => {}));

      const store = useWebhooksStore();
      store.fetchWebhooks({ page: 1, per_page: 20 });

      expect(store.loading).toBe(true);
    });

    it('sets error on fetch failure', async () => {
      vi.mocked(api.get).mockRejectedValue(new Error('Network error'));

      const store = useWebhooksStore();
      await expect(store.fetchWebhooks({ page: 1, per_page: 20 })).rejects.toThrow();

      expect(store.error).toBe('Network error');
    });
  });

  describe('fetchWebhook', () => {
    it('fetches single webhook by id', async () => {
      const mockWebhook = {
        id: '1',
        url: 'https://example.com/webhook',
        events: ['payment.completed'],
        status: 'active',
        delivery_history: []
      };
      vi.mocked(api.get).mockResolvedValue({ webhook: mockWebhook });

      const store = useWebhooksStore();
      const result = await store.fetchWebhook('1');

      expect(api.get).toHaveBeenCalledWith('/admin/webhooks/1');
      expect(result).toEqual(mockWebhook);
      expect(store.selectedWebhook).toEqual(mockWebhook);
    });
  });

  describe('createWebhook', () => {
    it('creates a new webhook', async () => {
      const mockWebhook = { id: '1', url: 'https://example.com/webhook', events: ['payment.completed'], status: 'active' };
      vi.mocked(api.post).mockResolvedValue({ webhook: mockWebhook });

      const store = useWebhooksStore();
      const result = await store.createWebhook({ url: 'https://example.com/webhook', events: ['payment.completed'] });

      expect(api.post).toHaveBeenCalledWith('/admin/webhooks', { url: 'https://example.com/webhook', events: ['payment.completed'] });
      expect(result).toEqual(mockWebhook);
      expect(store.webhooks).toContainEqual(mockWebhook);
    });
  });

  describe('deleteWebhook', () => {
    it('deletes a webhook', async () => {
      vi.mocked(api.delete).mockResolvedValue({});

      const store = useWebhooksStore();
      store.webhooks = [{ id: '1', url: 'https://example.com', events: [], status: 'active' }];
      store.total = 1;

      await store.deleteWebhook('1');

      expect(api.delete).toHaveBeenCalledWith('/admin/webhooks/1');
      expect(store.webhooks).toHaveLength(0);
    });
  });

  describe('toggleWebhook', () => {
    it('toggles webhook status', async () => {
      vi.mocked(api.post).mockResolvedValue({ webhook: { id: '1', status: 'inactive' } });

      const store = useWebhooksStore();
      store.webhooks = [{ id: '1', url: 'https://example.com', events: [], status: 'active' }];

      await store.toggleWebhook('1');

      expect(api.post).toHaveBeenCalledWith('/admin/webhooks/1/toggle', {});
      expect(store.webhooks[0].status).toBe('inactive');
    });
  });

  describe('testWebhook', () => {
    it('sends test event to webhook', async () => {
      vi.mocked(api.post).mockResolvedValue({ message: 'Test sent' });

      const store = useWebhooksStore();
      await store.testWebhook('1');

      expect(api.post).toHaveBeenCalledWith('/admin/webhooks/1/test', {});
    });
  });

  describe('reset', () => {
    it('resets store to initial state', () => {
      const store = useWebhooksStore();
      store.webhooks = [{ id: '1', url: 'https://example.com', events: [], status: 'active' as const }];
      store.total = 10;
      store.error = 'some error';

      store.reset();

      expect(store.webhooks).toEqual([]);
      expect(store.total).toBe(0);
      expect(store.error).toBeNull();
    });
  });
});
