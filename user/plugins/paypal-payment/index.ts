import type { IPlugin, IPlatformSDK } from '@vbwd/view-component';

export const paypalPaymentPlugin: IPlugin = {
  name: 'paypal-payment',
  version: '1.0.0',
  description: 'PayPal payment processing — redirects to PayPal Checkout',
  _active: false,

  install(sdk: IPlatformSDK) {
    sdk.addRoute({
      path: '/pay/paypal',
      name: 'paypal-payment',
      component: () => import('./PayPalPaymentView.vue'),
      meta: { requiresAuth: true }
    });
    sdk.addRoute({
      path: '/pay/paypal/success',
      name: 'paypal-success',
      component: () => import('./PayPalSuccessView.vue'),
      meta: { requiresAuth: true }
    });
    sdk.addRoute({
      path: '/pay/paypal/cancel',
      name: 'paypal-cancel',
      component: () => import('./PayPalCancelView.vue'),
      meta: { requiresAuth: true }
    });
  },

  activate() { this._active = true; },
  deactivate() { this._active = false; }
};
