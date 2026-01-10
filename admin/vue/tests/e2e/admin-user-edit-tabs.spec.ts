/**
 * E2E Tests: Admin User Edit - Tabs Feature
 *
 * Tests for the tabbed interface in user edit page:
 * - Account tab (existing form fields)
 * - Subscriptions tab (user's subscriptions with pagination/search)
 * - Invoices tab (user's invoices with pagination/search)
 *
 * TDD-First: Tests written BEFORE implementation.
 *
 * Run with: E2E_BASE_URL=http://localhost:8081 npx playwright test admin-user-edit-tabs
 */
import { test, expect } from '@playwright/test';
import { loginAsAdmin, navigateViaNavbar, waitForView } from './helpers/auth';

test.describe('Admin User Edit - Tab Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await navigateViaNavbar(page, 'users');
    await waitForView(page, 'users-view');

    // Navigate to user edit page
    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();
    await waitForView(page, 'user-edit-view');
  });

  test('should display three tabs: Account, Subscriptions, Invoices', async ({ page }) => {
    const tabsContainer = page.locator('[data-testid="user-edit-tabs"]');
    await expect(tabsContainer).toBeVisible();

    const accountTab = page.locator('[data-testid="tab-account"]');
    const subscriptionsTab = page.locator('[data-testid="tab-subscriptions"]');
    const invoicesTab = page.locator('[data-testid="tab-invoices"]');

    await expect(accountTab).toBeVisible();
    await expect(subscriptionsTab).toBeVisible();
    await expect(invoicesTab).toBeVisible();

    await expect(accountTab).toContainText('Account');
    await expect(subscriptionsTab).toContainText('Subscriptions');
    await expect(invoicesTab).toContainText('Invoices');
  });

  test('should show Account tab as active by default', async ({ page }) => {
    const accountTab = page.locator('[data-testid="tab-account"]');
    await expect(accountTab).toHaveClass(/active/);

    // Account content should be visible
    const accountContent = page.locator('[data-testid="tab-content-account"]');
    await expect(accountContent).toBeVisible();
  });

  test('should switch to Subscriptions tab on click', async ({ page }) => {
    const subscriptionsTab = page.locator('[data-testid="tab-subscriptions"]');
    await subscriptionsTab.click();

    // Subscriptions tab should be active
    await expect(subscriptionsTab).toHaveClass(/active/);

    // Subscriptions content should be visible
    const subscriptionsContent = page.locator('[data-testid="tab-content-subscriptions"]');
    await expect(subscriptionsContent).toBeVisible();

    // Account content should be hidden
    const accountContent = page.locator('[data-testid="tab-content-account"]');
    await expect(accountContent).not.toBeVisible();
  });

  test('should switch to Invoices tab on click', async ({ page }) => {
    const invoicesTab = page.locator('[data-testid="tab-invoices"]');
    await invoicesTab.click();

    // Invoices tab should be active
    await expect(invoicesTab).toHaveClass(/active/);

    // Invoices content should be visible
    const invoicesContent = page.locator('[data-testid="tab-content-invoices"]');
    await expect(invoicesContent).toBeVisible();

    // Account content should be hidden
    const accountContent = page.locator('[data-testid="tab-content-account"]');
    await expect(accountContent).not.toBeVisible();
  });

  test('should switch back to Account tab', async ({ page }) => {
    // First go to Subscriptions
    await page.locator('[data-testid="tab-subscriptions"]').click();
    await expect(page.locator('[data-testid="tab-content-subscriptions"]')).toBeVisible();

    // Then back to Account
    const accountTab = page.locator('[data-testid="tab-account"]');
    await accountTab.click();

    await expect(accountTab).toHaveClass(/active/);
    await expect(page.locator('[data-testid="tab-content-account"]')).toBeVisible();
  });
});

test.describe('Admin User Edit - Account Tab', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await navigateViaNavbar(page, 'users');
    await waitForView(page, 'users-view');

    // Navigate to user edit page
    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();
    await waitForView(page, 'user-edit-view');
  });

  test('should display account form fields in Account tab', async ({ page }) => {
    const accountContent = page.locator('[data-testid="tab-content-account"]');
    await expect(accountContent).toBeVisible();

    // Check form fields exist within account tab
    await expect(accountContent.locator('#email')).toBeVisible();
    await expect(accountContent.locator('[data-testid="status-select"]')).toBeVisible();
    await expect(accountContent.locator('[data-testid="role-select"]')).toBeVisible();
    await expect(accountContent.locator('#firstName')).toBeVisible();
    await expect(accountContent.locator('#lastName')).toBeVisible();
  });

  test('should retain form submission functionality', async ({ page }) => {
    // Update a field
    const firstNameInput = page.locator('#firstName');
    const originalName = await firstNameInput.inputValue();
    const newName = originalName === 'TabTest' ? 'TabTestUpdated' : 'TabTest';

    await firstNameInput.clear();
    await firstNameInput.fill(newName);

    // Submit
    await page.locator('[data-testid="submit-button"]').click();

    // Should navigate back to users list
    await expect(page).toHaveURL(/\/admin\/users$/);

    // Revert changes
    await navigateViaNavbar(page, 'users');
    await page.locator('tbody tr').first().click();
    await waitForView(page, 'user-edit-view');
    await firstNameInput.clear();
    await firstNameInput.fill(originalName);
    await page.locator('[data-testid="submit-button"]').click();
  });

  test('should show cancel button that navigates back', async ({ page }) => {
    await page.locator('[data-testid="cancel-button"]').click();
    await expect(page).toHaveURL(/\/admin\/users$/);
  });
});

