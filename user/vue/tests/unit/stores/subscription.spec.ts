import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

describe('SubscriptionStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('initializes with null subscription', async () => {
    const { useSubscriptionStore } = await import('../../../src/stores/subscription');
    const store = useSubscriptionStore();

    expect(store.subscription).toBeNull();
    expect(store.usage).toBeNull();
    expect(store.loading).toBe(false);
    expect(store.error).toBeNull();
  });

  it('fetches current subscription', async () => {
    const { useSubscriptionStore, api } = await import('../../../src/stores/subscription');
    const store = useSubscriptionStore();

    api.get = vi.fn().mockResolvedValue({
      id: 'sub_123',
      planId: 'pro',
      planName: 'Pro Plan',
      status: 'active',
      currentPeriodEnd: '2025-02-01'
    });

    await store.fetchSubscription();

    expect(api.get).toHaveBeenCalledWith('/user/subscriptions/active');
    expect(store.subscription).toEqual({
      id: 'sub_123',
      planId: 'pro',
      planName: 'Pro Plan',
      status: 'active',
      currentPeriodEnd: '2025-02-01'
    });
  });

  it('fetches usage statistics', async () => {
    const { useSubscriptionStore, api } = await import('../../../src/stores/subscription');
    const store = useSubscriptionStore();

    api.get = vi.fn().mockResolvedValue({
      apiCalls: { used: 500, limit: 1000 },
      storage: { used: 50, limit: 100, unit: 'MB' }
    });

    await store.fetchUsage();

    expect(api.get).toHaveBeenCalledWith('/user/usage');
    expect(store.usage).toEqual({
      apiCalls: { used: 500, limit: 1000 },
      storage: { used: 50, limit: 100, unit: 'MB' }
    });
  });

  it('handles fetch error gracefully', async () => {
    const { useSubscriptionStore, api } = await import('../../../src/stores/subscription');
    const store = useSubscriptionStore();

    api.get = vi.fn().mockRejectedValue(new Error('Network error'));

    await expect(store.fetchSubscription()).rejects.toThrow();
    expect(store.error).toBe('Network error');
    expect(store.loading).toBe(false);
  });

  it('cancels subscription', async () => {
    const { useSubscriptionStore, api } = await import('../../../src/stores/subscription');
    const store = useSubscriptionStore();
    store.subscription = {
      id: 'sub_123',
      planId: 'pro',
      planName: 'Pro Plan',
      status: 'active',
      currentPeriodEnd: '2025-02-01'
    };

    api.post = vi.fn().mockResolvedValue({
      success: true,
      cancellationDate: '2025-02-01'
    });

    const result = await store.cancelSubscription();

    expect(api.post).toHaveBeenCalledWith('/user/subscriptions/sub_123/cancel');
    expect(result.success).toBe(true);
    expect(store.subscription?.status).toBe('cancelling');
  });

  it('changes subscription plan', async () => {
    const { useSubscriptionStore, api } = await import('../../../src/stores/subscription');
    const store = useSubscriptionStore();
    store.subscription = {
      id: 'sub_123',
      planId: 'free',
      planName: 'Free Plan',
      status: 'active',
      currentPeriodEnd: '2025-02-01'
    };

    api.post = vi.fn().mockResolvedValue({
      id: 'sub_123',
      planId: 'pro',
      planName: 'Pro Plan',
      status: 'active',
      currentPeriodEnd: '2025-02-01'
    });

    await store.changePlan('pro');

    expect(api.post).toHaveBeenCalledWith('/user/subscriptions/sub_123/upgrade', { plan_id: 'pro' });
    expect(store.subscription?.planId).toBe('pro');
  });

  it('resets store state', async () => {
    const { useSubscriptionStore } = await import('../../../src/stores/subscription');
    const store = useSubscriptionStore();
    store.subscription = {
      id: 'sub_123',
      planId: 'pro',
      planName: 'Pro Plan',
      status: 'active',
      currentPeriodEnd: '2025-02-01'
    };
    store.error = 'Some error';
    store.loading = true;

    store.reset();

    expect(store.subscription).toBeNull();
    expect(store.usage).toBeNull();
    expect(store.error).toBeNull();
    expect(store.loading).toBe(false);
  });
});
