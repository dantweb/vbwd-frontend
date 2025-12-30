import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

describe('PlansStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('initializes with empty plans list', async () => {
    const { usePlansStore } = await import('../../../src/stores/plans');
    const store = usePlansStore();

    expect(store.plans).toEqual([]);
    expect(store.selectedPlan).toBeNull();
    expect(store.loading).toBe(false);
    expect(store.error).toBeNull();
  });

  it('fetches available plans', async () => {
    const { usePlansStore, api } = await import('../../../src/stores/plans');
    const store = usePlansStore();

    const mockPlans = [
      {
        id: 'free',
        name: 'Free',
        price: '$0',
        features: ['1,000 API calls', '100 MB storage'],
        popular: false
      },
      {
        id: 'pro',
        name: 'Pro',
        price: '$29',
        features: ['50,000 API calls', '10 GB storage'],
        popular: true
      }
    ];

    api.get = vi.fn().mockResolvedValue({ plans: mockPlans });

    await store.fetchPlans();

    expect(api.get).toHaveBeenCalledWith('/tarif-plans');
    expect(store.plans).toEqual(mockPlans);
  });

  it('handles fetch error gracefully', async () => {
    const { usePlansStore, api } = await import('../../../src/stores/plans');
    const store = usePlansStore();

    api.get = vi.fn().mockRejectedValue(new Error('Network error'));

    await expect(store.fetchPlans()).rejects.toThrow();
    expect(store.error).toBe('Network error');
    expect(store.loading).toBe(false);
  });

  it('selects a plan', async () => {
    const { usePlansStore } = await import('../../../src/stores/plans');
    const store = usePlansStore();
    store.plans = [
      { id: 'free', name: 'Free', price: '$0', features: [], popular: false },
      { id: 'pro', name: 'Pro', price: '$29', features: [], popular: true }
    ];

    store.selectPlan('pro');

    expect(store.selectedPlan).toEqual({ id: 'pro', name: 'Pro', price: '$29', features: [], popular: true });
  });

  it('subscribes to a plan', async () => {
    const { usePlansStore, api } = await import('../../../src/stores/plans');
    const store = usePlansStore();
    store.plans = [
      { id: 'pro', name: 'Pro', price: '$29', features: [], popular: true }
    ];

    api.post = vi.fn().mockResolvedValue({
      subscriptionId: 'sub_123',
      checkoutUrl: 'https://checkout.example.com/session_123'
    });

    const result = await store.subscribe('pro');

    expect(api.post).toHaveBeenCalledWith('/tarif-plans/subscribe', { planId: 'pro' });
    expect(result.checkoutUrl).toBeDefined();
  });

  it('gets plan by ID', async () => {
    const { usePlansStore } = await import('../../../src/stores/plans');
    const store = usePlansStore();
    store.plans = [
      { id: 'free', name: 'Free', price: '$0', features: [], popular: false },
      { id: 'pro', name: 'Pro', price: '$29', features: [], popular: true }
    ];

    const plan = store.getPlanById('pro');

    expect(plan).toEqual({ id: 'pro', name: 'Pro', price: '$29', features: [], popular: true });
  });

  it('returns undefined for non-existent plan', async () => {
    const { usePlansStore } = await import('../../../src/stores/plans');
    const store = usePlansStore();
    store.plans = [
      { id: 'free', name: 'Free', price: '$0', features: [], popular: false }
    ];

    const plan = store.getPlanById('enterprise');

    expect(plan).toBeUndefined();
  });

  it('resets store state', async () => {
    const { usePlansStore } = await import('../../../src/stores/plans');
    const store = usePlansStore();
    store.plans = [{ id: 'free', name: 'Free', price: '$0', features: [], popular: false }];
    store.selectedPlan = { id: 'free', name: 'Free', price: '$0', features: [], popular: false };
    store.error = 'Some error';
    store.loading = true;

    store.reset();

    expect(store.plans).toEqual([]);
    expect(store.selectedPlan).toBeNull();
    expect(store.error).toBeNull();
    expect(store.loading).toBe(false);
  });
});
