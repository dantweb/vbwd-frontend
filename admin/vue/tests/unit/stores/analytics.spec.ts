import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

describe('AnalyticsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('initializes with empty state', async () => {
    const { useAnalyticsStore } = await import('../../../src/stores/analytics');
    const store = useAnalyticsStore();

    expect(store.dashboard).toBeNull();
    expect(store.planDistribution).toBeNull();
    expect(store.loading).toBe(false);
    expect(store.error).toBeNull();
  });

  it('fetches dashboard summary', async () => {
    const { useAnalyticsStore, api } = await import('../../../src/stores/analytics');
    const store = useAnalyticsStore();

    const mockDashboard = {
      mrr: { total: 5000, change_percent: 10 },
      revenue: { total: 15000, data: [] },
      churn: { total: 2.5 },
      user_growth: { total: 50 },
      conversion: { total: 5.2 },
      arpu: { total: 45 }
    };

    api.get = vi.fn().mockResolvedValue(mockDashboard);

    await store.fetchDashboard();

    expect(api.get).toHaveBeenCalledWith('/admin/analytics/dashboard', undefined);
    expect(store.dashboard).toEqual(mockDashboard);
  });

  it('fetches dashboard with date range', async () => {
    const { useAnalyticsStore, api } = await import('../../../src/stores/analytics');
    const store = useAnalyticsStore();

    api.get = vi.fn().mockResolvedValue({});

    await store.fetchDashboard({ start: '2025-01-01', end: '2025-01-31' });

    expect(api.get).toHaveBeenCalledWith('/admin/analytics/dashboard', {
      params: { start: '2025-01-01', end: '2025-01-31' }
    });
  });

  it('fetches MRR data', async () => {
    const { useAnalyticsStore, api } = await import('../../../src/stores/analytics');
    const store = useAnalyticsStore();

    const mockMrr = { total: 5000, change_percent: 10 };
    api.get = vi.fn().mockResolvedValue(mockMrr);

    const result = await store.fetchMRR();

    expect(api.get).toHaveBeenCalledWith('/admin/analytics/mrr');
    expect(result).toEqual(mockMrr);
  });

  it('fetches revenue data', async () => {
    const { useAnalyticsStore, api } = await import('../../../src/stores/analytics');
    const store = useAnalyticsStore();

    const mockRevenue = {
      data: [
        { date: '2025-01-01', value: 1000 },
        { date: '2025-01-02', value: 1500 }
      ],
      total: 2500
    };
    api.get = vi.fn().mockResolvedValue(mockRevenue);

    const result = await store.fetchRevenue('2025-01-01', '2025-01-31');

    expect(api.get).toHaveBeenCalledWith('/admin/analytics/revenue', {
      params: { start: '2025-01-01', end: '2025-01-31' }
    });
    expect(result).toEqual(mockRevenue);
  });

  it('fetches churn rate', async () => {
    const { useAnalyticsStore, api } = await import('../../../src/stores/analytics');
    const store = useAnalyticsStore();

    const mockChurn = { total: 2.5 };
    api.get = vi.fn().mockResolvedValue(mockChurn);

    const result = await store.fetchChurn('2025-01-01', '2025-01-31');

    expect(api.get).toHaveBeenCalledWith('/admin/analytics/churn', {
      params: { start: '2025-01-01', end: '2025-01-31' }
    });
    expect(result).toEqual(mockChurn);
  });

  it('fetches user growth', async () => {
    const { useAnalyticsStore, api } = await import('../../../src/stores/analytics');
    const store = useAnalyticsStore();

    const mockGrowth = {
      data: [{ date: '2025-01-01', value: 10 }],
      total: 50
    };
    api.get = vi.fn().mockResolvedValue(mockGrowth);

    const result = await store.fetchUserGrowth('2025-01-01', '2025-01-31');

    expect(api.get).toHaveBeenCalledWith('/admin/analytics/users/growth', {
      params: { start: '2025-01-01', end: '2025-01-31' }
    });
    expect(result).toEqual(mockGrowth);
  });

  it('fetches plan distribution', async () => {
    const { useAnalyticsStore, api } = await import('../../../src/stores/analytics');
    const store = useAnalyticsStore();

    const mockDistribution = { Free: 100, Pro: 50, Enterprise: 10 };
    api.get = vi.fn().mockResolvedValue(mockDistribution);

    await store.fetchPlanDistribution();

    expect(api.get).toHaveBeenCalledWith('/admin/analytics/plans/distribution');
    expect(store.planDistribution).toEqual(mockDistribution);
  });

  it('fetches recent activity', async () => {
    const { useAnalyticsStore, api } = await import('../../../src/stores/analytics');
    const store = useAnalyticsStore();

    const mockActivity = [
      { type: 'signup', user: 'user@test.com', timestamp: '2025-01-01T10:00:00Z' },
      { type: 'subscription', user: 'user2@test.com', timestamp: '2025-01-01T11:00:00Z' }
    ];
    api.get = vi.fn().mockResolvedValue({ activity: mockActivity });

    const result = await store.fetchRecentActivity();

    expect(api.get).toHaveBeenCalledWith('/admin/analytics/activity');
    expect(result).toEqual(mockActivity);
  });

  it('handles fetch error gracefully', async () => {
    const { useAnalyticsStore, api } = await import('../../../src/stores/analytics');
    const store = useAnalyticsStore();

    api.get = vi.fn().mockRejectedValue(new Error('Network error'));

    await expect(store.fetchDashboard()).rejects.toThrow();
    expect(store.error).toBe('Network error');
  });

  it('resets store state', async () => {
    const { useAnalyticsStore } = await import('../../../src/stores/analytics');
    const store = useAnalyticsStore();
    store.dashboard = { mrr: { total: 5000 } };
    store.error = 'Some error';

    store.reset();

    expect(store.dashboard).toBeNull();
    expect(store.error).toBeNull();
  });
});
