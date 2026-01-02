import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import AdminLayout from '@/layouts/AdminLayout.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/admin/login',
    name: 'login',
    component: () => import('@/views/Login.vue'),
    meta: { public: true }
  },
  {
    path: '/admin/forbidden',
    name: 'forbidden',
    component: () => import('@/views/Forbidden.vue'),
    meta: { public: true }
  },
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/admin/dashboard'
      },
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('@/views/Dashboard.vue')
      },
      {
        path: 'users',
        name: 'users',
        component: () => import('@/views/Users.vue')
      },
      {
        path: 'users/:id',
        name: 'user-details',
        component: () => import('@/views/UserDetails.vue')
      },
      {
        path: 'plans',
        name: 'plans',
        component: () => import('@/views/Plans.vue')
      },
      {
        path: 'plans/new',
        name: 'plan-new',
        component: () => import('@/views/PlanForm.vue')
      },
      {
        path: 'plans/:id/edit',
        name: 'plan-edit',
        component: () => import('@/views/PlanForm.vue')
      },
      {
        path: 'subscriptions',
        name: 'subscriptions',
        component: () => import('@/views/Subscriptions.vue')
      },
      {
        path: 'subscriptions/:id',
        name: 'subscription-details',
        component: () => import('@/views/SubscriptionDetails.vue')
      },
      {
        path: 'invoices',
        name: 'invoices',
        component: () => import('@/views/Invoices.vue')
      },
      {
        path: 'invoices/:id',
        name: 'invoice-details',
        component: () => import('@/views/InvoiceDetails.vue')
      },
      {
        path: 'analytics',
        name: 'analytics',
        component: () => import('@/views/Analytics.vue')
      },
      {
        path: 'webhooks',
        name: 'webhooks',
        component: () => import('@/views/Webhooks.vue')
      },
      {
        path: 'webhooks/:id',
        name: 'webhook-details',
        component: () => import('@/views/WebhookDetails.vue')
      },
      {
        path: 'settings',
        name: 'settings',
        component: () => import('@/views/Settings.vue')
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Navigation guard
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore();

  // Public routes don't require authentication
  if (to.meta.public) {
    // Redirect to dashboard if already authenticated and trying to access login
    if (to.name === 'login' && authStore.isAuthenticated) {
      next({ name: 'dashboard' });
    } else {
      next();
    }
    return;
  }

  // Protected routes require authentication
  if (!authStore.isAuthenticated) {
    next({ name: 'login' });
    return;
  }

  next();
});

export default router;
