import { defineStore } from 'pinia';
import { ApiClient } from '@vbwd/view-component';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  is_active: boolean;
  roles: string[];
  subscription_plan?: string;
  created_at?: string;
}

export interface UserDetail extends AdminUser {
  subscription?: {
    plan: string | null;
    status: string | null;
    expires_at?: string | null;
  };
  stats?: {
    total_payments: number;
    last_login?: string | null;
  };
}

export interface FetchUsersParams {
  page: number;
  per_page: number;
  search?: string;
  status?: string;
}

// Create API client instance
const api = new ApiClient({
  baseURL: import.meta.env.VITE_API_URL || '/api'
});

export const useUserAdminStore = defineStore('userAdmin', {
  state: () => ({
    users: [] as AdminUser[],
    selectedUser: null as UserDetail | null,
    total: 0,
    loading: false,
    error: null as string | null
  }),

  actions: {
    async fetchUsers(params: FetchUsersParams) {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.get('/admin/users', {
          params: {
            page: params.page,
            per_page: params.per_page,
            search: params.search || '',
            status: params.status || ''
          }
        }) as { users: AdminUser[]; total: number; page: number; per_page: number };

        this.users = response.users;
        this.total = response.total;
        return response;
      } catch (error) {
        this.error = (error as Error).message || 'Failed to fetch users';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchUser(userId: string) {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.get(`/admin/users/${userId}`) as { user: UserDetail };
        this.selectedUser = response.user;
        return response.user;
      } catch (error) {
        this.error = (error as Error).message || 'Failed to fetch user';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateUser(userId: string, data: Partial<AdminUser>) {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.put(`/admin/users/${userId}`, data);
        return response;
      } catch (error) {
        this.error = (error as Error).message || 'Failed to update user';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async suspendUser(userId: string, reason: string) {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.post(`/admin/users/${userId}/suspend`, { reason });
        return response;
      } catch (error) {
        this.error = (error as Error).message || 'Failed to suspend user';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async activateUser(userId: string) {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.post(`/admin/users/${userId}/activate`);
        return response;
      } catch (error) {
        this.error = (error as Error).message || 'Failed to activate user';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateUserRoles(userId: string, roles: string[]) {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.put(`/admin/users/${userId}/roles`, { roles });
        return response;
      } catch (error) {
        this.error = (error as Error).message || 'Failed to update roles';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async impersonateUser(userId: string) {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.post(`/admin/users/${userId}/impersonate`);
        return response as { token: string; expires_in: number };
      } catch (error) {
        this.error = (error as Error).message || 'Failed to impersonate user';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    reset() {
      this.users = [];
      this.selectedUser = null;
      this.total = 0;
      this.error = null;
      this.loading = false;
    }
  }
});

// Export api for testing
export { api };
