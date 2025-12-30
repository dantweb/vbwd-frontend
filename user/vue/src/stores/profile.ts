import { defineStore } from 'pinia';
import { ApiClient } from '@vbwd/view-component';

export interface Profile {
  id: string;
  name: string;
  email: string;
}

// Create API client instance
const api = new ApiClient({
  baseURL: import.meta.env.VITE_API_URL || '/api'
});

export const useProfileStore = defineStore('profile', {
  state: () => ({
    profile: null as Profile | null,
    loading: false,
    error: null as string | null
  }),

  actions: {
    async fetchProfile() {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.get('/user/profile');
        this.profile = response as Profile;
        return response;
      } catch (error) {
        this.error = (error as Error).message || 'Failed to fetch profile';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateProfile(data: Partial<Profile>) {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.put('/user/details', data);
        this.profile = response as Profile;
        return response;
      } catch (error) {
        this.error = (error as Error).message || 'Failed to update profile';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async changePassword(currentPassword: string, newPassword: string) {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.post('/user/change-password', {
          currentPassword,
          newPassword
        });
        return response as { success: boolean };
      } catch (error) {
        this.error = (error as Error).message || 'Failed to change password';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    reset() {
      this.profile = null;
      this.error = null;
      this.loading = false;
    }
  }
});

// Export api for testing
export { api };
