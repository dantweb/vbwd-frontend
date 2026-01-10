/**
 * E2E Tests: Admin Subscriptions - Fields & Sorting
 *
 * Tests subscription list field population and sortable columns.
 * TDD-First: Tests written before implementation verification.
 *
 * Run with: E2E_BASE_URL=http://localhost:8081 npx playwright test admin-subscriptions-fields
 */
import { test, expect } from '@playwright/test';
import { loginAsAdmin, navigateViaNavbar, waitForView } from './helpers/auth';

test.describe('Admin Subscriptions - Field Population', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await navigateViaNavbar(page, 'subscriptions');
    await waitForView(page, 'subscriptions-view');
  });

  test('should display subscriptions table with data', async ({ page }) => {
    const table = page.locator('[data-testid="subscriptions-table"]');
    await expect(table).toBeVisible();

    // Verify table has rows
    const rows = page.locator('tbody tr');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should display user email in first column', async ({ page }) => {
    const table = page.locator('[data-testid="subscriptions-table"]');
    await expect(table).toBeVisible();

    // First row, first column should have email
    const firstCell = page.locator('tbody tr').first().locator('td').nth(0);
    const text = await firstCell.textContent();
    expect(text).toBeTruthy();
    expect(text).toContain('@');
  });

  test('should display plan name in second column', async ({ page }) => {
    const table = page.locator('[data-testid="subscriptions-table"]');
    await expect(table).toBeVisible();

    // First row, second column should have plan name
    const secondCell = page.locator('tbody tr').first().locator('td').nth(1);
    const text = await secondCell.textContent();
    expect(text).toBeTruthy();
    expect(text!.length).toBeGreaterThan(0);
  });

  test('should display status badge in third column', async ({ page }) => {
    const table = page.locator('[data-testid="subscriptions-table"]');
    await expect(table).toBeVisible();

    // Third column should have status badge
    const statusCell = page.locator('tbody tr').first().locator('td').nth(2);
    const statusBadge = statusCell.locator('.status-badge');
    await expect(statusBadge).toBeVisible();
  });

  test('should display created date in fourth column', async ({ page }) => {
    const table = page.locator('[data-testid="subscriptions-table"]');
    await expect(table).toBeVisible();

    // Fourth column should have date
    const dateCell = page.locator('tbody tr').first().locator('td').nth(3);
    const text = await dateCell.textContent();
    expect(text).toBeTruthy();
    // Date should contain / or - (date separator)
    expect(text).toMatch(/[\d/\-.]+/);
  });

  test('should display total count', async ({ page }) => {
    const totalCount = page.locator('.total-count');
    await expect(totalCount).toBeVisible();
    const text = await totalCount.textContent();
    expect(text).toMatch(/\d+ total/);
  });
});

