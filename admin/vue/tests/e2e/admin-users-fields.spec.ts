/**
 * E2E Tests: Admin Users - Field Population & Sorting
 *
 * Tests that all table fields are populated and sorting works.
 * TDD-First: Tests written before implementation.
 *
 * Run with: E2E_BASE_URL=http://localhost:8081 npx playwright test admin-users-fields
 */
import { test, expect } from '@playwright/test';
import { loginAsAdmin, navigateViaNavbar, waitForView } from './helpers/auth';

test.describe('Admin Users - Field Population', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await navigateViaNavbar(page, 'users');
    await waitForView(page, 'users-view');
  });

  test('should display all column headers', async ({ page }) => {
    const table = page.locator('[data-testid="users-table"]');
    await expect(table).toBeVisible();

    // Verify all column headers exist
    await expect(page.locator('th:has-text("Email")')).toBeVisible();
    await expect(page.locator('th:has-text("Name")')).toBeVisible();
    await expect(page.locator('th:has-text("Status")')).toBeVisible();
    await expect(page.locator('th:has-text("Roles")')).toBeVisible();
    await expect(page.locator('th:has-text("Created")')).toBeVisible();
  });

  test('should populate all fields in user rows', async ({ page }) => {
    const table = page.locator('[data-testid="users-table"]');
    await expect(table).toBeVisible();

    // Get first row
    const firstRow = page.locator('tbody tr').first();
    await expect(firstRow).toBeVisible();

    // Get all cells in first row
    const cells = firstRow.locator('td');
    const cellCount = await cells.count();
    expect(cellCount).toBe(5); // Email, Name, Status, Roles, Created

    // Email column (index 0) - should not be empty
    const emailCell = cells.nth(0);
    const emailText = await emailCell.textContent();
    expect(emailText).toBeTruthy();
    expect(emailText?.trim()).not.toBe('');
    expect(emailText).toMatch(/@/); // Should contain @ for email

    // Name column (index 1) - can be empty but cell should exist
    const nameCell = cells.nth(1);
    await expect(nameCell).toBeVisible();

    // Status column (index 2) - should have a badge
    const statusCell = cells.nth(2);
    const statusBadge = statusCell.locator('.status-badge');
    await expect(statusBadge).toBeVisible();
    const statusText = await statusBadge.textContent();
    expect(['Active', 'Inactive']).toContain(statusText?.trim());

    // Roles column (index 3) - should have at least one role badge
    const rolesCell = cells.nth(3);
    const roleBadges = rolesCell.locator('.role-badge');
    const roleCount = await roleBadges.count();
    expect(roleCount).toBeGreaterThan(0);

    // Created column (index 4) - should have a date
    const createdCell = cells.nth(4);
    const createdText = await createdCell.textContent();
    expect(createdText).toBeTruthy();
    expect(createdText?.trim()).not.toBe('-');
  });

  test('should populate fields for multiple users', async ({ page }) => {
    const table = page.locator('[data-testid="users-table"]');
    await expect(table).toBeVisible();

    const rows = page.locator('tbody tr');
    const rowCount = await rows.count();

    // Test at least first 3 rows (or all if less)
    const testCount = Math.min(rowCount, 3);

    for (let i = 0; i < testCount; i++) {
      const row = rows.nth(i);
      const cells = row.locator('td');

      // Email should not be empty
      const emailText = await cells.nth(0).textContent();
      expect(emailText?.trim()).not.toBe('');

      // Status badge should exist
      const statusBadge = cells.nth(2).locator('.status-badge');
      await expect(statusBadge).toBeVisible();

      // At least one role badge
      const roleBadges = cells.nth(3).locator('.role-badge');
      expect(await roleBadges.count()).toBeGreaterThan(0);
    }
  });
});

