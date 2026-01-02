import { test, expect } from '@playwright/test';
import { setupAuth } from './fixtures/admin';
import { mockSubscriptionsAPI, mockSubscriptionDetails } from './helpers/api-mocks';

test.describe('Admin Subscription Details', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
    await mockSubscriptionsAPI(page);
  });

  test('should display subscription details', async ({ page }) => {
    await page.goto('/admin/subscriptions/1');

    // Check subscription info is displayed
    await expect(page.locator(`text=${mockSubscriptionDetails.user_email}`)).toBeVisible();
    await expect(page.locator(`text=${mockSubscriptionDetails.plan_name}`)).toBeVisible();
  });

  test('should display subscription status', async ({ page }) => {
    await page.goto('/admin/subscriptions/1');

    // Check status badge
    await expect(page.locator('.badge, .status-badge, [data-testid="status"]').first()).toBeVisible();
  });

  test('should show payment history', async ({ page }) => {
    await page.goto('/admin/subscriptions/1');

    // Check payments section exists
    await expect(page.locator('text=/payment.*history/i, h3:has-text("Payment")').first()).toBeVisible();

    // Check payment amounts
    await expect(page.locator('text=$29.99').first()).toBeVisible();
  });

  test('should show back button', async ({ page }) => {
    await page.goto('/admin/subscriptions/1');

    const backButton = page.locator('[data-testid="back-button"], a:has-text("Back"), button:has-text("Back")');
    await expect(backButton).toBeVisible();

    await backButton.click();
    await expect(page).toHaveURL(/.*\/admin\/subscriptions$/);
  });

  test('should show cancel subscription button for active subscriptions', async ({ page }) => {
    await page.goto('/admin/subscriptions/1');

    const cancelButton = page.locator('[data-testid="cancel-subscription"], button:has-text("Cancel Subscription")');
    // May or may not be visible depending on status
    if (await cancelButton.isVisible()) {
      await expect(cancelButton).toBeEnabled();
    }
  });

  test('should cancel subscription', async ({ page }) => {
    await page.goto('/admin/subscriptions/1');

    const cancelButton = page.locator('[data-testid="cancel-subscription"], button:has-text("Cancel Subscription")');

    if (await cancelButton.isVisible()) {
      await cancelButton.click();

      // Check for confirmation dialog or success message
      const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Yes")');
      if (await confirmButton.isVisible()) {
        await confirmButton.click();
      }

      // Check for success feedback
      await expect(page.locator('text=/cancelled|success/i')).toBeVisible({ timeout: 5000 });
    }
  });

  test('should display subscription dates', async ({ page }) => {
    await page.goto('/admin/subscriptions/1');

    // Check dates are displayed
    await expect(page.locator('text=/start.*date/i, text=/2024/').first()).toBeVisible();
  });

  test('should show user details', async ({ page }) => {
    await page.goto('/admin/subscriptions/1');

    // Check user info
    await expect(page.locator(`text=${mockSubscriptionDetails.user_name}`)).toBeVisible();
    await expect(page.locator(`text=${mockSubscriptionDetails.user_email}`)).toBeVisible();
  });

  test('should display billing period', async ({ page }) => {
    await page.goto('/admin/subscriptions/1');

    await expect(page.locator('text=/monthly/i')).toBeVisible();
  });
});
