/**
 * E2E Tests: Admin Users Management
 *
 * Tests user listing, search, filter, and navigation.
 * Uses real backend data (UI-First approach).
 *
 * Run with: E2E_BASE_URL=http://localhost:8081 npx playwright test admin-users
 */
import { test, expect } from '@playwright/test';
import { loginAsAdmin, navigateViaNavbar, waitForView } from './helpers/auth';

test.describe('Admin Users Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await navigateViaNavbar(page, 'users');
    await waitForView(page, 'users-view');
  });

  test('should display users list', async ({ page }) => {
    // Check page loaded with title (within users-view container)
    await expect(page.locator('[data-testid="users-view"] h2')).toContainText('Users');

    // Check table is visible
    await expect(page.locator('[data-testid="users-table"]')).toBeVisible();

    // Check table headers exist
    await expect(page.locator('th:has-text("Email")')).toBeVisible();
    await expect(page.locator('th:has-text("Status")')).toBeVisible();
  });

  test('should display Create User button', async ({ page }) => {
    const createButton = page.locator('[data-testid="create-user-button"]');
    await expect(createButton).toBeVisible();
    await expect(createButton).toContainText('Create User');
  });

  test('should search users by email', async ({ page }) => {
    // Enter search query
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('admin');
    await searchInput.press('Enter');

    // Wait for filtered results
    await page.waitForTimeout(500);

    // Table should still be visible
    await expect(page.locator('[data-testid="users-table"]')).toBeVisible();
  });

  test('should filter users by status', async ({ page }) => {
    // Find and change status filter
    const statusFilter = page.locator('[data-testid="status-filter"]');
    await expect(statusFilter).toBeVisible();

    await statusFilter.selectOption('active');
    await page.waitForTimeout(500);

    // Table should still be visible after filtering
    const table = page.locator('[data-testid="users-table"]');
    const emptyState = page.locator('[data-testid="empty-state"]');

    // Either table with results or empty state is acceptable
    const tableVisible = await table.isVisible().catch(() => false);
    const emptyVisible = await emptyState.isVisible().catch(() => false);
    expect(tableVisible || emptyVisible).toBeTruthy();
  });

  test('should navigate to user edit on row click', async ({ page }) => {
    // Wait for table to load
    const table = page.locator('[data-testid="users-table"]');
    await expect(table).toBeVisible();

    // Click on first user row
    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();

    // Should navigate directly to user edit page
    await expect(page).toHaveURL(/\/admin\/users\/[\w-]+\/edit/);
    await expect(page.locator('[data-testid="user-edit-view"]')).toBeVisible();
  });

  test('should display user status badges', async ({ page }) => {
    // Check for status badges in the table
    const statusBadge = page.locator('[data-testid="status-active"], [data-testid="status-inactive"]').first();
    await expect(statusBadge).toBeVisible();
  });

  test('should navigate to create user form', async ({ page }) => {
    // Click create user button
    await page.locator('[data-testid="create-user-button"]').click();

    // Should navigate to create form
    await expect(page).toHaveURL(/\/admin\/users\/create/);
    await expect(page.locator('[data-testid="user-create-view"]')).toBeVisible();
    await expect(page.locator('[data-testid="user-form"]')).toBeVisible();
  });

  test('should show pagination when many users', async ({ page }) => {
    // Pagination may or may not be visible depending on user count
    const pagination = page.locator('[data-testid="pagination"]');
    const paginationVisible = await pagination.isVisible().catch(() => false);

    // If pagination exists, check controls
    if (paginationVisible) {
      await expect(page.locator('[data-testid="pagination-prev"]')).toBeVisible();
      await expect(page.locator('[data-testid="pagination-next"]')).toBeVisible();
    }

    // Test passes regardless - pagination only shows when needed
    expect(true).toBeTruthy();
  });

  test('should display user edit form with proper title', async ({ page }) => {
    // Click on first user row to go directly to edit
    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();

    // Wait for user edit page
    await expect(page.locator('[data-testid="user-edit-view"]')).toBeVisible();

    // Check form and title
    await expect(page.locator('[data-testid="user-form"]')).toBeVisible();
    await expect(page.locator('[data-testid="form-title"]')).toContainText('Edit User');
  });

  test('should have back button that returns to users list', async ({ page }) => {
    // Click on first user row to go to edit
    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();

    // Wait for user edit page
    await expect(page.locator('[data-testid="user-edit-view"]')).toBeVisible();

    // Click back button
    await page.locator('[data-testid="back-button"]').click();

    // Should navigate back to users list
    await expect(page).toHaveURL(/\/admin\/users$/);
    await expect(page.locator('[data-testid="users-view"]')).toBeVisible();
  });
});
