import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

describe('UserAdminStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('initializes with empty state', async () => {
    const { useUserAdminStore } = await import('../../../src/stores/userAdmin');
    const store = useUserAdminStore();

    expect(store.users).toEqual([]);
    expect(store.selectedUser).toBeNull();
    expect(store.total).toBe(0);
    expect(store.loading).toBe(false);
    expect(store.error).toBeNull();
  });

  it('fetches users list with pagination', async () => {
    const { useUserAdminStore, api } = await import('../../../src/stores/userAdmin');
    const store = useUserAdminStore();

    const mockUsers = [
      { id: '1', email: 'user1@test.com', name: 'User 1', is_active: true, roles: ['user'] },
      { id: '2', email: 'user2@test.com', name: 'User 2', is_active: true, roles: ['admin'] }
    ];

    api.get = vi.fn().mockResolvedValue({
      users: mockUsers,
      total: 100,
      page: 1,
      per_page: 20
    });

    await store.fetchUsers({ page: 1, per_page: 20 });

    expect(api.get).toHaveBeenCalledWith('/admin/users', {
      params: { page: 1, per_page: 20, search: '', status: '' }
    });
    expect(store.users).toEqual(mockUsers);
    expect(store.total).toBe(100);
  });

  it('fetches users with search filter', async () => {
    const { useUserAdminStore, api } = await import('../../../src/stores/userAdmin');
    const store = useUserAdminStore();

    api.get = vi.fn().mockResolvedValue({ users: [], total: 0 });

    await store.fetchUsers({ page: 1, per_page: 20, search: 'test@', status: 'active' });

    expect(api.get).toHaveBeenCalledWith('/admin/users', {
      params: { page: 1, per_page: 20, search: 'test@', status: 'active' }
    });
  });

  it('fetches single user details', async () => {
    const { useUserAdminStore, api } = await import('../../../src/stores/userAdmin');
    const store = useUserAdminStore();

    const mockUser = {
      id: '1',
      email: 'user@test.com',
      name: 'Test User',
      is_active: true,
      roles: ['user'],
      subscription: { plan: 'Pro', status: 'active' },
      stats: { total_payments: 100 }
    };

    api.get = vi.fn().mockResolvedValue({ user: mockUser });

    await store.fetchUser('1');

    expect(api.get).toHaveBeenCalledWith('/admin/users/1');
    expect(store.selectedUser).toEqual(mockUser);
  });

  it('updates user information', async () => {
    const { useUserAdminStore, api } = await import('../../../src/stores/userAdmin');
    const store = useUserAdminStore();

    api.put = vi.fn().mockResolvedValue({ message: 'User updated' });

    await store.updateUser('1', { name: 'New Name' });

    expect(api.put).toHaveBeenCalledWith('/admin/users/1', { name: 'New Name' });
  });

  it('suspends user with reason', async () => {
    const { useUserAdminStore, api } = await import('../../../src/stores/userAdmin');
    const store = useUserAdminStore();

    api.post = vi.fn().mockResolvedValue({ message: 'User suspended' });

    await store.suspendUser('1', 'Violation of terms');

    expect(api.post).toHaveBeenCalledWith('/admin/users/1/suspend', { reason: 'Violation of terms' });
  });

  it('activates suspended user', async () => {
    const { useUserAdminStore, api } = await import('../../../src/stores/userAdmin');
    const store = useUserAdminStore();

    api.post = vi.fn().mockResolvedValue({ message: 'User activated' });

    await store.activateUser('1');

    expect(api.post).toHaveBeenCalledWith('/admin/users/1/activate');
  });

  it('updates user roles', async () => {
    const { useUserAdminStore, api } = await import('../../../src/stores/userAdmin');
    const store = useUserAdminStore();

    api.put = vi.fn().mockResolvedValue({ message: 'Roles updated' });

    await store.updateUserRoles('1', ['admin', 'user']);

    expect(api.put).toHaveBeenCalledWith('/admin/users/1/roles', { roles: ['admin', 'user'] });
  });

  it('impersonates user', async () => {
    const { useUserAdminStore, api } = await import('../../../src/stores/userAdmin');
    const store = useUserAdminStore();

    api.post = vi.fn().mockResolvedValue({ token: 'impersonation_token', expires_in: 3600 });

    const result = await store.impersonateUser('1');

    expect(api.post).toHaveBeenCalledWith('/admin/users/1/impersonate');
    expect(result.token).toBe('impersonation_token');
  });

  it('handles fetch error gracefully', async () => {
    const { useUserAdminStore, api } = await import('../../../src/stores/userAdmin');
    const store = useUserAdminStore();

    api.get = vi.fn().mockRejectedValue(new Error('Network error'));

    await expect(store.fetchUsers({ page: 1, per_page: 20 })).rejects.toThrow();
    expect(store.error).toBe('Network error');
  });

  it('resets store state', async () => {
    const { useUserAdminStore } = await import('../../../src/stores/userAdmin');
    const store = useUserAdminStore();
    store.users = [{ id: '1', email: 'test@test.com', name: 'Test', is_active: true, roles: [] }];
    store.selectedUser = { id: '1', email: 'test@test.com', name: 'Test', is_active: true, roles: [] };
    store.error = 'Some error';

    store.reset();

    expect(store.users).toEqual([]);
    expect(store.selectedUser).toBeNull();
    expect(store.error).toBeNull();
  });
});