test.describe('Admin User Edit - Subscriptions Tab', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await navigateViaNavbar(page, 'users');
    await waitForView(page, 'users-view');

    // Navigate to user edit page
    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();
    await waitForView(page, 'user-edit-view');

    // Switch to Subscriptions tab
    await page.locator('[data-testid="tab-subscriptions"]').click();
    await expect(page.locator('[data-testid="tab-content-subscriptions"]')).toBeVisible();
  });

  test('should display subscriptions table or empty state', async ({ page }) => {
    const content = page.locator('[data-testid="tab-content-subscriptions"]');

    // Either table or empty state should be visible
    const table = content.locator('[data-testid="user-subscriptions-table"]');
    const emptyState = content.locator('[data-testid="subscriptions-empty-state"]');

    const tableVisible = await table.isVisible().catch(() => false);
    const emptyVisible = await emptyState.isVisible().catch(() => false);

    expect(tableVisible || emptyVisible).toBeTruthy();
  });

  test('should display subscription table columns', async ({ page }) => {
    const content = page.locator('[data-testid="tab-content-subscriptions"]');
    const table = content.locator('[data-testid="user-subscriptions-table"]');

    // Skip if no subscriptions
    if (!(await table.isVisible().catch(() => false))) {
      test.skip();
      return;
    }

    const headers = table.locator('thead th');
    await expect(headers.filter({ hasText: 'Plan' })).toBeVisible();
    await expect(headers.filter({ hasText: 'Status' })).toBeVisible();
    await expect(headers.filter({ hasText: 'Created' })).toBeVisible();
  });

  test('should display search input for subscriptions', async ({ page }) => {
    const content = page.locator('[data-testid="tab-content-subscriptions"]');
    const searchInput = content.locator('[data-testid="subscriptions-search-input"]');
    await expect(searchInput).toBeVisible();
  });

  test('should display pagination when multiple subscriptions exist', async ({ page }) => {
    const content = page.locator('[data-testid="tab-content-subscriptions"]');
    const table = content.locator('[data-testid="user-subscriptions-table"]');

    // Skip if no subscriptions table
    if (!(await table.isVisible().catch(() => false))) {
      test.skip();
      return;
    }

    // Pagination might not be visible if < 1 page of results
    const pagination = content.locator('[data-testid="subscriptions-pagination"]');
    // Just check the element exists (may be hidden if few results)
    await expect(pagination).toBeAttached();
  });

  test('should navigate to subscription details on row click', async ({ page }) => {
    const content = page.locator('[data-testid="tab-content-subscriptions"]');
    const table = content.locator('[data-testid="user-subscriptions-table"]');

    // Skip if no subscriptions
    if (!(await table.isVisible().catch(() => false))) {
      test.skip();
      return;
    }

    const firstRow = table.locator('tbody tr').first();
    if (!(await firstRow.isVisible().catch(() => false))) {
      test.skip();
      return;
    }

    await firstRow.click();

    // Should navigate to subscription details page
    await expect(page).toHaveURL(/\/admin\/subscriptions\/[a-zA-Z0-9-]+$/);
  });

  test('should filter subscriptions by search query', async ({ page }) => {
    const content = page.locator('[data-testid="tab-content-subscriptions"]');
    const searchInput = content.locator('[data-testid="subscriptions-search-input"]');
    const table = content.locator('[data-testid="user-subscriptions-table"]');

    // Skip if no subscriptions
    if (!(await table.isVisible().catch(() => false))) {
      test.skip();
      return;
    }

    // Get initial row count
    const initialRowCount = await table.locator('tbody tr').count();
    if (initialRowCount === 0) {
      test.skip();
      return;
    }

    // Type a search query that likely won't match
    await searchInput.fill('zzz-nonexistent-zzz');
    await page.waitForTimeout(300); // Debounce

    // Should show filtered results or empty state
    const newRowCount = await table.locator('tbody tr').count();
    const emptyState = content.locator('[data-testid="subscriptions-empty-state"]');

    // Either fewer rows or empty state
    expect(newRowCount < initialRowCount || await emptyState.isVisible()).toBeTruthy();
  });
});

