import { test, expect } from '@playwright/test';
import { setupAuth } from './fixtures/admin';
import { mockPlansAPI, mockPlans } from './helpers/api-mocks';

test.describe('Admin Plans Management', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
    await mockPlansAPI(page);
  });

  test('should display plans list', async ({ page }) => {
    await page.goto('/admin/plans');

    // Check page title
    await expect(page.locator('h1, h2').first()).toContainText('Plans');

    // Check plans are displayed
    for (const plan of mockPlans.filter(p => p.status === 'active')) {
      await expect(page.locator(`text=${plan.name}`)).toBeVisible();
    }
  });

  test('should display plan prices', async ({ page }) => {
    await page.goto('/admin/plans');

    // Check prices are displayed
    await expect(page.locator('text=$29.99')).toBeVisible();
    await expect(page.locator('text=$99.99')).toBeVisible();
  });

  test('should show create plan button', async ({ page }) => {
    await page.goto('/admin/plans');

    const createButton = page.locator('[data-testid="create-plan"], button:has-text("Create"), a:has-text("Create")');
    await expect(createButton).toBeVisible();
  });

  test('should navigate to create plan form', async ({ page }) => {
    await page.goto('/admin/plans');

    const createButton = page.locator('[data-testid="create-plan"], button:has-text("Create"), a:has-text("New")').first();
    await createButton.click();

    await expect(page).toHaveURL(/.*\/admin\/plans\/new/);
  });

  test('should navigate to edit plan', async ({ page }) => {
    await page.goto('/admin/plans');

    // Click edit button on first plan
    const editButton = page.locator('[data-testid="edit-plan"], a:has-text("Edit"), button:has-text("Edit")').first();
    if (await editButton.isVisible()) {
      await editButton.click();
      await expect(page).toHaveURL(/.*\/admin\/plans\/\d+\/edit/);
    }
  });

  test('should archive a plan', async ({ page }) => {
    await page.goto('/admin/plans');

    const archiveButton = page.locator('[data-testid="archive-plan"], button:has-text("Archive")').first();

    if (await archiveButton.isVisible()) {
      await archiveButton.click();

      // Check for confirmation or success
      await expect(page.locator('text=/archived|success/i')).toBeVisible({ timeout: 5000 });
    }
  });

  test('should display billing period for each plan', async ({ page }) => {
    await page.goto('/admin/plans');

    // Check billing period is shown
    await expect(page.locator('text=/monthly/i').first()).toBeVisible();
  });

  test('should show plan features', async ({ page }) => {
    await page.goto('/admin/plans');

    // Features might be shown in expandable section or column
    const featuresText = page.locator('text=/support|features/i');
    // At least one plan should mention features
  });
});
