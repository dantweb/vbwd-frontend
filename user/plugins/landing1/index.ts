import type { IPlugin, IPlatformSDK } from '@vbwd/view-component';
import en from './locales/en.json';
import de from './locales/de.json';

export const landing1Plugin: IPlugin = {
  name: 'landing1',
  version: '1.0.0',
  description: 'Public landing page with tariff plan selection',
  _active: false,

  install(sdk: IPlatformSDK) {
    sdk.addRoute({
      path: '/landing1',
      name: 'landing1',
      component: () => import('./Landing1View.vue') as Promise<{ default: unknown }>,
      meta: { requiresAuth: false }
    });

    sdk.addRoute({
      path: '/embed/landing1',
      name: 'landing1-embed',
      component: () => import('./EmbedLanding1View.vue') as Promise<{ default: unknown }>,
      meta: { requiresAuth: false, embed: true }
    });

    sdk.addTranslations('en', en);
    sdk.addTranslations('de', de);
  },

  activate(): void {
    (this as IPlugin & { _active: boolean })._active = true;
  },

  deactivate(): void {
    (this as IPlugin & { _active: boolean })._active = false;
  }
} as IPlugin & { _active: boolean };
