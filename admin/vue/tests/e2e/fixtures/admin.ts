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
 * Helper to set up authentication for a page
 */
export async function setupAuth(page: Page, user: AdminUser = defaultAdminUser): Promise<void> {
  await page.addInitScript((userData) => {
    localStorage.setItem('admin_token', 'test-admin-token');
  }, user);

  await page.route('**/api/v1/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(user)
    });
  });
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
