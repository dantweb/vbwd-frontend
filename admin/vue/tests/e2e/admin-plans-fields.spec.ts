/**
 * E2E Tests: Admin Plans - Field Population & Sorting
 *
 * Tests that all table fields are populated and sorting works.
 * TDD-First: Tests written before implementation.
 *
 * Run with: E2E_BASE_URL=http://localhost:8081 npx playwright test admin-plans-fields
 */
import { test, expect } from '@playwright/test';
import { loginAsAdmin, navigateViaNavbar, waitForView } from './helpers/auth';

test.describe('Admin Plans - Field Population', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await navigateViaNavbar(page, 'plans');
    await waitForView(page, 'plans-view');
  });

  test('should display all column headers', async ({ page }) => {
    const table = page.locator('[data-testid="plans-table"]');
    await expect(table).toBeVisible();

    // Verify all column headers exist
    await expect(page.locator('th:has-text("Name")')).toBeVisible();
    await expect(page.locator('th:has-text("Price")')).toBeVisible();
    await expect(page.locator('th:has-text("Billing")')).toBeVisible();
    await expect(page.locator('th:has-text("Subscribers")')).toBeVisible();
    await expect(page.locator('th:has-text("Status")')).toBeVisible();
  });

  test('should populate all fields in plan rows', async ({ page }) => {
    const table = page.locator('[data-testid="plans-table"]');
    await expect(table).toBeVisible();

    // Get first row
    const firstRow = page.locator('tbody tr').first();
    await expect(firstRow).toBeVisible();

    // Get all cells in first row
    const cells = firstRow.locator('td');
    const cellCount = await cells.count();
    expect(cellCount).toBe(6); // Name, Price, Billing, Subscribers, Status, Actions

    // Name column (index 0) - should not be empty
    const nameCell = cells.nth(0);
    const nameText = await nameCell.textContent();
    expect(nameText).toBeTruthy();
    expect(nameText?.trim()).not.toBe('');

    // Price column (index 1) - should have price or "Free"
    const priceCell = cells.nth(1);
    const priceText = await priceCell.textContent();
    expect(priceText).toBeTruthy();

    // Billing column (index 2) - should have billing period
    const billingCell = cells.nth(2);
    const billingText = await billingCell.textContent();
    expect(billingText).toBeTruthy();

    // Status column (index 4) - should have a badge
    const statusCell = cells.nth(4);
    const statusBadge = statusCell.locator('.status-badge');
    await expect(statusBadge).toBeVisible();
  });

  test('should populate fields for multiple plans', async ({ page }) => {
    const table = page.locator('[data-testid="plans-table"]');
    await expect(table).toBeVisible();

    const rows = page.locator('tbody tr');
    const rowCount = await rows.count();

    // Test at least first 2 rows (or all if less)
    const testCount = Math.min(rowCount, 2);

    for (let i = 0; i < testCount; i++) {
      const row = rows.nth(i);
      const cells = row.locator('td');

      // Name should not be empty
      const nameText = await cells.nth(0).textContent();
      expect(nameText?.trim()).not.toBe('');

      // Status badge should exist
      const statusBadge = cells.nth(4).locator('.status-badge');
      await expect(statusBadge).toBeVisible();
    }
  });
});

test.describe('Admin Plans - Sortable Columns', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await navigateViaNavbar(page, 'plans');
    await waitForView(page, 'plans-view');
  });

  test('should have sortable column headers', async ({ page }) => {
    const table = page.locator('[data-testid="plans-table"]');
    await expect(table).toBeVisible();

    // Check that sortable columns have the sortable class or data attribute
    const nameHeader = page.locator('th[data-sortable="name"]');
    const priceHeader = page.locator('th[data-sortable="price"]');
    const billingHeader = page.locator('th[data-sortable="billing_period"]');
    const statusHeader = page.locator('th[data-sortable="status"]');

    await expect(nameHeader).toBeVisible();
    await expect(priceHeader).toBeVisible();
    await expect(billingHeader).toBeVisible();
    await expect(statusHeader).toBeVisible();
  });

  test('should show sort indicator on column header click', async ({ page }) => {
    const table = page.locator('[data-testid="plans-table"]');
    await expect(table).toBeVisible();

    // Click on Name header to sort
    const nameHeader = page.locator('th[data-sortable="name"]');
    await nameHeader.click();

    // Wait for sort indicator
    await page.waitForTimeout(300);

    // Check that the header now has sorted class and indicator
    await expect(nameHeader).toHaveClass(/sorted/);
    const sortIndicator = nameHeader.locator('.sort-indicator');
    await expect(sortIndicator).toContainText('▲');
  });

  test('should toggle sort direction on repeated click', async ({ page }) => {
    const table = page.locator('[data-testid="plans-table"]');
    await expect(table).toBeVisible();

    const nameHeader = page.locator('th[data-sortable="name"]');

    // First click - ascending
    await nameHeader.click();
    await page.waitForTimeout(300);

    // Check for ascending indicator
    const sortIndicator = nameHeader.locator('.sort-indicator');
    await expect(sortIndicator).toContainText('▲');

    // Second click - descending
    await nameHeader.click();
    await page.waitForTimeout(300);

    // Check for descending indicator
    await expect(sortIndicator).toContainText('▼');
  });

  test('should sort by name column', async ({ page }) => {
    const table = page.locator('[data-testid="plans-table"]');
    await expect(table).toBeVisible();

    // Click Name header to sort ascending
    const nameHeader = page.locator('th[data-sortable="name"]');
    await nameHeader.click();
    await page.waitForTimeout(500);

    // Collect names
    const rows = page.locator('tbody tr');
    const rowCount = await rows.count();

    if (rowCount >= 2) {
      const names: string[] = [];
      for (let i = 0; i < Math.min(rowCount, 5); i++) {
        const name = await rows.nth(i).locator('td').first().textContent();
        names.push(name?.trim() || '');
      }

      // Verify sorted (ascending)
      const sorted = [...names].sort((a, b) => a.localeCompare(b));
      expect(names).toEqual(sorted);
    }
  });

  test('should sort by price column', async ({ page }) => {
    const table = page.locator('[data-testid="plans-table"]');
    await expect(table).toBeVisible();

    // Click Price header to sort
    const priceHeader = page.locator('th[data-sortable="price"]');
    await priceHeader.click();
    await page.waitForTimeout(500);

    // Table should still be visible after sort
    await expect(table).toBeVisible();
  });
});

test.describe('Admin Plans - Direct Edit Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await navigateViaNavbar(page, 'plans');
    await waitForView(page, 'plans-view');
  });

  test('should navigate to edit page on row click', async ({ page }) => {
    const table = page.locator('[data-testid="plans-table"]');
    await expect(table).toBeVisible();

    // Click on first plan row
    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();

    // Should navigate to edit page
    await expect(page).toHaveURL(/\/admin\/plans\/[\w-]+\/edit/);
  });

  test('should display Create Plan button', async ({ page }) => {
    const createButton = page.locator('[data-testid="create-plan-button"]');
    await expect(createButton).toBeVisible();
  });

  test('should navigate to create plan form', async ({ page }) => {
    const createButton = page.locator('[data-testid="create-plan-button"]');
    await createButton.click();

    await expect(page).toHaveURL(/\/admin\/plans\/new/);
  });
});
