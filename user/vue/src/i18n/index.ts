/**
 * Vue i18n configuration for user app
 * Active languages: EN and DE only
 */
import { createI18n } from 'vue-i18n';
import en from './locales/en.json';
import de from './locales/de.json';

export type LocaleCode = 'en' | 'de';

export const availableLocales: LocaleCode[] = ['en', 'de'];

export const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en,
    de,
  },
});

/**
 * Set the current locale
 */
export function setLocale(locale: LocaleCode): void {
  i18n.global.locale.value = locale;
  localStorage.setItem('user_locale', locale);
}

/**
 * Get the current locale
 */
export function getLocale(): LocaleCode {
  return i18n.global.locale.value as LocaleCode;
}

/**
 * Initialize locale from stored preference or default
 */
export function initLocale(defaultLocale: LocaleCode = 'en'): void {
  const stored = localStorage.getItem('user_locale') as LocaleCode | null;
  if (stored && availableLocales.includes(stored)) {
    setLocale(stored);
  } else {
    setLocale(defaultLocale);
  }
}

export default i18n;
