import { type IPlugin, type IPlatformSDK } from '@vbwd/view-component';
import en from './locales/en.json';
import de from './locales/de.json';

/**
 * Taro Plugin - Tarot card reading with LLM interpretations
 */
export const taroPlugin: IPlugin = {
  name: 'taro',
  version: '1.0.0',
  description: 'Tarot card reading with AI-powered interpretations',
  _active: false,

  install(sdk: IPlatformSDK) {
    // Add Taro route
    sdk.addRoute({
      path: '/dashboard/taro',
      name: 'taro',
      component: () => import('./src/Taro.vue'),
      meta: { requiresAuth: true },
    });

    // Add translations
    sdk.addTranslations('en', en);
    sdk.addTranslations('de', de);
  },

  activate() {
    console.log('Taro plugin activated');
  },

  deactivate() {
    console.log('Taro plugin deactivated');
  },
};
