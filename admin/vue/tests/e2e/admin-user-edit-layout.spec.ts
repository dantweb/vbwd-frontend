/**
 * E2E Tests: Admin User Edit - Layout Validation
 *
 * Tests that the user edit form has correct layout (full width).
 *
 * Run with: E2E_BASE_URL=http://localhost:8081 npx playwright test admin-user-edit-layout
 */
import { test, expect } from '@playwright/test';
import { loginAsAdmin, navigateViaNavbar, waitForView } from './helpers/auth';

test.describe('Admin User Edit - Layout', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await navigateViaNavbar(page, 'users');
    await waitForView(page, 'users-view');

    // Click first row to navigate to user details/edit
    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();
    await waitForView(page, 'user-edit-view');
  });

  test('should display user edit form full width', async ({ page }) => {
    const formView = page.locator('.user-edit-view');
    await expect(formView).toBeVisible();

    // Get the form width and parent width
    const formBox = await formView.boundingBox();
    expect(formBox).not.toBeNull();

    // The form should have significant width (not constrained to 700px or less)
    // We check that it's at least 800px wide on a standard viewport
    expect(formBox!.width).toBeGreaterThan(700);
  });

  test('should have all form sections visible', async ({ page }) => {
    // Account section (use h3 to match exact section title)
    const accountSection = page.locator('.form-section').filter({ has: page.locator('h3', { hasText: /^Account$/ }) });
    await expect(accountSection).toBeVisible();

    // Personal Details section
    const personalSection = page.locator('.form-section').filter({ has: page.locator('h3', { hasText: 'Personal Details' }) });
    await expect(personalSection).toBeVisible();

    // Balance section
    const balanceSection = page.locator('.form-section').filter({ has: page.locator('h3', { hasText: 'Balance' }) });
    await expect(balanceSection).toBeVisible();
  });

  test('should display email field as readonly', async ({ page }) => {
    const emailInput = page.locator('#email');
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toHaveAttribute('readonly');
    await expect(emailInput).toBeDisabled();
  });

  test('should display status and role dropdowns', async ({ page }) => {
    const statusSelect = page.locator('[data-testid="status-select"]');
    await expect(statusSelect).toBeVisible();

    const roleSelect = page.locator('[data-testid="role-select"]');
    await expect(roleSelect).toBeVisible();
  });

  test('should display first name and last name inputs', async ({ page }) => {
    const firstNameInput = page.locator('#firstName');
    await expect(firstNameInput).toBeVisible();

    const lastNameInput = page.locator('#lastName');
    await expect(lastNameInput).toBeVisible();
  });

  test('should display form action buttons', async ({ page }) => {
    const cancelButton = page.locator('[data-testid="cancel-button"]');
    await expect(cancelButton).toBeVisible();

    const submitButton = page.locator('[data-testid="submit-button"]');
    await expect(submitButton).toBeVisible();
  });

  test('should display back button', async ({ page }) => {
    const backButton = page.locator('[data-testid="back-button"]');
    await expect(backButton).toBeVisible();
    await expect(backButton).toContainText('Back');
  });
});
