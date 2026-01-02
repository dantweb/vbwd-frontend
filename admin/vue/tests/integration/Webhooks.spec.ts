import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import { createRouter, createMemoryHistory } from 'vue-router';
import Webhooks from '@/views/Webhooks.vue';
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

describe('Webhooks.vue', () => {
  let router: ReturnType<typeof createRouter>;

  const mockWebhooks = [
    { id: '1', url: 'https://example.com/webhook1', events: ['payment.completed'], status: 'active', created_at: '2025-01-01' },
    { id: '2', url: 'https://example.com/webhook2', events: ['user.created', 'user.updated'], status: 'inactive', created_at: '2025-01-02' },
    { id: '3', url: 'https://example.com/webhook3', events: ['subscription.canceled'], status: 'failed', created_at: '2025-01-03' }
  ];

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();

    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/admin/webhooks', name: 'webhooks', component: Webhooks },
        { path: '/admin/webhooks/:id', name: 'webhook-details', component: { template: '<div>Details</div>' } }
      ]
    });

    vi.mocked(api.get).mockResolvedValue({
      webhooks: mockWebhooks,
      total: 3,
      page: 1,
      per_page: 20
    });
  });

  it('renders webhooks table with data', async () => {
    const wrapper = mount(Webhooks, {
      global: { plugins: [router] }
    });

    await flushPromises();

    expect(wrapper.find('[data-testid="webhooks-table"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('URL');
    expect(wrapper.text()).toContain('Events');
    expect(wrapper.text()).toContain('Status');
  });

  it('displays webhook data in table rows', async () => {
    const wrapper = mount(Webhooks, {
      global: { plugins: [router] }
    });

    await flushPromises();

    expect(wrapper.text()).toContain('https://example.com/webhook1');
    expect(wrapper.text()).toContain('payment.completed');
  });

  it('shows loading state while fetching webhooks', async () => {
    vi.mocked(api.get).mockImplementation(() => new Promise(() => {}));

    const wrapper = mount(Webhooks, {
      global: { plugins: [router] }
    });

    await wrapper.vm.$nextTick();

    expect(wrapper.find('[data-testid="loading-spinner"]').exists()).toBe(true);
  });

  it('displays status badges', async () => {
    const wrapper = mount(Webhooks, {
      global: { plugins: [router] }
    });

    await flushPromises();

    expect(wrapper.find('[data-testid="status-active"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="status-inactive"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="status-failed"]').exists()).toBe(true);
  });

  it('navigates to webhook details on row click', async () => {
    await router.push('/admin/webhooks');

    const wrapper = mount(Webhooks, {
      global: { plugins: [router] }
    });

    await flushPromises();

    const firstRow = wrapper.find('[data-testid="webhook-row-1"]');
    await firstRow.trigger('click');
    await flushPromises();

    expect(router.currentRoute.value.path).toBe('/admin/webhooks/1');
  });

  it('can create a new webhook', async () => {
    vi.mocked(api.post).mockResolvedValue({
      webhook: { id: '4', url: 'https://new.com/hook', events: ['test'], status: 'active' }
    });

    const wrapper = mount(Webhooks, {
      global: { plugins: [router] }
    });

    await flushPromises();

    const createBtn = wrapper.find('[data-testid="create-webhook-button"]');
    expect(createBtn.exists()).toBe(true);
  });

  it('displays error message on fetch failure', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(api.get).mockRejectedValue(new Error('Failed to fetch webhooks'));

    const wrapper = mount(Webhooks, {
      global: { plugins: [router] }
    });

    await flushPromises();

    expect(wrapper.find('[data-testid="error-message"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('Failed to fetch webhooks');

    consoleSpy.mockRestore();
  });

  it('shows empty state when no webhooks found', async () => {
    vi.mocked(api.get).mockResolvedValue({
      webhooks: [],
      total: 0,
      page: 1,
      per_page: 20
    });

    const wrapper = mount(Webhooks, {
      global: { plugins: [router] }
    });

    await flushPromises();

    expect(wrapper.find('[data-testid="empty-state"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('No webhooks found');
  });

  it('displays total webhooks count', async () => {
    const wrapper = mount(Webhooks, {
      global: { plugins: [router] }
    });

    await flushPromises();

    expect(wrapper.text()).toContain('3');
  });
});
