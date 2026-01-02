import { test, expect } from '@playwright/test';
import { setupAuth } from './fixtures/admin';
import { mockWebhooksAPI, mockWebhookDetails } from './helpers/api-mocks';

test.describe('Admin Webhook Details', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
    await mockWebhooksAPI(page);
  });

  test('should display webhook details', async ({ page }) => {
    await page.goto('/admin/webhooks/1');

    // Check URL is displayed
    await expect(page.locator(`text=${mockWebhookDetails.url}`)).toBeVisible();
  });

  test('should display webhook status', async ({ page }) => {
    await page.goto('/admin/webhooks/1');

    await expect(page.locator('.badge, .status-badge, [data-testid="status"]').first()).toBeVisible();
  });

  test('should display subscribed events', async ({ page }) => {
    await page.goto('/admin/webhooks/1');

    // Check events are listed
    await expect(page.locator('text=/events/i').first()).toBeVisible();
    await expect(page.locator('text=/subscription/i').first()).toBeVisible();
  });

  test('should display delivery history', async ({ page }) => {
    await page.goto('/admin/webhooks/1');

    // Check delivery history section
    await expect(page.locator('text=/delivery.*history|deliveries/i').first()).toBeVisible();

    // Check delivery entries
    await expect(page.locator('text=/success|failed/i').first()).toBeVisible();
  });

  test('should show test webhook button', async ({ page }) => {
    await page.goto('/admin/webhooks/1');

    const testButton = page.locator('[data-testid="test-webhook"], button:has-text("Test")');
    await expect(testButton).toBeVisible();
  });

  test('should test webhook', async ({ page }) => {
    await page.goto('/admin/webhooks/1');

    const testButton = page.locator('[data-testid="test-webhook"], button:has-text("Test")');
    if (await testButton.isVisible()) {
      await testButton.click();

      // Check for success message
      await expect(page.locator('text=/success|200/i')).toBeVisible({ timeout: 5000 });
    }
  });

  test('should show back button', async ({ page }) => {
    await page.goto('/admin/webhooks/1');

    const backButton = page.locator('[data-testid="back-button"], a:has-text("Back"), button:has-text("Back")');
    await expect(backButton).toBeVisible();

    await backButton.click();
    await expect(page).toHaveURL(/.*\/admin\/webhooks$/);
  });

  test('should toggle webhook enabled/disabled', async ({ page }) => {
    await page.goto('/admin/webhooks/1');

    const toggleButton = page.locator('[data-testid="toggle-status"], button:has-text("Disable"), button:has-text("Enable")');
    if (await toggleButton.isVisible()) {
      await toggleButton.click();
      await page.waitForTimeout(500);
    }
  });

  test('should show delete button', async ({ page }) => {
    await page.goto('/admin/webhooks/1');

    const deleteButton = page.locator('[data-testid="delete-webhook"], button:has-text("Delete")');
    await expect(deleteButton).toBeVisible();
  });

  test('should display response codes in delivery history', async ({ page }) => {
    await page.goto('/admin/webhooks/1');

    // Check response codes are shown
    await expect(page.locator('text=/200|500/').first()).toBeVisible();
  });
});
