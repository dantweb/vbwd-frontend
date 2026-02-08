import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { isAuthenticated, sessionExpired } from '../api';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('../views/Profile.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/subscription',
    name: 'subscription',
    component: () => import('../views/Subscription.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/invoices',
    name: 'invoices',
    component: () => import('../views/Invoices.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/plans',
    name: 'plans',
    component: () => import('../views/Plans.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/tokens',
    name: 'tokens',
    component: () => import('../views/Tokens.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/add-ons',
    name: 'add-ons',
    component: () => import('../views/AddOns.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/add-ons/:id',
    name: 'addon-detail',
    component: () => import('../views/AddonDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/checkout/cart',
    name: 'checkout-cart',
    component: () => import('../views/Checkout.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/checkout/:planSlug',
    name: 'checkout',
    component: () => import('../views/Checkout.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/invoices/:invoiceId',
    name: 'invoice-detail',
    component: () => import('../views/InvoiceDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/invoices/:invoiceId/pay',
    name: 'invoice-pay',
    component: () => import('../views/InvoicePay.vue'),
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Navigation guard for authentication
router.beforeEach((to, _from, next) => {
  const authenticated = isAuthenticated();

  // If session has expired, redirect to login
  if (sessionExpired.value && to.name !== 'login') {
    next({ name: 'login' });
    return;
  }

  if (to.meta.requiresAuth && !authenticated) {
    // Pass the intended destination as query param for redirect after login
    next({
      name: 'login',
      query: to.fullPath !== '/' ? { redirect: to.fullPath } : undefined
    });
  } else if (to.name === 'login' && authenticated) {
    next({ name: 'dashboard' });
  } else {
    next();
  }
});

export default router;