test.describe('Admin Users - Sortable Columns', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await navigateViaNavbar(page, 'users');
    await waitForView(page, 'users-view');
  });

  test('should have sortable column headers', async ({ page }) => {
    const table = page.locator('[data-testid="users-table"]');
    await expect(table).toBeVisible();

    // Check that sortable columns have the sortable class or data attribute
    const emailHeader = page.locator('th[data-sortable="email"], th.sortable:has-text("Email")');
    const nameHeader = page.locator('th[data-sortable="name"], th.sortable:has-text("Name")');
    const statusHeader = page.locator('th[data-sortable="status"], th.sortable:has-text("Status")');
    const createdHeader = page.locator('th[data-sortable="created_at"], th.sortable:has-text("Created")');

    await expect(emailHeader).toBeVisible();
    await expect(nameHeader).toBeVisible();
    await expect(statusHeader).toBeVisible();
    await expect(createdHeader).toBeVisible();
  });

  test('should show sort indicator on column header click', async ({ page }) => {
    const table = page.locator('[data-testid="users-table"]');
    await expect(table).toBeVisible();

    // Click on Email header to sort
    const emailHeader = page.locator('th[data-sortable="email"]');
    await emailHeader.click();

    // Wait for sort indicator
    await page.waitForTimeout(300);

    // Check that the header now has sorted class and indicator
    await expect(emailHeader).toHaveClass(/sorted/);
    const sortIndicator = emailHeader.locator('.sort-indicator');
    await expect(sortIndicator).toContainText('▲');
  });

  test('should toggle sort direction on repeated click', async ({ page }) => {
    const table = page.locator('[data-testid="users-table"]');
    await expect(table).toBeVisible();

    const emailHeader = page.locator('th:has-text("Email")');

    // First click - ascending
    await emailHeader.click();
    await page.waitForTimeout(300);

    // Check for ascending indicator
    const ascIndicator = page.locator('th:has-text("Email") .sort-indicator');
    await expect(ascIndicator).toContainText('▲');

    // Second click - descending
    await emailHeader.click();
    await page.waitForTimeout(300);

    // Check for descending indicator
    await expect(ascIndicator).toContainText('▼');
  });

  test('should sort by email column', async ({ page }) => {
    const table = page.locator('[data-testid="users-table"]');
    await expect(table).toBeVisible();

    // Click Email header to sort ascending
    const emailHeader = page.locator('th:has-text("Email")');
    await emailHeader.click();
    await page.waitForTimeout(500);

    // Collect emails
    const rows = page.locator('tbody tr');
    const rowCount = await rows.count();

    if (rowCount >= 2) {
      const emails: string[] = [];
      for (let i = 0; i < Math.min(rowCount, 5); i++) {
        const email = await rows.nth(i).locator('td').first().textContent();
        emails.push(email?.trim() || '');
      }

      // Verify sorted (ascending)
      const sorted = [...emails].sort((a, b) => a.localeCompare(b));
      expect(emails).toEqual(sorted);
    }
  });

  test('should sort by created date column', async ({ page }) => {
    const table = page.locator('[data-testid="users-table"]');
    await expect(table).toBeVisible();

    // Click Created header to sort
    const createdHeader = page.locator('th:has-text("Created")');
    await createdHeader.click();
    await page.waitForTimeout(500);

    // Table should still be visible after sort
    await expect(table).toBeVisible();
  });
});

test.describe('Admin Users - Direct Edit Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await navigateViaNavbar(page, 'users');
    await waitForView(page, 'users-view');
  });

  test('should navigate directly to edit page on row click', async ({ page }) => {
    const table = page.locator('[data-testid="users-table"]');
    await expect(table).toBeVisible();

    // Click on first user row
    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();

    // Should navigate directly to edit page (not details page)
    await expect(page).toHaveURL(/\/admin\/users\/[\w-]+\/edit/);
    await expect(page.locator('[data-testid="user-edit-view"]')).toBeVisible();
  });

  test('should load user data in edit form after row click', async ({ page }) => {
    const table = page.locator('[data-testid="users-table"]');
    await expect(table).toBeVisible();

    // Get email from first row before clicking
    const firstRow = page.locator('tbody tr').first();
    const emailInList = await firstRow.locator('td').first().textContent();

    // Click row
    await firstRow.click();

    // Wait for edit form to load
    await expect(page.locator('[data-testid="user-edit-view"]')).toBeVisible();
    await expect(page.locator('[data-testid="user-form"]')).toBeVisible();

    // Verify email matches
    const emailInput = page.locator('input#email, input[name="email"]');
    await expect(emailInput).toHaveValue(emailInList?.trim() || '');
  });
});
