import { config } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { createPinia } from 'pinia'
import en from '../src/i18n/locales/en.json'

// Create i18n instance for tests
const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: { en }
})

// Create Pinia instance for tests
const pinia = createPinia()

// Configure vue-test-utils to use i18n and pinia globally
config.global.plugins = [i18n, pinia]
