/**
 * E2E Tests: Admin User Edit - New Password Field
 *
 * Tests for the new password field in the Account tab.
 * TDD-First: Tests written BEFORE implementation.
 *
 * Run with: E2E_BASE_URL=http://localhost:8081 npx playwright test admin-user-edit-password
 */
import { test, expect } from '@playwright/test';
import { loginAsAdmin, navigateViaNavbar, waitForView } from './helpers/auth';

test.describe('Admin User Edit - New Password Field', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await navigateViaNavbar(page, 'users');
    await waitForView(page, 'users-view');

    // Navigate to user edit page
    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();
    await waitForView(page, 'user-edit-view');

    // Ensure we're on Account tab
    const accountTab = page.locator('[data-testid="tab-account"]');
    if (!(await accountTab.evaluate(el => el.classList.contains('active')))) {
      await accountTab.click();
    }
  });

  test('should display new password field in Account tab', async ({ page }) => {
    const passwordInput = page.locator('[data-testid="new-password-input"]');
    await expect(passwordInput).toBeVisible();
  });

  test('should have password field initially empty', async ({ page }) => {
    const passwordInput = page.locator('[data-testid="new-password-input"]');
    await expect(passwordInput).toHaveValue('');
  });

  test('should have password field with type password', async ({ page }) => {
    const passwordInput = page.locator('[data-testid="new-password-input"]');
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('should display help text for password field', async ({ page }) => {
    const helpText = page.locator('[data-testid="new-password-help"]');
    await expect(helpText).toBeVisible();
    await expect(helpText).toContainText('empty');
  });

  test('should accept input in password field', async ({ page }) => {
    const passwordInput = page.locator('[data-testid="new-password-input"]');
    await passwordInput.fill('NewPassword123');
    await expect(passwordInput).toHaveValue('NewPassword123');
  });

  test('should submit form successfully without new password', async ({ page }) => {
    // Leave password field empty and submit
    const submitButton = page.locator('[data-testid="submit-button"]');
    await submitButton.click();

    // Should navigate back to users list (successful submission)
    await expect(page).toHaveURL(/\/admin\/users$/);
  });

  test('should show validation error for password too short', async ({ page }) => {
    const passwordInput = page.locator('[data-testid="new-password-input"]');
    await passwordInput.fill('short'); // Less than 8 characters

    const submitButton = page.locator('[data-testid="submit-button"]');
    await submitButton.click();

    // Should show validation error
    const validationError = page.locator('[data-testid="validation-error"]');
    await expect(validationError).toBeVisible();
    await expect(validationError).toContainText('8');
  });

  test('should submit form successfully with valid new password', async ({ page }) => {
    const passwordInput = page.locator('[data-testid="new-password-input"]');
    await passwordInput.fill('ValidPassword123');

    const submitButton = page.locator('[data-testid="submit-button"]');
    await submitButton.click();

    // Should navigate back to users list (successful submission)
    await expect(page).toHaveURL(/\/admin\/users$/);
  });

  test('should clear password field after failed validation', async ({ page }) => {
    const passwordInput = page.locator('[data-testid="new-password-input"]');
    await passwordInput.fill('short');

    const submitButton = page.locator('[data-testid="submit-button"]');
    await submitButton.click();

    // Validation error should be shown
    await expect(page.locator('[data-testid="validation-error"]')).toBeVisible();

    // User can correct the password
    await passwordInput.clear();
    await passwordInput.fill('ValidPassword123');

    // Submit again
    await submitButton.click();

    // Should navigate back to users list
    await expect(page).toHaveURL(/\/admin\/users$/);
  });

  test('should be able to login with new password after change', async ({ page }) => {
    // Get the user's email from the form
    const emailInput = page.locator('#email');
    const userEmail = await emailInput.inputValue();

    // Set a known new password
    const newPassword = 'NewTestPassword123@';
    const passwordInput = page.locator('[data-testid="new-password-input"]');
    await passwordInput.fill(newPassword);

    const submitButton = page.locator('[data-testid="submit-button"]');
    await submitButton.click();

    // Should navigate back to users list (successful submission)
    await expect(page).toHaveURL(/\/admin\/users$/);

    // Logout
    const userMenu = page.locator('[data-testid="user-menu"]');
    await userMenu.click();
    const logoutButton = page.locator('[data-testid="logout-button"]');
    await logoutButton.click();

    // Wait for login page
    await expect(page).toHaveURL(/\/admin\/login/);

    // Try to login with the new password
    await page.locator('[data-testid="email-input"]').fill(userEmail);
    await page.locator('[data-testid="password-input"]').fill(newPassword);
    await page.locator('[data-testid="login-button"]').click();

    // Should successfully login and see dashboard
    await expect(page).toHaveURL(/\/admin\/dashboard/);
  });
});
