import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import { createRouter, createMemoryHistory } from 'vue-router';
import AdminLayout from '@/layouts/AdminLayout.vue';
import { useAuthStore } from '@/stores/auth';

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

describe('AdminLayout.vue', () => {
  let router: ReturnType<typeof createRouter>;

  beforeEach(() => {
    setActivePinia(createPinia());
    localStorageMock.clear();
    vi.clearAllMocks();

    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/admin/login', name: 'login', component: { template: '<div>Login</div>' } },
        { path: '/admin/dashboard', name: 'dashboard', component: { template: '<div>Dashboard</div>' } },
        { path: '/admin/users', name: 'users', component: { template: '<div>Users</div>' } },
        { path: '/admin/plans', name: 'plans', component: { template: '<div>Plans</div>' } },
        { path: '/admin/analytics', name: 'analytics', component: { template: '<div>Analytics</div>' } }
      ]
    });

    // Set up authenticated state
    const authStore = useAuthStore();
    authStore.token = 'test-token';
    authStore.user = {
      id: '1',
      email: 'admin@test.com',
      name: 'Admin User',
      roles: ['admin']
    };
  });

  it('renders admin layout with sidebar and topbar', async () => {
    const wrapper = mount(AdminLayout, {
      global: {
        plugins: [router],
        stubs: {
          AdminSidebar: true,
          AdminTopbar: true
        }
      },
      slots: {
        default: '<div class="test-content">Test Content</div>'
      }
    });

    expect(wrapper.find('.admin-layout').exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'AdminSidebar' }).exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'AdminTopbar' }).exists()).toBe(true);
  });

  it('renders slot content in main area', async () => {
    const wrapper = mount(AdminLayout, {
      global: {
        plugins: [router],
        stubs: {
          AdminSidebar: true,
          AdminTopbar: true
        }
      },
      slots: {
        default: '<div class="test-content">Test Content</div>'
      }
    });

    expect(wrapper.find('.test-content').exists()).toBe(true);
    expect(wrapper.find('.test-content').text()).toBe('Test Content');
  });

  it('displays user email in sidebar', async () => {
    const wrapper = mount(AdminLayout, {
      global: {
        plugins: [router]
      },
      slots: {
        default: '<div>Content</div>'
      }
    });

    expect(wrapper.text()).toContain('admin@test.com');
  });

  it('has navigation links to admin sections', async () => {
    const wrapper = mount(AdminLayout, {
      global: {
        plugins: [router]
      },
      slots: {
        default: '<div>Content</div>'
      }
    });

    // Check for navigation links
    const links = wrapper.findAll('a');
    const hrefs = links.map(link => link.attributes('href'));

    expect(hrefs).toContain('/admin/dashboard');
    expect(hrefs).toContain('/admin/users');
    expect(hrefs).toContain('/admin/plans');
  });

  it('logs out when logout button is clicked', async () => {
    const wrapper = mount(AdminLayout, {
      global: {
        plugins: [router]
      },
      slots: {
        default: '<div>Content</div>'
      }
    });

    await router.push('/admin/dashboard');
    await flushPromises();

    const authStore = useAuthStore();
    expect(authStore.isAuthenticated).toBe(true);

    // Find and click logout button
    const logoutBtn = wrapper.find('[data-testid="logout-button"]');
    await logoutBtn.trigger('click');
    await flushPromises();

    expect(authStore.isAuthenticated).toBe(false);
    expect(router.currentRoute.value.path).toBe('/admin/login');
  });

  it('highlights active navigation item', async () => {
    await router.push('/admin/dashboard');

    const wrapper = mount(AdminLayout, {
      global: {
        plugins: [router]
      },
      slots: {
        default: '<div>Content</div>'
      }
    });

    await flushPromises();

    const dashboardLink = wrapper.find('a[href="/admin/dashboard"]');
    expect(dashboardLink.classes()).toContain('router-link-active');
  });

  it('shows admin brand in sidebar', async () => {
    const wrapper = mount(AdminLayout, {
      global: {
        plugins: [router]
      },
      slots: {
        default: '<div>Content</div>'
      }
    });

    expect(wrapper.text()).toContain('VBWD Admin');
  });
});
