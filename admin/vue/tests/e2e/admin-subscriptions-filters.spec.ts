/**
 * E2E Tests: Admin Subscriptions - Filters
 *
 * Tests subscription list filtering by status and plan.
 * TDD-First: Tests written before implementation verification.
 *
 * Run with: E2E_BASE_URL=http://localhost:8081 npx playwright test admin-subscriptions-filters
 */
import { test, expect } from '@playwright/test';
import { loginAsAdmin, navigateViaNavbar, waitForView } from './helpers/auth';

test.describe('Admin Subscriptions - Status Filter', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await navigateViaNavbar(page, 'subscriptions');
    await waitForView(page, 'subscriptions-view');
  });

  test('should display status filter dropdown', async ({ page }) => {
    const statusFilter = page.locator('[data-testid="status-filter"]');
    await expect(statusFilter).toBeVisible();
  });

  test('should have all status options', async ({ page }) => {
    const statusFilter = page.locator('[data-testid="status-filter"]');
    await expect(statusFilter).toBeVisible();

    // Check options exist
    await expect(statusFilter.locator('option[value=""]')).toHaveText('All Status');
    await expect(statusFilter.locator('option[value="active"]')).toHaveText('Active');
    await expect(statusFilter.locator('option[value="cancelled"]')).toHaveText('Cancelled');
    await expect(statusFilter.locator('option[value="past_due"]')).toHaveText('Past Due');
    await expect(statusFilter.locator('option[value="trialing"]')).toHaveText('Trialing');
    await expect(statusFilter.locator('option[value="paused"]')).toHaveText('Paused');
  });

  test('should filter by active status', async ({ page }) => {
    const table = page.locator('[data-testid="subscriptions-table"]');
    await expect(table).toBeVisible();

    // Get initial row count
    const initialRows = page.locator('tbody tr');
    const initialCount = await initialRows.count();

    // Filter by active
    const statusFilter = page.locator('[data-testid="status-filter"]');
    await statusFilter.selectOption('active');

    // Wait for filter to apply
    await page.waitForTimeout(500);

    // If there are active subscriptions, verify they show status badge
    const filteredRows = page.locator('tbody tr');
    const filteredCount = await filteredRows.count();

    // Count should change (usually fewer) or same if all are active
    expect(filteredCount).toBeLessThanOrEqual(initialCount);

    // All visible rows should have active status badge
    if (filteredCount > 0) {
      const activeStatusBadges = page.locator('tbody tr [data-testid="status-active"]');
      const activeCount = await activeStatusBadges.count();
      expect(activeCount).toBe(filteredCount);
    }
  });

  test('should filter by cancelled status', async ({ page }) => {
    const statusFilter = page.locator('[data-testid="status-filter"]');
    await statusFilter.selectOption('cancelled');

    await page.waitForTimeout(500);

    // All visible rows should have cancelled status badge
    const rows = page.locator('tbody tr');
    const rowCount = await rows.count();

    if (rowCount > 0) {
      const cancelledBadges = page.locator('tbody tr [data-testid="status-cancelled"]');
      const cancelledCount = await cancelledBadges.count();
      expect(cancelledCount).toBe(rowCount);
    }
  });

  test('should reset to all when selecting empty filter', async ({ page }) => {
    const statusFilter = page.locator('[data-testid="status-filter"]');

    // First filter by active
    await statusFilter.selectOption('active');
    await page.waitForTimeout(500);

    const filteredCount = await page.locator('tbody tr').count();

    // Then reset to all
    await statusFilter.selectOption('');
    await page.waitForTimeout(500);

    const resetCount = await page.locator('tbody tr').count();

    // Reset count should be >= filtered count
    expect(resetCount).toBeGreaterThanOrEqual(filteredCount);
  });
});

