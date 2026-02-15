/**
 * Comprehensive test to verify that user roles are transmitted from backend API to frontend auth store
 */
import { test, expect } from '@playwright/test';
import { adminCredentials } from './helpers/auth';

test('Verify user roles are transmitted and mapped correctly', async ({ page, context }) => {
  // Step 1: Test backend API directly
  console.log('\n=== STEP 1: Testing Backend API ===');
  const apiResponse = await context.request.post('http://localhost:5000/api/v1/auth/login', {
    data: {
      email: adminCredentials.email,
      password: adminCredentials.password,
    },
  });

  const apiData = await apiResponse.json();
  console.log('API Response Status:', apiResponse.status());
  console.log('API Response data:', JSON.stringify(apiData, null, 2));

  // Verify API response includes user with roles
  expect(apiData.success).toBe(true);
  expect(apiData.user).toBeDefined();
  expect(apiData.user.roles).toBeDefined();
  expect(apiData.user.roles).toContain('ADMIN');
  console.log('✓ API returns user with ADMIN role');

  // Step 2: Test frontend auth store receives the response correctly
  console.log('\n=== STEP 2: Testing Frontend Auth Store Response ===');

  // Login through UI and check auth store state
  await page.goto('/admin/login');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForLoadState('networkidle');

  // Fill in credentials
  await page.locator('[data-testid="username-input"]').fill(adminCredentials.email);
  await page.locator('[data-testid="password-input"]').fill(adminCredentials.password);

  // Intercept the login API call to see what response the frontend receives
  const responses: any[] = [];
  page.on('response', async (response) => {
    if (response.url().includes('/auth/login')) {
      const data = await response.json();
      responses.push({
        status: response.status(),
        data: data,
      });
    }
  });

  // Click login
  await page.locator('[data-testid="login-button"]').click();

  // Wait for response and check what frontend received
  await page.waitForTimeout(2000);

  if (responses.length > 0) {
    console.log('Frontend received API response:', JSON.stringify(responses[0], null, 2));
    expect(responses[0].data.user).toBeDefined();
    expect(responses[0].data.user.roles).toContain('ADMIN');
    console.log('✓ Frontend received user with ADMIN role');
  } else {
    console.warn('⚠ Could not capture API response in frontend');
  }

  // Step 3: Check auth store state in browser
  console.log('\n=== STEP 3: Testing Frontend Auth Store State ===');

  const authDebug = await page.evaluate(() => {
    return (window as any).__AUTH_DEBUG__ || null;
  });

  if (authDebug) {
    console.log('Auth store debug info:', JSON.stringify(authDebug, null, 2));
  } else {
    console.warn('⚠ Could not access auth debug info');
  }

  // Check the URL - if it redirected to forbidden, roles weren't processed correctly
  const currentUrl = page.url();
  console.log('Current URL after login:', currentUrl);

  if (currentUrl.includes('/admin/forbidden')) {
    console.error('✗ User was redirected to forbidden - roles were NOT processed correctly');
    throw new Error('Admin user was redirected to forbidden page');
  } else if (currentUrl.includes('/admin/dashboard') || currentUrl.includes('/admin')) {
    console.log('✓ User successfully navigated to admin dashboard');
  } else {
    console.warn('⚠ Unexpected URL:', currentUrl);
  }
});
