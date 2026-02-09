import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { initializeApi } from '@/api';
import i18n, { initLocale } from '@/i18n';
import { PluginRegistry, PlatformSDK } from '@vbwd/view-component';
import { landing1Plugin } from '../plugins/landing1';
import { checkoutPlugin } from '../plugins/checkout';

// Initialize API with stored auth token before mounting app
initializeApi();

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(i18n);

// Initialize locale from stored preference
initLocale();

// Bootstrap plugins then mount
(async () => {
  try {
    const registry = new PluginRegistry();
    const sdk = new PlatformSDK();

    registry.register(landing1Plugin);
    registry.register(checkoutPlugin);

    await registry.installAll(sdk);

    // Inject plugin routes into the router
    for (const route of sdk.getRoutes()) {
      router.addRoute(route as Parameters<typeof router.addRoute>[0]);
    }

    // Activate all plugins
    for (const plugin of registry.getAll()) {
      await registry.activate(plugin.name);
    }

    // Re-resolve current URL so dynamically added routes are matched
    await router.replace(location.pathname + location.search + location.hash);
  } catch (err) {
    console.error('[VBWD] Plugin bootstrap failed:', err);
  }

  app.mount('#app');
})();
