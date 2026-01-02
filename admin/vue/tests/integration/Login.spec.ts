import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import { createRouter, createMemoryHistory } from 'vue-router';
import Login from '@/views/Login.vue';
import { useAuthStore } from '@/stores/auth';
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

// Mock localStorage
const createLocalStorageMock = () => {
  const store: Record<string, string> = {};
  return {
    store,
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { Object.keys(store).forEach(key => delete store[key]); })
  };
};

const localStorageMock = createLocalStorageMock();
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

describe('Login.vue', () => {
  let router: ReturnType<typeof createRouter>;

  beforeEach(() => {
    setActivePinia(createPinia());
    localStorageMock.clear();
    vi.clearAllMocks();

    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/admin/login', name: 'login', component: Login },
        { path: '/admin/dashboard', name: 'dashboard', component: { template: '<div>Dashboard</div>' } },
        { path: '/admin/forbidden', name: 'forbidden', component: { template: '<div>Forbidden</div>' } }
      ]
    });
  });

  it('renders login form correctly', async () => {
    const wrapper = mount(Login, {
      global: {
        plugins: [router]
      }
    });

    expect(wrapper.find('h1').text()).toContain('VBWD Admin');
    expect(wrapper.find('input#username').exists()).toBe(true);
    expect(wrapper.find('input#password').exists()).toBe(true);
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true);
  });

  it('shows loading state while logging in', async () => {
    vi.mocked(api.post).mockImplementation(() => new Promise(() => {})); // Never resolves

    const wrapper = mount(Login, {
      global: {
        plugins: [router]
      }
    });

    await wrapper.find('input#username').setValue('admin@test.com');
    await wrapper.find('input#password').setValue('password');
    await wrapper.find('form').trigger('submit');

    expect(wrapper.find('button[type="submit"]').text()).toContain('Logging in');
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined();
  });

  it('displays error message on failed login', async () => {
    vi.mocked(api.post).mockRejectedValue(new Error('Invalid credentials'));

    const wrapper = mount(Login, {
      global: {
        plugins: [router]
      }
    });

    await wrapper.find('input#username').setValue('admin@test.com');
    await wrapper.find('input#password').setValue('wrongpassword');
    await wrapper.find('form').trigger('submit');

    await flushPromises();

    expect(wrapper.find('.error').exists()).toBe(true);
    expect(wrapper.find('.error').text()).toContain('Invalid credentials');
  });

  it('redirects to dashboard on successful admin login', async () => {
    vi.mocked(api.post).mockResolvedValue({
      token: 'test-admin-token',
      user: {
        id: '1',
        email: 'admin@test.com',
        name: 'Admin User',
        roles: ['admin']
      }
    });

    await router.push('/admin/login');

    const wrapper = mount(Login, {
      global: {
        plugins: [router]
      }
    });

    await wrapper.find('input#username').setValue('admin@test.com');
    await wrapper.find('input#password').setValue('admin123');
    await wrapper.find('form').trigger('submit');

    await flushPromises();

    expect(router.currentRoute.value.path).toBe('/admin/dashboard');
  });

  it('redirects to forbidden page when user has no admin role', async () => {
    vi.mocked(api.post).mockResolvedValue({
      token: 'test-user-token',
      user: {
        id: '2',
        email: 'user@test.com',
        name: 'Regular User',
        roles: ['user']  // No admin role
      }
    });

    await router.push('/admin/login');

    const wrapper = mount(Login, {
      global: {
        plugins: [router]
      }
    });

    await wrapper.find('input#username').setValue('user@test.com');
    await wrapper.find('input#password').setValue('user123');
    await wrapper.find('form').trigger('submit');

    await flushPromises();

    expect(router.currentRoute.value.path).toBe('/admin/forbidden');
  });

  it('stores token in localStorage on successful login', async () => {
    vi.mocked(api.post).mockResolvedValue({
      token: 'test-admin-token',
      user: {
        id: '1',
        email: 'admin@test.com',
        name: 'Admin User',
        roles: ['admin']
      }
    });

    const wrapper = mount(Login, {
      global: {
        plugins: [router]
      }
    });

    await wrapper.find('input#username').setValue('admin@test.com');
    await wrapper.find('input#password').setValue('admin123');
    await wrapper.find('form').trigger('submit');

    await flushPromises();

    expect(localStorageMock.setItem).toHaveBeenCalledWith('admin_token', 'test-admin-token');
  });

  it('updates auth store on successful login', async () => {
    vi.mocked(api.post).mockResolvedValue({
      token: 'test-admin-token',
      user: {
        id: '1',
        email: 'admin@test.com',
        name: 'Admin User',
        roles: ['admin']
      }
    });

    const wrapper = mount(Login, {
      global: {
        plugins: [router]
      }
    });

    await wrapper.find('input#username').setValue('admin@test.com');
    await wrapper.find('input#password').setValue('admin123');
    await wrapper.find('form').trigger('submit');

    await flushPromises();

    const authStore = useAuthStore();
    expect(authStore.isAuthenticated).toBe(true);
    expect(authStore.user?.email).toBe('admin@test.com');
    expect(authStore.user?.roles).toContain('admin');
  });
});