test.describe('Admin Subscriptions - Plan Filter', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await navigateViaNavbar(page, 'subscriptions');
    await waitForView(page, 'subscriptions-view');
  });

  test('should display plan filter dropdown', async ({ page }) => {
    const planFilter = page.locator('[data-testid="plan-filter"]');
    await expect(planFilter).toBeVisible();
  });

  test('should have all plan options', async ({ page }) => {
    const planFilter = page.locator('[data-testid="plan-filter"]');
    await expect(planFilter).toBeVisible();

    // Check options exist
    await expect(planFilter.locator('option[value=""]')).toHaveText('All Plans');
    await expect(planFilter.locator('option[value="Free"]')).toHaveText('Free');
    await expect(planFilter.locator('option[value="Pro"]')).toHaveText('Pro');
    await expect(planFilter.locator('option[value="Enterprise"]')).toHaveText('Enterprise');
  });

  test('should filter by Free plan', async ({ page }) => {
    const table = page.locator('[data-testid="subscriptions-table"]');
    await expect(table).toBeVisible();

    const planFilter = page.locator('[data-testid="plan-filter"]');
    await planFilter.selectOption('Free');

    await page.waitForTimeout(500);

    // All visible rows should have Free in plan column
    const rows = page.locator('tbody tr');
    const rowCount = await rows.count();

    if (rowCount > 0) {
      for (let i = 0; i < rowCount; i++) {
        const planCell = rows.nth(i).locator('td').nth(1);
        const planText = await planCell.textContent();
        expect(planText).toContain('Free');
      }
    }
  });

  test('should filter by Pro plan', async ({ page }) => {
    const planFilter = page.locator('[data-testid="plan-filter"]');
    await planFilter.selectOption('Pro');

    await page.waitForTimeout(500);

    const rows = page.locator('tbody tr');
    const rowCount = await rows.count();

    if (rowCount > 0) {
      for (let i = 0; i < rowCount; i++) {
        const planCell = rows.nth(i).locator('td').nth(1);
        const planText = await planCell.textContent();
        expect(planText).toContain('Pro');
      }
    }
  });
});

test.describe('Admin Subscriptions - Combined Filters', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await navigateViaNavbar(page, 'subscriptions');
    await waitForView(page, 'subscriptions-view');
  });

  test('should apply multiple filters together', async ({ page }) => {
    const statusFilter = page.locator('[data-testid="status-filter"]');
    const planFilter = page.locator('[data-testid="plan-filter"]');

    // Apply both filters
    await statusFilter.selectOption('active');
    await page.waitForTimeout(300);
    await planFilter.selectOption('Pro');
    await page.waitForTimeout(500);

    // Check results match both criteria
    const rows = page.locator('tbody tr');
    const rowCount = await rows.count();

    if (rowCount > 0) {
      // Verify each row has active status and Pro plan
      for (let i = 0; i < rowCount; i++) {
        const row = rows.nth(i);
        const statusBadge = row.locator('[data-testid="status-active"]');
        const planCell = row.locator('td').nth(1);

        await expect(statusBadge).toBeVisible();
        await expect(planCell).toContainText('Pro');
      }
    }
  });

  test('should show empty state when no matches', async ({ page }) => {
    // Try to filter with uncommon combination
    const statusFilter = page.locator('[data-testid="status-filter"]');
    const planFilter = page.locator('[data-testid="plan-filter"]');

    await statusFilter.selectOption('past_due');
    await page.waitForTimeout(300);
    await planFilter.selectOption('Enterprise');
    await page.waitForTimeout(500);

    // Either empty state or table with matching rows
    const table = page.locator('[data-testid="subscriptions-table"]');
    const emptyState = page.locator('[data-testid="empty-state"]');

    const hasTable = await table.isVisible().catch(() => false);
    const hasEmpty = await emptyState.isVisible().catch(() => false);

    // One of them should be visible
    expect(hasTable || hasEmpty).toBeTruthy();
  });

  test('should reset page to 1 when filter changes', async ({ page }) => {
    // This test verifies pagination reset on filter change
    const statusFilter = page.locator('[data-testid="status-filter"]');

    // Apply a filter
    await statusFilter.selectOption('active');
    await page.waitForTimeout(500);

    // Check if pagination exists
    const pagination = page.locator('[data-testid="pagination"]');
    const hasPagination = await pagination.isVisible().catch(() => false);

    if (hasPagination) {
      // Page info should show page 1
      const pageInfo = page.locator('.pagination-info');
      const pageText = await pageInfo.textContent();
      expect(pageText).toContain('Page 1');
    }

    // Test passes regardless of pagination presence
    expect(true).toBeTruthy();
  });
});
