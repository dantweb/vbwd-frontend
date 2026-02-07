import { test, expect } from '@playwright/test';
import { setupAuth } from './fixtures/admin';
import { mockPaymentMethodsAPI, mockPaymentMethods } from './helpers/api-mocks';
import { loginAsAdmin } from './helpers/auth';

// Use real login when E2E_BASE_URL is set (running against docker)
const useRealLogin = !!process.env.E2E_BASE_URL;

test.describe('Admin Payment Methods Management', () => {
  test.beforeEach(async ({ page }) => {
    if (useRealLogin) {
      await loginAsAdmin(page);
    } else {
      await setupAuth(page);
      await mockPaymentMethodsAPI(page);
    }
  });

  test('should display payment methods page title', async ({ page }) => {
    await page.goto('/admin/payment-methods');

    // Check page title
    await expect(page.locator('h2').first()).toContainText(/payment.*methods/i);
  });

  test('should display payment methods list', async ({ page }) => {
    await page.goto('/admin/payment-methods');

    // Wait for content to load
    await page.waitForLoadState('networkidle');

    // Check for table or list
    const table = page.locator('[data-testid="payment-methods-table"], table');
    await expect(table).toBeVisible();
  });

  test('should display payment method names', async ({ page }) => {
    await page.goto('/admin/payment-methods');

    // Check for mock payment method names
    await expect(page.locator('text=Invoice')).toBeVisible();
    await expect(page.locator('text=Credit Card')).toBeVisible();
    await expect(page.locator('text=PayPal')).toBeVisible();
  });

  test('should display payment method codes', async ({ page }) => {
    await page.goto('/admin/payment-methods');

    // Check for payment method codes
    await expect(page.locator('text=invoice')).toBeVisible();
    await expect(page.locator('text=credit_card')).toBeVisible();
  });

  test('should display status badges', async ({ page }) => {
    await page.goto('/admin/payment-methods');

    // Check for active/inactive status indicators
    const activeStatus = page.locator('.status-active, [data-testid="status-active"], .badge-active, .badge-success');
    const inactiveStatus = page.locator('.status-inactive, [data-testid="status-inactive"], .badge-inactive, .badge-warning');

    // Should have at least one active and one inactive
    expect(await activeStatus.count()).toBeGreaterThan(0);
    expect(await inactiveStatus.count()).toBeGreaterThan(0);
  });

  test('should display default badge for default method', async ({ page }) => {
    await page.goto('/admin/payment-methods');

    // Check for default indicator
    const defaultBadge = page.locator('.badge-default, [data-testid="default-badge"], text=/default/i');
    await expect(defaultBadge.first()).toBeVisible();
  });

  test('should have create button', async ({ page }) => {
    await page.goto('/admin/payment-methods');

    const createBtn = page.locator('[data-testid="create-payment-method"], button:has-text("Create"), button:has-text("Add"), a:has-text("Create")');
    await expect(createBtn.first()).toBeVisible();
  });

  test('should navigate to create form when clicking create button', async ({ page }) => {
    await page.goto('/admin/payment-methods');

    const createBtn = page.locator('[data-testid="create-payment-method"], button:has-text("Create"), a:has-text("Create")').first();
    await createBtn.click();

    await expect(page).toHaveURL(/.*\/admin\/payment-methods\/new/);
  });

  test('should display fee type column', async ({ page }) => {
    await page.goto('/admin/payment-methods');

    // Check for fee type column header or values
    await expect(page.locator('text=/fee.*type|fee/i').first()).toBeVisible();
  });

  test('should display position/order column', async ({ page }) => {
    await page.goto('/admin/payment-methods');

    // Check for position column
    await expect(page.locator('th:has-text("Position"), th:has-text("Order"), th:has-text("#")').first()).toBeVisible();
  });

  test('should have edit action for each method', async ({ page }) => {
    await page.goto('/admin/payment-methods');

    // Check for edit buttons/links
    const editButtons = page.locator('[data-testid="edit-payment-method"], button:has-text("Edit"), a:has-text("Edit")');
    expect(await editButtons.count()).toBeGreaterThan(0);
  });

  test('should have activate/deactivate actions', async ({ page }) => {
    await page.goto('/admin/payment-methods');

    // Check for toggle or activate/deactivate buttons
    const toggles = page.locator('[data-testid="toggle-active"], input[type="checkbox"], [role="switch"], button:has-text("Activate"), button:has-text("Deactivate")');
    expect(await toggles.count()).toBeGreaterThan(0);
  });

  test('should navigate to edit form when clicking edit', async ({ page }) => {
    await page.goto('/admin/payment-methods');

    // Click edit on first payment method
    const editBtn = page.locator('[data-testid="edit-payment-method"], button:has-text("Edit"), a:has-text("Edit")').first();
    await editBtn.click();

    await expect(page).toHaveURL(/.*\/admin\/payment-methods\/.*\/edit/);
  });
});

