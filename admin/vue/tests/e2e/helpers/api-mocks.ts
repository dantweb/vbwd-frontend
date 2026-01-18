/**
 * API Mock helpers for E2E tests
 */
import { Page } from '@playwright/test';

// ============================================
// MOCK DATA
// ============================================

export const mockUsers = [
  { id: '1', email: 'user1@test.com', name: 'User One', is_active: true, roles: ['user'], created_at: '2024-01-01' },
  { id: '2', email: 'user2@test.com', name: 'User Two', is_active: true, roles: ['user'], created_at: '2024-01-02' },
  { id: '3', email: 'suspended@test.com', name: 'Suspended User', is_active: false, roles: ['user'], created_at: '2024-01-03' },
  { id: '4', email: 'admin@test.com', name: 'Admin User', is_active: true, roles: ['admin'], created_at: '2024-01-04' },
  { id: '5', email: 'vendor@test.com', name: 'Vendor User', is_active: true, roles: ['vendor'], created_at: '2024-01-05' },
];

export const mockUserDetails = {
  id: '1',
  email: 'user1@test.com',
  name: 'User One',
  is_active: true,
  roles: ['user'],
  created_at: '2024-01-01',
  stats: {
    total_subscriptions: 3,
    active_subscriptions: 1,
    total_invoices: 12,
    total_spent: 1250.00
  }
};

export const mockPlans = [
  { id: '1', name: 'Free', price: 0, billing_period: 'monthly', status: 'active', features: ['Basic support'] },
  { id: '2', name: 'Pro', price: 29.99, billing_period: 'monthly', status: 'active', features: ['Priority support', 'Advanced features'] },
  { id: '3', name: 'Enterprise', price: 99.99, billing_period: 'monthly', status: 'active', features: ['24/7 support', 'Custom integrations', 'SLA'] },
  { id: '4', name: 'Legacy', price: 19.99, billing_period: 'monthly', status: 'archived', features: ['Basic features'] },
];

export const mockSubscriptions = [
  { id: '1', user_id: '1', user_email: 'user1@test.com', plan_name: 'Pro', status: 'active', start_date: '2024-01-01', end_date: '2024-12-31' },
  { id: '2', user_id: '2', user_email: 'user2@test.com', plan_name: 'Free', status: 'active', start_date: '2024-02-01', end_date: null },
  { id: '3', user_id: '3', user_email: 'user3@test.com', plan_name: 'Pro', status: 'cancelled', start_date: '2024-01-15', end_date: '2024-06-15' },
  { id: '4', user_id: '4', user_email: 'user4@test.com', plan_name: 'Enterprise', status: 'trial', start_date: '2024-03-01', end_date: '2024-03-14' },
  { id: '5', user_id: '5', user_email: 'user5@test.com', plan_name: 'Pro', status: 'expired', start_date: '2023-01-01', end_date: '2023-12-31' },
];

export const mockSubscriptionDetails = {
  id: '1',
  user_id: '1',
  user_email: 'user1@test.com',
  user_name: 'User One',
  plan_name: 'Pro',
  plan_price: 29.99,
  status: 'active',
  start_date: '2024-01-01',
  end_date: '2024-12-31',
  billing_period: 'monthly',
  payments: [
    { id: '1', date: '2024-01-01', amount: 29.99, status: 'paid' },
    { id: '2', date: '2024-02-01', amount: 29.99, status: 'paid' },
    { id: '3', date: '2024-03-01', amount: 29.99, status: 'paid' },
  ]
};

export const mockInvoices = [
  { id: 'INV-001', user_email: 'user1@test.com', amount: 29.99, status: 'paid', date: '2024-01-01' },
  { id: 'INV-002', user_email: 'user2@test.com', amount: 99.99, status: 'paid', date: '2024-01-15' },
  { id: 'INV-003', user_email: 'user3@test.com', amount: 29.99, status: 'pending', date: '2024-02-01' },
  { id: 'INV-004', user_email: 'user4@test.com', amount: 29.99, status: 'failed', date: '2024-02-15' },
  { id: 'INV-005', user_email: 'user5@test.com', amount: 199.99, status: 'refunded', date: '2024-03-01' },
];

export const mockInvoiceDetails = {
  id: 'INV-001',
  user_email: 'user1@test.com',
  user_name: 'User One',
  amount: 29.99,
  status: 'paid',
  date: '2024-01-01',
  due_date: '2024-01-15',
  paid_date: '2024-01-10',
  billing_address: {
    street: '123 Main St',
    city: 'New York',
    state: 'NY',
    zip: '10001',
    country: 'USA'
  },
  line_items: [
    { description: 'Pro Plan - Monthly', quantity: 1, unit_price: 29.99, total: 29.99 }
  ]
};

