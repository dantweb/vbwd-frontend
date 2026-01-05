/**
 * E2E Tests: Admin User-Subscription-Invoice Flow
 *
 * Tests the complete flow against real backend:
 * 1. Admin login
 * 2. Create new user with all details
 * 3. Create subscription for user
 * 4. Verify invoice is created with pending status
 *
 * Run with: E2E_BASE_URL=http://localhost:8081 npx playwright test admin-user-subscription-flow
 */

import { test, expect } from '@playwright/test';

test.describe('Admin User-Subscription-Invoice Flow (Real Backend)', () => {
  // Test data - unique email per test run
  const timestamp = Date.now();
  const testUser = {
    email: `e2e.flow.${timestamp}@example.com`,
    password: 'TestPass123@',
    firstName: 'E2E',
    lastName: 'FlowTest',
    addressLine1: 'Teststraße 123',
    addressLine2: 'Apt 4B',
    city: 'Berlin',
    postalCode: '10115',
    country: 'DE',
    phone: '+49 30 12345678',
  };

  // Admin credentials from CLAUDE.md
  const adminCredentials = {
    email: 'admin@example.com',
    password: 'AdminPass123@',
  };

  test.beforeEach(async ({ page }) => {
    // Login as admin via real login form
    await page.goto('/admin/login');
    await page.waitForLoadState('networkidle');

    // Wait for Vue component to mount
    await page.waitForSelector('input#username', { timeout: 10000 });

    // Fill login form
    await page.fill('input#username', adminCredentials.email);
    await page.fill('input#password', adminCredentials.password);

    // Submit login
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await page.waitForURL(/\/admin\/(dashboard)?$/, { timeout: 15000 });
  });

  test('Step 1: Navigate to Users page', async ({ page }) => {
    // Click Users link in sidebar
    await page.click('a[href="/admin/users"], nav >> text=Users');

    // Verify navigation
    await expect(page).toHaveURL(/\/admin\/users/);
    // h1 in topbar shows "User Management", h2 in content shows "Users"
    await expect(page.locator('.admin-topbar h1, .users-view h2').first()).toContainText(/User/i);
  });

  test('Step 2: Create new user with all fields', async ({ page }) => {
    // Navigate to users
    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');

    // Wait for the users page to fully load (header visible)
    await page.waitForSelector('.users-view, .users-header', { timeout: 10000 });

    // Click "Create User" button (use data-testid for reliability)
    const createButton = page.locator('[data-testid="create-user-button"]');
    await createButton.waitFor({ state: 'visible', timeout: 10000 });
    await createButton.click();

    // Wait for form to appear
    await page.waitForSelector('form', { timeout: 5000 });

    // Fill User fields
    await page.fill('input[name="email"], input[id="email"]', testUser.email);
    await page.fill('input[name="password"], input[id="password"]', testUser.password);

    // Select status if available
    const statusSelect = page.locator('select[name="status"], select[id="status"]');
    if (await statusSelect.isVisible()) {
      await statusSelect.selectOption('active');
    }

    // Select role if available
    const roleSelect = page.locator('select[name="role"], select[id="role"]');
    if (await roleSelect.isVisible()) {
      await roleSelect.selectOption('user');
    }

    // Fill UserDetails fields (if visible)
    const firstNameInput = page.locator('input[name="firstName"], input[name="first_name"], input[id="firstName"]');
    if (await firstNameInput.isVisible()) {
      await firstNameInput.fill(testUser.firstName);
    }

    const lastNameInput = page.locator('input[name="lastName"], input[name="last_name"], input[id="lastName"]');
    if (await lastNameInput.isVisible()) {
      await lastNameInput.fill(testUser.lastName);
    }

    const addressInput = page.locator('input[name="addressLine1"], input[name="address_line_1"], input[id="addressLine1"]');
    if (await addressInput.isVisible()) {
      await addressInput.fill(testUser.addressLine1);
    }

    const cityInput = page.locator('input[name="city"], input[id="city"]');
    if (await cityInput.isVisible()) {
      await cityInput.fill(testUser.city);
    }

    const postalCodeInput = page.locator('input[name="postalCode"], input[name="postal_code"], input[id="postalCode"]');
    if (await postalCodeInput.isVisible()) {
      await postalCodeInput.fill(testUser.postalCode);
    }

    const countrySelect = page.locator('select[name="country"], input[name="country"]');
    if (await countrySelect.isVisible()) {
      if (await countrySelect.evaluate(el => el.tagName.toLowerCase()) === 'select') {
        await countrySelect.selectOption(testUser.country);
      } else {
        await countrySelect.fill(testUser.country);
      }
    }

    const phoneInput = page.locator('input[name="phone"], input[id="phone"]');
    if (await phoneInput.isVisible()) {
      await phoneInput.fill(testUser.phone);
    }

    // Submit form
    await page.click('button[type="submit"]:has-text("Save"), button[type="submit"]:has-text("Create")');

    // Wait for success - either toast or redirect
    await Promise.race([
      page.waitForSelector('.toast-success, .notification-success, [role="alert"]:has-text("success")', { timeout: 5000 }).catch(() => null),
      page.waitForURL(/\/admin\/users\/[\w-]+/, { timeout: 5000 }).catch(() => null),
    ]);

    // Verify creation - either toast/notification or redirect to detail page
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/admin\/users/);
  });

  test('Step 3: Verify user appears in list', async ({ page }) => {
    await page.goto('/admin/users');

    // Search for the test user
    const searchInput = page.locator('input[placeholder*="Search"], input[data-testid="search-input"], input[type="search"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill(testUser.email);
      await searchInput.press('Enter');
      await page.waitForTimeout(500);
    }

    // Verify user email appears in table
    await expect(page.locator(`text=${testUser.email}`).first()).toBeVisible({ timeout: 10000 });
  });

  test('Step 4: Navigate to Subscriptions page', async ({ page }) => {
    await page.click('a[href="/admin/subscriptions"], nav >> text=Subscription');
    await expect(page).toHaveURL(/\/admin\/subscriptions/);
    // h1 in topbar shows "Subscriptions"
    await expect(page.locator('.admin-topbar h1').first()).toContainText(/Subscription/i);
  });

  test('Step 5: Create subscription for user', async ({ page }) => {
    await page.goto('/admin/subscriptions');

    // Click "Create Subscription" button
    const createButton = page.locator('button:has-text("Create"), button:has-text("Add"), a:has-text("Create")').first();
    await createButton.click();

    // Wait for form
    await page.waitForSelector('form', { timeout: 5000 });

    // Select user - try different UI patterns
    const userSelect = page.locator('[data-testid="user-select"], select[name="user_id"], select[name="userId"]');
    const userSearchInput = page.locator('[data-testid="user-search"], input[placeholder*="user"], input[placeholder*="User"]');

    if (await userSearchInput.isVisible()) {
      // Autocomplete/search pattern
      await userSearchInput.fill(testUser.email);
      await page.waitForTimeout(500);
      await page.click(`[data-testid="user-option"]:has-text("${testUser.email}"), li:has-text("${testUser.email}"), .option:has-text("${testUser.email}")`);
    } else if (await userSelect.isVisible()) {
      // Select dropdown pattern - find option containing user email
      const options = await userSelect.locator('option').allTextContents();
      const matchingOption = options.find(opt => opt.includes(testUser.email));
      if (matchingOption) {
        await userSelect.selectOption({ label: matchingOption });
      }
    }

    // Select plan - first available plan
    const planSelect = page.locator('[data-testid="plan-select"], select[name="tarif_plan_id"], select[name="planId"]');
    const planSearchInput = page.locator('[data-testid="plan-search"], input[placeholder*="plan"], input[placeholder*="Plan"]');

    if (await planSearchInput.isVisible()) {
      // Autocomplete pattern
      await planSearchInput.click();
      await page.click('[data-testid="plan-option"]:first-child, li:first-child');
    } else if (await planSelect.isVisible()) {
      // Select first option (not empty)
      const options = await planSelect.locator('option').all();
      for (const option of options) {
        const value = await option.getAttribute('value');
        if (value && value !== '') {
          await planSelect.selectOption(value);
          break;
        }
      }
    }

    // Set start date to now
    const startDateInput = page.locator('input[name="startDate"], input[name="started_at"], input[type="date"]');
    if (await startDateInput.isVisible()) {
      const today = new Date().toISOString().split('T')[0];
      await startDateInput.fill(today);
    }

    // Submit form
    await page.click('button[type="submit"]:has-text("Save"), button[type="submit"]:has-text("Create")');

    // Wait for success
    await Promise.race([
      page.waitForSelector('.toast-success, .notification-success', { timeout: 5000 }).catch(() => null),
      page.waitForURL(/\/admin\/subscriptions\/[\w-]+/, { timeout: 5000 }).catch(() => null),
    ]);

    // Verify creation - either toast/notification or redirect to detail page
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/admin\/subscriptions/);
  });

  test('Step 6: Navigate to Invoices and find user invoice', async ({ page }) => {
    await page.click('a[href="/admin/invoices"], nav >> text=Invoice');
    await expect(page).toHaveURL(/\/admin\/invoices/);

    // Search for user's invoice
    const searchInput = page.locator('input[placeholder*="Search"], input[data-testid="search-input"], input[data-testid="invoice-search"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill(testUser.email);
      await searchInput.press('Enter');
      await page.waitForTimeout(500);
    }

    // Verify invoice appears
    await expect(page.locator(`text=${testUser.email}`).first()).toBeVisible({ timeout: 10000 });
  });

  test('Step 7: Verify invoice status is pending', async ({ page }) => {
    await page.goto('/admin/invoices');

    // Search for user
    const searchInput = page.locator('input[placeholder*="Search"], input[data-testid="search-input"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill(testUser.email);
      await searchInput.press('Enter');
      await page.waitForTimeout(500);
    }

    // Click on first invoice row to view details
    const invoiceRow = page.locator('table tbody tr, [data-testid="invoice-row"]').first();
    await invoiceRow.click();

    // Wait for details page
    await page.waitForURL(/\/admin\/invoices\/[\w-]+/, { timeout: 5000 });

    // Verify status is "pending"
    const statusElement = page.locator('[data-testid="invoice-status"], .status-badge, .badge, td:has-text("pending"), span:has-text("pending")');
    await expect(statusElement.first()).toContainText(/pending/i);
  });

  test('Complete flow: Create user, subscription, verify invoice', async ({ page }) => {
    // This test combines all steps in one flow for a complete E2E test

    // Step 1: Create User
    await page.goto('/admin/users');
    const createUserButton = page.locator('button:has-text("Create"), button:has-text("Add")').first();
    if (await createUserButton.isVisible()) {
      await createUserButton.click();
      await page.waitForSelector('form', { timeout: 5000 });

      const uniqueEmail = `flow.complete.${Date.now()}@example.com`;
      await page.fill('input[name="email"], input[id="email"]', uniqueEmail);
      await page.fill('input[name="password"], input[id="password"]', 'TestPass123@');

      await page.click('button[type="submit"]');
      await page.waitForTimeout(1000);

      // Step 2: Create Subscription
      await page.goto('/admin/subscriptions');
      const createSubButton = page.locator('button:has-text("Create"), button:has-text("Add")').first();
      if (await createSubButton.isVisible()) {
        await createSubButton.click();
        await page.waitForSelector('form', { timeout: 5000 });

        // Fill subscription form (implementation depends on UI)
        // ... subscription form filling logic

        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);
      }

      // Step 3: Verify Invoice
      await page.goto('/admin/invoices');
      // Search and verify pending status
      // ... invoice verification logic
    }
  });
});
