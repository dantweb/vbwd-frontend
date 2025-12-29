import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useSubmissionStore, api } from '@/stores/submission'

// Mock the API client
vi.mock('@vbwd/core-sdk', () => ({
  ApiClient: vi.fn().mockImplementation(() => ({
    post: vi.fn(),
    get: vi.fn(),
    setToken: vi.fn(),
    clearToken: vi.fn()
  }))
}))

describe('SubmissionStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('should have correct initial state', () => {
    const store = useSubmissionStore()

    expect(store.submissionId).toBeNull()
    expect(store.status).toBeNull()
    expect(store.error).toBeNull()
    expect(store.loading).toBe(false)
  })

  it('should set loading state during submit', async () => {
    const store = useSubmissionStore()

    api.post = vi.fn().mockResolvedValue({ submission_id: '123' })

    const promise = store.submit({ images: [], email: 'test@test.com' })
    expect(store.loading).toBe(true)

    await promise
    expect(store.loading).toBe(false)
  })

  it('should set submission ID after successful submit', async () => {
    const store = useSubmissionStore()

    api.post = vi.fn().mockResolvedValue({ submission_id: '123' })

    await store.submit({ images: [], email: 'test@test.com' })

    expect(store.submissionId).toBe('123')
    expect(store.status).toBe('submitted')
  })

  it('should handle submission error', async () => {
    const store = useSubmissionStore()

    api.post = vi.fn().mockRejectedValue(new Error('Network error'))

    await expect(store.submit({ images: [], email: 'test@test.com' })).rejects.toThrow()
    expect(store.error).toBe('Network error')
  })

  it('should get status using API', async () => {
    const store = useSubmissionStore()
    store.submissionId = '123'

    api.get = vi.fn().mockResolvedValue({ status: 'completed' })

    await store.getStatus()

    expect(api.get).toHaveBeenCalledWith('/user/status/123')
    expect(store.status).toBe('completed')
  })

  it('should not call API if submissionId is null', async () => {
    const store = useSubmissionStore()
    store.submissionId = null

    api.get = vi.fn()

    await store.getStatus()

    expect(api.get).not.toHaveBeenCalled()
  })

  it('should reset state', () => {
    const store = useSubmissionStore()
    store.submissionId = '123'
    store.status = 'completed'
    store.error = 'Some error'
    store.loading = true

    store.reset()

    expect(store.submissionId).toBeNull()
    expect(store.status).toBeNull()
    expect(store.error).toBeNull()
    expect(store.loading).toBe(false)
  })
})
