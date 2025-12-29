/**
 * Auth store for authentication state management.
 *
 * This is a minimal store interface that apps should extend
 * with their specific authentication implementation.
 */
import { ref, computed } from 'vue';

export interface AuthUser {
  id: string;
  email: string;
  roles: string[];
  permissions?: string[];
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
}

// Reactive state
const user = ref<AuthUser | null>(null);
const token = ref<string | null>(null);

/**
 * Auth store composable.
 *
 * Provides authentication state and methods.
 * Apps should call setUser/setToken after successful login.
 */
export function useAuthStore() {
  const isAuthenticated = computed(() => !!token.value && !!user.value);

  const hasRole = (role: string): boolean => {
    return user.value?.roles.includes(role) ?? false;
  };

  const hasAnyRole = (roles: string[]): boolean => {
    if (!user.value?.roles) return false;
    return roles.some(role => user.value!.roles.includes(role));
  };

  const hasPermission = (permission: string): boolean => {
    return user.value?.permissions?.includes(permission) ?? false;
  };

  const setUser = (newUser: AuthUser | null) => {
    user.value = newUser;
  };

  const setToken = (newToken: string | null) => {
    token.value = newToken;
  };

  const logout = () => {
    user.value = null;
    token.value = null;
  };

  return {
    // State
    user: computed(() => user.value),
    token: computed(() => token.value),
    isAuthenticated,

    // Getters
    hasRole,
    hasAnyRole,
    hasPermission,

    // Actions
    setUser,
    setToken,
    logout,
  };
}

// Export type for use in other modules
export type AuthStore = ReturnType<typeof useAuthStore>;
