import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { initializeApi } from '@/api';
import i18n, { initLocale } from '@/i18n';
import { PluginRegistry, PlatformSDK } from '@vbwd/view-component';
import { landing1Plugin } from '../../plugins/landing1';
import { checkoutPlugin } from '../../plugins/checkout';
import { stripePaymentPlugin } from '../../plugins/stripe-payment';
import type { IPlugin } from '@vbwd/view-component';

// Initialize API with stored auth token before mounting app
initializeApi();

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(i18n);

// Initialize locale from stored preference
initLocale();

// All available plugins (code is always bundled, routes are conditional)
const availablePlugins: Record<string, IPlugin> = {
  landing1: landing1Plugin,
  checkout: checkoutPlugin,
  'stripe-payment': stripePaymentPlugin,
};

async function fetchPluginRegistry(): Promise<Record<string, { enabled: boolean }>> {
  try {
    const response = await fetch('/plugin-registry.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return (data.plugins || {}) as Record<string, { enabled: boolean }>;
  } catch (err) {
    console.warn('[VBWD] Could not fetch plugin registry, using defaults:', err);
    // Fallback: enable all plugins if registry is unavailable
    return Object.fromEntries(
      Object.keys(availablePlugins).map(name => [name, { enabled: true }])
    );
  }
}

// Bootstrap plugins then mount
(async () => {
  try {
    const registry = new PluginRegistry();
    const sdk = new PlatformSDK();

    // Fetch plugin status at runtime (not build time)
    const enabledPlugins = await fetchPluginRegistry();

    // Only register and install plugins that are enabled
    for (const [name, entry] of Object.entries(enabledPlugins)) {
      if (entry.enabled && availablePlugins[name]) {
        registry.register(availablePlugins[name]);
      }
    }

    await registry.installAll(sdk);

    // Inject plugin routes into the router (only enabled plugins' routes)
    for (const route of sdk.getRoutes()) {
      router.addRoute(route as Parameters<typeof router.addRoute>[0]);
    }

    // Add catch-all 404 AFTER plugin routes so dynamic routes are matched first
    router.addRoute({
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('./views/NotFound.vue'),
      meta: { requiresAuth: false }
    });

    // Activate all registered plugins (they're all enabled)
    for (const [name, entry] of Object.entries(enabledPlugins)) {
      if (entry.enabled && availablePlugins[name]) {
        await registry.activate(name);
      }
    }

    // Make available via provide/inject
    app.provide('pluginRegistry', registry);
    app.provide('platformSDK', sdk);

    // Re-resolve current URL so dynamically added routes are matched
    await router.replace(location.pathname + location.search + location.hash);
  } catch (err) {
    console.error('[VBWD] Plugin bootstrap failed:', err);
  }

  app.mount('#app');
})();
