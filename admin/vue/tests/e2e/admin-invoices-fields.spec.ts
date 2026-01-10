/**
 * E2E Tests: Admin Invoices - Fields & Sorting
 *
 * Tests invoice list field population and sortable columns.
 * TDD-First: Tests written before implementation verification.
 *
 * Run with: E2E_BASE_URL=http://localhost:8081 npx playwright test admin-invoices-fields
 */
import { test, expect } from '@playwright/test';
import { loginAsAdmin, navigateViaNavbar, waitForView } from './helpers/auth';

test.describe('Admin Invoices - Field Population', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await navigateViaNavbar(page, 'invoices');
    await waitForView(page, 'invoices-view');
  });

  test('should display invoices table with data', async ({ page }) => {
    const table = page.locator('[data-testid="invoices-table"]');
    await expect(table).toBeVisible();

    // Verify table has rows
    const rows = page.locator('tbody tr');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should display invoice number in first column', async ({ page }) => {
    const table = page.locator('[data-testid="invoices-table"]');
    await expect(table).toBeVisible();

    // First row, first column should have invoice number
    const firstCell = page.locator('tbody tr').first().locator('td').nth(0);
    const text = await firstCell.textContent();
    expect(text).toBeTruthy();
    expect(text!.length).toBeGreaterThan(0);
  });

  test('should display customer email in second column', async ({ page }) => {
    const table = page.locator('[data-testid="invoices-table"]');
    await expect(table).toBeVisible();

    // First row, second column should have email
    const secondCell = page.locator('tbody tr').first().locator('td').nth(1);
    const text = await secondCell.textContent();
    expect(text).toBeTruthy();
    expect(text).toContain('@');
  });

  test('should display formatted amount in third column', async ({ page }) => {
    const table = page.locator('[data-testid="invoices-table"]');
    await expect(table).toBeVisible();

    // Third column should have formatted amount with currency symbol
    const amountCell = page.locator('tbody tr').first().locator('td').nth(2);
    const text = await amountCell.textContent();
    expect(text).toBeTruthy();
    // Should contain currency symbol or number
    expect(text).toMatch(/[$€£]?\d+[\d,.]*|[\d,.]+\s*[A-Z]{3}/);
  });

  test('should display status badge in fourth column', async ({ page }) => {
    const table = page.locator('[data-testid="invoices-table"]');
    await expect(table).toBeVisible();

    // Fourth column should have status badge
    const statusCell = page.locator('tbody tr').first().locator('td').nth(3);
    const statusBadge = statusCell.locator('.status-badge');
    await expect(statusBadge).toBeVisible();
  });

  test('should display date in fifth column', async ({ page }) => {
    const table = page.locator('[data-testid="invoices-table"]');
    await expect(table).toBeVisible();

    // Fifth column should have date
    const dateCell = page.locator('tbody tr').first().locator('td').nth(4);
    const text = await dateCell.textContent();
    expect(text).toBeTruthy();
    // Date should contain / or - (date separator) or be a dash for empty
    expect(text).toMatch(/[\d/\-.]+|-/);
  });

  test('should display total count', async ({ page }) => {
    const totalCount = page.locator('.total-count');
    await expect(totalCount).toBeVisible();
    const text = await totalCount.textContent();
    expect(text).toMatch(/\d+ total/);
  });
});

