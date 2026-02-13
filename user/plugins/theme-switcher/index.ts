import type { IPlugin, IPlatformSDK } from '@vbwd/view-component';
import { themePresets } from './presets';
import { applyTheme } from './apply-theme';
import en from './locales/en.json';
import de from './locales/de.json';

const STORAGE_KEY = 'vbwd_theme';

export const themeSwitcherPlugin: IPlugin = {
  name: 'theme-switcher',
  version: '1.0.0',
  description: 'Dashboard color theme selector with preset themes',
  _active: false,

  install(sdk: IPlatformSDK) {
    sdk.addRoute({
      path: '/dashboard/appearance',
      name: 'appearance',
      component: () => import('./ThemeSelectorView.vue') as Promise<{ default: unknown }>,
      meta: { requiresAuth: true }
    });

    sdk.addTranslations('en', en);
    sdk.addTranslations('de', de);
  },

  activate() {
    this._active = true;
    const savedThemeId = localStorage.getItem(STORAGE_KEY) || 'default';
    const preset = themePresets.find(p => p.id === savedThemeId);
    if (preset) {
      applyTheme(preset);
    }
  },

  deactivate() {
    this._active = false;
    const defaultPreset = themePresets.find(p => p.id === 'default');
    if (defaultPreset) {
      applyTheme(defaultPreset);
    }
  }
};
