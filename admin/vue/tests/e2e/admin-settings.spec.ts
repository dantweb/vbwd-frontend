import { test, expect } from '@playwright/test';
import { setupAuth } from './fixtures/admin';
import { mockSettingsAPI, mockSettings } from './helpers/api-mocks';

test.describe('Admin Settings', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
    await mockSettingsAPI(page);
  });

  test('should display settings page', async ({ page }) => {
    await page.goto('/admin/settings');

    // Check page title
    await expect(page.locator('h1, h2').first()).toContainText('Settings');
  });

  test('should display company information section', async ({ page }) => {
    await page.goto('/admin/settings');

    // Check company section
    await expect(page.locator('text=/company.*information|company/i').first()).toBeVisible();

    // Check company name input
    const companyNameInput = page.locator('input[data-testid="company-name"], input[name="company_name"], input#company-name');
    if (await companyNameInput.isVisible()) {
      await expect(companyNameInput).toHaveValue(mockSettings.company.name);
    }
  });

  test('should display billing settings section', async ({ page }) => {
    await page.goto('/admin/settings');

    // Check billing section
    await expect(page.locator('text=/billing.*settings|billing/i').first()).toBeVisible();
  });

  test('should display currency setting', async ({ page }) => {
    await page.goto('/admin/settings');

    // Check currency field
    await expect(page.locator('text=/currency/i').first()).toBeVisible();
    await expect(page.locator('text=USD')).toBeVisible();
  });

  test('should display tax rate setting', async ({ page }) => {
    await page.goto('/admin/settings');

    // Check tax rate
    await expect(page.locator('text=/tax.*rate|tax/i').first()).toBeVisible();
  });

  test('should display notification preferences', async ({ page }) => {
    await page.goto('/admin/settings');

    // Check notifications section
    await expect(page.locator('text=/notification.*preferences|notifications/i').first()).toBeVisible();
  });

  test('should have notification toggles', async ({ page }) => {
    await page.goto('/admin/settings');

    // Check for checkbox/toggle inputs
    const toggles = page.locator('input[type="checkbox"], [role="switch"]');
    const count = await toggles.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should have save button', async ({ page }) => {
    await page.goto('/admin/settings');

    const saveButton = page.locator('[data-testid="save-settings"], button:has-text("Save")');
    await expect(saveButton).toBeVisible();
  });

  test('should save settings successfully', async ({ page }) => {
    await page.goto('/admin/settings');

    // Modify a field
    const companyNameInput = page.locator('input[data-testid="company-name"], input[name="company_name"], input#company-name');
    if (await companyNameInput.isVisible()) {
      await companyNameInput.clear();
      await companyNameInput.fill('Updated Company Name');
    }

    // Click save
    const saveButton = page.locator('[data-testid="save-settings"], button:has-text("Save")');
    await saveButton.click();

    // Check for success message
    await expect(page.locator('text=/saved|success/i')).toBeVisible({ timeout: 5000 });
  });

  test('should show error on save failure', async ({ page }) => {
    // Mock API to return error
    await page.route('**/api/v1/admin/settings', async (route) => {
      if (route.request().method() === 'PUT') {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Failed to save settings' })
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockSettings)
        });
      }
    });

    await page.goto('/admin/settings');

    // Click save
    const saveButton = page.locator('[data-testid="save-settings"], button:has-text("Save")');
    await saveButton.click();

    // Check for error message
    await expect(page.locator('text=/error|failed/i')).toBeVisible({ timeout: 5000 });
  });

  test('should display invoice prefix setting', async ({ page }) => {
    await page.goto('/admin/settings');

    // Check invoice prefix
    await expect(page.locator('text=/invoice.*prefix|prefix/i').first()).toBeVisible();
  });
});
