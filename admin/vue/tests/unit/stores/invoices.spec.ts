import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useInvoicesStore } from '@/stores/invoices';
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

describe('invoices store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe('fetchInvoices', () => {
    it('fetches invoices with pagination', async () => {
      const mockResponse = {
        invoices: [
          { id: '1', invoice_number: 'INV-001', amount: 29.99, status: 'paid' }
        ],
        total: 1,
        page: 1,
        per_page: 20
      };
      vi.mocked(api.get).mockResolvedValue(mockResponse);

      const store = useInvoicesStore();
      await store.fetchInvoices({ page: 1, per_page: 20 });

      expect(api.get).toHaveBeenCalledWith('/admin/invoices', {
        params: { page: 1, per_page: 20, status: '', user_id: '' }
      });
      expect(store.invoices).toEqual(mockResponse.invoices);
      expect(store.total).toBe(1);
    });

    it('filters invoices by status', async () => {
      vi.mocked(api.get).mockResolvedValue({
        invoices: [],
        total: 0,
        page: 1,
        per_page: 20
      });

      const store = useInvoicesStore();
      await store.fetchInvoices({ page: 1, per_page: 20, status: 'paid' });

      expect(api.get).toHaveBeenCalledWith('/admin/invoices', {
        params: { page: 1, per_page: 20, status: 'paid', user_id: '' }
      });
    });

    it('filters invoices by user_id', async () => {
      vi.mocked(api.get).mockResolvedValue({
        invoices: [],
        total: 0,
        page: 1,
        per_page: 20
      });

      const store = useInvoicesStore();
      await store.fetchInvoices({ page: 1, per_page: 20, user_id: 'user-123' });

      expect(api.get).toHaveBeenCalledWith('/admin/invoices', {
        params: { page: 1, per_page: 20, status: '', user_id: 'user-123' }
      });
    });

    it('sets loading state during fetch', async () => {
      vi.mocked(api.get).mockImplementation(() => new Promise(() => {}));

      const store = useInvoicesStore();
      store.fetchInvoices({ page: 1, per_page: 20 });

      expect(store.loading).toBe(true);
    });

    it('sets error on fetch failure', async () => {
      vi.mocked(api.get).mockRejectedValue(new Error('Network error'));

      const store = useInvoicesStore();
      await expect(store.fetchInvoices({ page: 1, per_page: 20 })).rejects.toThrow();

      expect(store.error).toBe('Network error');
      expect(store.loading).toBe(false);
    });
  });

  describe('fetchInvoice', () => {
    it('fetches single invoice by id', async () => {
      const mockInvoice = {
        id: '1',
        invoice_number: 'INV-001',
        amount: 29.99,
        status: 'paid',
        line_items: [{ description: 'Pro Plan', amount: 29.99 }]
      };
      vi.mocked(api.get).mockResolvedValue({ invoice: mockInvoice });

      const store = useInvoicesStore();
      const result = await store.fetchInvoice('1');

      expect(api.get).toHaveBeenCalledWith('/admin/invoices/1');
      expect(result).toEqual(mockInvoice);
      expect(store.selectedInvoice).toEqual(mockInvoice);
    });

    it('sets error on fetch failure', async () => {
      vi.mocked(api.get).mockRejectedValue(new Error('Invoice not found'));

      const store = useInvoicesStore();
      await expect(store.fetchInvoice('999')).rejects.toThrow();

      expect(store.error).toBe('Invoice not found');
    });
  });

  describe('refundInvoice', () => {
    it('processes refund for an invoice', async () => {
      vi.mocked(api.post).mockResolvedValue({ message: 'Refund processed' });

      const store = useInvoicesStore();
      await store.refundInvoice('1', 29.99, 'Customer request');

      expect(api.post).toHaveBeenCalledWith('/admin/invoices/1/refund', {
        amount: 29.99,
        reason: 'Customer request'
      });
    });

    it('sets error on refund failure', async () => {
      vi.mocked(api.post).mockRejectedValue(new Error('Refund failed'));

      const store = useInvoicesStore();
      await expect(store.refundInvoice('1', 29.99, 'test')).rejects.toThrow();

      expect(store.error).toBe('Refund failed');
    });
  });

  describe('resendInvoice', () => {
    it('resends invoice to customer', async () => {
      vi.mocked(api.post).mockResolvedValue({ message: 'Invoice sent' });

      const store = useInvoicesStore();
      await store.resendInvoice('1');

      expect(api.post).toHaveBeenCalledWith('/admin/invoices/1/resend', {});
    });
  });

  describe('reset', () => {
    it('resets store to initial state', async () => {
      const store = useInvoicesStore();
      store.invoices = [{ id: '1' } as any];
      store.total = 10;
      store.error = 'some error';

      store.reset();

      expect(store.invoices).toEqual([]);
      expect(store.total).toBe(0);
      expect(store.error).toBeNull();
    });
  });
});
