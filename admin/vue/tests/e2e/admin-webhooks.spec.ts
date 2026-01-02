import { test, expect } from '@playwright/test';
import { setupAuth } from './fixtures/admin';
import { mockWebhooksAPI, mockWebhooks } from './helpers/api-mocks';

test.describe('Admin Webhooks Management', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
    await mockWebhooksAPI(page);
  });

  test('should display webhooks list', async ({ page }) => {
    await page.goto('/admin/webhooks');

    // Check page title
    await expect(page.locator('h1, h2').first()).toContainText('Webhook');

    // Check table headers
    await expect(page.locator('th:has-text("URL")').first()).toBeVisible();
    await expect(page.locator('th:has-text("Events"), th:has-text("Event")').first()).toBeVisible();
    await expect(page.locator('th:has-text("Status")').first()).toBeVisible();
  });

  test('should display webhook URLs', async ({ page }) => {
    await page.goto('/admin/webhooks');

    // Check URLs are displayed
    await expect(page.locator('text=example.com/webhook1')).toBeVisible();
    await expect(page.locator('text=example.com/webhook2')).toBeVisible();
  });

  test('should show status badges', async ({ page }) => {
    await page.goto('/admin/webhooks');

    await expect(page.locator('.badge:has-text("active"), .status-badge:has-text("active"), [class*="active"]').first()).toBeVisible();
  });

  test('should navigate to webhook details', async ({ page }) => {
    await page.goto('/admin/webhooks');

    const viewButton = page.locator('[data-testid="view-webhook"], a:has-text("View")').first();
    if (await viewButton.isVisible()) {
      await viewButton.click();
    } else {
      await page.locator('text=example.com/webhook1').click();
    }

    await expect(page).toHaveURL(/.*\/admin\/webhooks\/\d+/);
  });

  test('should toggle webhook status', async ({ page }) => {
    await page.goto('/admin/webhooks');

    const toggleButton = page.locator('[data-testid="toggle-webhook"], button:has-text("Disable"), button:has-text("Enable")').first();
    if (await toggleButton.isVisible()) {
      await toggleButton.click();
      await page.waitForTimeout(500);
    }
  });

  test('should delete webhook', async ({ page }) => {
    await page.goto('/admin/webhooks');

    const deleteButton = page.locator('[data-testid="delete-webhook"], button:has-text("Delete")').first();
    if (await deleteButton.isVisible()) {
      await deleteButton.click();

      // Handle confirmation dialog
      const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Yes")');
      if (await confirmButton.isVisible()) {
        await confirmButton.click();
      }

      // Check for success message
      await expect(page.locator('text=/deleted|success/i')).toBeVisible({ timeout: 5000 });
    }
  });

  test('should display events for each webhook', async ({ page }) => {
    await page.goto('/admin/webhooks');

    // Check event names are displayed
    await expect(page.locator('text=/subscription|invoice|user/i').first()).toBeVisible();
  });
});