test.describe('Admin User Edit - Invoices Tab', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await navigateViaNavbar(page, 'users');
    await waitForView(page, 'users-view');

    // Navigate to user edit page
    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();
    await waitForView(page, 'user-edit-view');

    // Switch to Invoices tab
    await page.locator('[data-testid="tab-invoices"]').click();
    await expect(page.locator('[data-testid="tab-content-invoices"]')).toBeVisible();
  });

  test('should display invoices table or empty state', async ({ page }) => {
    const content = page.locator('[data-testid="tab-content-invoices"]');

    // Either table or empty state should be visible
    const table = content.locator('[data-testid="user-invoices-table"]');
    const emptyState = content.locator('[data-testid="invoices-empty-state"]');

    const tableVisible = await table.isVisible().catch(() => false);
    const emptyVisible = await emptyState.isVisible().catch(() => false);

    expect(tableVisible || emptyVisible).toBeTruthy();
  });

  test('should display invoice table columns', async ({ page }) => {
    const content = page.locator('[data-testid="tab-content-invoices"]');
    const table = content.locator('[data-testid="user-invoices-table"]');

    // Skip if no invoices
    if (!(await table.isVisible().catch(() => false))) {
      test.skip();
      return;
    }

    const headers = table.locator('thead th');
    await expect(headers.filter({ hasText: 'Invoice' })).toBeVisible();
    await expect(headers.filter({ hasText: 'Amount' })).toBeVisible();
    await expect(headers.filter({ hasText: 'Status' })).toBeVisible();
    await expect(headers.filter({ hasText: 'Date' })).toBeVisible();
  });

  test('should display search input for invoices', async ({ page }) => {
    const content = page.locator('[data-testid="tab-content-invoices"]');
    const searchInput = content.locator('[data-testid="invoices-search-input"]');
    await expect(searchInput).toBeVisible();
  });

  test('should display pagination when multiple invoices exist', async ({ page }) => {
    const content = page.locator('[data-testid="tab-content-invoices"]');
    const table = content.locator('[data-testid="user-invoices-table"]');

    // Skip if no invoices table
    if (!(await table.isVisible().catch(() => false))) {
      test.skip();
      return;
    }

    // Pagination might not be visible if < 1 page of results
    const pagination = content.locator('[data-testid="invoices-pagination"]');
    await expect(pagination).toBeAttached();
  });

  test('should navigate to invoice details on row click', async ({ page }) => {
    const content = page.locator('[data-testid="tab-content-invoices"]');
    const table = content.locator('[data-testid="user-invoices-table"]');

    // Skip if no invoices
    if (!(await table.isVisible().catch(() => false))) {
      test.skip();
      return;
    }

    const firstRow = table.locator('tbody tr').first();
    if (!(await firstRow.isVisible().catch(() => false))) {
      test.skip();
      return;
    }

    await firstRow.click();

    // Should navigate to invoice details page
    await expect(page).toHaveURL(/\/admin\/invoices\/[a-zA-Z0-9-]+$/);
  });

  test('should filter invoices by search query', async ({ page }) => {
    const content = page.locator('[data-testid="tab-content-invoices"]');
    const searchInput = content.locator('[data-testid="invoices-search-input"]');
    const table = content.locator('[data-testid="user-invoices-table"]');

    // Skip if no invoices
    if (!(await table.isVisible().catch(() => false))) {
      test.skip();
      return;
    }

    // Get initial row count
    const initialRowCount = await table.locator('tbody tr').count();
    if (initialRowCount === 0) {
      test.skip();
      return;
    }

    // Type a search query that likely won't match
    await searchInput.fill('zzz-nonexistent-zzz');
    await page.waitForTimeout(300); // Debounce

    // Should show filtered results or empty state
    const newRowCount = await table.locator('tbody tr').count();
    const emptyState = content.locator('[data-testid="invoices-empty-state"]');

    // Either fewer rows or empty state
    expect(newRowCount < initialRowCount || await emptyState.isVisible()).toBeTruthy();
  });

  test('should display formatted amount with currency', async ({ page }) => {
    const content = page.locator('[data-testid="tab-content-invoices"]');
    const table = content.locator('[data-testid="user-invoices-table"]');

    // Skip if no invoices
    if (!(await table.isVisible().catch(() => false))) {
      test.skip();
      return;
    }

    const firstRow = table.locator('tbody tr').first();
    if (!(await firstRow.isVisible().catch(() => false))) {
      test.skip();
      return;
    }

    // Amount cell should contain currency symbol
    const amountCell = firstRow.locator('td').nth(1); // Amount is second column
    const amountText = await amountCell.textContent();
    expect(amountText).toMatch(/[$€£¥]/); // Should contain currency symbol
  });
});
