import { test, expect } from '@playwright/test';
import { setupAuth } from './fixtures/admin';
import { mockAddonsAPI } from './helpers/api-mocks';
import { loginAsAdmin } from './helpers/auth';

// Use real login when E2E_BASE_URL is set (running against docker)
const useRealLogin = !!process.env.E2E_BASE_URL;

test.describe('Admin Add-ons List', () => {
  test.beforeEach(async ({ page }) => {
    if (useRealLogin) {
      await loginAsAdmin(page);
    } else {
      await setupAuth(page);
      await mockAddonsAPI(page);
    }
  });

  test('should display add-ons page with title', async ({ page }) => {
    await page.goto('/admin/add-ons');

    await expect(page.locator('[data-testid="addons-view"]')).toBeVisible();
    await expect(page.locator('h2').first()).toContainText(/add-?ons/i);
  });

  test('should display addons table with data', async ({ page }) => {
    await page.goto('/admin/add-ons');

    await expect(page.locator('[data-testid="addons-table"]')).toBeVisible();

    // Should show all 4 addons (include inactive is on by default)
    const rows = page.locator('.addon-row');
    await expect(rows).toHaveCount(4);
  });

  test('should display addon names in table', async ({ page }) => {
    await page.goto('/admin/add-ons');

    await expect(page.locator('text=Priority Support')).toBeVisible();
    await expect(page.locator('text=Custom Domain')).toBeVisible();
    await expect(page.locator('text=Extra Storage')).toBeVisible();
    await expect(page.locator('text=Legacy Addon')).toBeVisible();
  });

  test('should display addon prices', async ({ page }) => {
    await page.goto('/admin/add-ons');

    // €19.99 for Priority Support
    await expect(page.locator('text=€19.99')).toBeVisible();
    // €9.99 for Custom Domain
    await expect(page.locator('text=€9.99')).toBeVisible();
  });

  test('should display active and inactive status badges', async ({ page }) => {
    await page.goto('/admin/add-ons');

    await expect(page.locator('[data-testid="status-active"]').first()).toBeVisible();
    await expect(page.locator('[data-testid="status-inactive"]').first()).toBeVisible();
  });

  test('should show create addon button', async ({ page }) => {
    await page.goto('/admin/add-ons');

    await expect(page.locator('[data-testid="create-addon-button"]')).toBeVisible();
  });

  test('should navigate to create form when create button clicked', async ({ page }) => {
    await page.goto('/admin/add-ons');

    await page.locator('[data-testid="create-addon-button"]').click();

    await expect(page).toHaveURL(/.*\/admin\/add-ons\/new/);
  });

  test('should navigate to edit form when row clicked', async ({ page }) => {
    await page.goto('/admin/add-ons');

    await page.locator('[data-testid="addon-row-1"]').click();

    await expect(page).toHaveURL(/.*\/admin\/add-ons\/1\/edit/);
  });

  test('should filter addons by search query', async ({ page }) => {
    await page.goto('/admin/add-ons');

    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('Priority');

    const rows = page.locator('.addon-row');
    await expect(rows).toHaveCount(1);
    await expect(page.locator('text=Priority Support')).toBeVisible();
  });

  test('should search by slug', async ({ page }) => {
    await page.goto('/admin/add-ons');

    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('extra-storage');

    const rows = page.locator('.addon-row');
    await expect(rows).toHaveCount(1);
    await expect(page.locator('text=Extra Storage')).toBeVisible();
  });

  test('should show empty state when search has no results', async ({ page }) => {
    await page.goto('/admin/add-ons');

    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('nonexistent addon xyz');

    await expect(page.locator('[data-testid="addons-table"]')).not.toBeVisible();
  });

  test('should display correct column headers', async ({ page }) => {
    await page.goto('/admin/add-ons');

    const headers = page.locator('th');
    const headerCount = await headers.count();
    expect(headerCount).toBe(6);
  });

  test('should sort addons by name when header clicked', async ({ page }) => {
    await page.goto('/admin/add-ons');

    // Click name header to sort
    const nameHeader = page.locator('th.sortable').first();
    await nameHeader.click();

    // First row should be alphabetically first (ascending)
    const firstRow = page.locator('.addon-row').first();
    await expect(firstRow).toContainText('Custom Domain');
  });

  test('should reverse sort on second click', async ({ page }) => {
    await page.goto('/admin/add-ons');

    const nameHeader = page.locator('th.sortable').first();
    // First click: ascending
    await nameHeader.click();
    // Second click: descending
    await nameHeader.click();

    const firstRow = page.locator('.addon-row').first();
    await expect(firstRow).toContainText('Priority Support');
  });

  test('should show deactivate button for active addon', async ({ page }) => {
    await page.goto('/admin/add-ons');

    await expect(page.locator('[data-testid="deactivate-addon-1"]')).toBeVisible();
  });

  test('should show activate button for inactive addon', async ({ page }) => {
    await page.goto('/admin/add-ons');

    await expect(page.locator('[data-testid="activate-addon-4"]')).toBeVisible();
  });

  test('should show delete button for each addon', async ({ page }) => {
    await page.goto('/admin/add-ons');

    await expect(page.locator('[data-testid="delete-addon-1"]')).toBeVisible();
    await expect(page.locator('[data-testid="delete-addon-2"]')).toBeVisible();
  });

  test('should have include inactive checkbox checked by default', async ({ page }) => {
    await page.goto('/admin/add-ons');

    await expect(page.locator('[data-testid="include-inactive"]')).toBeChecked();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    await setupAuth(page);

    await page.route('**/api/v1/admin/addons**', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });

    await page.goto('/admin/add-ons');

    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  test('should show slug in code format', async ({ page }) => {
    await page.goto('/admin/add-ons');

    await expect(page.locator('code:has-text("priority-support")')).toBeVisible();
    await expect(page.locator('code:has-text("custom-domain")')).toBeVisible();
  });
});

test.describe('Admin Add-on Form — Create', () => {
  test.beforeEach(async ({ page }) => {
    if (useRealLogin) {
      await loginAsAdmin(page);
    } else {
      await setupAuth(page);
      await mockAddonsAPI(page);
    }
  });

  test('should display create form with title', async ({ page }) => {
    await page.goto('/admin/add-ons/new');

    await expect(page.locator('[data-testid="form-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="addon-form"]')).toBeVisible();
  });

  test('should display all form fields', async ({ page }) => {
    await page.goto('/admin/add-ons/new');

    await expect(page.locator('[data-testid="addon-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="addon-slug"]')).toBeVisible();
    await expect(page.locator('[data-testid="addon-description"]')).toBeVisible();
    await expect(page.locator('[data-testid="addon-price"]')).toBeVisible();
    await expect(page.locator('[data-testid="addon-currency"]')).toBeVisible();
    await expect(page.locator('[data-testid="addon-billing"]')).toBeVisible();
    await expect(page.locator('[data-testid="addon-config"]')).toBeVisible();
    await expect(page.locator('[data-testid="addon-sort-order"]')).toBeVisible();
  });

  test('should show validation error for empty name', async ({ page }) => {
    await page.goto('/admin/add-ons/new');

    // Fill price and billing but leave name empty
    await page.locator('[data-testid="addon-price"]').fill('9.99');
    await page.locator('[data-testid="addon-billing"]').selectOption('monthly');

    await page.locator('[data-testid="submit-button"]').click();

    await expect(page.locator('[data-testid="validation-error"]')).toBeVisible();
  });

  test('should show validation error for missing billing period', async ({ page }) => {
    await page.goto('/admin/add-ons/new');

    await page.locator('[data-testid="addon-name"]').fill('Test Add-on');
    await page.locator('[data-testid="addon-price"]').fill('9.99');
    // Don't select billing period

    await page.locator('[data-testid="submit-button"]').click();

    await expect(page.locator('[data-testid="validation-error"]')).toBeVisible();
  });

  test('should create addon and redirect to list', async ({ page }) => {
    await page.goto('/admin/add-ons/new');

    await page.locator('[data-testid="addon-name"]').fill('New Premium Add-on');
    await page.locator('[data-testid="addon-slug"]').fill('new-premium');
    await page.locator('[data-testid="addon-description"]').fill('A great add-on for premium users');
    await page.locator('[data-testid="addon-price"]').fill('14.99');
    await page.locator('[data-testid="addon-currency"]').selectOption('USD');
    await page.locator('[data-testid="addon-billing"]').selectOption('monthly');

    await page.locator('[data-testid="submit-button"]').click();

    await expect(page).toHaveURL(/.*\/admin\/add-ons$/, { timeout: 5000 });
  });

  test('should have cancel button that goes back to list', async ({ page }) => {
    await page.goto('/admin/add-ons/new');

    await page.locator('[data-testid="cancel-button"]').click();

    await expect(page).toHaveURL(/.*\/admin\/add-ons$/);
  });

  test('should have back button that goes to list', async ({ page }) => {
    await page.goto('/admin/add-ons/new');

    await expect(page.locator('[data-testid="back-button"]')).toBeVisible();

    await page.locator('[data-testid="back-button"]').click();

    await expect(page).toHaveURL(/.*\/admin\/add-ons$/);
  });

  test('should not show activate/deactivate/delete buttons in create mode', async ({ page }) => {
    await page.goto('/admin/add-ons/new');

    await expect(page.locator('[data-testid="activate-button"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="deactivate-button"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="delete-button"]')).not.toBeVisible();
  });

  test('should default currency to EUR', async ({ page }) => {
    await page.goto('/admin/add-ons/new');

    await expect(page.locator('[data-testid="addon-currency"]')).toHaveValue('EUR');
  });

  test('should have billing period options', async ({ page }) => {
    await page.goto('/admin/add-ons/new');

    const billingSelect = page.locator('[data-testid="addon-billing"]');
    const options = billingSelect.locator('option');
    const count = await options.count();
    // placeholder + monthly + yearly + one_time = 4
    expect(count).toBe(4);
  });
});

test.describe('Admin Add-on Form — Edit', () => {
  test.beforeEach(async ({ page }) => {
    if (useRealLogin) {
      await loginAsAdmin(page);
    } else {
      await setupAuth(page);
      await mockAddonsAPI(page);
    }
  });

  test('should load addon data in edit mode', async ({ page }) => {
    await page.goto('/admin/add-ons/1/edit');

    // Wait for data to load
    await page.waitForTimeout(500);

    const nameInput = page.locator('[data-testid="addon-name"]');
    await expect(nameInput).toHaveValue('Priority Support');

    const slugInput = page.locator('[data-testid="addon-slug"]');
    await expect(slugInput).toHaveValue('priority-support');
  });

  test('should populate price and currency in edit mode', async ({ page }) => {
    await page.goto('/admin/add-ons/1/edit');
    await page.waitForTimeout(500);

    await expect(page.locator('[data-testid="addon-price"]')).toHaveValue('19.99');
    await expect(page.locator('[data-testid="addon-currency"]')).toHaveValue('EUR');
  });

  test('should populate billing period in edit mode', async ({ page }) => {
    await page.goto('/admin/add-ons/1/edit');
    await page.waitForTimeout(500);

    await expect(page.locator('[data-testid="addon-billing"]')).toHaveValue('monthly');
  });

  test('should update addon and redirect to list', async ({ page }) => {
    await page.goto('/admin/add-ons/1/edit');
    await page.waitForTimeout(500);

    const nameInput = page.locator('[data-testid="addon-name"]');
    await nameInput.clear();
    await nameInput.fill('Priority Support Plus');

    await page.locator('[data-testid="submit-button"]').click();

    await expect(page).toHaveURL(/.*\/admin\/add-ons$/, { timeout: 5000 });
  });

  test('should show deactivate button for active addon in edit mode', async ({ page }) => {
    await page.goto('/admin/add-ons/1/edit');
    await page.waitForTimeout(500);

    await expect(page.locator('[data-testid="deactivate-button"]')).toBeVisible();
  });

  test('should show activate button for inactive addon in edit mode', async ({ page }) => {
    // Addon 4 is inactive
    await page.goto('/admin/add-ons/4/edit');
    await page.waitForTimeout(500);

    await expect(page.locator('[data-testid="activate-button"]')).toBeVisible();
  });

  test('should show delete button in edit mode', async ({ page }) => {
    await page.goto('/admin/add-ons/1/edit');
    await page.waitForTimeout(500);

    await expect(page.locator('[data-testid="delete-button"]')).toBeVisible();
  });

  test('should load description in edit mode', async ({ page }) => {
    await page.goto('/admin/add-ons/1/edit');
    await page.waitForTimeout(500);

    const descInput = page.locator('[data-testid="addon-description"]');
    await expect(descInput).toHaveValue('24/7 priority support');
  });

  test('should handle fetch error for non-existent addon', async ({ page }) => {
    await setupAuth(page);

    // Override route for specific ID
    await page.route('**/api/v1/admin/addons/999', async (route) => {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Add-on not found' })
      });
    });

    // Also mock the list endpoint
    await page.route('**/api/v1/admin/addons', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ items: [], total: 0 })
      });
    });

    await page.goto('/admin/add-ons/999/edit');
    await page.waitForTimeout(1000);

    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  test('should cancel edit and go back to list', async ({ page }) => {
    await page.goto('/admin/add-ons/1/edit');
    await page.waitForTimeout(500);

    await page.locator('[data-testid="cancel-button"]').click();

    await expect(page).toHaveURL(/.*\/admin\/add-ons$/);
  });
});

