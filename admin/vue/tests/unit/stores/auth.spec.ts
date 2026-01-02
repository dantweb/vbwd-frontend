import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from '@/stores/auth';
import { api } from '@/api';

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

describe('AuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorageMock.clear();
    vi.clearAllMocks();
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

    vi.mocked(api.post).mockResolvedValue({ token: 'test-token', user: { id: '1', email: 'admin@test.com', name: 'Admin', roles: ['admin'] } });

    await store.login('admin@test.com', 'password');

    expect(api.post).toHaveBeenCalledWith('/auth/login', {
      email: 'admin@test.com',
      password: 'password'
    });
    expect(store.token).toBe('test-token');
    expect(store.user).toEqual({ id: '1', email: 'admin@test.com', name: 'Admin', roles: ['admin'] });
    expect(api.setToken).toHaveBeenCalledWith('test-token');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('admin_token', 'test-token');
  });

  it('should handle login error', async () => {
    const store = useAuthStore();

    vi.mocked(api.post).mockRejectedValue(new Error('Invalid credentials'));

    await expect(store.login('admin@test.com', 'wrong')).rejects.toThrow();
    expect(store.error).toBe('Invalid credentials');
  });

  it('should logout and clear token', async () => {
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
