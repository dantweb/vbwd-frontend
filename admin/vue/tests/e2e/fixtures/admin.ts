/**
 * Shared Playwright fixtures for admin E2E tests
 */
import { test as base, Page } from '@playwright/test';

// Test data types
export interface AdminUser {
  id: string;
  email: string;
  name: string;
  roles: string[];
}

export interface AuthenticatedFixtures {
  authenticatedPage: Page;
  adminUser: AdminUser;
}

// Default admin user for tests
export const defaultAdminUser: AdminUser = {
  id: '1',
  email: 'admin@test.com',
  name: 'Admin User',
  roles: ['admin']
};

/**
 * Extended test fixture with authenticated admin page
 */
export const test = base.extend<AuthenticatedFixtures>({
  // eslint-disable-next-line no-empty-pattern
  adminUser: async ({}, use) => {
    await use(defaultAdminUser);
  },

  authenticatedPage: async ({ page, adminUser }, use) => {
    // Set up authentication state
    await page.addInitScript((user) => {
      localStorage.setItem('admin_token', 'test-admin-token');
      // Store user info for the app
      sessionStorage.setItem('admin_user', JSON.stringify(user));
    }, adminUser);

    // Mock the auth verification endpoint
    await page.route('**/api/v1/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(adminUser)
      });
    });

    await use(page);
  }
});

export { expect } from '@playwright/test';

/**
 * Helper to set up authentication for a page via mock login.
 * Performs a real login flow through the UI with mocked API endpoints,
 * which properly sets both token and user in the Pinia auth store.
 */
export async function setupAuth(page: Page, user: AdminUser = defaultAdminUser): Promise<void> {
  // Mock login endpoint
  await page.route('**/api/v1/auth/login', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ token: 'test-admin-token', user })
    });
  });

  // Mock auth verification endpoint (used on page reloads)
  await page.route('**/api/v1/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(user)
    });
  });

  // Mock admin profile endpoint (used for language preferences)
  await page.route('**/api/v1/admin/profile', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ user: { details: {} } })
    });
  });

  // Navigate to login page and perform mock login
  await page.goto('/admin/login');
  await page.locator('[data-testid="username-input"]').fill(user.email);
  await page.locator('[data-testid="password-input"]').fill('TestPass123@');
  await page.locator('[data-testid="login-button"]').click();

  // Wait for redirect to dashboard (auth state is now fully set)
  await page.waitForURL(/\/admin\/(dashboard)?$/, { timeout: 10000 });
}

/**
 * Helper to clear authentication
 */
export async function clearAuth(page: Page): Promise<void> {
  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}
