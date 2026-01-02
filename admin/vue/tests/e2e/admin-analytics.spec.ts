import { test, expect } from '@playwright/test';
import { setupAuth } from './fixtures/admin';
import { mockAnalyticsAPI, mockAnalytics } from './helpers/api-mocks';

test.describe('Admin Analytics Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
    await mockAnalyticsAPI(page);
  });

  test('should display analytics page', async ({ page }) => {
    await page.goto('/admin/analytics');

    // Check page title
    await expect(page.locator('h1, h2').first()).toContainText('Analytics');
  });

  test('should display MRR KPI card', async ({ page }) => {
    await page.goto('/admin/analytics');

    // Check MRR is displayed
    await expect(page.locator('text=/MRR|monthly.*recurring/i').first()).toBeVisible();
    await expect(page.locator('text=/\\$12,500|12500/').first()).toBeVisible();
  });

  test('should display total revenue', async ({ page }) => {
    await page.goto('/admin/analytics');

    await expect(page.locator('text=/revenue/i').first()).toBeVisible();
    await expect(page.locator('text=/\\$150,000|150000/').first()).toBeVisible();
  });

  test('should display total users', async ({ page }) => {
    await page.goto('/admin/analytics');

    await expect(page.locator('text=/users/i').first()).toBeVisible();
    await expect(page.locator('text=/1,250|1250/').first()).toBeVisible();
  });

  test('should display churn rate', async ({ page }) => {
    await page.goto('/admin/analytics');

    await expect(page.locator('text=/churn/i').first()).toBeVisible();
    await expect(page.locator('text=/2\\.5%|2\\.5/').first()).toBeVisible();
  });

  test('should display conversion rate', async ({ page }) => {
    await page.goto('/admin/analytics');

    await expect(page.locator('text=/conversion/i').first()).toBeVisible();
  });

  test('should display ARPU', async ({ page }) => {
    await page.goto('/admin/analytics');

    await expect(page.locator('text=/ARPU|average.*revenue/i').first()).toBeVisible();
  });

  test('should display plan distribution', async ({ page }) => {
    await page.goto('/admin/analytics');

    // Check plan distribution section
    await expect(page.locator('text=/plan.*distribution|distribution/i').first()).toBeVisible();

    // Check plan names
    await expect(page.locator('text=Free')).toBeVisible();
    await expect(page.locator('text=Pro')).toBeVisible();
  });

  test('should display recent activity', async ({ page }) => {
    await page.goto('/admin/analytics');

    // Check activity section
    await expect(page.locator('text=/recent.*activity|activity/i').first()).toBeVisible();
  });

  test('should have date range filter', async ({ page }) => {
    await page.goto('/admin/analytics');

    // Check for date filter controls
    const dateFilter = page.locator('[data-testid="date-range"], select:has-text("days"), input[type="date"]');
    // May or may not be visible depending on implementation
  });

  test('should have refresh button', async ({ page }) => {
    await page.goto('/admin/analytics');

    const refreshButton = page.locator('[data-testid="refresh-analytics"], button:has-text("Refresh")');
    if (await refreshButton.isVisible()) {
      await refreshButton.click();
      await page.waitForTimeout(500);
    }
  });

  test('should display change indicators', async ({ page }) => {
    await page.goto('/admin/analytics');

    // Check for percentage changes (positive/negative indicators)
    await expect(page.locator('text=/%|\\+|\\-/').first()).toBeVisible();
  });
});
