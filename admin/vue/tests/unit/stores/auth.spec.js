import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAuthStore, api } from '@/stores/auth'

// Mock localStorage
const localStorageMock = {
  store: {},
  getItem: vi.fn((key) => localStorageMock.store[key] || null),
  setItem: vi.fn((key, value) => { localStorageMock.store[key] = value }),
  removeItem: vi.fn((key) => { delete localStorageMock.store[key] }),
  clear: vi.fn(() => { localStorageMock.store = {} })
}
Object.defineProperty(global, 'localStorage', { value: localStorageMock })

// Mock the API client
vi.mock('@vbwd/core-sdk', () => ({
  ApiClient: vi.fn().mockImplementation(() => ({
    post: vi.fn(),
    get: vi.fn(),
    setToken: vi.fn(),
    clearToken: vi.fn()
  }))
}))

describe('AuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  it('should have correct initial state', () => {
    const store = useAuthStore()

    expect(store.token).toBeNull()
    expect(store.user).toBeNull()
    expect(store.error).toBeNull()
  })

  it('should return isAuthenticated as false when no token', () => {
    const store = useAuthStore()

    expect(store.isAuthenticated).toBe(false)
  })

  it('should return isAuthenticated as true when token exists', () => {
    const store = useAuthStore()
    store.token = 'test-token'

    expect(store.isAuthenticated).toBe(true)
  })

  it('should login and store token', async () => {
    const store = useAuthStore()

    api.post = vi.fn().mockResolvedValue({ token: 'test-token', user: { id: '1' } })
    api.setToken = vi.fn()

    await store.login('admin@test.com', 'password')

    expect(api.post).toHaveBeenCalledWith('/auth/login', {
      email: 'admin@test.com',
      password: 'password'
    })
    expect(store.token).toBe('test-token')
    expect(store.user).toEqual({ id: '1' })
    expect(api.setToken).toHaveBeenCalledWith('test-token')
    expect(localStorageMock.setItem).toHaveBeenCalledWith('admin_token', 'test-token')
  })

  it('should handle login error', async () => {
    const store = useAuthStore()

    api.post = vi.fn().mockRejectedValue(new Error('Invalid credentials'))

    await expect(store.login('admin@test.com', 'wrong')).rejects.toThrow()
    expect(store.error).toBe('Invalid credentials')
  })

  it('should logout and clear token', () => {
    const store = useAuthStore()
    store.token = 'test-token'
    store.user = { id: '1' }

    api.clearToken = vi.fn()

    store.logout()

    expect(store.token).toBeNull()
    expect(store.user).toBeNull()
    expect(api.clearToken).toHaveBeenCalled()
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('admin_token')
  })

  it('should initialize auth from localStorage', () => {
    localStorageMock.store['admin_token'] = 'saved-token'
    localStorageMock.getItem.mockReturnValue('saved-token')

    const store = useAuthStore()
    api.setToken = vi.fn()

    store.initAuth()

    expect(store.token).toBe('saved-token')
    expect(api.setToken).toHaveBeenCalledWith('saved-token')
  })
})
