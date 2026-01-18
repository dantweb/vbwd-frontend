import { test, expect } from '@playwright/test';
import { setupAuth } from './fixtures/admin';
import { mockAddonsAPI, mockAddons } from './helpers/api-mocks';
import { loginAsAdmin } from './helpers/auth';

// Use real login when E2E_BASE_URL is set (running against docker)
const useRealLogin = !!process.env.E2E_BASE_URL;

test.describe('Admin Add-ons Management', () => {
  test.beforeEach(async ({ page }) => {
    if (useRealLogin) {
      await loginAsAdmin(page);
    } else {
      await setupAuth(page);
      await mockAddonsAPI(page);
    }
  });

  test('should display add-ons page title', async ({ page }) => {
    await page.goto('/admin/addons');

    // Check page title
    await expect(page.locator('h2').first()).toContainText(/add-?ons/i);
  });

  test('should display tabs navigation', async ({ page }) => {
    await page.goto('/admin/addons');

    // Check tabs container exists
    await expect(page.locator('[data-testid="addons-tabs"]')).toBeVisible();
  });

  test('should have tab buttons', async ({ page }) => {
    await page.goto('/admin/addons');

    // Check tab buttons exist
    await expect(page.locator('[data-testid="addons-tab1"]')).toBeVisible();
    await expect(page.locator('[data-testid="addons-tab2"]')).toBeVisible();
  });

  test('should display tab1 content by default', async ({ page }) => {
    await page.goto('/admin/addons');

    // Tab1 content should be visible
    await expect(page.locator('[data-testid="addons-tab1-content"]')).toBeVisible();
  });

  test('should switch to tab2 when clicked', async ({ page }) => {
    await page.goto('/admin/addons');

    // Click tab2
    await page.locator('[data-testid="addons-tab2"]').click();

    // Tab2 content should be visible
    await expect(page.locator('[data-testid="addons-tab2-content"]')).toBeVisible();
  });

  test('should show active class on selected tab', async ({ page }) => {
    await page.goto('/admin/addons');

    // Tab1 should be active by default
    const tab1 = page.locator('[data-testid="addons-tab1"]');
    await expect(tab1).toHaveClass(/active/);

    // Click tab2
    await page.locator('[data-testid="addons-tab2"]').click();

    // Tab2 should now be active
    const tab2 = page.locator('[data-testid="addons-tab2"]');
    await expect(tab2).toHaveClass(/active/);
  });

  test('should navigate to add-ons via sidebar', async ({ page }) => {
    await page.goto('/admin/dashboard');

    // Look for add-ons link in sidebar
    const addonsLink = page.locator('[data-testid="nav-addons"], a:has-text("Add-ons"), a:has-text("AddOns")').first();

    if (await addonsLink.isVisible()) {
      await addonsLink.click();
      await expect(page).toHaveURL(/.*\/admin\/addons/);
    }
  });

  test('should display placeholder content in tab1', async ({ page }) => {
    await page.goto('/admin/addons');

    // Check placeholder content exists
    const placeholder = page.locator('[data-testid="addons-tab1-content"] .placeholder-content');
    await expect(placeholder).toBeVisible();
  });

  test('should display placeholder content in tab2', async ({ page }) => {
    await page.goto('/admin/addons');

    // Switch to tab2
    await page.locator('[data-testid="addons-tab2"]').click();

    // Check placeholder content exists
    const placeholder = page.locator('[data-testid="addons-tab2-content"] .placeholder-content');
    await expect(placeholder).toBeVisible();
  });
});

test.describe('Admin Add-ons API (Backend Integration)', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
  });

  test('should load addons page without errors', async ({ page }) => {
    await page.route('**/api/v1/admin/addons**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: mockAddons,
          total: mockAddons.length,
          page: 1,
          per_page: 20,
          pages: 1
        })
      });
    });

    await page.goto('/admin/addons');
    await page.waitForLoadState('networkidle');

    // Verify the page loads without errors
    await expect(page.locator('h2').first()).toContainText(/add-?ons/i);
  });

  test('should handle API errors gracefully', async ({ page }) => {
    await page.route('**/api/v1/admin/addons**', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });

    await page.goto('/admin/addons');

    // Page should still render without crashing
    await expect(page.locator('.add-ons-view, [data-testid="addons-view"]').first()).toBeVisible();
  });
});

test.describe('Public Add-ons API', () => {
  test('should access public addons API', async ({ page }) => {
    await page.route('**/api/v1/addons', async (route) => {
      const activeAddons = mockAddons.filter(a => a.is_active);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ addons: activeAddons })
      });
    });

    // Make a direct API request to test the endpoint
    const response = await page.request.get('/api/v1/addons');

    // Verify response is successful
    expect(response.ok()).toBe(true);
  });
});
