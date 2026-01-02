import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import { createRouter, createMemoryHistory } from 'vue-router';
import Analytics from '@/views/Analytics.vue';
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

describe('Analytics.vue', () => {
  let router: ReturnType<typeof createRouter>;

  const mockDashboard = {
    mrr: { total: 15000, change_percent: 12.5 },
    revenue: { total: 45000, change_percent: 8.3 },
    churn: { total: 2.1, change_percent: -0.5 },
    user_growth: { total: 150, change_percent: 25 },
    conversion: { total: 4.5, change_percent: 1.2 },
    arpu: { total: 35, change_percent: 3.0 }
  };

  const mockPlanDistribution = {
    'Free': 500,
    'Pro': 150,
    'Enterprise': 25
  };

  const mockActivity = [
    { type: 'subscription', user: 'user1@test.com', timestamp: '2025-12-20T10:00:00Z', details: 'Upgraded to Pro' },
    { type: 'payment', user: 'user2@test.com', timestamp: '2025-12-20T09:30:00Z', details: 'Payment of $29.99' },
    { type: 'signup', user: 'user3@test.com', timestamp: '2025-12-20T09:00:00Z', details: 'New signup' }
  ];

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();

    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/admin/analytics', name: 'analytics', component: Analytics }
      ]
    });

    // Default mock responses
    vi.mocked(api.get).mockImplementation((url: string) => {
      if (url === '/admin/analytics/dashboard') {
        return Promise.resolve(mockDashboard);
      }
      if (url === '/admin/analytics/plans/distribution') {
        return Promise.resolve(mockPlanDistribution);
      }
      if (url === '/admin/analytics/activity') {
        return Promise.resolve({ activity: mockActivity });
      }
      return Promise.resolve({});
    });
  });

  it('renders analytics dashboard', async () => {
    const wrapper = mount(Analytics, {
      global: {
        plugins: [router]
      }
    });

    await flushPromises();

    expect(wrapper.find('[data-testid="analytics-dashboard"]').exists()).toBe(true);
  });

  it('displays MRR metric card', async () => {
    const wrapper = mount(Analytics, {
      global: {
        plugins: [router]
      }
    });

    await flushPromises();

    expect(wrapper.find('[data-testid="metric-mrr"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('15,000');
    expect(wrapper.text()).toContain('12.5%');
  });

  it('displays revenue metric card', async () => {
    const wrapper = mount(Analytics, {
      global: {
        plugins: [router]
      }
    });

    await flushPromises();

    expect(wrapper.find('[data-testid="metric-revenue"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('45,000');
  });

  it('displays user growth metric', async () => {
    const wrapper = mount(Analytics, {
      global: {
        plugins: [router]
      }
    });

    await flushPromises();

    expect(wrapper.find('[data-testid="metric-user-growth"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('150');
  });

  it('displays churn rate metric', async () => {
    const wrapper = mount(Analytics, {
      global: {
        plugins: [router]
      }
    });

    await flushPromises();

    expect(wrapper.find('[data-testid="metric-churn"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('2.1');
  });

  it('shows positive change with green indicator', async () => {
    const wrapper = mount(Analytics, {
      global: {
        plugins: [router]
      }
    });

    await flushPromises();

    const mrrCard = wrapper.find('[data-testid="metric-mrr"]');
    expect(mrrCard.find('.change-positive').exists()).toBe(true);
  });

  it('shows negative change with red indicator', async () => {
    const wrapper = mount(Analytics, {
      global: {
        plugins: [router]
      }
    });

    await flushPromises();

    const churnCard = wrapper.find('[data-testid="metric-churn"]');
    expect(churnCard.find('.change-negative').exists()).toBe(true);
  });

  it('displays plan distribution section', async () => {
    const wrapper = mount(Analytics, {
      global: {
        plugins: [router]
      }
    });

    await flushPromises();

    expect(wrapper.find('[data-testid="plan-distribution"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('Free');
    expect(wrapper.text()).toContain('500');
    expect(wrapper.text()).toContain('Pro');
    expect(wrapper.text()).toContain('150');
  });

  it('displays recent activity feed', async () => {
    const wrapper = mount(Analytics, {
      global: {
        plugins: [router]
      }
    });

    await flushPromises();

    expect(wrapper.find('[data-testid="activity-feed"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('user1@test.com');
    expect(wrapper.text()).toContain('Upgraded to Pro');
  });

  it('shows loading state while fetching data', async () => {
    vi.mocked(api.get).mockImplementation(() => new Promise(() => {}));

    const wrapper = mount(Analytics, {
      global: {
        plugins: [router]
      }
    });

    await wrapper.vm.$nextTick();

    expect(wrapper.find('[data-testid="loading-spinner"]').exists()).toBe(true);
  });

  it('shows error state on fetch failure', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(api.get).mockRejectedValue(new Error('Failed to load analytics'));

    const wrapper = mount(Analytics, {
      global: {
        plugins: [router]
      }
    });

    await flushPromises();

    expect(wrapper.find('[data-testid="error-message"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('Failed to load analytics');

    consoleSpy.mockRestore();
  });

  it('can refresh dashboard data', async () => {
    const wrapper = mount(Analytics, {
      global: {
        plugins: [router]
      }
    });

    await flushPromises();
    vi.clearAllMocks();

    // Setup mocks again after clearing
    vi.mocked(api.get).mockImplementation((url: string) => {
      if (url === '/admin/analytics/dashboard') {
        return Promise.resolve(mockDashboard);
      }
      if (url === '/admin/analytics/plans/distribution') {
        return Promise.resolve(mockPlanDistribution);
      }
      if (url === '/admin/analytics/activity') {
        return Promise.resolve({ activity: mockActivity });
      }
      return Promise.resolve({});
    });

    const refreshBtn = wrapper.find('[data-testid="refresh-button"]');
    await refreshBtn.trigger('click');
    await flushPromises();

    expect(api.get).toHaveBeenCalledWith('/admin/analytics/dashboard', undefined);
  });
});
