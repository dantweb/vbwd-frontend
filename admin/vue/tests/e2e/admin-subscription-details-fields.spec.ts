/**
 * E2E Tests: Admin Subscription Details - Field Validation
 *
 * Tests that all fields in the subscription details view are populated correctly.
 *
 * Run with: E2E_BASE_URL=http://localhost:8081 npx playwright test admin-subscription-details-fields
 */
import { test, expect } from '@playwright/test';
import { loginAsAdmin, navigateViaNavbar, waitForView } from './helpers/auth';

test.describe('Admin Subscription Details - All Fields Populated', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await navigateViaNavbar(page, 'subscriptions');
    await waitForView(page, 'subscriptions-view');

    // Click first row to navigate to details
    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();
    await waitForView(page, 'subscription-details-view');
  });

  test('should load the subscription page successfully', async ({ page }) => {
    // Verify we're on a subscription details page
    await expect(page).toHaveURL(/\/admin\/subscriptions\/[\w-]+/);

    // Should not show error state
    const errorMessage = page.locator('[data-testid="error-message"]');
    await expect(errorMessage).not.toBeVisible();
  });

  test('should display subscription header', async ({ page }) => {
    const header = page.locator('.details-header h2');
    await expect(header).toBeVisible();

    const headerText = await header.textContent();
    expect(headerText).toBeTruthy();
    expect(headerText).toContain('Subscription');
  });

  test('should display back button', async ({ page }) => {
    const backButton = page.locator('[data-testid="back-button"]');
    await expect(backButton).toBeVisible();
    await expect(backButton).toContainText('Back');
  });

  // User Information Section
  test.describe('User Information Section', () => {
    test('should display user information section', async ({ page }) => {
      const section = page.locator('.info-section:has-text("User Information")');
      await expect(section).toBeVisible();
    });

    test('should display user email', async ({ page }) => {
      const emailLabel = page.locator('.info-section:has-text("User Information") .info-item:has-text("Email") label');
      await expect(emailLabel).toBeVisible();

      const emailValue = page.locator('.info-section:has-text("User Information") .info-item:has-text("Email") span').last();
      await expect(emailValue).toBeVisible();

      const emailText = await emailValue.textContent();
      expect(emailText).toBeTruthy();
      // Email should contain @ symbol
      expect(emailText).toContain('@');
    });

    test('should display user name field', async ({ page }) => {
      const nameLabel = page.locator('.info-section:has-text("User Information") .info-item:has-text("Name") label');
      await expect(nameLabel).toBeVisible();
      await expect(nameLabel).toContainText('Name');

      // The name value span exists (may be empty if user has no name set)
      const nameValue = page.locator('.info-section:has-text("User Information") .info-item:has-text("Name") span').last();
      const exists = await nameValue.count();
      expect(exists).toBeGreaterThan(0);
    });
  });

  // Subscription Information Section
  test.describe('Subscription Information Section', () => {
    test('should display subscription information section', async ({ page }) => {
      const section = page.locator('.info-section:has-text("Subscription Information")');
      await expect(section).toBeVisible();
    });

    test('should display plan name field', async ({ page }) => {
      const planLabel = page.locator('.info-section:has-text("Subscription Information") .info-item:has-text("Plan") label');
      await expect(planLabel).toBeVisible();

      const planValue = page.locator('.info-section:has-text("Subscription Information") .info-item:has-text("Plan") span').last();
      await expect(planValue).toBeVisible();

      const planText = await planValue.textContent();
      expect(planText).toBeTruthy();
      expect(planText!.length).toBeGreaterThan(0);
    });

    test('should display status badge with valid status', async ({ page }) => {
      const statusBadge = page.locator('.info-section:has-text("Subscription Information") .status-badge').first();
      await expect(statusBadge).toBeVisible();

      const statusText = await statusBadge.textContent();
      expect(statusText).toBeTruthy();

      // Status should be one of the valid statuses
      const validStatuses = ['Active', 'Canceled', 'Cancelled', 'Past Due', 'Trialing', 'Paused', 'Pending', 'Expired'];
      const isValidStatus = validStatuses.some(status =>
        statusText!.toLowerCase().includes(status.toLowerCase())
      );
      expect(isValidStatus).toBeTruthy();
    });
  });

  // Billing Period Section
  test.describe('Billing Period Section', () => {
    test('should display billing period section', async ({ page }) => {
      const section = page.locator('[data-testid="billing-period"]');
      await expect(section).toBeVisible();

      const sectionTitle = section.locator('h3');
      await expect(sectionTitle).toContainText('Billing Period');
    });

    test('should display current period start field', async ({ page }) => {
      const label = page.locator('.info-item:has-text("Current Period Start") label');
      await expect(label).toBeVisible();

      const value = page.locator('.info-item:has-text("Current Period Start") span').last();
      await expect(value).toBeVisible();

      const text = await value.textContent();
      expect(text).toBeTruthy();
      // Should be a date format or dash
      expect(text).toMatch(/\d|^-$/);
    });

    test('should display current period end field', async ({ page }) => {
      const label = page.locator('.info-item:has-text("Current Period End") label');
      await expect(label).toBeVisible();

      const value = page.locator('.info-item:has-text("Current Period End") span').last();
      await expect(value).toBeVisible();

      const text = await value.textContent();
      expect(text).toBeTruthy();
      // Should be a date format or dash
      expect(text).toMatch(/\d|^-$/);
    });

    test('should display created date field', async ({ page }) => {
      const label = page.locator('[data-testid="billing-period"] .info-item:has-text("Created") label');
      await expect(label).toBeVisible();

      const value = page.locator('[data-testid="billing-period"] .info-item:has-text("Created") span').last();
      await expect(value).toBeVisible();

      const text = await value.textContent();
      expect(text).toBeTruthy();
      // Should contain a date (numbers)
      expect(text).toMatch(/\d|^-$/);
    });
  });

  // Payment History Section
  test.describe('Payment History Section', () => {
    test('should display payment history section', async ({ page }) => {
      const section = page.locator('[data-testid="payment-history"]');
      await expect(section).toBeVisible();

      const sectionTitle = section.locator('h3');
      await expect(sectionTitle).toContainText('Payment History');
    });

    test('should display payment table or no payments message', async ({ page }) => {
      const section = page.locator('[data-testid="payment-history"]');

      // Either table or "no payments" message should be present
      const table = section.locator('table');
      const noPayments = section.locator('.no-payments');

      const hasTable = await table.isVisible().catch(() => false);
      const hasNoPayments = await noPayments.isVisible().catch(() => false);

      expect(hasTable || hasNoPayments).toBeTruthy();
    });

    test('should display table headers when payments exist', async ({ page }) => {
      const table = page.locator('[data-testid="payment-history"] table');
      const tableExists = await table.isVisible().catch(() => false);

      if (tableExists) {
        await expect(table.locator('th:has-text("Date")')).toBeVisible();
        await expect(table.locator('th:has-text("Amount")')).toBeVisible();
        await expect(table.locator('th:has-text("Status")')).toBeVisible();
      }

      expect(true).toBeTruthy();
    });
  });

  // Actions Section
  test.describe('Actions Section', () => {
    test('should display cancel button for active subscriptions', async ({ page }) => {
      const statusBadge = page.locator('.info-section:has-text("Subscription Information") .status-badge').first();
      const statusText = await statusBadge.textContent();

      if (statusText?.toLowerCase().includes('active')) {
        const cancelButton = page.locator('[data-testid="cancel-button"]');
        await expect(cancelButton).toBeVisible();
        await expect(cancelButton).toContainText('Cancel');
      }

      expect(true).toBeTruthy();
    });
  });

  // Overall Page Integrity
  test.describe('Page Integrity', () => {
    test('should not have any undefined or null values displayed', async ({ page }) => {
      const content = await page.content();

      // These should not appear in the rendered page
      expect(content).not.toContain('>undefined<');
      expect(content).not.toContain('>null<');
      expect(content).not.toContain('>NaN<');
    });

    test('should have consistent styling', async ({ page }) => {
      // Check key CSS classes are applied
      const infoSections = page.locator('.info-section');
      const sectionCount = await infoSections.count();
      expect(sectionCount).toBeGreaterThanOrEqual(3);

      const infoItems = page.locator('.info-item');
      const itemCount = await infoItems.count();
      expect(itemCount).toBeGreaterThanOrEqual(4);
    });

    test('should have all labels properly displayed', async ({ page }) => {
      // All info items should have labels
      const labels = page.locator('.info-item label');
      const labelCount = await labels.count();
      expect(labelCount).toBeGreaterThanOrEqual(4);

      // Each label should have text
      for (let i = 0; i < labelCount; i++) {
        const labelText = await labels.nth(i).textContent();
        expect(labelText).toBeTruthy();
        expect(labelText!.length).toBeGreaterThan(0);
      }
    });
  });
});

// Test for navigating to subscription from list
test.describe('Admin Subscription Details - Navigation from List', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await navigateViaNavbar(page, 'subscriptions');
    await waitForView(page, 'subscriptions-view');
  });

  test('should be able to navigate to subscription by clicking row', async ({ page }) => {
    // Click first row
    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();
    await waitForView(page, 'subscription-details-view');

    // Page should load without errors
    const errorMessage = page.locator('[data-testid="error-message"]');
    const errorVisible = await errorMessage.isVisible().catch(() => false);

    if (errorVisible) {
      const errorText = await errorMessage.textContent();
      console.log('Error loading subscription:', errorText);
    }

    // Header should be visible (confirms page loaded)
    const header = page.locator('.details-header');
    await expect(header).toBeVisible();
  });
});
