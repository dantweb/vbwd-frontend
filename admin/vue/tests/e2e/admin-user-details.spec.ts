/**
 * E2E Tests: Admin User Details
 *
 * Tests for the User Details page functionality.
 * Uses real backend with actual login.
 *
 * Run with: E2E_BASE_URL=http://localhost:8081 npx playwright test admin-user-details
 */
import { test, expect } from '@playwright/test';
import { loginAsAdmin, navigateViaNavbar, waitForView } from './helpers/auth';

test.describe('Admin User Details', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await navigateViaNavbar(page, 'users');
    await waitForView(page, 'users-view');
  });

  test('should display user details', async ({ page }) => {
    // Get email from first row before clicking
    const firstRow = page.locator('tbody tr').first();
    const emailInList = await firstRow.locator('td').first().textContent();

    // Click to open the user (goes to edit view now)
    await firstRow.click();

    // Wait for edit view to load
    await expect(page.locator('[data-testid="user-edit-view"]')).toBeVisible();

    // Check user email is displayed in form
    const emailInput = page.locator('input#email, input[name="email"]');
    await expect(emailInput).toHaveValue(emailInList?.trim() || '');
  });

  test('should display user form fields', async ({ page }) => {
    // Click first row to open edit page
    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();

    await expect(page.locator('[data-testid="user-edit-view"]')).toBeVisible();

    // Check form fields exist
    await expect(page.locator('input#email')).toBeVisible();
    await expect(page.locator('[data-testid="status-select"]')).toBeVisible();
    await expect(page.locator('input#firstName')).toBeVisible();
    await expect(page.locator('input#lastName')).toBeVisible();
  });

  test('should show back button to users list', async ({ page }) => {
    // Click first row to open edit page
    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();

    await expect(page.locator('[data-testid="user-edit-view"]')).toBeVisible();

    // Find and click back button
    const backButton = page.locator('[data-testid="back-button"]');
    await expect(backButton).toBeVisible();

    await backButton.click();
    await expect(page).toHaveURL(/.*\/admin\/users$/);
    await waitForView(page, 'users-view');
  });

  test('should change user status to inactive', async ({ page }) => {
    // Click first row to open edit page
    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();

    await expect(page.locator('[data-testid="user-edit-view"]')).toBeVisible();

    // Get status select
    const statusSelect = page.locator('[data-testid="status-select"]');
    await expect(statusSelect).toBeVisible();

    // Get current value and toggle
    const currentValue = await statusSelect.inputValue();
    const newValue = currentValue === 'true' ? 'false' : 'true';
    await statusSelect.selectOption(newValue);

    // Submit form
    await page.locator('[data-testid="submit-button"]').click();

    // Should redirect back to users list
    await expect(page).toHaveURL(/\/admin\/users$/, { timeout: 10000 });
    await waitForView(page, 'users-view');
  });

  test('should edit multiple users in sequence', async ({ page }) => {
    // Click first row to open edit page
    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();

    await expect(page.locator('[data-testid="user-edit-view"]')).toBeVisible();

    // Submit without changes
    await page.locator('[data-testid="submit-button"]').click();
    await expect(page).toHaveURL(/\/admin\/users$/, { timeout: 10000 });
    await waitForView(page, 'users-view');

    // Click second row if available
    const rows = page.locator('tbody tr');
    const rowCount = await rows.count();

    if (rowCount > 1) {
      await rows.nth(1).click();
      await expect(page.locator('[data-testid="user-edit-view"]')).toBeVisible();

      // Submit without changes
      await page.locator('[data-testid="submit-button"]').click();
      await expect(page).toHaveURL(/\/admin\/users$/, { timeout: 10000 });
    }
  });

  test('should display user status in edit form', async ({ page }) => {
    // Click first row to open edit page
    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();

    await expect(page.locator('[data-testid="user-edit-view"]')).toBeVisible();

    // Check for status select with Active/Inactive options
    const statusSelect = page.locator('[data-testid="status-select"]');
    await expect(statusSelect).toBeVisible();

    // Should have 2 options
    const options = statusSelect.locator('option');
    await expect(options).toHaveCount(2);
  });
});
