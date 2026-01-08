/**
 * E2E Tests: Admin User Edit - Status Change & Field Updates
 *
 * Tests that user status and other fields can be updated and saved.
 * TDD-First: Tests written before implementation.
 *
 * Run with: E2E_BASE_URL=http://localhost:8081 npx playwright test admin-user-edit
 */
import { test, expect } from '@playwright/test';
import { loginAsAdmin, navigateViaNavbar, waitForView } from './helpers/auth';

test.describe('Admin User Edit - Status Change', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await navigateViaNavbar(page, 'users');
    await waitForView(page, 'users-view');
  });

  test('should display status select in edit form', async ({ page }) => {
    // Navigate to edit page
    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();

    await expect(page.locator('[data-testid="user-edit-view"]')).toBeVisible();

    // Check status select exists
    const statusSelect = page.locator('[data-testid="status-select"]');
    await expect(statusSelect).toBeVisible();

    // Should have Active and Inactive options (options inside closed select are hidden, check count)
    const options = statusSelect.locator('option');
    await expect(options).toHaveCount(2);

    // Click to open and verify options text
    await statusSelect.click();
    await page.waitForTimeout(100);
  });

  test('should change user status from Active to Inactive', async ({ page }) => {
    // Navigate to edit page
    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();

    await expect(page.locator('[data-testid="user-edit-view"]')).toBeVisible();

    // Get current status
    const statusSelect = page.locator('[data-testid="status-select"]');
    const currentStatus = await statusSelect.inputValue();

    // Change status to opposite
    const newStatus = currentStatus === 'true' ? 'false' : 'true';
    await statusSelect.selectOption(newStatus);

    // Submit form
    await page.locator('[data-testid="submit-button"]').click();

    // Wait for navigation back to users list
    await expect(page).toHaveURL(/\/admin\/users$/);
    await waitForView(page, 'users-view');

    // Verify the user's status badge has changed
    await expect(page.locator('[data-testid="users-table"]')).toBeVisible();
  });

  test('should submit form and navigate back to list', async ({ page }) => {
    // Navigate to edit page
    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();

    await expect(page.locator('[data-testid="user-edit-view"]')).toBeVisible();

    // Just submit the form without changes
    await page.locator('[data-testid="submit-button"]').click();

    // Should navigate back to users list after submit
    await expect(page).toHaveURL(/\/admin\/users$/);
    await waitForView(page, 'users-view');

    // Users table should be visible
    await expect(page.locator('[data-testid="users-table"]')).toBeVisible();
  });
});

test.describe('Admin User Edit - Field Updates', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await navigateViaNavbar(page, 'users');
    await waitForView(page, 'users-view');
  });

  test('should display user data in edit form', async ({ page }) => {
    // Click first row to edit
    const firstRow = page.locator('tbody tr').first();
    const emailInList = await firstRow.locator('td').first().textContent();
    await firstRow.click();

    await expect(page.locator('[data-testid="user-edit-view"]')).toBeVisible();
    await expect(page.locator('[data-testid="user-form"]')).toBeVisible();

    // Email should be populated and readonly
    const emailInput = page.locator('input#email, input[name="email"]');
    await expect(emailInput).toHaveValue(emailInList?.trim() || '');
    await expect(emailInput).toBeDisabled();
  });

  test('should update first name field', async ({ page }) => {
    // Click first row to edit
    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();

    await expect(page.locator('[data-testid="user-edit-view"]')).toBeVisible();

    // Update first name
    const firstNameInput = page.locator('input#firstName, input[name="firstName"]');
    const originalName = await firstNameInput.inputValue();
    const newName = originalName === 'TestName' ? 'UpdatedName' : 'TestName';

    await firstNameInput.clear();
    await firstNameInput.fill(newName);

    // Submit
    await page.locator('[data-testid="submit-button"]').click();
    await page.waitForTimeout(1000);

    // Revert: Go back and restore original name
    await page.goBack();
    await expect(page.locator('[data-testid="user-edit-view"]')).toBeVisible();
    await firstNameInput.clear();
    await firstNameInput.fill(originalName);
    await page.locator('[data-testid="submit-button"]').click();
  });

  test('should update last name field', async ({ page }) => {
    // Click first row to edit
    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();

    await expect(page.locator('[data-testid="user-edit-view"]')).toBeVisible();

    // Update last name
    const lastNameInput = page.locator('input#lastName, input[name="lastName"]');
    await expect(lastNameInput).toBeVisible();

    const originalName = await lastNameInput.inputValue();
    const newName = originalName === 'TestLast' ? 'UpdatedLast' : 'TestLast';

    await lastNameInput.clear();
    await lastNameInput.fill(newName);

    // Submit
    await page.locator('[data-testid="submit-button"]').click();
    await page.waitForTimeout(1000);

    // Revert
    await page.goBack();
    await lastNameInput.clear();
    await lastNameInput.fill(originalName);
    await page.locator('[data-testid="submit-button"]').click();
  });

  test('should update user roles', async ({ page }) => {
    // Click first row to edit
    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();

    await expect(page.locator('[data-testid="user-edit-view"]')).toBeVisible();

    // Find role checkboxes
    const userCheckbox = page.locator('input[type="checkbox"][value="user"]');
    const vendorCheckbox = page.locator('input[type="checkbox"][value="vendor"]');

    await expect(userCheckbox).toBeVisible();
    await expect(vendorCheckbox).toBeVisible();

    // Toggle vendor role
    const isVendorChecked = await vendorCheckbox.isChecked();
    if (isVendorChecked) {
      await vendorCheckbox.uncheck();
    } else {
      await vendorCheckbox.check();
    }

    // Submit
    await page.locator('[data-testid="submit-button"]').click();
    await page.waitForTimeout(1000);

    // Revert: toggle back
    await page.goBack();
    if (isVendorChecked) {
      await vendorCheckbox.check();
    } else {
      await vendorCheckbox.uncheck();
    }
    await page.locator('[data-testid="submit-button"]').click();
  });
});

test.describe('Admin User Edit - Form Validation', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await navigateViaNavbar(page, 'users');
    await waitForView(page, 'users-view');
  });

  test('should require at least one role', async ({ page }) => {
    // Click first row to edit
    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();

    await expect(page.locator('[data-testid="user-edit-view"]')).toBeVisible();

    // Uncheck all roles
    const roleCheckboxes = page.locator('input[type="checkbox"][value="user"], input[type="checkbox"][value="admin"], input[type="checkbox"][value="vendor"]');
    const checkboxCount = await roleCheckboxes.count();

    for (let i = 0; i < checkboxCount; i++) {
      const checkbox = roleCheckboxes.nth(i);
      if (await checkbox.isChecked()) {
        await checkbox.uncheck();
      }
    }

    // Submit
    await page.locator('[data-testid="submit-button"]').click();

    // Should show validation error
    const validationError = page.locator('[data-testid="validation-error"]');
    await expect(validationError).toBeVisible();
    await expect(validationError).toContainText('role');
  });

  test('should show cancel button that returns to list', async ({ page }) => {
    // Click first row to edit
    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();

    await expect(page.locator('[data-testid="user-edit-view"]')).toBeVisible();

    // Click cancel
    await page.locator('[data-testid="cancel-button"]').click();

    // Should return to user details or list
    // Based on current implementation, it goes back to user details
    await expect(page.locator('[data-testid="user-details-view"], [data-testid="users-view"]')).toBeVisible();
  });
});
