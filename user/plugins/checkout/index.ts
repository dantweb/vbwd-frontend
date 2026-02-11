import type { IPlugin, IPlatformSDK } from '@vbwd/view-component';

export const checkoutPlugin: IPlugin = {
  name: 'checkout',
  version: '1.0.0',
  description: 'Public checkout page for anonymous and authenticated users',
  _active: false,

  install(sdk: IPlatformSDK) {
    sdk.addRoute({
      path: '/checkout',
      name: 'checkout-public',
      component: () => import('./PublicCheckoutView.vue') as Promise<{ default: unknown }>,
      meta: { requiresAuth: false }
    });
  },

  activate(): void {
    (this as IPlugin & { _active: boolean })._active = true;
  },

  deactivate(): void {
    (this as IPlugin & { _active: boolean })._active = false;
  }
} as IPlugin & { _active: boolean };
