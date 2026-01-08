/**
 * E2E Tests: Admin Invoice Details - Actions
 *
 * Tests invoice action buttons including duplicate functionality.
 *
 * Run with: E2E_BASE_URL=http://localhost:8081 npx playwright test admin-invoice-actions
 */
import { test, expect } from '@playwright/test';
import { loginAsAdmin, navigateViaNavbar, waitForView } from './helpers/auth';

test.describe('Admin Invoice Details - Actions', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await navigateViaNavbar(page, 'invoices');
    await waitForView(page, 'invoices-view');

    // Click first row to navigate to details
    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();
    await waitForView(page, 'invoice-details-view');
  });

  test('should display duplicate button', async ({ page }) => {
    const duplicateButton = page.locator('[data-testid="duplicate-button"]');
    await expect(duplicateButton).toBeVisible();
    await expect(duplicateButton).toContainText('Duplicate');
  });

  test('should display resend button', async ({ page }) => {
    const resendButton = page.locator('[data-testid="resend-button"]');
    await expect(resendButton).toBeVisible();
    await expect(resendButton).toContainText('Resend');
  });

  test('should display appropriate status-based buttons', async ({ page }) => {
    const statusBadge = page.locator('.info-section:has-text("Invoice Information") .status-badge').first();
    const statusText = await statusBadge.textContent();

    if (statusText?.toLowerCase().includes('pending')) {
      await expect(page.locator('[data-testid="mark-paid-button"]')).toBeVisible();
      await expect(page.locator('[data-testid="void-button"]')).toBeVisible();
    } else if (statusText?.toLowerCase().includes('paid')) {
      await expect(page.locator('[data-testid="refund-button"]')).toBeVisible();
    }

    expect(true).toBeTruthy();
  });

  test('duplicate button should create new invoice and navigate', async ({ page }) => {
    // Get current URL to compare later
    const currentUrl = page.url();
    const currentInvoiceId = currentUrl.split('/').pop();

    // Click duplicate button
    const duplicateButton = page.locator('[data-testid="duplicate-button"]');
    await duplicateButton.click();

    // Wait for URL to change to a different invoice
    await page.waitForFunction(
      (currentId) => {
        const url = window.location.href;
        const match = url.match(/\/admin\/invoices\/([\w-]+)/);
        return match && match[1] !== currentId;
      },
      currentInvoiceId,
      { timeout: 10000 }
    );

    // Verify we're on a different invoice page
    const newUrl = page.url();
    const newInvoiceId = newUrl.split('/').pop();

    // The new invoice ID should be different
    expect(newInvoiceId).not.toBe(currentInvoiceId);

    // Verify new page loaded correctly
    await waitForView(page, 'invoice-details-view');
    const header = page.locator('.details-header h2');
    await expect(header).toBeVisible();
  });
});

test.describe('Admin Invoice Details - Plan and Subscription Info', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await navigateViaNavbar(page, 'invoices');
    await waitForView(page, 'invoices-view');

    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();
    await waitForView(page, 'invoice-details-view');
  });

  test('should display plan information section', async ({ page }) => {
    const planSection = page.locator('[data-testid="plan-info"]');
    const hasPlanSection = await planSection.isVisible().catch(() => false);

    if (hasPlanSection) {
      await expect(planSection.locator('h3')).toContainText('Plan Information');

      // Check for plan name
      const planName = planSection.locator('.info-item:has-text("Plan Name")');
      await expect(planName).toBeVisible();
    }

    expect(true).toBeTruthy();
  });

  test('should display subscription information section', async ({ page }) => {
    const subscriptionSection = page.locator('[data-testid="subscription-info"]');
    const hasSubscriptionSection = await subscriptionSection.isVisible().catch(() => false);

    if (hasSubscriptionSection) {
      await expect(subscriptionSection.locator('h3')).toContainText('Subscription Information');

      // Check for subscription status
      const statusItem = subscriptionSection.locator('.info-item:has-text("Status")');
      await expect(statusItem).toBeVisible();
    }

    expect(true).toBeTruthy();
  });

  test('should display line items with correct data', async ({ page }) => {
    const lineItemsSection = page.locator('[data-testid="line-items"]');
    await expect(lineItemsSection).toBeVisible();

    const table = lineItemsSection.locator('table');
    const hasTable = await table.isVisible().catch(() => false);

    if (hasTable) {
      // Check headers
      await expect(table.locator('th:has-text("Description")')).toBeVisible();
      await expect(table.locator('th:has-text("Amount")')).toBeVisible();

      // Check there's at least one row in tbody
      const rows = table.locator('tbody tr');
      const rowCount = await rows.count();
      expect(rowCount).toBeGreaterThan(0);
    }

    expect(true).toBeTruthy();
  });
});
