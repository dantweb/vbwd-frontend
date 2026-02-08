import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useSubscriptionStore } from '../../../src/stores/subscription';
import { api } from '../../../src/api';

vi.mock('../../../src/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  },
  isAuthenticated: vi.fn(() => true)
}));

describe('SubscriptionStore — User Add-ons', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('fetches user addons and populates state', async () => {
    const store = useSubscriptionStore();

    vi.mocked(api.get).mockResolvedValue({
      addon_subscriptions: [
        { id: '1', addon_id: 'a1', status: 'active', addon: { name: 'Priority Support', slug: 'priority-support' } },
        { id: '2', addon_id: 'a2', status: 'cancelled', addon: { name: 'Extra Storage', slug: 'extra-storage' } },
        { id: '3', addon_id: 'a3', status: 'active', addon: { name: 'API Boost', slug: 'api-boost' } },
      ]
    });

    await store.fetchUserAddons();

    expect(api.get).toHaveBeenCalledWith('/user/addons');
    expect(store.addonSubscriptions).toHaveLength(3);
  });

  it('activeAddons getter filters active only', async () => {
    const store = useSubscriptionStore();

    vi.mocked(api.get).mockResolvedValue({
      addon_subscriptions: [
        { id: '1', addon_id: 'a1', status: 'active' },
        { id: '2', addon_id: 'a2', status: 'cancelled' },
        { id: '3', addon_id: 'a3', status: 'active' },
      ]
    });

    await store.fetchUserAddons();

    expect(store.activeAddons).toHaveLength(2);
    expect(store.activeAddons.every(a => a.status === 'active')).toBe(true);
  });

  it('inactiveAddons getter filters expired and cancelled', async () => {
    const store = useSubscriptionStore();

    vi.mocked(api.get).mockResolvedValue({
      addon_subscriptions: [
        { id: '1', addon_id: 'a1', status: 'active' },
        { id: '2', addon_id: 'a2', status: 'cancelled' },
        { id: '3', addon_id: 'a3', status: 'expired' },
        { id: '4', addon_id: 'a4', status: 'pending' },
      ]
    });

    await store.fetchUserAddons();

    expect(store.inactiveAddons).toHaveLength(2);
    expect(store.inactiveAddons.map(a => a.status).sort()).toEqual(['cancelled', 'expired']);
  });

  it('sets error on fetch failure', async () => {
    const store = useSubscriptionStore();

    vi.mocked(api.get).mockRejectedValue(new Error('Failed to fetch'));

    await expect(store.fetchUserAddons()).rejects.toThrow();
    expect(store.addonsError).toBe('Failed to fetch');
    expect(store.addonsLoading).toBe(false);
  });
});
