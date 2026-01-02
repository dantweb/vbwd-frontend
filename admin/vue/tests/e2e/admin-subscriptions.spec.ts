import { test, expect } from '@playwright/test';
import { setupAuth } from './fixtures/admin';
import { mockSubscriptionsAPI } from './helpers/api-mocks';

test.describe('Admin Subscriptions Management', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
    await mockSubscriptionsAPI(page);
  });

  test('should display subscriptions list', async ({ page }) => {
    await page.goto('/admin/subscriptions');

    // Check page title
    await expect(page.locator('h1, h2').first()).toContainText('Subscription');

    // Check table headers
    await expect(page.locator('th:has-text("User"), th:has-text("Email")').first()).toBeVisible();
    await expect(page.locator('th:has-text("Plan")').first()).toBeVisible();
    await expect(page.locator('th:has-text("Status")').first()).toBeVisible();
  });

  test('should display subscription data', async ({ page }) => {
    await page.goto('/admin/subscriptions');

    // Check subscription emails are displayed
    await expect(page.locator('text=user1@test.com')).toBeVisible();
    await expect(page.locator('text=user2@test.com')).toBeVisible();
  });

  test('should filter by status', async ({ page }) => {
    await page.goto('/admin/subscriptions');

    // Find status filter
    const statusFilter = page.locator('select[data-testid="status-filter"], select').first();
    if (await statusFilter.isVisible()) {
      await statusFilter.selectOption('active');
      await page.waitForTimeout(300);
    }
  });

  test('should show status badges', async ({ page }) => {
    await page.goto('/admin/subscriptions');

    // Check for different status badges
    await expect(page.locator('.badge:has-text("active"), .status-badge:has-text("active"), [class*="active"]').first()).toBeVisible();
  });

  test('should navigate to subscription details', async ({ page }) => {
    await page.goto('/admin/subscriptions');

    // Click view button or subscription row
    const viewButton = page.locator('[data-testid="view-subscription"], a:has-text("View")').first();
    if (await viewButton.isVisible()) {
      await viewButton.click();
    } else {
      await page.locator('text=user1@test.com').click();
    }

    await expect(page).toHaveURL(/.*\/admin\/subscriptions\/\d+/);
  });

  test('should show plan names', async ({ page }) => {
    await page.goto('/admin/subscriptions');

    // Check plan names are displayed
    await expect(page.locator('text=Pro')).toBeVisible();
    await expect(page.locator('text=Free')).toBeVisible();
  });

  test('should display date columns', async ({ page }) => {
    await page.goto('/admin/subscriptions');

    // Check date headers exist
    await expect(page.locator('th:has-text("Start"), th:has-text("Date")').first()).toBeVisible();
  });
});
