/**
 * Debug test to see what the auth store receives from login
 */
import { test } from '@playwright/test';
import { adminCredentials } from './helpers/auth';

test('Debug: Check what auth store receives from login', async ({ page }) => {
  // Add a handler to log login-related messages
  page.on('console', msg => {
    if (msg.text().includes('[AUTH') || msg.text().includes('login') || msg.text().includes('roles')) {
      console.log(`[BROWSER CONSOLE] ${msg.type()}: ${msg.text()}`);
    }
  });

  await page.goto('/admin/login');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForLoadState('networkidle');

  // Fill in credentials
  await page.locator('[data-testid="username-input"]').fill(adminCredentials.email);
  await page.locator('[data-testid="password-input"]').fill(adminCredentials.password);

  // Click login
  await page.locator('[data-testid="login-button"]').click();

  // Wait for login to complete
  await page.waitForTimeout(3000);

  // Check the debug info that should be set on window.__AUTH_DEBUG__
  const debugData = await page.evaluate(() => {
    const debug = (window as any).__AUTH_DEBUG__;
    const authError = (window as any).__AUTH_ERROR__;
    const authStore = (window as any).__PINIA_STORE__;
    return {
      authDebug: debug,
      authError: authError,
      piniaStore: authStore,
      userFromStorage: localStorage.getItem('admin_token') ? 'token exists' : 'no token',
      windowKeys: Object.keys(window).filter(k => k.includes('AUTH') || k.includes('PINIA')),
    };
  });

  console.log('\n=== DEBUG DATA ===');
  console.log(JSON.stringify(debugData, null, 2));
  console.log('=== END DEBUG ===\n');

  // Also check localStorage to verify token was saved
  const localStorageData = await page.evaluate(() => {
    return {
      tokens: Object.keys(localStorage),
      admin_token: localStorage.getItem('admin_token') ? 'exists (length: ' + localStorage.getItem('admin_token')!.length + ')' : 'NOT FOUND',
    };
  });

  console.log('\n=== LOCAL STORAGE ===');
  console.log(JSON.stringify(localStorageData, null, 2));
  console.log('=== END STORAGE ===\n');

  // Check current URL
  console.log('Current URL:', page.url());
});
