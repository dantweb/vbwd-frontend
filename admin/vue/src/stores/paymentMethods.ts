import { defineStore } from 'pinia';
import { api } from '../api';

export interface PaymentMethod {
  id: string;
  code: string;
  name: string;
  description: string | null;
  short_description: string | null;
  icon: string | null;
  plugin_id: string | null;
  is_active: boolean;
  is_default: boolean;
  position: number;
  min_amount: string | null;
  max_amount: string | null;
  currencies: string[];
  countries: string[];
  fee_type: 'none' | 'fixed' | 'percentage';
  fee_amount: string | null;
  fee_charged_to: 'customer' | 'merchant';
  config: Record<string, unknown>;
  instructions: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface PaymentMethodTranslation {
  id: string;
  payment_method_id: string;
  locale: string;
  name: string | null;
  description: string | null;
  short_description: string | null;
  instructions: string | null;
}

export interface CreatePaymentMethodData {
  code: string;
  name: string;
  description?: string;
  short_description?: string;
  icon?: string;
  plugin_id?: string;
  is_active?: boolean;
  is_default?: boolean;
  position?: number;
  min_amount?: number | null;
  max_amount?: number | null;
  currencies?: string[];
  countries?: string[];
  fee_type?: 'none' | 'fixed' | 'percentage';
  fee_amount?: number | null;
  fee_charged_to?: 'customer' | 'merchant';
  config?: Record<string, unknown>;
  instructions?: string;
}

export interface UpdatePaymentMethodData {
  name?: string;
  description?: string | null;
  short_description?: string | null;
  icon?: string | null;
  plugin_id?: string | null;
  is_active?: boolean;
  position?: number;
  min_amount?: number | null;
  max_amount?: number | null;
  currencies?: string[];
  countries?: string[];
  fee_type?: 'none' | 'fixed' | 'percentage';
  fee_amount?: number | null;
  fee_charged_to?: 'customer' | 'merchant';
  config?: Record<string, unknown>;
  instructions?: string | null;
}

export interface CreateTranslationData {
  locale: string;
  name?: string;
  description?: string;
  short_description?: string;
  instructions?: string;
}

export const usePaymentMethodsStore = defineStore('paymentMethods', {
  state: () => ({
    paymentMethods: [] as PaymentMethod[],
    selectedMethod: null as PaymentMethod | null,
    translations: [] as PaymentMethodTranslation[],
    loading: false,
    error: null as string | null,
  }),

  getters: {
    activeMethods: (state) => state.paymentMethods.filter(m => m.is_active),
    inactiveMethods: (state) => state.paymentMethods.filter(m => !m.is_active),
    defaultMethod: (state) => state.paymentMethods.find(m => m.is_default),
    sortedByPosition: (state) => [...state.paymentMethods].sort((a, b) => a.position - b.position),
  },

  actions: {
    async fetchPaymentMethods(): Promise<PaymentMethod[]> {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.get('/admin/payment-methods') as { payment_methods: PaymentMethod[] };
        this.paymentMethods = response.payment_methods;
        return response.payment_methods;
      } catch (error) {
        this.error = (error as Error).message || 'Failed to fetch payment methods';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchPaymentMethod(methodId: string): Promise<PaymentMethod> {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.get(`/admin/payment-methods/${methodId}`) as { payment_method: PaymentMethod };
        this.selectedMethod = response.payment_method;
        return response.payment_method;
      } catch (error) {
        this.error = (error as Error).message || 'Failed to fetch payment method';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchPaymentMethodByCode(code: string): Promise<PaymentMethod> {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.get(`/admin/payment-methods/code/${code}`) as { payment_method: PaymentMethod };
        this.selectedMethod = response.payment_method;
        return response.payment_method;
      } catch (error) {
        this.error = (error as Error).message || 'Failed to fetch payment method';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createPaymentMethod(data: CreatePaymentMethodData): Promise<PaymentMethod> {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.post('/admin/payment-methods', data) as { payment_method: PaymentMethod };
        // Refresh list after create
        await this.fetchPaymentMethods();
        return response.payment_method;
      } catch (error) {
        this.error = (error as Error).message || 'Failed to create payment method';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updatePaymentMethod(methodId: string, data: UpdatePaymentMethodData): Promise<PaymentMethod> {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.put(`/admin/payment-methods/${methodId}`, data) as { payment_method: PaymentMethod };
        // Refresh list after update
        await this.fetchPaymentMethods();
        return response.payment_method;
      } catch (error) {
        this.error = (error as Error).message || 'Failed to update payment method';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deletePaymentMethod(methodId: string): Promise<void> {
      this.loading = true;
      this.error = null;

      try {
        await api.delete(`/admin/payment-methods/${methodId}`);
        // Refresh list after delete
        await this.fetchPaymentMethods();
      } catch (error) {
        this.error = (error as Error).message || 'Failed to delete payment method';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async activatePaymentMethod(methodId: string): Promise<PaymentMethod> {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.post(`/admin/payment-methods/${methodId}/activate`) as { payment_method: PaymentMethod };
        // Refresh list
        await this.fetchPaymentMethods();
        return response.payment_method;
      } catch (error) {
        this.error = (error as Error).message || 'Failed to activate payment method';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deactivatePaymentMethod(methodId: string): Promise<PaymentMethod> {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.post(`/admin/payment-methods/${methodId}/deactivate`) as { payment_method: PaymentMethod };
        // Refresh list
        await this.fetchPaymentMethods();
        return response.payment_method;
      } catch (error) {
        this.error = (error as Error).message || 'Failed to deactivate payment method';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async setDefaultPaymentMethod(methodId: string): Promise<PaymentMethod> {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.post(`/admin/payment-methods/${methodId}/set-default`) as { payment_method: PaymentMethod };
        // Refresh list
        await this.fetchPaymentMethods();
        return response.payment_method;
      } catch (error) {
        this.error = (error as Error).message || 'Failed to set default payment method';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async reorderPaymentMethods(order: Array<{ id: string; position: number }>): Promise<PaymentMethod[]> {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.put('/admin/payment-methods/reorder', { order }) as { payment_methods: PaymentMethod[] };
        this.paymentMethods = response.payment_methods;
        return response.payment_methods;
      } catch (error) {
        this.error = (error as Error).message || 'Failed to reorder payment methods';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Translation methods
    async fetchTranslations(methodId: string): Promise<PaymentMethodTranslation[]> {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.get(`/admin/payment-methods/${methodId}/translations`) as { translations: PaymentMethodTranslation[] };
        this.translations = response.translations;
        return response.translations;
      } catch (error) {
        this.error = (error as Error).message || 'Failed to fetch translations';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async addTranslation(methodId: string, data: CreateTranslationData): Promise<PaymentMethodTranslation> {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.post(`/admin/payment-methods/${methodId}/translations`, data) as { translation: PaymentMethodTranslation };
        // Refresh translations
        await this.fetchTranslations(methodId);
        return response.translation;
      } catch (error) {
        this.error = (error as Error).message || 'Failed to add translation';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    reset() {
      this.paymentMethods = [];
      this.selectedMethod = null;
      this.translations = [];
      this.error = null;
      this.loading = false;
    },
  },
});
