import { defineStore } from 'pinia';
import { api } from '@/api';

export interface Invoice {
  id: string;
  number: string;
  date: string;
  amount: string;
  status: 'paid' | 'pending' | 'overdue';
}

export const useInvoicesStore = defineStore('invoices', {
  state: () => ({
    invoices: [] as Invoice[],
    loading: false,
    error: null as string | null
  }),

  actions: {
    async fetchInvoices() {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.get('/user/invoices') as { invoices: Invoice[] };
        this.invoices = response.invoices;
        return response;
      } catch (error) {
        this.error = (error as Error).message || 'Failed to fetch invoices';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async downloadInvoice(invoiceId: string) {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.get(`/user/invoices/${invoiceId}/download`);
        return response as { downloadUrl: string };
      } catch (error) {
        this.error = (error as Error).message || 'Failed to download invoice';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    reset() {
      this.invoices = [];
      this.error = null;
      this.loading = false;
    }
  }
});
