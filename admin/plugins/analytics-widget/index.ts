import type { IPlugin, IPlatformSDK } from '@vbwd/view-component'

/**
 * Analytics Widget Plugin
 * Adds an "Active Sessions" widget to the admin dashboard.
 * Sprint 05 — minimal plugin system validation.
 */
export const analyticsWidgetPlugin: IPlugin = {
  name: 'analytics-widget',
  version: '1.0.0',
  description: 'Displays active sessions count on the dashboard',

  _active: false,

  install(sdk: IPlatformSDK): void {
    sdk.addComponent('AnalyticsWidget', () => import('./AnalyticsWidget.vue') as Promise<{ default: unknown }>)
  },

  activate(): void {
    (this as IPlugin & { _active: boolean })._active = true
  },

  deactivate(): void {
    (this as IPlugin & { _active: boolean })._active = false
  }
} as IPlugin & { _active: boolean }
