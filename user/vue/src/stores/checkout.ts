import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from '@/api';

export interface Plan {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  display_price?: number;
  currency: string;
  billing_period: string;
}

export interface TokenBundle {
  id: string;
  name: string;
  token_amount: number;
  price: number;
  currency: string;
  is_active: boolean;
}

export interface AddOn {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  billing_period: string;
  is_active: boolean;
}

export interface LineItem {
  type: 'subscription' | 'token_bundle' | 'add_on';
  id: string;
  name: string;
  price: number;
  description?: string;
  total_price?: string;
  token_amount?: number;
}

export interface CheckoutResult {
  subscription: {
    id: string;
    status: string;
    plan: Plan;
  };
  invoice: {
    id: string;
    invoice_number: string;
    status: string;
    amount: string;
    total_amount: string;
    currency: string;
    line_items: LineItem[];
  };
  token_bundles?: Array<{
    id: string;
    bundle_id: string;
    status: string;
  }>;
  add_ons?: Array<{
    id: string;
    addon_id: string;
    status: string;
  }>;
  message: string;
}

export const useCheckoutStore = defineStore('checkout', () => {
  // State
  const plan = ref<Plan | null>(null);
  const selectedBundles = ref<TokenBundle[]>([]);
  const selectedAddons = ref<AddOn[]>([]);
  const availableBundles = ref<TokenBundle[]>([]);
  const availableAddons = ref<AddOn[]>([]);
  const loading = ref(false);
  const submitting = ref(false);
  const error = ref<string | null>(null);
  const checkoutResult = ref<CheckoutResult | null>(null);

  // Computed
  const orderTotal = computed(() => {
    let total = plan.value?.price || plan.value?.display_price || 0;
    total += selectedBundles.value.reduce((sum, b) => sum + b.price, 0);
    total += selectedAddons.value.reduce((sum, a) => sum + a.price, 0);
    return total;
  });

  const lineItems = computed(() => {
    const items: LineItem[] = [];
    if (plan.value) {
      items.push({
        type: 'subscription',
        id: plan.value.id,
        name: plan.value.name,
        price: plan.value.price || plan.value.display_price || 0,
      });
    }
    selectedBundles.value.forEach((b) => {
      items.push({
        type: 'token_bundle',
        id: b.id,
        name: b.name,
        price: b.price,
        token_amount: b.token_amount,
      });
    });
    selectedAddons.value.forEach((a) => {
      items.push({
        type: 'add_on',
        id: a.id,
        name: a.name,
        price: a.price,
      });
    });
    return items;
  });

  // Actions
  async function loadPlan(slug: string) {
    loading.value = true;
    error.value = null;
    try {
      const response = await api.get(`/tarif-plans/${slug}`) as { plan: Plan };
      plan.value = response.plan || response as unknown as Plan;
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } }; message?: string };
      error.value = err.response?.data?.error || err.message || 'Failed to load plan';
    } finally {
      loading.value = false;
    }
  }

  async function loadOptions() {
    try {
      const [bundlesRes, addonsRes] = await Promise.all([
        api.get('/token-bundles').catch(() => ({ bundles: [] })),
        api.get('/addons').catch(() => ({ addons: [] })),
      ]) as [{ bundles: TokenBundle[] }, { addons: AddOn[] }];
      availableBundles.value = (bundlesRes.bundles || []).filter(b => b.is_active);
      availableAddons.value = (addonsRes.addons || []).filter(a => a.is_active);
    } catch {
      // Options are optional, don't fail the checkout
    }
  }

  function addBundle(bundle: TokenBundle) {
    if (!selectedBundles.value.find((b) => b.id === bundle.id)) {
      selectedBundles.value = [...selectedBundles.value, bundle];
    }
  }

  function removeBundle(bundleId: string) {
    selectedBundles.value = selectedBundles.value.filter((b) => b.id !== bundleId);
  }

  function addAddon(addon: AddOn) {
    if (!selectedAddons.value.find((a) => a.id === addon.id)) {
      selectedAddons.value = [...selectedAddons.value, addon];
    }
  }

  function removeAddon(addonId: string) {
    selectedAddons.value = selectedAddons.value.filter((a) => a.id !== addonId);
  }

  async function submitCheckout() {
    if (!plan.value) {
      error.value = 'No plan selected';
      return;
    }

    submitting.value = true;
    error.value = null;

    try {
      const response = await api.post('/user/checkout', {
        plan_id: plan.value.id,
        token_bundle_ids: selectedBundles.value.map((b) => b.id),
        add_on_ids: selectedAddons.value.map((a) => a.id),
      }) as CheckoutResult;
      checkoutResult.value = response;
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } }; message?: string };
      error.value = err.response?.data?.error || err.message || 'Checkout failed';
    } finally {
      submitting.value = false;
    }
  }

  function reset() {
    plan.value = null;
    selectedBundles.value = [];
    selectedAddons.value = [];
    availableBundles.value = [];
    availableAddons.value = [];
    error.value = null;
    checkoutResult.value = null;
    loading.value = false;
    submitting.value = false;
  }

  return {
    // State
    plan,
    selectedBundles,
    selectedAddons,
    availableBundles,
    availableAddons,
    loading,
    submitting,
    error,
    checkoutResult,
    // Computed
    orderTotal,
    lineItems,
    // Actions
    loadPlan,
    loadOptions,
    addBundle,
    removeBundle,
    addAddon,
    removeAddon,
    submitCheckout,
    reset,
  };
});
