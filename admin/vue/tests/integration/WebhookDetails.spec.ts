import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import { createRouter, createMemoryHistory } from 'vue-router';
import WebhookDetails from '@/views/WebhookDetails.vue';
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

describe('WebhookDetails.vue', () => {
  let router: ReturnType<typeof createRouter>;

  const mockWebhook = {
    id: '1',
    url: 'https://example.com/webhook',
    events: ['payment.completed', 'subscription.created'],
    status: 'active',
    secret: 'whsec_xxxx',
    created_at: '2025-01-01T00:00:00Z',
    last_triggered_at: '2025-01-15T10:00:00Z',
    delivery_history: [
      { id: 'd1', event_type: 'payment.completed', status: 'success', response_code: 200, created_at: '2025-01-15T10:00:00Z' },
      { id: 'd2', event_type: 'subscription.created', status: 'failed', response_code: 500, created_at: '2025-01-14T10:00:00Z' }
    ]
  };

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();

    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/admin/webhooks', name: 'webhooks', component: { template: '<div>Webhooks</div>' } },
        { path: '/admin/webhooks/:id', name: 'webhook-details', component: WebhookDetails }
      ]
    });

    vi.mocked(api.get).mockResolvedValue({ webhook: mockWebhook });
  });

  it('fetches webhook details on mount', async () => {
    await router.push('/admin/webhooks/1');

    mount(WebhookDetails, {
      global: { plugins: [router] }
    });

    await flushPromises();

    expect(api.get).toHaveBeenCalledWith('/admin/webhooks/1');
  });

  it('displays webhook information', async () => {
    await router.push('/admin/webhooks/1');

    const wrapper = mount(WebhookDetails, {
      global: { plugins: [router] }
    });

    await flushPromises();

    expect(wrapper.text()).toContain('https://example.com/webhook');
    expect(wrapper.text()).toContain('payment.completed');
    expect(wrapper.text()).toContain('subscription.created');
  });

  it('displays webhook status badge', async () => {
    await router.push('/admin/webhooks/1');

    const wrapper = mount(WebhookDetails, {
      global: { plugins: [router] }
    });

    await flushPromises();

    expect(wrapper.find('[data-testid="status-active"]').exists()).toBe(true);
  });

  it('displays delivery history', async () => {
    await router.push('/admin/webhooks/1');

    const wrapper = mount(WebhookDetails, {
      global: { plugins: [router] }
    });

    await flushPromises();

    expect(wrapper.find('[data-testid="delivery-history"]').exists()).toBe(true);
  });

  it('can test webhook', async () => {
    vi.mocked(api.post).mockResolvedValue({ message: 'Test sent' });

    await router.push('/admin/webhooks/1');

    const wrapper = mount(WebhookDetails, {
      global: { plugins: [router] }
    });

    await flushPromises();

    const testBtn = wrapper.find('[data-testid="test-button"]');
    await testBtn.trigger('click');
    await flushPromises();

    expect(api.post).toHaveBeenCalledWith('/admin/webhooks/1/test', {});
  });

  it('can toggle webhook status', async () => {
    vi.mocked(api.post).mockResolvedValue({ webhook: { ...mockWebhook, status: 'inactive' } });

    await router.push('/admin/webhooks/1');

    const wrapper = mount(WebhookDetails, {
      global: { plugins: [router] }
    });

    await flushPromises();

    const toggleBtn = wrapper.find('[data-testid="toggle-button"]');
    await toggleBtn.trigger('click');
    await flushPromises();

    expect(api.post).toHaveBeenCalledWith('/admin/webhooks/1/toggle', {});
  });

  it('can delete webhook', async () => {
    vi.mocked(api.delete).mockResolvedValue({});

    await router.push('/admin/webhooks/1');

    const wrapper = mount(WebhookDetails, {
      global: { plugins: [router] }
    });

    await flushPromises();

    const deleteBtn = wrapper.find('[data-testid="delete-button"]');
    await deleteBtn.trigger('click');
    await flushPromises();

    expect(api.delete).toHaveBeenCalledWith('/admin/webhooks/1');
  });

  it('navigates back to webhooks list', async () => {
    await router.push('/admin/webhooks/1');

    const wrapper = mount(WebhookDetails, {
      global: { plugins: [router] }
    });

    await flushPromises();

    const backBtn = wrapper.find('[data-testid="back-button"]');
    await backBtn.trigger('click');
    await flushPromises();

    expect(router.currentRoute.value.path).toBe('/admin/webhooks');
  });

  it('shows loading state while fetching', async () => {
    vi.mocked(api.get).mockImplementation(() => new Promise(() => {}));

    await router.push('/admin/webhooks/1');

    const wrapper = mount(WebhookDetails, {
      global: { plugins: [router] }
    });

    await wrapper.vm.$nextTick();

    expect(wrapper.find('[data-testid="loading-spinner"]').exists()).toBe(true);
  });

  it('shows error state on fetch failure', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(api.get).mockRejectedValue(new Error('Webhook not found'));

    await router.push('/admin/webhooks/1');

    const wrapper = mount(WebhookDetails, {
      global: { plugins: [router] }
    });

    await flushPromises();

    expect(wrapper.find('[data-testid="error-message"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('Webhook not found');

    consoleSpy.mockRestore();
  });
});
