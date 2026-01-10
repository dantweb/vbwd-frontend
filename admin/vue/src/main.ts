import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { api } from '@/api';
import {
  configureAuthStore,
  configureEventBus,
  useAuthStore
} from '@vbwd/view-component';
import i18n, { initLocale, setLocale, type LocaleCode, availableLocales } from '@/i18n';

// Configure auth store with admin-specific settings
configureAuthStore({
  storageKey: 'admin_token',
  apiClient: api,
  loginEndpoint: '/auth/login',
  logoutEndpoint: '/auth/logout',
  refreshEndpoint: '/auth/refresh',
  profileEndpoint: '/auth/me',
});

// Configure EventBus for frontend-to-backend event delivery
configureEventBus({
  apiClient: api,
  eventsEndpoint: '/events',
  autoSendToBackend: true,
});

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(i18n);

// Initialize auth state from localStorage
const authStore = useAuthStore();
authStore.initAuth();

// Initialize locale from stored preference
initLocale();

// Load user's language preference from backend if authenticated
async function loadUserLanguagePreference(): Promise<void> {
  if (authStore.isAuthenticated) {
    try {
      const response = await api.get('/admin/profile') as { user: { details?: { config?: { language?: string } } } };
      const language = response.user?.details?.config?.language;
      if (language && availableLocales.includes(language as LocaleCode)) {
        setLocale(language as LocaleCode);
      }
    } catch {
      // Ignore errors - use localStorage preference
    }
  }
}

loadUserLanguagePreference();

app.mount('#app');
