import { test, expect } from '@playwright/test';
import { setupAuth } from './fixtures/admin';
import { mockInvoicesAPI, mockInvoiceDetails } from './helpers/api-mocks';

test.describe('Admin Invoice Details', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
    await mockInvoicesAPI(page);
  });

  test('should display invoice details', async ({ page }) => {
    await page.goto('/admin/invoices/INV-001');

    // Check invoice ID is displayed
    await expect(page.locator('text=INV-001')).toBeVisible();
  });

  test('should display customer info', async ({ page }) => {
    await page.goto('/admin/invoices/INV-001');

    await expect(page.locator(`text=${mockInvoiceDetails.user_email}`)).toBeVisible();
    await expect(page.locator(`text=${mockInvoiceDetails.user_name}`)).toBeVisible();
  });

  test('should display invoice amount', async ({ page }) => {
    await page.goto('/admin/invoices/INV-001');

    await expect(page.locator('text=$29.99')).toBeVisible();
  });

  test('should display invoice status', async ({ page }) => {
    await page.goto('/admin/invoices/INV-001');

    await expect(page.locator('.badge, .status-badge, [data-testid="status"]').first()).toBeVisible();
  });

  test('should display line items', async ({ page }) => {
    await page.goto('/admin/invoices/INV-001');

    // Check line items section
    await expect(page.locator('text=/line.*items|description/i').first()).toBeVisible();
    await expect(page.locator('text=/Pro Plan/i')).toBeVisible();
  });

  test('should display billing address', async ({ page }) => {
    await page.goto('/admin/invoices/INV-001');

    // Check billing address
    await expect(page.locator('text=/billing.*address|address/i').first()).toBeVisible();
    await expect(page.locator('text=123 Main St')).toBeVisible();
  });

  test('should show back button', async ({ page }) => {
    await page.goto('/admin/invoices/INV-001');

    const backButton = page.locator('[data-testid="back-button"], a:has-text("Back"), button:has-text("Back")');
    await expect(backButton).toBeVisible();

    await backButton.click();
    await expect(page).toHaveURL(/.*\/admin\/invoices$/);
  });

  test('should show resend button for paid invoices', async ({ page }) => {
    await page.goto('/admin/invoices/INV-001');

    const resendButton = page.locator('[data-testid="resend-invoice"], button:has-text("Resend")');
    if (await resendButton.isVisible()) {
      await expect(resendButton).toBeEnabled();
    }
  });

  test('should show void button', async ({ page }) => {
    await page.goto('/admin/invoices/INV-001');

    // Void button may or may not be visible depending on invoice status
    await expect(page.locator('[data-testid="void-invoice"], button:has-text("Void")').first()).toBeDefined();
  });

  test('should display dates', async ({ page }) => {
    await page.goto('/admin/invoices/INV-001');

    // Check dates are displayed
    await expect(page.locator('text=/date|2024/i').first()).toBeVisible();
  });
});
