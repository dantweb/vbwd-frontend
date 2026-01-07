/**
 * E2E Tests: Admin Login Flow
 *
 * Tests authentication, login form, and protected routes.
 * Uses real backend for most tests.
 *
 * Run with: E2E_BASE_URL=http://localhost:8081 npx playwright test admin-login
 */
import { test, expect } from '@playwright/test';
import { adminCredentials } from './helpers/auth';

test.describe('Admin Login Flow', () => {
  test('should display login form when not authenticated', async ({ page }) => {
    // Clear localStorage before visiting
    await page.goto('/admin/login');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Check login page loaded
    await expect(page.locator('[data-testid="login-view"], .login-container')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('h1')).toContainText('VBWD Admin');

    // Check form elements are visible
    await expect(page.locator('[data-testid="login-form"]')).toBeVisible();
    await expect(page.locator('[data-testid="username-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="password-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="login-button"]')).toBeVisible();
  });

  test('should redirect to login when accessing protected route without authentication', async ({ page }) => {
    // Clear auth first
    await page.goto('/admin/login');
    await page.evaluate(() => localStorage.clear());

    // Now try to access protected route
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');

    // Should redirect to login page
    await expect(page).toHaveURL(/\/admin\/login/);
    await expect(page.locator('[data-testid="login-view"], .login-container')).toBeVisible({ timeout: 10000 });
  });

  test('should show error message on invalid credentials', async ({ page }) => {
    await page.goto('/admin/login');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Fill in invalid credentials
    await page.locator('[data-testid="username-input"]').fill('invalid@test.com');
    await page.locator('[data-testid="password-input"]').fill('wrongpassword');
    await page.locator('[data-testid="login-button"]').click();

    // Wait for error message
    await expect(page.locator('[data-testid="login-error"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('[data-testid="login-error"]')).toContainText('Invalid credentials');
  });

  test('should login successfully with valid admin credentials', async ({ page }) => {
    await page.goto('/admin/login');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Fill in valid admin credentials
    await page.locator('[data-testid="username-input"]').fill(adminCredentials.email);
    await page.locator('[data-testid="password-input"]').fill(adminCredentials.password);
    await page.locator('[data-testid="login-button"]').click();

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/admin\/(dashboard)?$/, { timeout: 15000 });
    await expect(page.locator('[data-testid="dashboard-view"]')).toBeVisible({ timeout: 10000 });
  });

  test('should display sidebar after login', async ({ page }) => {
    await page.goto('/admin/login');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Login
    await page.locator('[data-testid="username-input"]').fill(adminCredentials.email);
    await page.locator('[data-testid="password-input"]').fill(adminCredentials.password);
    await page.locator('[data-testid="login-button"]').click();

    // Wait for dashboard
    await expect(page).toHaveURL(/\/admin\/(dashboard)?$/, { timeout: 15000 });

    // Check sidebar navigation is visible
    await expect(page.locator('[data-testid="sidebar-nav"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('[data-testid="nav-dashboard"]')).toBeVisible();
    await expect(page.locator('[data-testid="nav-users"]')).toBeVisible();
    await expect(page.locator('[data-testid="nav-plans"]')).toBeVisible();
    await expect(page.locator('[data-testid="nav-subscriptions"]')).toBeVisible();
    await expect(page.locator('[data-testid="nav-invoices"]')).toBeVisible();
  });

  test('should logout and redirect to login', async ({ page }) => {
    // First login
    await page.goto('/admin/login');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForLoadState('networkidle');

    await page.locator('[data-testid="username-input"]').fill(adminCredentials.email);
    await page.locator('[data-testid="password-input"]').fill(adminCredentials.password);
    await page.locator('[data-testid="login-button"]').click();

    // Wait for dashboard
    await expect(page).toHaveURL(/\/admin\/(dashboard)?$/, { timeout: 15000 });
    await expect(page.locator('[data-testid="sidebar-nav"]')).toBeVisible({ timeout: 10000 });

    // Click logout button and wait for URL change
    await page.locator('[data-testid="logout-button"]').click();
    await page.waitForURL(/\/admin\/login/, { timeout: 10000 });

    // Verify login page is visible
    await expect(page.locator('[data-testid="login-view"], .login-container')).toBeVisible({ timeout: 10000 });
  });
});
