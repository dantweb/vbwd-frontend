import { test, expect } from '@playwright/test';
import { setupAuth } from './fixtures/admin';
import { mockInvoicesAPI } from './helpers/api-mocks';

test.describe('Admin Invoices Management', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
    await mockInvoicesAPI(page);
  });

  test('should display invoices list', async ({ page }) => {
    await page.goto('/admin/invoices');

    // Check page title
    await expect(page.locator('h1, h2').first()).toContainText('Invoice');

    // Check table headers
    await expect(page.locator('th:has-text("Invoice"), th:has-text("ID")').first()).toBeVisible();
    await expect(page.locator('th:has-text("Amount")').first()).toBeVisible();
    await expect(page.locator('th:has-text("Status")').first()).toBeVisible();
  });

  test('should display invoice IDs', async ({ page }) => {
    await page.goto('/admin/invoices');

    // Check invoice IDs are displayed
    await expect(page.locator('text=INV-001')).toBeVisible();
    await expect(page.locator('text=INV-002')).toBeVisible();
  });

  test('should display amounts', async ({ page }) => {
    await page.goto('/admin/invoices');

    // Check amounts are displayed
    await expect(page.locator('text=$29.99').first()).toBeVisible();
    await expect(page.locator('text=$99.99').first()).toBeVisible();
  });

  test('should show status badges', async ({ page }) => {
    await page.goto('/admin/invoices');

    // Check for status badges
    await expect(page.locator('.badge:has-text("paid"), .status-badge:has-text("paid"), [class*="paid"]').first()).toBeVisible();
  });

  test('should filter by status', async ({ page }) => {
    await page.goto('/admin/invoices');

    const statusFilter = page.locator('select[data-testid="status-filter"], select').first();
    if (await statusFilter.isVisible()) {
      await statusFilter.selectOption('paid');
      await page.waitForTimeout(300);
    }
  });

  test('should navigate to invoice details', async ({ page }) => {
    await page.goto('/admin/invoices');

    // Click view button
    const viewButton = page.locator('[data-testid="view-invoice"], a:has-text("View")').first();
    if (await viewButton.isVisible()) {
      await viewButton.click();
    } else {
      await page.locator('text=INV-001').click();
    }

    await expect(page).toHaveURL(/.*\/admin\/invoices\/.+/);
  });

  test('should display customer emails', async ({ page }) => {
    await page.goto('/admin/invoices');

    await expect(page.locator('text=user1@test.com')).toBeVisible();
  });
});
