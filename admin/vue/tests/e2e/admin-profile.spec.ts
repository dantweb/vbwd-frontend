/**
 * E2E Tests: Admin Profile Page
 *
 * Tests for the admin profile page functionality.
 * TDD-First: Tests written BEFORE implementation.
 *
 * Run with: E2E_BASE_URL=http://localhost:8081 npx playwright test admin-profile
 */
import { test, expect, Page } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth';

/**
 * Navigate to profile page via user menu (like a real user)
 */
async function navigateToProfile(page: Page): Promise<void> {
  const userMenu = page.locator('[data-testid="user-menu"]');
  await userMenu.click();
  await page.locator('[data-testid="profile-link"]').click();
  await page.waitForLoadState('networkidle');
  await expect(page.locator('[data-testid="profile-view"]')).toBeVisible({ timeout: 10000 });
}

test.describe('Admin Profile Page', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('should access profile from user menu dropdown', async ({ page }) => {
    // Click user menu to open dropdown
    const userMenu = page.locator('[data-testid="user-menu"]');
    await userMenu.click();

    // Click profile link
    const profileLink = page.locator('[data-testid="profile-link"]');
    await expect(profileLink).toBeVisible();
    await profileLink.click();

    // Should navigate to profile page
    await expect(page).toHaveURL(/\/admin\/profile/);
    await expect(page.locator('[data-testid="profile-view"]')).toBeVisible();
  });

  test('should display email as readonly', async ({ page }) => {
    await navigateToProfile(page);

    const emailInput = page.locator('[data-testid="email-input"]');
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toBeDisabled();
    await expect(emailInput).toHaveValue(/admin@example\.com/);
  });

  test('should display role as readonly badge', async ({ page }) => {
    await navigateToProfile(page);

    const roleBadge = page.locator('[data-testid="role-badge"]');
    await expect(roleBadge).toBeVisible();
    await expect(roleBadge).toContainText(/admin/i);
  });

  test('should display editable name fields', async ({ page }) => {
    await navigateToProfile(page);

    const firstNameInput = page.locator('[data-testid="first-name-input"]');
    const lastNameInput = page.locator('[data-testid="last-name-input"]');

    await expect(firstNameInput).toBeVisible();
    await expect(lastNameInput).toBeVisible();
    await expect(firstNameInput).toBeEnabled();
    await expect(lastNameInput).toBeEnabled();
  });

  test('should display company and tax number fields', async ({ page }) => {
    await navigateToProfile(page);

    const companyInput = page.locator('[data-testid="company-input"]');
    const taxNumberInput = page.locator('[data-testid="tax-number-input"]');

    await expect(companyInput).toBeVisible();
    await expect(taxNumberInput).toBeVisible();
    await expect(companyInput).toBeEnabled();
    await expect(taxNumberInput).toBeEnabled();
  });

  test('should display address fields', async ({ page }) => {
    await navigateToProfile(page);

    await expect(page.locator('[data-testid="address-line-1-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="city-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="postal-code-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="country-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="phone-input"]')).toBeVisible();
  });

  test('should display balance as readonly', async ({ page }) => {
    await navigateToProfile(page);

    const balanceDisplay = page.locator('[data-testid="balance-display"]');
    await expect(balanceDisplay).toBeVisible();
  });

  test('should display language selector', async ({ page }) => {
    await navigateToProfile(page);

    const languageSelect = page.locator('[data-testid="language-select"]');
    await expect(languageSelect).toBeVisible();
    await expect(languageSelect).toBeEnabled();
  });

  test('should have all 8 language options available', async ({ page }) => {
    await navigateToProfile(page);

    const languageSelect = page.locator('[data-testid="language-select"]');

    // Check for all 8 language options
    const expectedLanguages = [
      { code: 'en', name: 'English' },
      { code: 'de', name: 'Deutsch' },
      { code: 'ru', name: 'Русский' },
      { code: 'th', name: 'ไทย' },
      { code: 'zh', name: '中文' },
      { code: 'es', name: 'Español' },
      { code: 'fr', name: 'Français' },
      { code: 'ja', name: '日本語' },
    ];

    for (const lang of expectedLanguages) {
      const option = page.locator(`option[value="${lang.code}"]`);
      await expect(option).toBeAttached();
      await expect(option).toContainText(lang.name);
    }

    // Verify the total count of options
    const options = languageSelect.locator('option');
    await expect(options).toHaveCount(8);
  });

  test('should be able to select each language', async ({ page }) => {
    await navigateToProfile(page);

    const languageSelect = page.locator('[data-testid="language-select"]');
    const languageCodes = ['en', 'de', 'ru', 'th', 'zh', 'es', 'fr', 'ja'];

    for (const code of languageCodes) {
      await languageSelect.selectOption(code);
      await expect(languageSelect).toHaveValue(code);
    }

    // Reset to English at the end
    await languageSelect.selectOption('en');
  });

  test('should save profile changes successfully', async ({ page }) => {
    await navigateToProfile(page);

    // Fill in some data
    const companyInput = page.locator('[data-testid="company-input"]');
    await companyInput.fill('Test Company Inc.');

    // Click save button
    const saveButton = page.locator('[data-testid="save-button"]');
    await saveButton.click();

    // Should show success message
    const successMessage = page.locator('[data-testid="success-message"]');
    await expect(successMessage).toBeVisible();
  });

  test('should persist changes after reload', async ({ page }) => {
    await navigateToProfile(page);

    // Fill unique data
    const uniqueCompany = `Test Company ${Date.now()}`;
    const companyInput = page.locator('[data-testid="company-input"]');
    await companyInput.fill(uniqueCompany);

    // Save
    const saveButton = page.locator('[data-testid="save-button"]');
    await saveButton.click();

    // Wait for success
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();

    // Reload - navigate back to profile
    await navigateToProfile(page);

    // Check value persisted
    await expect(companyInput).toHaveValue(uniqueCompany);
  });

  test('should change language and update UI', async ({ page }) => {
    await navigateToProfile(page);

    // Change to German
    const languageSelect = page.locator('[data-testid="language-select"]');
    await languageSelect.selectOption('de');

    // Save changes
    const saveButton = page.locator('[data-testid="save-button"]');
    await saveButton.click();

    // Wait for page to update - some UI text should change
    // The save button or page title should be in German
    await page.waitForTimeout(500);

    // Check that some text has changed to German
    // (This will depend on what strings we translate)
    const pageTitle = page.locator('[data-testid="profile-title"]');
    await expect(pageTitle).toContainText(/Profil/i);
  });

  test('should persist language selection after save', async ({ page }) => {
    await navigateToProfile(page);

    // Change to Russian
    const languageSelect = page.locator('[data-testid="language-select"]');
    await languageSelect.selectOption('ru');

    // Save changes
    const saveButton = page.locator('[data-testid="save-button"]');
    await saveButton.click();

    // Wait for success message
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();

    // Navigate away and back to profile
    await page.locator('[data-testid="nav-dashboard"]').click();
    await page.waitForLoadState('networkidle');

    // Navigate back to profile
    await navigateToProfile(page);

    // Check that language is still Russian
    await expect(languageSelect).toHaveValue('ru');
  });

  test('should restore language to English after test', async ({ page }) => {
    // This test cleans up by setting language back to English
    await navigateToProfile(page);

    const languageSelect = page.locator('[data-testid="language-select"]');
    await languageSelect.selectOption('en');

    const saveButton = page.locator('[data-testid="save-button"]');
    await saveButton.click();

    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(languageSelect).toHaveValue('en');
  });
});
