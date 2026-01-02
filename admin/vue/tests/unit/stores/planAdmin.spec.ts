import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { usePlanAdminStore } from '@/stores/planAdmin';
import { api } from '@/api';

// Mock the API module
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

describe('PlanAdminStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('initializes with empty state', () => {
    const store = usePlanAdminStore();

    expect(store.plans).toEqual([]);
    expect(store.selectedPlan).toBeNull();
    expect(store.loading).toBe(false);
    expect(store.error).toBeNull();
  });

  it('fetches all plans', async () => {
    const store = usePlanAdminStore();

    const mockPlans = [
      { id: '1', name: 'Free', price: 0, billing_period: 'monthly' as const, is_active: true },
      { id: '2', name: 'Pro', price: 29, billing_period: 'monthly' as const, is_active: true }
    ];

    vi.mocked(api.get).mockResolvedValue({ plans: mockPlans });

    await store.fetchPlans();

    expect(api.get).toHaveBeenCalledWith('/admin/tarif-plans', { params: { include_archived: false } });
    expect(store.plans).toEqual(mockPlans);
  });

  it('fetches plans including archived', async () => {
    const store = usePlanAdminStore();

    vi.mocked(api.get).mockResolvedValue({ plans: [] });

    await store.fetchPlans(true);

    expect(api.get).toHaveBeenCalledWith('/admin/tarif-plans', { params: { include_archived: true } });
  });

  it('creates new plan', async () => {
    const store = usePlanAdminStore();

    const newPlan = {
      name: 'Enterprise',
      price: 99,
      billing_period: 'monthly',
      features: ['Unlimited API', '100GB storage'],
      limits: { api_calls: -1, storage_gb: 100 }
    };

    vi.mocked(api.post).mockResolvedValue({ plan_id: '3' });

    const result = await store.createPlan(newPlan);

    expect(api.post).toHaveBeenCalledWith('/admin/tarif-plans', newPlan);
    expect(result.plan_id).toBe('3');
  });

  it('updates existing plan', async () => {
    const store = usePlanAdminStore();

    vi.mocked(api.put).mockResolvedValue({ message: 'Plan updated' });

    await store.updatePlan('1', { price: 39 });

    expect(api.put).toHaveBeenCalledWith('/admin/tarif-plans/1', { price: 39 });
  });

  it('archives plan', async () => {
    const store = usePlanAdminStore();

    vi.mocked(api.post).mockResolvedValue({ message: 'Plan archived' });

    await store.archivePlan('1');

    expect(api.post).toHaveBeenCalledWith('/admin/tarif-plans/1/archive');
  });

  it('gets subscriber count for plan', async () => {
    const store = usePlanAdminStore();

    vi.mocked(api.get).mockResolvedValue({ count: 150 });

    const count = await store.getSubscriberCount('1');

    expect(api.get).toHaveBeenCalledWith('/admin/tarif-plans/1/subscribers/count');
    expect(count).toBe(150);
  });

  it('handles fetch error gracefully', async () => {
    const store = usePlanAdminStore();

    vi.mocked(api.get).mockRejectedValue(new Error('Network error'));

    await expect(store.fetchPlans()).rejects.toThrow();
    expect(store.error).toBe('Network error');
  });

  it('resets store state', () => {
    const store = usePlanAdminStore();
    store.plans = [{ id: '1', name: 'Free', price: 0, billing_period: 'monthly' as const, is_active: true }];
    store.error = 'Some error';

    store.reset();

    expect(store.plans).toEqual([]);
    expect(store.error).toBeNull();
  });
});