export const mockWebhooks = [
  { id: '1', url: 'https://example.com/webhook1', events: ['subscription.created'], status: 'active', created_at: '2024-01-01' },
  { id: '2', url: 'https://example.com/webhook2', events: ['invoice.paid', 'invoice.failed'], status: 'active', created_at: '2024-01-15' },
  { id: '3', url: 'https://test.com/webhook', events: ['user.created'], status: 'disabled', created_at: '2024-02-01' },
];

export const mockWebhookDetails = {
  id: '1',
  url: 'https://example.com/webhook1',
  events: ['subscription.created', 'subscription.cancelled'],
  status: 'active',
  secret: 'whsec_xxxxx',
  created_at: '2024-01-01',
  deliveries: [
    { id: '1', event: 'subscription.created', status: 'success', timestamp: '2024-03-01T10:00:00Z', response_code: 200 },
    { id: '2', event: 'subscription.created', status: 'success', timestamp: '2024-03-02T14:30:00Z', response_code: 200 },
    { id: '3', event: 'subscription.cancelled', status: 'failed', timestamp: '2024-03-03T09:15:00Z', response_code: 500 },
  ]
};

export const mockAnalytics = {
  kpis: {
    mrr: 12500.00,
    mrr_change: 5.2,
    total_revenue: 150000.00,
    revenue_change: 8.5,
    total_users: 1250,
    users_change: 12.3,
    churn_rate: 2.5,
    churn_change: -0.3,
    conversion_rate: 15.8,
    conversion_change: 1.2,
    arpu: 45.50,
    arpu_change: 3.1
  },
  plan_distribution: [
    { name: 'Free', count: 500, percentage: 40 },
    { name: 'Pro', count: 600, percentage: 48 },
    { name: 'Enterprise', count: 150, percentage: 12 }
  ],
  recent_activity: [
    { type: 'subscription', description: 'New Pro subscription', user: 'user@test.com', timestamp: '2024-03-01T10:00:00Z' },
    { type: 'payment', description: 'Payment received $29.99', user: 'user2@test.com', timestamp: '2024-03-01T09:30:00Z' },
    { type: 'user', description: 'New user registered', user: 'newuser@test.com', timestamp: '2024-03-01T09:00:00Z' },
  ]
};

export const mockSettings = {
  company: {
    name: 'VBWD Inc.',
    email: 'admin@vbwd.com',
    address: '123 Business St, Tech City, TC 12345'
  },
  billing: {
    currency: 'USD',
    tax_rate: 10,
    invoice_prefix: 'INV'
  },
  notifications: {
    email_new_user: true,
    email_new_subscription: true,
    email_payment_failed: true,
    email_subscription_cancelled: false
  }
};

export const mockTokenBundles = [
  { id: '1', name: 'Starter Pack', token_amount: 100, price: '9.99', currency: 'USD', is_active: true, description: 'Perfect for trying out', created_at: '2024-01-01' },
  { id: '2', name: 'Pro Pack', token_amount: 500, price: '39.99', currency: 'USD', is_active: true, description: 'Most popular choice', created_at: '2024-01-02' },
  { id: '3', name: 'Enterprise Pack', token_amount: 2000, price: '99.99', currency: 'USD', is_active: true, description: 'Best value for power users', created_at: '2024-01-03' },
  { id: '4', name: 'Legacy Pack', token_amount: 50, price: '4.99', currency: 'USD', is_active: false, description: 'Discontinued', created_at: '2024-01-04' },
];

export const mockAddons = [
  { id: '1', name: 'Priority Support', slug: 'priority-support', price: '19.99', currency: 'EUR', billing_period: 'monthly', is_active: true, description: '24/7 priority support', config: {}, sort_order: 0, created_at: '2024-01-01' },
  { id: '2', name: 'Custom Domain', slug: 'custom-domain', price: '9.99', currency: 'EUR', billing_period: 'monthly', is_active: true, description: 'Use your own domain', config: {}, sort_order: 1, created_at: '2024-01-02' },
  { id: '3', name: 'Extra Storage', slug: 'extra-storage', price: '29.99', currency: 'EUR', billing_period: 'one_time', is_active: true, description: '100GB additional storage', config: { storage_gb: 100 }, sort_order: 2, created_at: '2024-01-03' },
  { id: '4', name: 'Legacy Addon', slug: 'legacy-addon', price: '4.99', currency: 'EUR', billing_period: 'monthly', is_active: false, description: 'Discontinued addon', config: {}, sort_order: 99, created_at: '2024-01-04' },
];

