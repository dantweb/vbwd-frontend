import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

// This test will fail initially (RED phase) until we implement the store
describe('ProfileStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('initializes with empty profile', async () => {
    const { useProfileStore } = await import('../../../src/stores/profile');
    const store = useProfileStore();

    expect(store.profile).toBeNull();
    expect(store.loading).toBe(false);
    expect(store.error).toBeNull();
  });

  it('sets loading state during fetch', async () => {
    const { useProfileStore, api } = await import('../../../src/stores/profile');
    const store = useProfileStore();

    api.get = vi.fn().mockResolvedValue({
      id: '1',
      name: 'John Doe',
      email: 'john@example.com'
    });

    const promise = store.fetchProfile();
    expect(store.loading).toBe(true);

    await promise;
    expect(store.loading).toBe(false);
  });

  it('fetches profile from API', async () => {
    const { useProfileStore, api } = await import('../../../src/stores/profile');
    const store = useProfileStore();

    api.get = vi.fn().mockResolvedValue({
      id: '1',
      name: 'John Doe',
      email: 'john@example.com'
    });

    await store.fetchProfile();

    expect(api.get).toHaveBeenCalledWith('/user/profile');
    expect(store.profile).toEqual({
      id: '1',
      name: 'John Doe',
      email: 'john@example.com'
    });
  });

  it('handles fetch error gracefully', async () => {
    const { useProfileStore, api } = await import('../../../src/stores/profile');
    const store = useProfileStore();

    api.get = vi.fn().mockRejectedValue(new Error('Network error'));

    await expect(store.fetchProfile()).rejects.toThrow();
    expect(store.error).toBe('Network error');
    expect(store.loading).toBe(false);
  });

  it('updates profile with valid data', async () => {
    const { useProfileStore, api } = await import('../../../src/stores/profile');
    const store = useProfileStore();
    store.profile = { id: '1', name: 'John', email: 'john@example.com' };

    api.put = vi.fn().mockResolvedValue({
      id: '1',
      name: 'Jane',
      email: 'john@example.com'
    });

    await store.updateProfile({ name: 'Jane' });

    expect(api.put).toHaveBeenCalledWith('/user/details', { name: 'Jane' });
    expect(store.profile.name).toBe('Jane');
  });

  it('changes password with current password validation', async () => {
    const { useProfileStore, api } = await import('../../../src/stores/profile');
    const store = useProfileStore();

    api.post = vi.fn().mockResolvedValue({ success: true });

    const result = await store.changePassword('oldpass', 'newpass');

    expect(api.post).toHaveBeenCalledWith('/user/change-password', {
      currentPassword: 'oldpass',
      newPassword: 'newpass'
    });
    expect(result.success).toBe(true);
  });

  it('resets store state', async () => {
    const { useProfileStore } = await import('../../../src/stores/profile');
    const store = useProfileStore();
    store.profile = { id: '1', name: 'John', email: 'john@example.com' };
    store.error = 'Some error';
    store.loading = true;

    store.reset();

    expect(store.profile).toBeNull();
    expect(store.error).toBeNull();
    expect(store.loading).toBe(false);
  });
});
