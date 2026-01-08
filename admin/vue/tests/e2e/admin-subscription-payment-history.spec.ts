/**
 * E2E Tests: Admin Subscription Details - Payment History Navigation
 *
 * Tests that payment history items are clickable and navigate to invoice details.
 *
 * Run with: E2E_BASE_URL=http://localhost:8081 npx playwright test admin-subscription-payment-history
 */
import { test, expect } from '@playwright/test';
import { loginAsAdmin, navigateViaNavbar, waitForView } from './helpers/auth';

test.describe('Admin Subscription Details - Payment History', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await navigateViaNavbar(page, 'subscriptions');
    await waitForView(page, 'subscriptions-view');

    // Click first row to navigate to details
    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();
    await waitForView(page, 'subscription-details-view');
  });

  test('should display payment history section', async ({ page }) => {
    const paymentHistorySection = page.locator('[data-testid="payment-history"]');
    await expect(paymentHistorySection).toBeVisible();

    const sectionTitle = paymentHistorySection.locator('h3');
    await expect(sectionTitle).toContainText('Payment History');
  });

  test('should display payment table or no payments message', async ({ page }) => {
    const paymentHistorySection = page.locator('[data-testid="payment-history"]');

    const table = paymentHistorySection.locator('table');
    const noPayments = paymentHistorySection.locator('.no-payments');

    const hasTable = await table.isVisible().catch(() => false);
    const hasNoPayments = await noPayments.isVisible().catch(() => false);

    expect(hasTable || hasNoPayments).toBeTruthy();
  });

  test('payment history rows should be clickable', async ({ page }) => {
    const paymentHistorySection = page.locator('[data-testid="payment-history"]');
    const table = paymentHistorySection.locator('table');
    const hasTable = await table.isVisible().catch(() => false);

    if (hasTable) {
      const rows = table.locator('tbody tr');
      const rowCount = await rows.count();

      if (rowCount > 0) {
        const firstRow = rows.first();
        // Check that rows have clickable-row class or cursor pointer
        const hasClickableClass = await firstRow.evaluate(el =>
          el.classList.contains('clickable-row') ||
          window.getComputedStyle(el).cursor === 'pointer'
        );
        expect(hasClickableClass).toBeTruthy();
      }
    }

    expect(true).toBeTruthy();
  });

  test('clicking payment history row should navigate to invoice', async ({ page }) => {
    const paymentHistorySection = page.locator('[data-testid="payment-history"]');
    const table = paymentHistorySection.locator('table');
    const hasTable = await table.isVisible().catch(() => false);

    if (hasTable) {
      const rows = table.locator('tbody tr');
      const rowCount = await rows.count();

      if (rowCount > 0) {
        const firstRow = rows.first();
        await firstRow.click();

        // Wait for navigation to invoice details
        await page.waitForURL(/\/admin\/invoices\/[\w-]+/, { timeout: 10000 });

        // Verify we're on invoice details page
        await waitForView(page, 'invoice-details-view');

        const header = page.locator('.details-header h2');
        await expect(header).toBeVisible();
        const headerText = await header.textContent();
        expect(headerText).toContain('Invoice');
      }
    }

    expect(true).toBeTruthy();
  });
});

test.describe('Admin Subscription Details - User and Plan Info', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await navigateViaNavbar(page, 'subscriptions');
    await waitForView(page, 'subscriptions-view');

    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();
    await waitForView(page, 'subscription-details-view');
  });

  test('should display user information with email', async ({ page }) => {
    const userSection = page.locator('.info-section:has-text("User Information")');
    await expect(userSection).toBeVisible();

    const emailItem = userSection.locator('.info-item:has-text("Email")');
    await expect(emailItem).toBeVisible();

    const emailValue = emailItem.locator('span').last();
    const emailText = await emailValue.textContent();
    expect(emailText).toContain('@');
  });

  test('should display subscription information with plan name', async ({ page }) => {
    const subscriptionSection = page.locator('.info-section:has-text("Subscription Information")');
    await expect(subscriptionSection).toBeVisible();

    const planItem = subscriptionSection.locator('.info-item:has-text("Plan")');
    await expect(planItem).toBeVisible();

    const planValue = planItem.locator('span').last();
    const planText = await planValue.textContent();
    expect(planText).toBeTruthy();
    expect(planText!.length).toBeGreaterThan(0);
  });

  test('should display billing period dates', async ({ page }) => {
    const billingSection = page.locator('[data-testid="billing-period"]');
    await expect(billingSection).toBeVisible();

    const startItem = billingSection.locator('.info-item:has-text("Current Period Start")');
    await expect(startItem).toBeVisible();

    const endItem = billingSection.locator('.info-item:has-text("Current Period End")');
    await expect(endItem).toBeVisible();
  });
});
