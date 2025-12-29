import { defineStore } from 'pinia'
import { ApiClient } from '@vbwd/core-sdk'

// Create API client instance
const api = new ApiClient({
  baseURL: import.meta.env.VITE_API_URL || '/api'
})

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('admin_token') || null,
    user: null,
    error: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.token
  },

  actions: {
    async login(email, password) {
      this.error = null

      try {
        const response = await api.post('/auth/login', { email, password })
        this.token = response.token
        this.user = response.user

        // Set token in API client for future requests
        api.setToken(this.token)

        // Persist token
        localStorage.setItem('admin_token', this.token)

        return response
      } catch (error) {
        this.error = error.message || 'Login failed'
        throw error
      }
    },

    logout() {
      this.token = null
      this.user = null
      this.error = null
      api.clearToken()
      localStorage.removeItem('admin_token')
    },

    initAuth() {
      const token = localStorage.getItem('admin_token')
      if (token) {
        this.token = token
        api.setToken(token)
      }
    }
  }
})

// Export api for testing
export { api }
