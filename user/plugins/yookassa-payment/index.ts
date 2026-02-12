import type { IPlugin, IPlatformSDK } from '@vbwd/view-component';

export const yookassaPaymentPlugin: IPlugin = {
  name: 'yookassa-payment',
  version: '1.0.0',
  description: 'YooKassa payment processing — redirects to YooKassa Checkout',
  _active: false,

  install(sdk: IPlatformSDK) {
    sdk.addRoute({
      path: '/pay/yookassa',
      name: 'yookassa-payment',
      component: () => import('./YooKassaPaymentView.vue'),
      meta: { requiresAuth: true }
    });
    sdk.addRoute({
      path: '/pay/yookassa/success',
      name: 'yookassa-success',
      component: () => import('./YooKassaSuccessView.vue'),
      meta: { requiresAuth: true }
    });
    sdk.addRoute({
      path: '/pay/yookassa/cancel',
      name: 'yookassa-cancel',
      component: () => import('./YooKassaCancelView.vue'),
      meta: { requiresAuth: true }
    });
  },

  activate() { this._active = true; },
  deactivate() { this._active = false; }
};
