import { defineStore } from 'pinia';
import { api } from '../api';

export interface Invoice {
  id: string;
  invoice_number: string;
  user_id?: string;
  user_email?: string;
  user_name?: string;
  subscription_id?: string;
  amount: number;
  currency?: string;
  status: 'pending' | 'paid' | 'failed' | 'cancelled' | 'refunded';
  due_date?: string;
  paid_at?: string;
  created_at?: string;
}

export interface InvoiceDetail extends Invoice {
  line_items?: LineItem[];
  billing_address?: BillingAddress;
  payment_method?: string;
  // Plan info
  plan_name?: string;
  plan_description?: string;
  plan_billing_period?: string;
  plan_price?: string;
  // Subscription info
  subscription_status?: string;
  subscription_start_date?: string;
  subscription_end_date?: string;
  subscription_is_trial?: boolean;
  subscription_trial_end?: string;
}

export interface LineItem {
  id?: string;
  type?: string;
  item_id?: string;
  description: string;
  quantity?: number;
  unit_price?: number;
  amount: number;
}

export interface BillingAddress {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
}

export interface FetchInvoicesParams {
  page: number;
  per_page: number;
  status?: string;
  user_id?: string;
}

export interface FetchInvoicesResponse {
  invoices: Invoice[];
  total: number;
  page: number;
  per_page: number;
}

export const useInvoicesStore = defineStore('invoices', {
  state: () => ({
    invoices: [] as Invoice[],
    selectedInvoice: null as InvoiceDetail | null,
    total: 0,
    page: 1,
    perPage: 20,
    loading: false,
    error: null as string | null
  }),

  getters: {
    hasInvoices: (state): boolean => state.invoices.length > 0,
    totalPages: (state): number => Math.ceil(state.total / state.perPage)
  },

  actions: {
    async fetchInvoices(params: FetchInvoicesParams): Promise<FetchInvoicesResponse> {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.get('/admin/invoices', {
          params: {
            page: params.page,
            per_page: params.per_page,
            status: params.status || '',
            user_id: params.user_id || ''
          }
        }) as FetchInvoicesResponse;

        this.invoices = response.invoices;
        this.total = response.total;
        this.page = response.page;
        this.perPage = response.per_page;
        return response;
      } catch (error) {
        this.error = (error as Error).message || 'Failed to fetch invoices';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchInvoice(invoiceId: string): Promise<InvoiceDetail> {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.get(`/admin/invoices/${invoiceId}`) as { invoice: InvoiceDetail };
        this.selectedInvoice = response.invoice;
        return response.invoice;
      } catch (error) {
        this.error = (error as Error).message || 'Failed to fetch invoice';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async refundInvoice(invoiceId: string): Promise<void> {
      this.loading = true;
      this.error = null;

      try {
        await api.post(`/admin/invoices/${invoiceId}/refund`, {});

        // Update local state
        if (this.selectedInvoice?.id === invoiceId) {
          this.selectedInvoice.status = 'refunded';
        }
        const index = this.invoices.findIndex(i => i.id === invoiceId);
        if (index !== -1) {
          this.invoices[index].status = 'refunded';
        }
      } catch (error) {
        this.error = (error as Error).message || 'Failed to process refund';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async markPaid(invoiceId: string, paymentReference?: string): Promise<void> {
      this.loading = true;
      this.error = null;

      try {
        await api.post(`/admin/invoices/${invoiceId}/mark-paid`, {
          payment_reference: paymentReference || 'MANUAL'
        });

        // Update local state
        if (this.selectedInvoice?.id === invoiceId) {
          this.selectedInvoice.status = 'paid';
        }
        const index = this.invoices.findIndex(i => i.id === invoiceId);
        if (index !== -1) {
          this.invoices[index].status = 'paid';
        }
      } catch (error) {
        this.error = (error as Error).message || 'Failed to mark invoice as paid';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async resendInvoice(invoiceId: string): Promise<void> {
      this.loading = true;
      this.error = null;

      try {
        await api.post(`/admin/invoices/${invoiceId}/resend`, {});
      } catch (error) {
        this.error = (error as Error).message || 'Failed to resend invoice';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async voidInvoice(invoiceId: string): Promise<void> {
      this.loading = true;
      this.error = null;

      try {
        await api.post(`/admin/invoices/${invoiceId}/void`, {});

        // Update local state
        if (this.selectedInvoice?.id === invoiceId) {
          this.selectedInvoice.status = 'cancelled';
        }
        const index = this.invoices.findIndex(i => i.id === invoiceId);
        if (index !== -1) {
          this.invoices[index].status = 'cancelled';
        }
      } catch (error) {
        this.error = (error as Error).message || 'Failed to void invoice';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async duplicateInvoice(invoiceId: string): Promise<Invoice> {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.post(`/admin/invoices/${invoiceId}/duplicate`, {}) as { invoice: Invoice };
        const newInvoice = response.invoice;

        // Add to local list
        this.invoices.unshift(newInvoice);
        this.total += 1;

        return newInvoice;
      } catch (error) {
        this.error = (error as Error).message || 'Failed to duplicate invoice';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    clearSelectedInvoice(): void {
      this.selectedInvoice = null;
    },

    reset(): void {
      this.invoices = [];
      this.selectedInvoice = null;
      this.total = 0;
      this.page = 1;
      this.error = null;
      this.loading = false;
    }
  }
});