test.describe('Admin Subscriptions - Sortable Columns', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await navigateViaNavbar(page, 'subscriptions');
    await waitForView(page, 'subscriptions-view');
  });

  test('should have sortable column headers', async ({ page }) => {
    const table = page.locator('[data-testid="subscriptions-table"]');
    await expect(table).toBeVisible();

    // Check all columns have sortable class
    const userHeader = page.locator('th[data-sortable="user_email"]');
    const planHeader = page.locator('th[data-sortable="plan_name"]');
    const statusHeader = page.locator('th[data-sortable="status"]');
    const createdHeader = page.locator('th[data-sortable="created_at"]');

    await expect(userHeader).toHaveClass(/sortable/);
    await expect(planHeader).toHaveClass(/sortable/);
    await expect(statusHeader).toHaveClass(/sortable/);
    await expect(createdHeader).toHaveClass(/sortable/);
  });

  test('should sort by user email when clicking header', async ({ page }) => {
    const table = page.locator('[data-testid="subscriptions-table"]');
    await expect(table).toBeVisible();

    const userHeader = page.locator('th[data-sortable="user_email"]');

    // Get first email before sort (not used in assertion but helps debug)
    await page.locator('tbody tr').first().locator('td').nth(0).textContent();

    // Click to sort
    await userHeader.click();
    await page.waitForTimeout(200);

    // Verify header shows sorted state
    await expect(userHeader).toHaveClass(/sorted/);

    // Verify sort indicator appears
    const indicator = userHeader.locator('.sort-indicator');
    const indicatorText = await indicator.textContent();
    expect(indicatorText).toMatch(/[▲▼]/);
  });

  test('should toggle sort direction on second click', async ({ page }) => {
    const table = page.locator('[data-testid="subscriptions-table"]');
    await expect(table).toBeVisible();

    const userHeader = page.locator('th[data-sortable="user_email"]');

    // First click - ascending
    await userHeader.click();
    await page.waitForTimeout(200);

    const indicator = userHeader.locator('.sort-indicator');
    let indicatorText = await indicator.textContent();
    const firstDirection = indicatorText;

    // Second click - descending
    await userHeader.click();
    await page.waitForTimeout(200);

    indicatorText = await indicator.textContent();
    expect(indicatorText).not.toBe(firstDirection);
  });

  test('should sort by plan name', async ({ page }) => {
    const table = page.locator('[data-testid="subscriptions-table"]');
    await expect(table).toBeVisible();

    const planHeader = page.locator('th[data-sortable="plan_name"]');
    await planHeader.click();
    await page.waitForTimeout(200);

    await expect(planHeader).toHaveClass(/sorted/);
    const indicator = planHeader.locator('.sort-indicator');
    await expect(indicator).toContainText(/[▲▼]/);
  });

  test('should sort by status', async ({ page }) => {
    const table = page.locator('[data-testid="subscriptions-table"]');
    await expect(table).toBeVisible();

    const statusHeader = page.locator('th[data-sortable="status"]');
    await statusHeader.click();
    await page.waitForTimeout(200);

    await expect(statusHeader).toHaveClass(/sorted/);
    const indicator = statusHeader.locator('.sort-indicator');
    await expect(indicator).toContainText(/[▲▼]/);
  });

  test('should sort by created date', async ({ page }) => {
    const table = page.locator('[data-testid="subscriptions-table"]');
    await expect(table).toBeVisible();

    const createdHeader = page.locator('th[data-sortable="created_at"]');
    await createdHeader.click();
    await page.waitForTimeout(200);

    await expect(createdHeader).toHaveClass(/sorted/);
    const indicator = createdHeader.locator('.sort-indicator');
    await expect(indicator).toContainText(/[▲▼]/);
  });

  test('should change sorted column when clicking different header', async ({ page }) => {
    const table = page.locator('[data-testid="subscriptions-table"]');
    await expect(table).toBeVisible();

    const userHeader = page.locator('th[data-sortable="user_email"]');
    const planHeader = page.locator('th[data-sortable="plan_name"]');

    // Sort by user first
    await userHeader.click();
    await page.waitForTimeout(200);
    await expect(userHeader).toHaveClass(/sorted/);

    // Sort by plan - user should no longer be sorted
    await planHeader.click();
    await page.waitForTimeout(200);

    await expect(planHeader).toHaveClass(/sorted/);
    // User header should not have sorted class anymore (or indicator should be empty)
    const userIndicator = userHeader.locator('.sort-indicator');
    const userIndicatorText = await userIndicator.textContent();
    expect(userIndicatorText?.trim()).toBe('');
  });
});

test.describe('Admin Subscriptions - Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await navigateViaNavbar(page, 'subscriptions');
    await waitForView(page, 'subscriptions-view');
  });

  test('should navigate to subscription details on row click', async ({ page }) => {
    const table = page.locator('[data-testid="subscriptions-table"]');
    await expect(table).toBeVisible();

    // Click first row
    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();

    // Should navigate to details page
    await expect(page).toHaveURL(/\/admin\/subscriptions\/[\w-]+/);
  });

  test('should have create subscription button', async ({ page }) => {
    const createBtn = page.locator('[data-testid="create-subscription-button"]');
    await expect(createBtn).toBeVisible();
  });

  test('should navigate to create form when clicking create button', async ({ page }) => {
    const createBtn = page.locator('[data-testid="create-subscription-button"]');
    await createBtn.click();

    await expect(page).toHaveURL(/\/admin\/subscriptions\/create/);
  });
});
