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
import type { IPlugin } from '@vbwd/view-component';
import { getEnabledPlugins, getAdminExtensions } from '@/utils/pluginLoader';
import i18n, { initLocale, setLocale, type LocaleCode, availableLocales } from '@/i18n';
import { extensionRegistry } from '@/plugins/extensionRegistry';

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

(async () => {
  // Get enabled plugins based on plugins.json configuration
  let plugins: IPlugin[] = [];
  try {
    plugins = await getEnabledPlugins();
    console.log(`[Admin] Using ${plugins.length} enabled plugin(s)`);
  } catch (error) {
    console.error('[Admin] Failed to load plugins, continuing without plugins:', error);
  }

  // Register all loaded plugins
  for (const plugin of plugins) {
    registry.register(plugin);
  }

  // Install all registered plugins
  await registry.installAll(sdk);

  // Activate all loaded plugins
  for (const plugin of plugins) {
    await registry.activate(plugin.name);
  }

  // Register admin extensions from enabled plugins
  try {
    const adminExtensions = await getAdminExtensions();
    for (const [pluginName, extension] of Object.entries(adminExtensions)) {
      extensionRegistry.register(pluginName, extension);
      console.log(`[Admin] Registered extension for plugin: ${pluginName}`);
    }
  } catch (error) {
    console.error('[Admin] Failed to load admin extensions:', error);
  }

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