test.describe('Admin Add-ons CRUD Flow', () => {
  test.beforeEach(async ({ page }) => {
    if (useRealLogin) {
      await loginAsAdmin(page);
    } else {
      await setupAuth(page);
      await mockAddonsAPI(page);
    }
  });

  test('full CRUD: list → create → list', async ({ page }) => {
    // Start on list
    await page.goto('/admin/add-ons');
    await expect(page.locator('[data-testid="addons-table"]')).toBeVisible();

    // Navigate to create
    await page.locator('[data-testid="create-addon-button"]').click();
    await expect(page).toHaveURL(/.*\/admin\/add-ons\/new/);

    // Fill form
    await page.locator('[data-testid="addon-name"]').fill('Analytics Add-on');
    await page.locator('[data-testid="addon-price"]').fill('24.99');
    await page.locator('[data-testid="addon-billing"]').selectOption('monthly');

    // Submit
    await page.locator('[data-testid="submit-button"]').click();

    // Should redirect to list
    await expect(page).toHaveURL(/.*\/admin\/add-ons$/, { timeout: 5000 });
  });

  test('full CRUD: list → edit → update → list', async ({ page }) => {
    // Start on list
    await page.goto('/admin/add-ons');
    await expect(page.locator('[data-testid="addons-table"]')).toBeVisible();

    // Click on first addon to edit
    await page.locator('[data-testid="addon-row-1"]').click();
    await expect(page).toHaveURL(/.*\/admin\/add-ons\/1\/edit/);

    // Wait for form to load
    await page.waitForTimeout(500);

    // Verify data loaded
    await expect(page.locator('[data-testid="addon-name"]')).toHaveValue('Priority Support');

    // Update name
    const nameInput = page.locator('[data-testid="addon-name"]');
    await nameInput.clear();
    await nameInput.fill('Priority Support Pro');

    // Submit
    await page.locator('[data-testid="submit-button"]').click();

    // Should redirect to list
    await expect(page).toHaveURL(/.*\/admin\/add-ons$/, { timeout: 5000 });
  });

  test('navigate via sidebar to add-ons', async ({ page }) => {
    await page.goto('/admin/dashboard');

    // Look for add-ons link in sidebar
    const addonsLink = page.locator('[data-testid="nav-addons"], a:has-text("Add-ons"), a:has-text("Add-Ons")').first();

    if (await addonsLink.isVisible()) {
      await addonsLink.click();
      await expect(page).toHaveURL(/.*\/admin\/add-ons/);
    }
  });
});
