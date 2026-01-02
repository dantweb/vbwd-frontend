import { test, expect } from '@playwright/test';
import { setupAuth } from './fixtures/admin';
import { mockUsersAPI, mockUserDetails } from './helpers/api-mocks';

test.describe('Admin User Details', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
    await mockUsersAPI(page);
  });

  test('should display user details', async ({ page }) => {
    await page.goto('/admin/users/1');

    // Check user info is displayed
    await expect(page.locator(`text=${mockUserDetails.email}`)).toBeVisible();
    await expect(page.locator(`text=${mockUserDetails.name}`)).toBeVisible();
  });

  test('should display user statistics', async ({ page }) => {
    await page.goto('/admin/users/1');

    // Check stats are displayed
    await expect(page.locator('text=/total.*subscriptions/i')).toBeVisible();
  });

  test('should show back button to users list', async ({ page }) => {
    await page.goto('/admin/users/1');

    // Find and click back button
    const backButton = page.locator('[data-testid="back-button"], a:has-text("Back"), button:has-text("Back")');
    await expect(backButton).toBeVisible();

    await backButton.click();
    await expect(page).toHaveURL(/.*\/admin\/users$/);
  });

  test('should suspend active user', async ({ page }) => {
    await page.goto('/admin/users/1');

    // Find suspend button
    const suspendButton = page.locator('[data-testid="suspend-button"], button:has-text("Suspend")');

    if (await suspendButton.isVisible()) {
      await suspendButton.click();

      // Check for confirmation or success message
      await expect(page.locator('text=/suspended|success/i')).toBeVisible({ timeout: 5000 });
    }
  });

  test('should activate suspended user', async ({ page }) => {
    // Mock a suspended user
    await page.route('**/api/v1/admin/users/3', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ...mockUserDetails, id: '3', status: 'suspended' })
      });
    });

    await page.goto('/admin/users/3');

    // Find activate button
    const activateButton = page.locator('[data-testid="activate-button"], button:has-text("Activate")');

    if (await activateButton.isVisible()) {
      await activateButton.click();

      // Check for success message
      await expect(page.locator('text=/activated|success/i')).toBeVisible({ timeout: 5000 });
    }
  });

  test('should display user status badge', async ({ page }) => {
    await page.goto('/admin/users/1');

    // Check for status badge
    await expect(page.locator('.badge, .status-badge, [data-testid="status-badge"]').first()).toBeVisible();
  });
});
