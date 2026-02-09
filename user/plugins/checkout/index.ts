import type { IPlugin, IPlatformSDK } from '@vbwd/view-component';

export const checkoutPlugin: IPlugin = {
  name: 'checkout-public',
  version: '1.0.0',
  description: 'Public checkout page for anonymous and authenticated users',
  install(sdk: IPlatformSDK) {
    sdk.addRoute({
      path: '/checkout',
      name: 'checkout-public',
      component: () => import('./PublicCheckoutView.vue') as Promise<{ default: unknown }>,
      meta: { requiresAuth: false }
    });
  }
};
