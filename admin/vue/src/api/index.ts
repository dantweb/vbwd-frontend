/**
 * Shared API Client Instance
 *
 * Singleton ApiClient used by all stores and components.
 * This ensures the auth token is shared across the application.
 */
import { ApiClient } from '@vbwd/view-component';

// Singleton API client instance
export const api = new ApiClient({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1'
});

/**
 * Initialize API client with token from localStorage
 * Call this on app startup to restore authentication state
 */
export function initializeApi(): void {
  const token = localStorage.getItem('admin_token');
  if (token) {
    api.setToken(token);
  }
}

/**
 * Clear API authentication
 * Call this on logout to clear the token
 */
export function clearApiAuth(): void {
  api.clearToken();
  localStorage.removeItem('admin_token');
}

// Initialize on module load
initializeApi();
