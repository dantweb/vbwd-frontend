import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { api } from '@/api';
import {
  configureAuthStore,
  configureEventBus,
  useAuthStore,
  PluginRegistry,
  PlatformSDK
} from '@vbwd/view-component';
import { analyticsWidgetPlugin } from '@plugins/analytics-widget';
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

// Initialize plugin system
const registry = new PluginRegistry();
const sdk = new PlatformSDK();

registry.register(analyticsWidgetPlugin);

(async () => {
  await registry.installAll(sdk);
  await registry.activate('analytics-widget');

  // Inject plugin routes into Vue Router
  for (const route of sdk.getRoutes()) {
    router.addRoute('admin', route as unknown as import('vue-router').RouteRecordRaw);
  }

  // Make available via provide/inject
  app.provide('pluginRegistry', registry);
  app.provide('platformSDK', sdk);

  // Initialize auth state from localStorage
  const authStore = useAuthStore();
  authStore.initAuth();

  // Initialize locale from stored preference
  initLocale();

  // Load user's language preference from backend if authenticated
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

  app.mount('#app');
})();
