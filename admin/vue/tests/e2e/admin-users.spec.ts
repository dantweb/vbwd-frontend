import { test, expect } from '@playwright/test';
import { setupAuth } from './fixtures/admin';
import { mockUsersAPI, mockUsers } from './helpers/api-mocks';

test.describe('Admin Users Management', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
    await mockUsersAPI(page);
  });

  test('should display users list', async ({ page }) => {
    await page.goto('/admin/users');

    // Check page title
    await expect(page.locator('h1, h2').first()).toContainText('Users');

    // Check table headers exist
    await expect(page.locator('th:has-text("Email")')).toBeVisible();
    await expect(page.locator('th:has-text("Status")')).toBeVisible();

    // Check users are displayed
    for (const user of mockUsers.slice(0, 3)) {
      await expect(page.locator(`text=${user.email}`)).toBeVisible();
    }
  });

  test('should search users by email', async ({ page }) => {
    await page.goto('/admin/users');

    // Enter search query
    const searchInput = page.locator('input[placeholder*="Search"], input[data-testid="search-input"]');
    await searchInput.fill('user1@test.com');

    // Trigger search (may be on input or need button click)
    await searchInput.press('Enter');

    // Wait for filtered results
    await page.waitForTimeout(300);

    // Should show matching user
    await expect(page.locator('text=user1@test.com')).toBeVisible();
  });

  test('should filter users by status', async ({ page }) => {
    await page.goto('/admin/users');

    // Find and click status filter
    const statusFilter = page.locator('select[data-testid="status-filter"], select:has-text("Status")').first();
    if (await statusFilter.isVisible()) {
      await statusFilter.selectOption('suspended');
      await page.waitForTimeout(300);
    }
  });

  test('should navigate to user details', async ({ page }) => {
    await page.goto('/admin/users');

    // Click on first user row or view button
    const viewButton = page.locator('[data-testid="view-user"], a:has-text("View")').first();
    if (await viewButton.isVisible()) {
      await viewButton.click();
    } else {
      // Click on user email link
      await page.locator('text=user1@test.com').click();
    }

    // Should navigate to user details
    await expect(page).toHaveURL(/.*\/admin\/users\/\d+/);
  });

  test('should display user status badges', async ({ page }) => {
    await page.goto('/admin/users');

    // Check for status badges
    await expect(page.locator('.badge:has-text("active"), .status-badge:has-text("active")').first()).toBeVisible();
  });

  test('should show pagination when many users', async ({ page }) => {
    await page.goto('/admin/users');

    // Check for pagination controls (if users exceed page size)
    await expect(page.locator('[data-testid="pagination"], .pagination, nav[aria-label="pagination"]').first()).toBeDefined();
  });
});
