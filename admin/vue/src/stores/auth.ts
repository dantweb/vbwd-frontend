import { defineStore } from 'pinia';
import { api, initializeApi, clearApiAuth } from '@/api';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  roles: string[];
}

export interface LoginResponse {
  token: string;
  user: AdminUser;
}

export interface AuthState {
  token: string | null;
  user: AdminUser | null;
  error: string | null;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: localStorage.getItem('admin_token'),
    user: null,
    error: null
  }),

  getters: {
    isAuthenticated: (state): boolean => !!state.token,
    isAdmin: (state): boolean => state.user?.roles?.includes('admin') ?? false
  },

  actions: {
    async login(email: string, password: string): Promise<LoginResponse> {
      this.error = null;

      try {
        const response = await api.post('/auth/login', { email, password }) as LoginResponse;
        this.token = response.token;
        this.user = response.user;

        // Set token in API client for future requests
        api.setToken(this.token);

        // Persist token
        localStorage.setItem('admin_token', this.token);

        return response;
      } catch (error) {
        this.error = (error as Error).message || 'Login failed';
        throw error;
      }
    },

    logout(): void {
      this.token = null;
      this.user = null;
      this.error = null;
      clearApiAuth();
    },

    initAuth(): void {
      initializeApi();
      this.token = localStorage.getItem('admin_token');
    }
  }
});
