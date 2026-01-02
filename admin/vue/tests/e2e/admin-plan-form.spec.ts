import { test, expect } from '@playwright/test';
import { setupAuth } from './fixtures/admin';
import { mockPlansAPI, mockPlans } from './helpers/api-mocks';

test.describe('Admin Plan Form', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
    await mockPlansAPI(page);
  });

  test('should display create plan form', async ({ page }) => {
    await page.goto('/admin/plans/new');

    // Check form title
    await expect(page.locator('[data-testid="form-title"], h1, h2').first()).toContainText(/create/i);

    // Check form fields exist
    await expect(page.locator('[data-testid="plan-name"], input#plan-name')).toBeVisible();
    await expect(page.locator('[data-testid="plan-price"], input#plan-price')).toBeVisible();
    await expect(page.locator('[data-testid="plan-billing"], select#plan-billing')).toBeVisible();
  });

  test('should show validation error for empty name', async ({ page }) => {
    await page.goto('/admin/plans/new');

    // Leave name empty, fill other fields
    await page.locator('[data-testid="plan-price"], input#plan-price').fill('29.99');
    await page.locator('[data-testid="plan-billing"], select#plan-billing').selectOption('monthly');

    // Submit form
    await page.locator('[data-testid="submit-button"], button[type="submit"]').click();

    // Check for validation error
    await expect(page.locator('[data-testid="validation-error"], .validation-error, .error')).toBeVisible();
    await expect(page.locator('text=/name.*required/i')).toBeVisible();
  });

  test('should show validation error for missing billing period', async ({ page }) => {
    await page.goto('/admin/plans/new');

    // Fill name and price, skip billing period
    await page.locator('[data-testid="plan-name"], input#plan-name').fill('Test Plan');
    await page.locator('[data-testid="plan-price"], input#plan-price').fill('29.99');

    // Submit form
    await page.locator('[data-testid="submit-button"], button[type="submit"]').click();

    // Check for validation error
    await expect(page.locator('[data-testid="validation-error"], .validation-error, .error')).toBeVisible();
  });

  test('should create plan successfully', async ({ page }) => {
    await page.goto('/admin/plans/new');

    // Fill all required fields
    await page.locator('[data-testid="plan-name"], input#plan-name').fill('New Premium Plan');
    await page.locator('[data-testid="plan-price"], input#plan-price').fill('49.99');
    await page.locator('[data-testid="plan-billing"], select#plan-billing').selectOption('monthly');

    // Add features
    const featuresInput = page.locator('[data-testid="plan-features"], textarea#plan-features');
    if (await featuresInput.isVisible()) {
      await featuresInput.fill('Feature 1\nFeature 2\nFeature 3');
    }

    // Submit form
    await page.locator('[data-testid="submit-button"], button[type="submit"]').click();

    // Should redirect to plans list
    await expect(page).toHaveURL(/.*\/admin\/plans$/, { timeout: 5000 });
  });

  test('should load plan data in edit mode', async ({ page }) => {
    await page.goto('/admin/plans/2/edit');

    // Wait for form to load
    await page.waitForTimeout(500);

    // Check form is populated with plan data
    const nameInput = page.locator('[data-testid="plan-name"], input#plan-name');
    await expect(nameInput).toHaveValue('Pro');

    const priceInput = page.locator('[data-testid="plan-price"], input#plan-price');
    await expect(priceInput).toHaveValue('29.99');
  });

  test('should update plan successfully', async ({ page }) => {
    await page.goto('/admin/plans/2/edit');

    // Wait for form to load
    await page.waitForTimeout(500);

    // Update name
    const nameInput = page.locator('[data-testid="plan-name"], input#plan-name');
    await nameInput.clear();
    await nameInput.fill('Pro Plus');

    // Submit form
    await page.locator('[data-testid="submit-button"], button[type="submit"]').click();

    // Should redirect to plans list
    await expect(page).toHaveURL(/.*\/admin\/plans$/, { timeout: 5000 });
  });

  test('should cancel and go back to plans list', async ({ page }) => {
    await page.goto('/admin/plans/new');

    // Click cancel button
    const cancelButton = page.locator('[data-testid="cancel-button"], button:has-text("Cancel")');
    await cancelButton.click();

    // Should go back to plans list
    await expect(page).toHaveURL(/.*\/admin\/plans$/);
  });

  test('should show back button', async ({ page }) => {
    await page.goto('/admin/plans/new');

    const backButton = page.locator('[data-testid="back-button"], a:has-text("Back")');
    await expect(backButton).toBeVisible();
  });
});
