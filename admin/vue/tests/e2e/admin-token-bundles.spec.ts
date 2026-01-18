import { test, expect } from '@playwright/test';
import { setupAuth } from './fixtures/admin';
import { mockSettingsAPI, mockTokenBundlesAPI } from './helpers/api-mocks';
import { loginAsAdmin, navigateViaNavbar } from './helpers/auth';

// Use real login when E2E_BASE_URL is set (running against docker)
const useRealLogin = !!process.env.E2E_BASE_URL;

// Helper to navigate to settings page
async function goToSettings(page: import('@playwright/test').Page): Promise<void> {
  if (useRealLogin) {
    await navigateViaNavbar(page, 'settings');
  } else {
    await page.goto('/admin/settings');
  }
}

// Helper to go to tokens tab and wait for bundles to load
async function goToTokensTab(page: import('@playwright/test').Page): Promise<void> {
  await goToSettings(page);
  await page.locator('[data-testid="tab-tokens"]').click();
  // Wait for tokens content to be visible
  await page.locator('[data-testid="tokens-content"]').waitFor({ state: 'visible', timeout: 10000 });
  // Wait for bundles table or empty/error state to appear
  try {
    await page.waitForSelector('[data-testid="token-bundles-table"], [data-testid="no-bundles"], [data-testid="bundles-error"]', { timeout: 10000 });
  } catch {
    // If neither appears, loading might still be in progress
    await page.waitForTimeout(2000);
  }
}

test.describe('Admin Token Bundles Management', () => {
  test.beforeEach(async ({ page }) => {
    if (useRealLogin) {
      await loginAsAdmin(page);
    } else {
      await setupAuth(page);
      await mockSettingsAPI(page);
      await mockTokenBundlesAPI(page);
    }
  });

  test('should display tokens tab in settings', async ({ page }) => {
    await goToSettings(page);

    // Check the tokens tab exists
    const tokensTab = page.locator('[data-testid="tab-tokens"]');
    await expect(tokensTab).toBeVisible();
  });

  test('should switch to tokens tab and display bundles', async ({ page }) => {
    await goToTokensTab(page);

    // Check tokens content is visible
    await expect(page.locator('[data-testid="tokens-content"]')).toBeVisible();

    // Check bundles table or empty state exists
    const hasTable = await page.locator('[data-testid="token-bundles-table"]').isVisible().catch(() => false);
    const hasEmptyState = await page.locator('[data-testid="no-bundles"]').isVisible().catch(() => false);

    expect(hasTable || hasEmptyState).toBe(true);
  });

  test('should show create bundle button', async ({ page }) => {
    await goToTokensTab(page);

    const createButton = page.locator('[data-testid="create-bundle-btn"]');
    await expect(createButton).toBeVisible();
  });

  test('should navigate to create bundle form', async ({ page }) => {
    await goToTokensTab(page);

    const createButton = page.locator('[data-testid="create-bundle-btn"]');
    await createButton.click();

    await expect(page).toHaveURL(/.*\/admin\/settings\/token-bundles\/new/);
  });

  test('should display bundle data in table when bundles exist', async ({ page }) => {
    await goToTokensTab(page);

    // Skip if no bundles (empty state)
    const hasTable = await page.locator('[data-testid="token-bundles-table"]').isVisible().catch(() => false);
    if (!hasTable) {
      test.skip();
      return;
    }

    // Check bundle rows exist
    const bundleRows = page.locator('[data-testid="bundle-row"]');
    const count = await bundleRows.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should show edit buttons for bundles', async ({ page }) => {
    await goToTokensTab(page);

    const hasTable = await page.locator('[data-testid="token-bundles-table"]').isVisible().catch(() => false);
    if (!hasTable) {
      test.skip();
      return;
    }

    const editButtons = page.locator('[data-testid="edit-bundle-btn"]');
    expect(await editButtons.count()).toBeGreaterThan(0);
  });

  test('should show delete buttons for bundles', async ({ page }) => {
    await goToTokensTab(page);

    const hasTable = await page.locator('[data-testid="token-bundles-table"]').isVisible().catch(() => false);
    if (!hasTable) {
      test.skip();
      return;
    }

    const deleteButtons = page.locator('[data-testid="delete-bundle-btn"]');
    expect(await deleteButtons.count()).toBeGreaterThan(0);
  });

  test('should show activate/deactivate buttons', async ({ page }) => {
    await goToTokensTab(page);

    const hasTable = await page.locator('[data-testid="token-bundles-table"]').isVisible().catch(() => false);
    if (!hasTable) {
      test.skip();
      return;
    }

    // At least one of these should exist
    const activateButtons = await page.locator('[data-testid="activate-bundle-btn"]').count();
    const deactivateButtons = await page.locator('[data-testid="deactivate-bundle-btn"]').count();

    expect(activateButtons + deactivateButtons).toBeGreaterThan(0);
  });

  test('should navigate to bundle details when clicking name link', async ({ page }) => {
    await goToTokensTab(page);

    const hasTable = await page.locator('[data-testid="token-bundles-table"]').isVisible().catch(() => false);
    if (!hasTable) {
      test.skip();
      return;
    }

    // Click on the first bundle name link
    const bundleLink = page.locator('.bundle-name a').first();
    await bundleLink.click();

    await expect(page).toHaveURL(/.*\/admin\/settings\/token-bundles\//);
  });

  test('should display status badges', async ({ page }) => {
    await goToTokensTab(page);

    const hasTable = await page.locator('[data-testid="token-bundles-table"]').isVisible().catch(() => false);
    if (!hasTable) {
      test.skip();
      return;
    }

    // Check status badges exist
    const statusBadges = page.locator('.status-badge');
    expect(await statusBadges.count()).toBeGreaterThan(0);
  });
});