test.describe('Admin Invoices - Sortable Columns', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await navigateViaNavbar(page, 'invoices');
    await waitForView(page, 'invoices-view');
  });

  test('should have sortable column headers', async ({ page }) => {
    const table = page.locator('[data-testid="invoices-table"]');
    await expect(table).toBeVisible();

    // Check all columns have sortable class
    const invoiceHeader = page.locator('th[data-sortable="invoice_number"]');
    const customerHeader = page.locator('th[data-sortable="user_email"]');
    const amountHeader = page.locator('th[data-sortable="amount"]');
    const statusHeader = page.locator('th[data-sortable="status"]');
    const dateHeader = page.locator('th[data-sortable="created_at"]');

    await expect(invoiceHeader).toHaveClass(/sortable/);
    await expect(customerHeader).toHaveClass(/sortable/);
    await expect(amountHeader).toHaveClass(/sortable/);
    await expect(statusHeader).toHaveClass(/sortable/);
    await expect(dateHeader).toHaveClass(/sortable/);
  });

  test('should sort by invoice number when clicking header', async ({ page }) => {
    const table = page.locator('[data-testid="invoices-table"]');
    await expect(table).toBeVisible();

    const invoiceHeader = page.locator('th[data-sortable="invoice_number"]');

    // Click to sort
    await invoiceHeader.click();
    await page.waitForTimeout(200);

    // Verify header shows sorted state
    await expect(invoiceHeader).toHaveClass(/sorted/);

    // Verify sort indicator appears
    const indicator = invoiceHeader.locator('.sort-indicator');
    const indicatorText = await indicator.textContent();
    expect(indicatorText).toMatch(/[▲▼]/);
  });

  test('should toggle sort direction on second click', async ({ page }) => {
    const table = page.locator('[data-testid="invoices-table"]');
    await expect(table).toBeVisible();

    const invoiceHeader = page.locator('th[data-sortable="invoice_number"]');

    // First click - ascending
    await invoiceHeader.click();
    await page.waitForTimeout(200);

    const indicator = invoiceHeader.locator('.sort-indicator');
    const firstDirection = await indicator.textContent();

    // Second click - descending
    await invoiceHeader.click();
    await page.waitForTimeout(200);

    const secondDirection = await indicator.textContent();
    expect(secondDirection).not.toBe(firstDirection);
  });

  test('should sort by customer email', async ({ page }) => {
    const table = page.locator('[data-testid="invoices-table"]');
    await expect(table).toBeVisible();

    const customerHeader = page.locator('th[data-sortable="user_email"]');
    await customerHeader.click();
    await page.waitForTimeout(200);

    await expect(customerHeader).toHaveClass(/sorted/);
    const indicator = customerHeader.locator('.sort-indicator');
    await expect(indicator).toContainText(/[▲▼]/);
  });

  test('should sort by amount', async ({ page }) => {
    const table = page.locator('[data-testid="invoices-table"]');
    await expect(table).toBeVisible();

    const amountHeader = page.locator('th[data-sortable="amount"]');
    await amountHeader.click();
    await page.waitForTimeout(200);

    await expect(amountHeader).toHaveClass(/sorted/);
    const indicator = amountHeader.locator('.sort-indicator');
    await expect(indicator).toContainText(/[▲▼]/);
  });

  test('should sort by status', async ({ page }) => {
    const table = page.locator('[data-testid="invoices-table"]');
    await expect(table).toBeVisible();

    const statusHeader = page.locator('th[data-sortable="status"]');
    await statusHeader.click();
    await page.waitForTimeout(200);

    await expect(statusHeader).toHaveClass(/sorted/);
    const indicator = statusHeader.locator('.sort-indicator');
    await expect(indicator).toContainText(/[▲▼]/);
  });

  test('should sort by date', async ({ page }) => {
    const table = page.locator('[data-testid="invoices-table"]');
    await expect(table).toBeVisible();

    const dateHeader = page.locator('th[data-sortable="created_at"]');
    await dateHeader.click();
    await page.waitForTimeout(200);

    await expect(dateHeader).toHaveClass(/sorted/);
    const indicator = dateHeader.locator('.sort-indicator');
    await expect(indicator).toContainText(/[▲▼]/);
  });

  test('should change sorted column when clicking different header', async ({ page }) => {
    const table = page.locator('[data-testid="invoices-table"]');
    await expect(table).toBeVisible();

    const invoiceHeader = page.locator('th[data-sortable="invoice_number"]');
    const customerHeader = page.locator('th[data-sortable="user_email"]');

    // Sort by invoice first
    await invoiceHeader.click();
    await page.waitForTimeout(200);
    await expect(invoiceHeader).toHaveClass(/sorted/);

    // Sort by customer - invoice should no longer be sorted
    await customerHeader.click();
    await page.waitForTimeout(200);

    await expect(customerHeader).toHaveClass(/sorted/);
    // Invoice header indicator should be empty
    const invoiceIndicator = invoiceHeader.locator('.sort-indicator');
    const invoiceIndicatorText = await invoiceIndicator.textContent();
    expect(invoiceIndicatorText?.trim()).toBe('');
  });
});

test.describe('Admin Invoices - Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await navigateViaNavbar(page, 'invoices');
    await waitForView(page, 'invoices-view');
  });

  test('should navigate to invoice details on row click', async ({ page }) => {
    const table = page.locator('[data-testid="invoices-table"]');
    await expect(table).toBeVisible();

    // Click first row
    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();

    // Should navigate to details page
    await expect(page).toHaveURL(/\/admin\/invoices\/[\w-]+/);
  });
});
