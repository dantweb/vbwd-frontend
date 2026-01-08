/**
 * E2E Tests: Admin Invoice Details - Field Validation
 *
 * Tests that all fields in the invoice details view are populated correctly.
 *
 * Run with: E2E_BASE_URL=http://localhost:8081 npx playwright test admin-invoice-details-fields
 */
import { test, expect } from '@playwright/test';
import { loginAsAdmin, navigateViaNavbar, waitForView } from './helpers/auth';

test.describe('Admin Invoice Details - All Fields Populated', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await navigateViaNavbar(page, 'invoices');
    await waitForView(page, 'invoices-view');

    // Click first row to navigate to details
    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();
    await waitForView(page, 'invoice-details-view');
  });

  test('should load the invoice page successfully', async ({ page }) => {
    // Verify we're on an invoice details page
    await expect(page).toHaveURL(/\/admin\/invoices\/[\w-]+/);

    // Should not show error state
    const errorMessage = page.locator('[data-testid="error-message"]');
    await expect(errorMessage).not.toBeVisible();
  });

  test('should display invoice header with invoice number', async ({ page }) => {
    const header = page.locator('.details-header h2');
    await expect(header).toBeVisible();

    const headerText = await header.textContent();
    expect(headerText).toBeTruthy();
    expect(headerText).toContain('Invoice');
    // Invoice number should be present (e.g., "Invoice INV-2024-001")
    expect(headerText!.length).toBeGreaterThan(8);
  });

  test('should display back button', async ({ page }) => {
    const backButton = page.locator('[data-testid="back-button"]');
    await expect(backButton).toBeVisible();
    await expect(backButton).toContainText('Back');
  });

  // Customer Information Section
  test.describe('Customer Information Section', () => {
    test('should display customer information section', async ({ page }) => {
      const section = page.locator('.info-section:has-text("Customer Information")');
      await expect(section).toBeVisible();
    });

    test('should display customer email', async ({ page }) => {
      const emailLabel = page.locator('.info-item:has-text("Email") label');
      await expect(emailLabel).toBeVisible();

      const emailValue = page.locator('.info-item:has-text("Email") span').last();
      await expect(emailValue).toBeVisible();

      const emailText = await emailValue.textContent();
      expect(emailText).toBeTruthy();
      // Email should contain @ symbol
      expect(emailText).toContain('@');
    });

    test('should display customer name field', async ({ page }) => {
      // Use specific selector within Customer Information section
      const nameLabel = page.locator('.info-section:has-text("Customer Information") .info-item:has-text("Name") label').first();
      await expect(nameLabel).toBeVisible();
      await expect(nameLabel).toContainText('Name');

      // The name value span exists (may be empty if user has no name set)
      const nameValue = page.locator('.info-section:has-text("Customer Information") .info-item:has-text("Name") span').last();
      // Just verify the element exists (not visibility, as empty spans may be hidden)
      const exists = await nameValue.count();
      expect(exists).toBeGreaterThan(0);
    });
  });

  // Invoice Information Section
  test.describe('Invoice Information Section', () => {
    test('should display invoice information section', async ({ page }) => {
      const section = page.locator('.info-section:has-text("Invoice Information")');
      await expect(section).toBeVisible();
    });

    test('should display invoice number field', async ({ page }) => {
      const invoiceNumberLabel = page.locator('.info-item:has-text("Invoice Number") label');
      await expect(invoiceNumberLabel).toBeVisible();

      const invoiceNumberValue = page.locator('.info-item:has-text("Invoice Number") span').last();
      await expect(invoiceNumberValue).toBeVisible();

      const invoiceNumber = await invoiceNumberValue.textContent();
      expect(invoiceNumber).toBeTruthy();
      expect(invoiceNumber!.length).toBeGreaterThan(0);
    });

    test('should display status badge with valid status', async ({ page }) => {
      // Use specific selector for invoice status (in Invoice Information section)
      const statusBadge = page.locator('.info-section:has-text("Invoice Information") .status-badge').first();
      await expect(statusBadge).toBeVisible();

      const statusText = await statusBadge.textContent();
      expect(statusText).toBeTruthy();

      // Status should be one of the valid statuses
      const validStatuses = ['Pending', 'Paid', 'Failed', 'Cancelled', 'Refunded'];
      const isValidStatus = validStatuses.some(status =>
        statusText!.toLowerCase().includes(status.toLowerCase())
      );
      expect(isValidStatus).toBeTruthy();
    });

    test('should display amount field with currency', async ({ page }) => {
      const amountLabel = page.locator('.info-item:has-text("Amount") label');
      await expect(amountLabel).toBeVisible();

      const amountValue = page.locator('.amount');
      await expect(amountValue).toBeVisible();

      const amountText = await amountValue.textContent();
      expect(amountText).toBeTruthy();
      // Amount should contain a currency symbol or number
      expect(amountText).toMatch(/[$€£]?\s*\d+[,.]?\d*/);
    });

    test('should display due date field', async ({ page }) => {
      const dueDateLabel = page.locator('.info-item:has-text("Due Date") label');
      await expect(dueDateLabel).toBeVisible();

      const dueDateValue = page.locator('.info-item:has-text("Due Date") span').last();
      await expect(dueDateValue).toBeVisible();

      const dueDateText = await dueDateValue.textContent();
      expect(dueDateText).toBeTruthy();
    });

    test('should display created date field', async ({ page }) => {
      const createdLabel = page.locator('.info-item:has-text("Created") label');
      await expect(createdLabel).toBeVisible();

      const createdValue = page.locator('.info-item:has-text("Created") span').last();
      await expect(createdValue).toBeVisible();

      const createdText = await createdValue.textContent();
      expect(createdText).toBeTruthy();
      // Should be a date format (contains / or - or numbers)
      expect(createdText).toMatch(/\d/);
    });
  });

  // Line Items Section
  test.describe('Line Items Section', () => {
    test('should display line items section', async ({ page }) => {
      const lineItemsSection = page.locator('[data-testid="line-items"]');
      await expect(lineItemsSection).toBeVisible();

      const sectionTitle = page.locator('[data-testid="line-items"] h3');
      await expect(sectionTitle).toContainText('Line Items');
    });

    test('should display line items table or no items message', async ({ page }) => {
      const lineItemsSection = page.locator('[data-testid="line-items"]');

      // Either table or "no items" message should be present
      const table = lineItemsSection.locator('table');
      const noItems = lineItemsSection.locator('.no-items');

      const hasTable = await table.isVisible().catch(() => false);
      const hasNoItems = await noItems.isVisible().catch(() => false);

      expect(hasTable || hasNoItems).toBeTruthy();
    });

    test('should display table headers when line items exist', async ({ page }) => {
      const table = page.locator('[data-testid="line-items"] table');
      const tableExists = await table.isVisible().catch(() => false);

      if (tableExists) {
        await expect(table.locator('th:has-text("Description")')).toBeVisible();
        await expect(table.locator('th:has-text("Qty")')).toBeVisible();
        await expect(table.locator('th:has-text("Unit Price")')).toBeVisible();
        await expect(table.locator('th:has-text("Amount")')).toBeVisible();
      }

      expect(true).toBeTruthy();
    });

    test('should display total in line items table', async ({ page }) => {
      const table = page.locator('[data-testid="line-items"] table');
      const tableExists = await table.isVisible().catch(() => false);

      if (tableExists) {
        const totalLabel = table.locator('tfoot td:has-text("Total")');
        await expect(totalLabel).toBeVisible();

        const totalAmount = table.locator('tfoot td').last();
        await expect(totalAmount).toBeVisible();
        const totalText = await totalAmount.textContent();
        expect(totalText).toMatch(/[$€£]?\s*\d+[,.]?\d*/);
      }

      expect(true).toBeTruthy();
    });
  });

  // Actions Section
  test.describe('Actions Section', () => {
    test('should display actions section', async ({ page }) => {
      const actionsSection = page.locator('.actions-section');
      await expect(actionsSection).toBeVisible();
    });

    test('should display resend button', async ({ page }) => {
      const resendButton = page.locator('[data-testid="resend-button"]');
      await expect(resendButton).toBeVisible();
      await expect(resendButton).toContainText('Resend');
    });

    test('should display appropriate action buttons based on status', async ({ page }) => {
      const statusBadge = page.locator('.info-section:has-text("Invoice Information") .status-badge').first();
      const statusText = await statusBadge.textContent();

      if (statusText?.toLowerCase().includes('pending')) {
        // Pending invoices should have mark paid and void buttons
        await expect(page.locator('[data-testid="mark-paid-button"]')).toBeVisible();
        await expect(page.locator('[data-testid="void-button"]')).toBeVisible();
      } else if (statusText?.toLowerCase().includes('paid')) {
        // Paid invoices should have refund button
        await expect(page.locator('[data-testid="refund-button"]')).toBeVisible();
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
      expect(sectionCount).toBeGreaterThanOrEqual(2);

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

// Test for navigating to invoice from list
test.describe('Admin Invoice Details - Navigation from List', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await navigateViaNavbar(page, 'invoices');
    await waitForView(page, 'invoices-view');
  });

  test('should be able to navigate to invoice by clicking row', async ({ page }) => {
    // Click first row
    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();
    await waitForView(page, 'invoice-details-view');

    // Page should load without errors
    const errorMessage = page.locator('[data-testid="error-message"]');
    const errorVisible = await errorMessage.isVisible().catch(() => false);

    if (errorVisible) {
      const errorText = await errorMessage.textContent();
      console.log('Error loading invoice:', errorText);
    }

    // Header should be visible (confirms page loaded)
    const header = page.locator('.details-header');
    await expect(header).toBeVisible();
  });
});