test.describe('Admin Payment Methods Create/Edit Form', () => {
  test.beforeEach(async ({ page }) => {
    if (useRealLogin) {
      await loginAsAdmin(page);
    } else {
      await setupAuth(page);
      await mockPaymentMethodsAPI(page);
    }
  });

  test('should display create form', async ({ page }) => {
    await page.goto('/admin/payment-methods/new');

    // Check form title
    await expect(page.locator('h2, h3').first()).toContainText(/create|new|add/i);
  });

  test('should have code field', async ({ page }) => {
    await page.goto('/admin/payment-methods/new');

    const codeInput = page.locator('input[name="code"], input[data-testid="code-input"], #code');
    await expect(codeInput).toBeVisible();
  });

  test('should have name field', async ({ page }) => {
    await page.goto('/admin/payment-methods/new');

    const nameInput = page.locator('input[name="name"], input[data-testid="name-input"], #name');
    await expect(nameInput).toBeVisible();
  });

  test('should have description field', async ({ page }) => {
    await page.goto('/admin/payment-methods/new');

    const descInput = page.locator('textarea[name="description"], textarea[data-testid="description-input"], #description, input[name="description"]');
    await expect(descInput).toBeVisible();
  });

  test('should have fee type selector', async ({ page }) => {
    await page.goto('/admin/payment-methods/new');

    const feeTypeSelect = page.locator('select[name="fee_type"], [data-testid="fee-type-select"], #fee_type');
    await expect(feeTypeSelect).toBeVisible();
  });

  test('should have fee amount field', async ({ page }) => {
    await page.goto('/admin/payment-methods/new');

    const feeAmountInput = page.locator('input[name="fee_amount"], input[data-testid="fee-amount-input"], #fee_amount');
    await expect(feeAmountInput).toBeVisible();
  });

  test('should have fee charged to selector', async ({ page }) => {
    await page.goto('/admin/payment-methods/new');

    const feeChargedToSelect = page.locator('select[name="fee_charged_to"], [data-testid="fee-charged-to-select"], #fee_charged_to');
    await expect(feeChargedToSelect).toBeVisible();
  });

  test('should have is_active toggle', async ({ page }) => {
    await page.goto('/admin/payment-methods/new');

    const activeToggle = page.locator('input[name="is_active"], [data-testid="is-active-toggle"], #is_active');
    await expect(activeToggle).toBeVisible();
  });

  test('should have save button', async ({ page }) => {
    await page.goto('/admin/payment-methods/new');

    const saveBtn = page.locator('[data-testid="save-payment-method"], button:has-text("Save"), button:has-text("Create"), button[type="submit"]');
    await expect(saveBtn.first()).toBeVisible();
  });

  test('should have cancel button', async ({ page }) => {
    await page.goto('/admin/payment-methods/new');

    const cancelBtn = page.locator('[data-testid="cancel-btn"], button:has-text("Cancel"), a:has-text("Cancel")');
    await expect(cancelBtn.first()).toBeVisible();
  });

  test('should validate required fields on submit', async ({ page }) => {
    await page.goto('/admin/payment-methods/new');

    // Try to submit empty form
    const saveBtn = page.locator('[data-testid="save-payment-method"], button:has-text("Save"), button:has-text("Create"), button[type="submit"]').first();
    await saveBtn.click();

    // Should show validation errors
    await expect(page.locator('.error, .invalid-feedback, [data-testid="validation-error"], text=/required/i').first()).toBeVisible({ timeout: 3000 });
  });

  test('should submit form successfully', async ({ page }) => {
    await page.goto('/admin/payment-methods/new');

    // Fill in required fields
    await page.locator('input[name="code"], input[data-testid="code-input"], #code').fill('test_method');
    await page.locator('input[name="name"], input[data-testid="name-input"], #name').fill('Test Payment Method');

    // Submit form
    const saveBtn = page.locator('[data-testid="save-payment-method"], button:has-text("Save"), button:has-text("Create"), button[type="submit"]').first();
    await saveBtn.click();

    // Should show success or redirect
    await expect(page.locator('text=/success|created/i')).toBeVisible({ timeout: 5000 });
  });

  test('edit form should pre-fill existing data', async ({ page }) => {
    await page.goto('/admin/payment-methods/1/edit');

    // Check that code field is pre-filled
    const codeInput = page.locator('input[name="code"], input[data-testid="code-input"], #code');
    await expect(codeInput).toHaveValue('invoice');

    // Check that name field is pre-filled
    const nameInput = page.locator('input[name="name"], input[data-testid="name-input"], #name');
    await expect(nameInput).toHaveValue('Invoice');
  });

  test('edit form should make code field readonly', async ({ page }) => {
    await page.goto('/admin/payment-methods/1/edit');

    // Code should be readonly in edit mode
    const codeInput = page.locator('input[name="code"], input[data-testid="code-input"], #code');
    const isDisabled = await codeInput.isDisabled();
    const isReadonly = await codeInput.getAttribute('readonly');

    expect(isDisabled || isReadonly !== null).toBeTruthy();
  });
});

test.describe('Admin Payment Methods API Integration', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
  });

  test('should load payment methods page without errors', async ({ page }) => {
    await page.route('**/api/v1/admin/payment-methods**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ payment_methods: mockPaymentMethods })
      });
    });

    await page.goto('/admin/payment-methods');
    await page.waitForLoadState('networkidle');

    // Verify the page loads without errors
    await expect(page.locator('h2').first()).toContainText(/payment.*methods/i);
  });

  test('should handle API errors gracefully', async ({ page }) => {
    await page.route('**/api/v1/admin/payment-methods**', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });

    await page.goto('/admin/payment-methods');

    // Page should still render without crashing
    await expect(page.locator('.payment-methods-view, [data-testid="payment-methods-view"]').first()).toBeVisible();
  });
});

test.describe('Public Payment Methods API', () => {
  test('should access public payment methods API', async ({ page }) => {
    await page.route('**/api/v1/settings/payment-methods', async (route) => {
      const activeMethods = mockPaymentMethods.filter(m => m.is_active);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ methods: activeMethods })
      });
    });

    // Make a direct API request to test the endpoint
    const response = await page.request.get('/api/v1/settings/payment-methods');

    // Verify response is successful
    expect(response.ok()).toBe(true);

    // Verify only active methods are returned
    const data = await response.json();
    expect(data.methods.every((m: { is_active: boolean }) => m.is_active)).toBe(true);
  });
});
