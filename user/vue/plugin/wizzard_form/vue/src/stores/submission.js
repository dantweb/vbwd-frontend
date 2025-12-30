import { defineStore } from 'pinia'
import { ApiClient } from '@vbwd/view-component'

// Create API client instance
const api = new ApiClient({
  baseURL: import.meta.env.VITE_API_URL || '/api'
})

export const useSubmissionStore = defineStore('submission', {
  state: () => ({
    submissionId: null,
    status: null,
    error: null,
    loading: false
  }),

  actions: {
    async submit(data) {
      this.loading = true
      this.error = null

      try {
        const response = await api.post('/user/submit', data)
        this.submissionId = response.submission_id
        this.status = 'submitted'
        return response
      } catch (error) {
        this.error = error.message || 'Submission failed'
        throw error
      } finally {
        this.loading = false
      }
    },

    async getStatus() {
      if (!this.submissionId) return

      try {
        const response = await api.get(`/user/status/${this.submissionId}`)
        this.status = response.status
        return response
      } catch (error) {
        this.error = error.message
        throw error
      }
    },

    reset() {
      this.submissionId = null
      this.status = null
      this.error = null
      this.loading = false
    }
  }
})

// Export api for testing
export { api }
