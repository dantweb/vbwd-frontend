import type { IPlugin, IPlatformSDK } from '@vbwd/view-component';

export const stripePaymentPlugin: IPlugin = {
  name: 'stripe-payment',
  version: '1.0.0',
  description: 'Stripe payment processing — redirects to Stripe Checkout',
  _active: false,

  install(sdk: IPlatformSDK) {
    sdk.addRoute({
      path: '/pay/stripe',
      name: 'stripe-payment',
      component: () => import('./StripePaymentView.vue'),
      meta: { requiresAuth: true }
    });
    sdk.addRoute({
      path: '/pay/stripe/success',
      name: 'stripe-success',
      component: () => import('./StripeSuccessView.vue'),
      meta: { requiresAuth: true }
    });
    sdk.addRoute({
      path: '/pay/stripe/cancel',
      name: 'stripe-cancel',
      component: () => import('./StripeCancelView.vue'),
      meta: { requiresAuth: true }
    });
  },

  activate() { this._active = true; },
  deactivate() { this._active = false; }
};
