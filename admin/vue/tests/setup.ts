import { config } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import en from '../src/i18n/locales/en.json'

// Create i18n instance for tests
const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: { en }
})

// Configure vue-test-utils to use i18n globally
config.global.plugins = [i18n]
