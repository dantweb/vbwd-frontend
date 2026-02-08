import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAddonStore } from '@/stores/addons';
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

describe('AddonStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('initializes with empty state', () => {
    const store = useAddonStore();

    expect(store.addons).toEqual([]);
    expect(store.selectedAddon).toBeNull();
    expect(store.total).toBe(0);
    expect(store.loading).toBe(false);
    expect(store.error).toBeNull();
  });

  it('fetches addons with pagination', async () => {
    const store = useAddonStore();

    const mockAddons = [
      { id: '1', name: 'Priority Support', slug: 'priority-support', is_active: true },
      { id: '2', name: 'Extra Storage', slug: 'extra-storage', is_active: true }
    ];

    vi.mocked(api.get).mockResolvedValue({ items: mockAddons, total: 2 });

    await store.fetchAddons();

    expect(api.get).toHaveBeenCalledWith('/admin/addons/', {
      params: { page: 1, per_page: 20, include_inactive: true }
    });
    expect(store.addons).toEqual(mockAddons);
    expect(store.total).toBe(2);
  });

  it('sets loading state during fetch', async () => {
    const store = useAddonStore();
    vi.mocked(api.get).mockResolvedValue({ items: [], total: 0 });

    const promise = store.fetchAddons();
    expect(store.loading).toBe(true);

    await promise;
    expect(store.loading).toBe(false);
  });

  it('handles fetch error', async () => {
    const store = useAddonStore();
    vi.mocked(api.get).mockRejectedValue(new Error('Network Error'));

    await expect(store.fetchAddons()).rejects.toThrow();
    expect(store.error).toBe('Network Error');
    expect(store.loading).toBe(false);
  });

  it('fetches single addon by ID', async () => {
    const store = useAddonStore();
    const mockAddon = { id: '1', name: 'Priority Support', slug: 'priority-support', is_active: true };

    vi.mocked(api.get).mockResolvedValue({ addon: mockAddon });

    const result = await store.fetchAddon('1');

    expect(api.get).toHaveBeenCalledWith('/admin/addons/1');
    expect(store.selectedAddon).toEqual(mockAddon);
    expect(result).toEqual(mockAddon);
  });

  it('creates addon', async () => {
    const store = useAddonStore();
    const newAddon = { name: 'Priority Support', price: 9.99, billing_period: 'monthly' };

    vi.mocked(api.post).mockResolvedValue({ addon: { id: '1', ...newAddon } });

    await store.createAddon(newAddon);

    expect(api.post).toHaveBeenCalledWith('/admin/addons/', newAddon);
  });

  it('handles create validation error', async () => {
    const store = useAddonStore();
    vi.mocked(api.post).mockRejectedValue(new Error('Name is required'));

    await expect(store.createAddon({ name: '', price: 0, billing_period: '' })).rejects.toThrow();
    expect(store.error).toBe('Name is required');
  });

  it('updates addon', async () => {
    const store = useAddonStore();
    vi.mocked(api.put).mockResolvedValue({ addon: { id: '1', name: 'Updated' } });

    await store.updateAddon('1', { name: 'Updated' });

    expect(api.put).toHaveBeenCalledWith('/admin/addons/1', { name: 'Updated' });
  });

  it('deletes addon', async () => {
    const store = useAddonStore();
    vi.mocked(api.delete).mockResolvedValue({ message: 'Deleted' });

    await store.deleteAddon('1');

    expect(api.delete).toHaveBeenCalledWith('/admin/addons/1');
  });

  it('activates addon', async () => {
    const store = useAddonStore();
    vi.mocked(api.post).mockResolvedValue({ addon: { id: '1', is_active: true } });

    await store.activateAddon('1');

    expect(api.post).toHaveBeenCalledWith('/admin/addons/1/activate');
  });

  it('deactivates addon', async () => {
    const store = useAddonStore();
    vi.mocked(api.post).mockResolvedValue({ addon: { id: '1', is_active: false } });

    await store.deactivateAddon('1');

    expect(api.post).toHaveBeenCalledWith('/admin/addons/1/deactivate');
  });

  it('resets store state', () => {
    const store = useAddonStore();
    store.addons = [{ id: '1', name: 'Test', slug: 'test' } as never];
    store.total = 1;
    store.error = 'Some error';

    store.reset();

    expect(store.addons).toEqual([]);
    expect(store.selectedAddon).toBeNull();
    expect(store.total).toBe(0);
    expect(store.error).toBeNull();
    expect(store.loading).toBe(false);
  });

  // Sprint 13: tarif_plan_ids tests
  it('creates addon with tarif_plan_ids', async () => {
    const store = useAddonStore();
    const addonData = {
      name: 'Plan-Specific Addon',
      price: 5.00,
      billing_period: 'monthly',
      tarif_plan_ids: ['plan-1', 'plan-2']
    };

    vi.mocked(api.post).mockResolvedValue({ addon: { id: '1', ...addonData } });

    await store.createAddon(addonData);

    expect(api.post).toHaveBeenCalledWith('/admin/addons/', addonData);
  });

  it('updates addon with tarif_plan_ids', async () => {
    const store = useAddonStore();
    vi.mocked(api.put).mockResolvedValue({ addon: { id: '1', tarif_plan_ids: ['plan-1'] } });

    await store.updateAddon('1', { tarif_plan_ids: ['plan-1'] });

    expect(api.put).toHaveBeenCalledWith('/admin/addons/1', { tarif_plan_ids: ['plan-1'] });
  });

  it('fetches addon with tarif_plan_ids and tarif_plans', async () => {
    const store = useAddonStore();
    const addonWithPlans = {
      id: '1',
      name: 'Plan Addon',
      slug: 'plan-addon',
      tarif_plan_ids: ['plan-1'],
      tarif_plans: [{ id: 'plan-1', name: 'Basic' }],
      is_active: true
    };

    vi.mocked(api.get).mockResolvedValue({ addon: addonWithPlans });

    const result = await store.fetchAddon('1');

    expect(result.tarif_plan_ids).toEqual(['plan-1']);
    expect(result.tarif_plans).toEqual([{ id: 'plan-1', name: 'Basic' }]);
  });
});
