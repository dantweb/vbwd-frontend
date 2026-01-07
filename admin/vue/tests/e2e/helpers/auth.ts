/**
 * Authentication helpers for E2E tests
 * Uses real login via UI (not mocked)
 */
import { Page } from '@playwright/test';

// Admin credentials from CLAUDE.md
export const adminCredentials = {
  email: 'admin@example.com',
  password: 'AdminPass123@',
};

/**
 * Login to admin panel via UI
 */
export async function loginAsAdmin(page: Page): Promise<void> {
  // Go to any admin page - will redirect to login if not authenticated
  await page.goto('/admin/users');
  await page.waitForLoadState('networkidle');

  // Check if we're on login page
  const isLoginPage = await page.locator('[data-testid="login-view"], .login-container').isVisible().catch(() => false);

  if (isLoginPage) {
    // Fill and submit login form
    await page.locator('[data-testid="username-input"], input#username').fill(adminCredentials.email);
    await page.locator('[data-testid="password-input"], input#password').fill(adminCredentials.password);
    await page.locator('[data-testid="login-button"], button[type="submit"]').click();

    // Wait for redirect to dashboard
    await page.waitForURL(/\/admin\/(dashboard)?$/, { timeout: 15000 });
  }
}

/**
 * Navigate to a page using sidebar links (preferred method)
 */
export async function navigateViaNavbar(page: Page, destination: 'dashboard' | 'users' | 'plans' | 'subscriptions' | 'invoices' | 'analytics' | 'webhooks' | 'settings'): Promise<void> {
  const testId = `nav-${destination}`;
  await page.locator(`[data-testid="${testId}"]`).click();
  await page.waitForLoadState('networkidle');
}

/**
 * Wait for a view to be fully loaded
 */
export async function waitForView(page: Page, viewTestId: string, timeout = 10000): Promise<void> {
  await page.locator(`[data-testid="${viewTestId}"]`).waitFor({ state: 'visible', timeout });
}
