import type { IPlugin, IPlatformSDK } from '@vbwd/view-component';
import en from './locales/en.json';
import de from './locales/de.json';

export const chatPlugin: IPlugin = {
  name: 'chat',
  version: '1.0.0',
  description: 'LLM chat with token-based billing',
  _active: false,

  install(sdk: IPlatformSDK) {
    sdk.addRoute({
      path: '/dashboard/chat',
      name: 'chat',
      component: () => import('./src/ChatView.vue') as Promise<{ default: unknown }>,
      meta: { requiresAuth: true },
    });

    sdk.addTranslations('en', en);
    sdk.addTranslations('de', de);
  },

  activate() {
    this._active = true;
  },

  deactivate() {
    this._active = false;
  },
};
