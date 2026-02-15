import { test } from '@playwright/test';

test('Capture login attempt and debug info', async ({ page }) => {
  // Clear localStorage and go to login
  await page.goto('/admin/login');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForLoadState('networkidle');

  // Fill in credentials
  await page.locator('[data-testid="username-input"]').fill('admin@example.com');
  await page.locator('[data-testid="password-input"]').fill('AdminPass123@');

  // Click login
  await page.locator('[data-testid="login-button"]').click();

  // Wait for page to respond (might be error or redirect)
  await page.waitForTimeout(2000);

  // Check current URL
  const currentUrl = page.url();
  console.log('\n=== LOGIN RESULT ===');
  console.log('Current URL:', currentUrl);

  // Try to extract error message
  const errorElement = await page.locator('[data-testid="login-error"]');
  const isVisible = await errorElement.isVisible().catch(() => false);

  if (isVisible) {
    const errorText = await errorElement.textContent();
    console.log('Error Element Found:');
    console.log(errorText);
  } else {
    console.log('No error element visible');
    // Try to get all page content to see if there's debug info
    const pageContent = await page.content();
    const debugMatch = pageContent.match(/\[DEBUG\]/);
    if (debugMatch) {
      console.log('Found DEBUG info in page');
      const errorText = await page.locator('[data-testid="login-error"]').textContent().catch(() => '');
      console.log('Error text:', errorText);
    }
  }

  console.log('=== END LOGIN RESULT ===\n');
});
