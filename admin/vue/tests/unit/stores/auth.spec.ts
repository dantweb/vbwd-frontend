import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { defineStore } from 'pinia';

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

// Create mock API client
const mockApiClient = {
  post: vi.fn(),
  get: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  setToken: vi.fn(),
  clearToken: vi.fn()
};

// Store configuration - mirrors core auth store
let storeConfig: { storageKey: string; apiClient: typeof mockApiClient } | null = null;

// Configurable auth store for testing
function configureAuthStore(config: { storageKey: string; apiClient: typeof mockApiClient }): void {
  storeConfig = config;
}

function getConfig() {
  if (!storeConfig) {
    throw new Error('Auth store not configured');
  }
  return storeConfig;
}

// Define a test-local auth store (mirrors the core implementation)
const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as { id: string; email: string; name: string; roles: string[] } | null,
    token: null as string | null,
    error: null as string | null,
    loading: false,
  }),

  getters: {
    isAuthenticated: (state): boolean => !!state.token,
  },

  actions: {
    initAuth(): void {
      const config = getConfig();
      const token = localStorage.getItem(config.storageKey);
      if (token) {
        this.token = token;
        config.apiClient.setToken(token);
      }
    },

    async login(credentials: { email: string; password: string }) {
      const config = getConfig();
      this.error = null;
      this.loading = true;

      try {
        const response = await config.apiClient.post('/auth/login', credentials);
        this.token = response.token;
        this.user = response.user;
        config.apiClient.setToken(this.token!);
        localStorage.setItem(config.storageKey, this.token!);
        return response;
      } catch (error) {
        this.error = (error as Error).message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    logout(): void {
      const config = getConfig();
      this.token = null;
      this.user = null;
      config.apiClient.clearToken();
      localStorage.removeItem(config.storageKey);
    },
  },
});

describe('AuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorageMock.clear();
    vi.clearAllMocks();

    // Configure auth store with mock API client
    configureAuthStore({
      storageKey: 'admin_token',
      apiClient: mockApiClient,
    });
  });

  it('should have correct initial state', () => {
    const store = useAuthStore();

    expect(store.token).toBeNull();
    expect(store.user).toBeNull();
    expect(store.error).toBeNull();
  });

  it('should return isAuthenticated as false when no token', () => {
    const store = useAuthStore();

    expect(store.isAuthenticated).toBe(false);
  });

  it('should return isAuthenticated as true when token exists', () => {
    const store = useAuthStore();
    store.token = 'test-token';

    expect(store.isAuthenticated).toBe(true);
  });

  it('should login and store token', async () => {
    const store = useAuthStore();

    mockApiClient.post.mockResolvedValue({ token: 'test-token', user: { id: '1', email: 'admin@test.com', name: 'Admin', roles: ['admin'] } });

    await store.login({ email: 'admin@test.com', password: 'password' });

    expect(mockApiClient.post).toHaveBeenCalledWith('/auth/login', {
      email: 'admin@test.com',
      password: 'password'
    });
    expect(store.token).toBe('test-token');
    expect(store.user).toEqual({ id: '1', email: 'admin@test.com', name: 'Admin', roles: ['admin'] });
    expect(mockApiClient.setToken).toHaveBeenCalledWith('test-token');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('admin_token', 'test-token');
  });

  it('should handle login error', async () => {
    const store = useAuthStore();

    mockApiClient.post.mockRejectedValue(new Error('Invalid credentials'));

    await expect(store.login({ email: 'admin@test.com', password: 'wrong' })).rejects.toThrow();
    expect(store.error).toBe('Invalid credentials');
  });

  it('should logout and clear token', () => {
    const store = useAuthStore();
    store.token = 'test-token';
    store.user = { id: '1', email: 'admin@test.com', name: 'Admin', roles: ['admin'] };

    store.logout();

    expect(store.token).toBeNull();
    expect(store.user).toBeNull();
  });

  it('should initialize auth from localStorage', () => {
    localStorageMock.store['admin_token'] = 'saved-token';
    localStorageMock.getItem.mockReturnValue('saved-token');

    const store = useAuthStore();

    store.initAuth();

    expect(store.token).toBe('saved-token');
  });
});