// ============================================
// MOCK SETUP FUNCTIONS
// ============================================

export async function mockUsersAPI(page: Page): Promise<void> {
  await page.route('**/api/v1/admin/users', async (route) => {
    const url = new URL(route.request().url());
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || '';

    let filtered = [...mockUsers];
    if (search) {
      filtered = filtered.filter(u => u.email.includes(search) || u.name.includes(search));
    }
    if (status) {
      // Map status filter to is_active boolean
      const isActive = status === 'active';
      filtered = filtered.filter(u => u.is_active === isActive);
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ users: filtered, total: filtered.length })
    });
  });

  await page.route('**/api/v1/admin/users/*', async (route) => {
    const method = route.request().method();
    const url = route.request().url();

    // Skip routes that end with /edit or /roles as they are handled elsewhere
    if (url.endsWith('/edit') || url.endsWith('/roles')) {
      await route.continue();
      return;
    }

    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: mockUserDetails })
      });
    } else if (method === 'PUT') {
      const body = JSON.parse(route.request().postData() || '{}');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: { ...mockUserDetails, ...body } })
      });
    }
  });
}

export async function mockPlansAPI(page: Page): Promise<void> {
  await page.route('**/api/v1/admin/tarif-plans', async (route) => {
    const method = route.request().method();

    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ plans: mockPlans, total: mockPlans.length })
      });
    } else if (method === 'POST') {
      const body = JSON.parse(route.request().postData() || '{}');
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ id: '5', ...body })
      });
    }
  });

  await page.route('**/api/v1/admin/tarif-plans/*', async (route) => {
    const method = route.request().method();
    const id = route.request().url().split('/').pop();
    const plan = mockPlans.find(p => p.id === id) || mockPlans[0];

    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(plan)
      });
    } else if (method === 'PUT') {
      const body = JSON.parse(route.request().postData() || '{}');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ...plan, ...body })
      });
    }
  });
}

export async function mockSubscriptionsAPI(page: Page): Promise<void> {
  await page.route('**/api/v1/admin/subscriptions', async (route) => {
    const url = new URL(route.request().url());
    const status = url.searchParams.get('status') || '';

    let filtered = [...mockSubscriptions];
    if (status) {
      filtered = filtered.filter(s => s.status === status);
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ subscriptions: filtered, total: filtered.length })
    });
  });

  await page.route('**/api/v1/admin/subscriptions/*', async (route) => {
    const method = route.request().method();

    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockSubscriptionDetails)
      });
    } else if (method === 'PUT') {
      const body = JSON.parse(route.request().postData() || '{}');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ...mockSubscriptionDetails, ...body })
      });
    }
  });
}

export async function mockInvoicesAPI(page: Page): Promise<void> {
  await page.route('**/api/v1/admin/invoices', async (route) => {
    const url = new URL(route.request().url());
    const status = url.searchParams.get('status') || '';

    let filtered = [...mockInvoices];
    if (status) {
      filtered = filtered.filter(i => i.status === status);
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ invoices: filtered, total: filtered.length })
    });
  });

  await page.route('**/api/v1/admin/invoices/*', async (route) => {
    const method = route.request().method();

    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockInvoiceDetails)
      });
    } else if (method === 'POST') {
      // Resend or void action
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      });
    }
  });
}

export async function mockWebhooksAPI(page: Page): Promise<void> {
  await page.route('**/api/v1/admin/webhooks', async (route) => {
    const method = route.request().method();

    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ webhooks: mockWebhooks, total: mockWebhooks.length })
      });
    } else if (method === 'POST') {
      const body = JSON.parse(route.request().postData() || '{}');
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ id: '4', ...body })
      });
    }
  });

  await page.route('**/api/v1/admin/webhooks/*', async (route) => {
    const method = route.request().method();

    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockWebhookDetails)
      });
    } else if (method === 'PUT') {
      const body = JSON.parse(route.request().postData() || '{}');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ...mockWebhookDetails, ...body })
      });
    } else if (method === 'DELETE') {
      await route.fulfill({
        status: 204,
        body: ''
      });
    }
  });

  // Webhook test endpoint
  await page.route('**/api/v1/admin/webhooks/*/test', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, response_code: 200 })
    });
  });
}

