import { test, expect } from '@playwright/test';

test.describe('Admin Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any stored tokens before each test
    await page.addInitScript(() => {
      localStorage.clear();
    });
  });

  test('should display login form when not authenticated', async ({ page }) => {
    await page.goto('/admin/login');

    // Check login form elements are visible
    await expect(page.locator('h1')).toContainText('VBWD Admin');
    await expect(page.locator('input#username')).toBeVisible();
    await expect(page.locator('input#password')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should redirect to login when accessing protected route without authentication', async ({ page }) => {
    await page.goto('/admin/dashboard');

    // Should redirect to login page
    await expect(page).toHaveURL(/.*\/admin\/login/);
  });

  test('should show error message on invalid credentials', async ({ page }) => {
    await page.goto('/admin/login');

    // Fill in invalid credentials
    await page.fill('input#username', 'invalid@test.com');
    await page.fill('input#password', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Wait for error message
    await expect(page.locator('.error')).toBeVisible();
    await expect(page.locator('.error')).toContainText('Invalid credentials');
  });

  test('should login successfully with valid admin credentials', async ({ page }) => {
    // Mock the API response
    await page.route('**/api/v1/auth/login', async (route) => {
      const request = route.request();
      const postData = JSON.parse(request.postData() || '{}');

      if (postData.email === 'admin@test.com' && postData.password === 'admin123') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            token: 'test-admin-token',
            user: {
              id: '1',
              email: 'admin@test.com',
              name: 'Admin User',
              roles: ['admin']
            }
          })
        });
      } else {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Invalid credentials' })
        });
      }
    });

    await page.goto('/admin/login');

    // Fill in valid credentials
    await page.fill('input#username', 'admin@test.com');
    await page.fill('input#password', 'admin123');
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*\/admin\/dashboard/);
  });

  test('should redirect non-admin users to forbidden page', async ({ page }) => {
    // Mock the API response for a regular user (no admin role)
    await page.route('**/api/v1/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'test-user-token',
          user: {
            id: '2',
            email: 'user@test.com',
            name: 'Regular User',
            roles: ['user']  // No admin role
          }
        })
      });
    });

    await page.goto('/admin/login');

    // Fill in credentials
    await page.fill('input#username', 'user@test.com');
    await page.fill('input#password', 'user123');
    await page.click('button[type="submit"]');

    // Should redirect to forbidden page
    await expect(page).toHaveURL(/.*\/admin\/forbidden/);
    await expect(page.locator('h1')).toContainText('403');
  });

  test('should persist login state across page reloads', async ({ page }) => {
    // Set up authentication state
    await page.addInitScript(() => {
      localStorage.setItem('admin_token', 'test-admin-token');
    });

    // Mock API for token validation
    await page.route('**/api/v1/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: '1',
          email: 'admin@test.com',
          name: 'Admin User',
          roles: ['admin']
        })
      });
    });

    await page.goto('/admin/dashboard');

    // Should stay on dashboard (authenticated)
    await expect(page).toHaveURL(/.*\/admin\/dashboard/);
  });

  test('should logout and redirect to login', async ({ page }) => {
    // Set up authentication state
    await page.addInitScript(() => {
      localStorage.setItem('admin_token', 'test-admin-token');
    });

    await page.goto('/admin/dashboard');

    // Click logout button
    await page.click('.logout-btn');

    // Should redirect to login page
    await expect(page).toHaveURL(/.*\/admin\/login/);

    // Token should be cleared
    const token = await page.evaluate(() => localStorage.getItem('admin_token'));
    expect(token).toBeNull();
  });
});
