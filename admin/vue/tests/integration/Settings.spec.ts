import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import { createRouter, createMemoryHistory } from 'vue-router';
import Settings from '@/views/Settings.vue';
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

describe('Settings.vue', () => {
  let router: ReturnType<typeof createRouter>;

  const mockSettings = {
    company_name: 'Test Company',
    company_email: 'admin@test.com',
    default_currency: 'USD',
    tax_rate: 10,
    support_email: 'support@test.com',
    notification_preferences: {
      email_on_new_subscription: true,
      email_on_cancellation: true,
      email_on_payment_failed: true
    }
  };

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();

    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/admin/settings', name: 'settings', component: Settings }
      ]
    });

    vi.mocked(api.get).mockResolvedValue({ settings: mockSettings });
  });

  it('renders settings form', async () => {
    const wrapper = mount(Settings, {
      global: { plugins: [router] }
    });

    await flushPromises();

    expect(wrapper.find('[data-testid="settings-form"]').exists()).toBe(true);
  });

  it('displays current settings values', async () => {
    const wrapper = mount(Settings, {
      global: { plugins: [router] }
    });

    await flushPromises();

    const companyNameInput = wrapper.find('[data-testid="company-name-input"]');
    expect((companyNameInput.element as HTMLInputElement).value).toBe('Test Company');
  });

  it('shows loading state while fetching settings', async () => {
    vi.mocked(api.get).mockImplementation(() => new Promise(() => {}));

    const wrapper = mount(Settings, {
      global: { plugins: [router] }
    });

    await wrapper.vm.$nextTick();

    expect(wrapper.find('[data-testid="loading-spinner"]').exists()).toBe(true);
  });

  it('can update settings', async () => {
    vi.mocked(api.put).mockResolvedValue({ settings: { ...mockSettings, company_name: 'New Company' } });

    const wrapper = mount(Settings, {
      global: { plugins: [router] }
    });

    await flushPromises();

    const companyNameInput = wrapper.find('[data-testid="company-name-input"]');
    await companyNameInput.setValue('New Company');

    const saveBtn = wrapper.find('[data-testid="save-button"]');
    await saveBtn.trigger('click');
    await flushPromises();

    expect(api.put).toHaveBeenCalledWith('/admin/settings', expect.objectContaining({
      company_name: 'New Company'
    }));
  });

  it('displays success message after save', async () => {
    vi.mocked(api.put).mockResolvedValue({ settings: mockSettings });

    const wrapper = mount(Settings, {
      global: { plugins: [router] }
    });

    await flushPromises();

    const saveBtn = wrapper.find('[data-testid="save-button"]');
    await saveBtn.trigger('click');
    await flushPromises();

    expect(wrapper.find('[data-testid="success-message"]').exists()).toBe(true);
  });

  it('displays error message on save failure', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(api.put).mockRejectedValue(new Error('Failed to save settings'));

    const wrapper = mount(Settings, {
      global: { plugins: [router] }
    });

    await flushPromises();

    const saveBtn = wrapper.find('[data-testid="save-button"]');
    await saveBtn.trigger('click');
    await flushPromises();

    expect(wrapper.find('[data-testid="error-message"]').exists()).toBe(true);

    consoleSpy.mockRestore();
  });

  it('displays notification preferences', async () => {
    const wrapper = mount(Settings, {
      global: { plugins: [router] }
    });

    await flushPromises();

    expect(wrapper.find('[data-testid="notification-preferences"]').exists()).toBe(true);
  });

  it('shows error state on fetch failure', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(api.get).mockRejectedValue(new Error('Failed to load settings'));

    const wrapper = mount(Settings, {
      global: { plugins: [router] }
    });

    await flushPromises();

    expect(wrapper.find('[data-testid="fetch-error"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('Failed to load settings');

    consoleSpy.mockRestore();
  });
});
