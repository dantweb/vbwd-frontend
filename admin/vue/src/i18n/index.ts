/**
 * Vue i18n configuration
 */
import { createI18n } from 'vue-i18n';
import en from './locales/en.json';
import de from './locales/de.json';
import ru from './locales/ru.json';
import th from './locales/th.json';
import zh from './locales/zh.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import ja from './locales/ja.json';

export type LocaleCode = 'en' | 'de' | 'ru' | 'th' | 'zh' | 'es' | 'fr' | 'ja';

export const availableLocales: LocaleCode[] = ['en', 'de', 'ru', 'th', 'zh', 'es', 'fr', 'ja'];

export const i18n = createI18n({
  legacy: false, // Use Composition API
  locale: 'en', // Default locale
  fallbackLocale: 'en',
  messages: {
    en,
    de,
    ru,
    th,
    zh,
    es,
    fr,
    ja,
  },
});

/**
 * Set the current locale
 */
export function setLocale(locale: LocaleCode): void {
  i18n.global.locale.value = locale;
  // Store in localStorage for persistence
  localStorage.setItem('locale', locale);
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
  const stored = localStorage.getItem('locale') as LocaleCode | null;
  if (stored && availableLocales.includes(stored)) {
    setLocale(stored);
  } else {
    setLocale(defaultLocale);
  }
}

export default i18n;