export async function mockAnalyticsAPI(page: Page): Promise<void> {
  await page.route('**/api/v1/admin/analytics**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockAnalytics)
    });
  });
}

export async function mockSettingsAPI(page: Page): Promise<void> {
  await page.route('**/api/v1/admin/settings', async (route) => {
    const method = route.request().method();

    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockSettings)
      });
    } else if (method === 'PUT') {
      const body = JSON.parse(route.request().postData() || '{}');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ...mockSettings, ...body })
      });
    }
  });
}

export async function mockTokenBundlesAPI(page: Page): Promise<void> {
  await page.route('**/api/v1/admin/token-bundles', async (route) => {
    const method = route.request().method();
    const url = new URL(route.request().url());
    const includeInactive = url.searchParams.get('include_inactive') !== 'false';

    if (method === 'GET') {
      let filtered = [...mockTokenBundles];
      if (!includeInactive) {
        filtered = filtered.filter(b => b.is_active);
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: filtered,
          total: filtered.length,
          page: 1,
          per_page: 20,
          pages: 1
        })
      });
    } else if (method === 'POST') {
      const body = JSON.parse(route.request().postData() || '{}');
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          bundle: { id: '5', ...body, is_active: true },
          message: 'Token bundle created successfully'
        })
      });
    }
  });

  await page.route('**/api/v1/admin/token-bundles/*', async (route) => {
    const method = route.request().method();
    const url = route.request().url();
    const id = url.split('/').pop()?.split('?')[0];
    const bundle = mockTokenBundles.find(b => b.id === id) || mockTokenBundles[0];

    if (url.includes('/activate')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ bundle: { ...bundle, is_active: true }, message: 'Token bundle activated' })
      });
    } else if (url.includes('/deactivate')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ bundle: { ...bundle, is_active: false }, message: 'Token bundle deactivated' })
      });
    } else if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ bundle })
      });
    } else if (method === 'PUT') {
      const body = JSON.parse(route.request().postData() || '{}');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ bundle: { ...bundle, ...body } })
      });
    } else if (method === 'DELETE') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Token bundle deleted successfully' })
      });
    }
  });
}

export async function mockAddonsAPI(page: Page): Promise<void> {
  await page.route('**/api/v1/admin/addons', async (route) => {
    const method = route.request().method();
    const url = new URL(route.request().url());
    const includeInactive = url.searchParams.get('include_inactive') !== 'false';

    if (method === 'GET') {
      let filtered = [...mockAddons];
      if (!includeInactive) {
        filtered = filtered.filter(a => a.is_active);
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: filtered,
          total: filtered.length,
          page: 1,
          per_page: 20,
          pages: 1
        })
      });
    } else if (method === 'POST') {
      const body = JSON.parse(route.request().postData() || '{}');
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          addon: { id: '5', ...body, is_active: true },
          message: 'Add-on created successfully'
        })
      });
    }
  });

  await page.route('**/api/v1/admin/addons/*', async (route) => {
    const method = route.request().method();
    const url = route.request().url();
    const id = url.split('/').pop()?.split('?')[0];
    const addon = mockAddons.find(a => a.id === id) || mockAddons[0];

    if (url.includes('/activate')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ addon: { ...addon, is_active: true }, message: 'Add-on activated' })
      });
    } else if (url.includes('/deactivate')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ addon: { ...addon, is_active: false }, message: 'Add-on deactivated' })
      });
    } else if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ addon })
      });
    } else if (method === 'PUT') {
      const body = JSON.parse(route.request().postData() || '{}');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ addon: { ...addon, ...body } })
      });
    } else if (method === 'DELETE') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Add-on deleted successfully' })
      });
    }
  });

  // Public addons endpoint
  await page.route('**/api/v1/addons', async (route) => {
    const activeAddons = mockAddons.filter(a => a.is_active);
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ addons: activeAddons })
    });
  });
}

/**
 * Set up all admin API mocks
 */
export async function mockAllAdminAPIs(page: Page): Promise<void> {
  await mockUsersAPI(page);
  await mockPlansAPI(page);
  await mockSubscriptionsAPI(page);
  await mockInvoicesAPI(page);
  await mockWebhooksAPI(page);
  await mockAnalyticsAPI(page);
  await mockSettingsAPI(page);
  await mockTokenBundlesAPI(page);
  await mockAddonsAPI(page);
}
