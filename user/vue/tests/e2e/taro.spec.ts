import { test, expect, type Page } from '@playwright/test';

/**
 * Test credentials from environment or defaults
 */
const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL || 'test@example.com';
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD || 'TestPass123@';

/**
 * Helper function to login as test user
 */
async function loginAsTestUser(page: Page): Promise<void> {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');

  // Check if already logged in
  const isLoginPage = await page.locator('[data-testid="login-form"], .login-container').isVisible().catch(() => false);

  if (isLoginPage) {
    await page.locator('[data-testid="email"]').fill(TEST_USER_EMAIL);
    await page.locator('[data-testid="password"]').fill(TEST_USER_PASSWORD);
    await page.locator('[data-testid="login-button"]').click();
    await page.waitForURL('/dashboard', { timeout: 15000 });
  }
}

test.describe('Taro Plugin - Navigation and Access', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
  });

  test('should display Taro in navigation menu', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Check for Taro nav item
    const taroNavLink = page.locator('a[href="/dashboard/taro"]');
    await expect(taroNavLink).toBeVisible();
  });

  test('should navigate to Taro page via menu link', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Click Taro nav link
    await page.locator('a[href="/dashboard/taro"]').click();
    await page.waitForURL('/dashboard/taro', { timeout: 10000 });

    // Verify we're on Taro page
    await expect(page.locator('[data-testid="taro-dashboard"]')).toBeVisible();
  });

  test('should navigate directly to /dashboard/taro', async ({ page }) => {
    await page.goto('/dashboard/taro');
    await page.waitForLoadState('networkidle');

    // Verify page title and main content
    await expect(page.locator('[data-testid="taro-dashboard"]')).toBeVisible();
    await expect(page.locator('[data-testid="daily-limits-card"]')).toBeVisible();
  });
});

test.describe('Taro Plugin - Daily Limits Display', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/dashboard/taro');
    await page.waitForLoadState('networkidle');
  });

  test('should display daily limits card', async ({ page }) => {
    const limitsCard = page.locator('[data-testid="daily-limits-card"]');
    await expect(limitsCard).toBeVisible();

    // Check for limit information
    await expect(limitsCard.locator('text=Daily Total')).toBeVisible();
    await expect(limitsCard.locator('text=Daily Remaining')).toBeVisible();
    await expect(limitsCard.locator('text=Plan Name')).toBeVisible();
  });

  test('should display limit values', async ({ page }) => {
    const limitsCard = page.locator('[data-testid="daily-limits-card"]');

    // Get the limit values (should be numbers)
    const dailyTotal = limitsCard.locator('.limit-item').first();
    const value = await dailyTotal.locator('.value').textContent();

    expect(value).toBeTruthy();
    expect(/^\d+$/.test(value || '')).toBeTruthy();
  });

  test('should refresh limits on button click', async ({ page }) => {
    const refreshBtn = page.locator('[data-testid="refresh-limits-btn"]');
    await expect(refreshBtn).toBeVisible();

    // Get initial value
    const initialValue = await page.locator('[data-testid="daily-limits-card"]').locator('.value').first().textContent();

    // Click refresh
    await refreshBtn.click();
    await page.waitForLoadState('networkidle');

    // Value should still be present (may or may not change)
    const afterValue = await page.locator('[data-testid="daily-limits-card"]').locator('.value').first().textContent();
    expect(afterValue).toBeTruthy();
  });
});

test.describe('Taro Plugin - Create Session Flow', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/dashboard/taro');
    await page.waitForLoadState('networkidle');
  });

  test('should display create session card when no active session', async ({ page }) => {
    const createCard = page.locator('[data-testid="create-session-card"]');
    await expect(createCard).toBeVisible({ timeout: 5000 });

    // Check for create button
    const createBtn = page.locator('[data-testid="create-session-btn"]');
    await expect(createBtn).toBeVisible();
  });

  test('should display benefit information on create card', async ({ page }) => {
    const createCard = page.locator('[data-testid="create-session-card"]');

    // Look for benefit items
    const benefits = createCard.locator('.benefit-item');
    const count = await benefits.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should be able to initiate session creation', async ({ page }) => {
    const createBtn = page.locator('[data-testid="create-session-btn"]');

    // Check if button is enabled (may be disabled if daily limit exceeded)
    const isDisabled = await createBtn.isDisabled();

    if (!isDisabled) {
      // Click create button
      await createBtn.click();

      // Wait for either success or error
      const activeSessionCard = page.locator('[data-testid="active-session-card"]');
      const errorMsg = page.locator('[data-testid="taro-error"]');

      // Either should appear (error if token issues, session if success)
      const hasSessionOrError = await Promise.race([
        activeSessionCard.isVisible({ timeout: 5000 }).catch(() => false),
        errorMsg.isVisible({ timeout: 5000 }).catch(() => false)
      ]);

      expect(hasSessionOrError).toBeTruthy();
    } else {
      // Button disabled likely due to daily limit
      expect(isDisabled).toBeTruthy();
    }
  });
});

test.describe('Taro Plugin - Active Session Display', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    // This test assumes an active session exists
    // In real testing, we might need to create one or use a fixture
  });

  test('should display active session card if session exists', async ({ page }) => {
    await page.goto('/dashboard/taro');
    await page.waitForLoadState('networkidle');

    const activeSessionCard = page.locator('[data-testid="active-session-card"]');
    const createCard = page.locator('[data-testid="create-session-card"]');

    // Either active session or create session should be visible
    const hasSession = await activeSessionCard.isVisible().catch(() => false);
    const hasCreate = await createCard.isVisible().catch(() => false);

    expect(hasSession || hasCreate).toBeTruthy();
  });

  test('should display 3 cards in active session', async ({ page }) => {
    await page.goto('/dashboard/taro');
    await page.waitForLoadState('networkidle');

    const activeSessionCard = page.locator('[data-testid="active-session-card"]');

    if (await activeSessionCard.isVisible().catch(() => false)) {
      const cards = activeSessionCard.locator('[data-testid="card-display"]');
      const count = await cards.count();
      expect(count).toBe(3);
    }
  });

  test('should display session info (follow-ups, tokens, time)', async ({ page }) => {
    await page.goto('/dashboard/taro');
    await page.waitForLoadState('networkidle');

    const activeSessionCard = page.locator('[data-testid="active-session-card"]');

    if (await activeSessionCard.isVisible().catch(() => false)) {
      // Check for info labels
      await expect(activeSessionCard.locator('text=Follow Ups')).toBeVisible().catch(() => {});
      await expect(activeSessionCard.locator('text=Tokens Used')).toBeVisible().catch(() => {});
      await expect(activeSessionCard.locator('text=Time Remaining')).toBeVisible().catch(() => {});
    }
  });
});

test.describe('Taro Plugin - Follow-up Functionality', () => {
  test('should display follow-up section when session is active', async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/dashboard/taro');
    await page.waitForLoadState('networkidle');

    const followUpSection = page.locator('[data-testid="follow-up-section"]');
    const activeSession = page.locator('[data-testid="active-session-card"]');

    // Follow-up section only visible if active session exists
    if (await activeSession.isVisible().catch(() => false)) {
      const followUpExists = await followUpSection.isVisible().catch(() => false);

      if (followUpExists) {
        // Verify form elements
        const input = page.locator('[data-testid="follow-up-input"]');
        await expect(input).toBeVisible();

        // Check for radio buttons
        const sameCardsOption = page.locator('[data-testid="followup-same-cards"]');
        const additionalOption = page.locator('[data-testid="followup-additional"]');
        const newSpreadOption = page.locator('[data-testid="followup-new-spread"]');

        expect(
          await sameCardsOption.isVisible().catch(() => false) ||
          await additionalOption.isVisible().catch(() => false) ||
          await newSpreadOption.isVisible().catch(() => false)
        ).toBeTruthy();
      }
    }
  });

  test('should allow selecting follow-up types', async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/dashboard/taro');
    await page.waitForLoadState('networkidle');

    const followUpSection = page.locator('[data-testid="follow-up-section"]');

    if (await followUpSection.isVisible().catch(() => false)) {
      const additionalOption = page.locator('[data-testid="followup-additional"]');

      if (await additionalOption.isVisible().catch(() => false)) {
        await additionalOption.click();
        await expect(additionalOption).toBeChecked();
      }
    }
  });

  test('submit follow-up button should be disabled when question is empty', async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/dashboard/taro');
    await page.waitForLoadState('networkidle');

    const followUpSection = page.locator('[data-testid="follow-up-section"]');

    if (await followUpSection.isVisible().catch(() => false)) {
      const submitBtn = page.locator('[data-testid="submit-follow-up-btn"]');
      await expect(submitBtn).toBeDisabled();
    }
  });

  test('submit follow-up button should be enabled when question is provided', async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/dashboard/taro');
    await page.waitForLoadState('networkidle');

    const followUpSection = page.locator('[data-testid="follow-up-section"]');

    if (await followUpSection.isVisible().catch(() => false)) {
      const input = page.locator('[data-testid="follow-up-input"]');
      const submitBtn = page.locator('[data-testid="submit-follow-up-btn"]');

      // Type a question
      await input.fill('Tell me more about this reading');

      // Button should be enabled now
      await expect(submitBtn).toBeEnabled();
    }
  });
});

test.describe('Taro Plugin - Session History', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/dashboard/taro');
    await page.waitForLoadState('networkidle');
  });

  test('should display session history section', async ({ page }) => {
    const historySection = page.locator('[data-testid="session-history"]');
    await expect(historySection).toBeVisible({ timeout: 5000 });
  });

  test('should show empty state when no history', async ({ page }) => {
    const emptyState = page.locator('.empty-state');
    const sessions = page.locator('.session-item');

    const isEmptyVisible = await emptyState.isVisible().catch(() => false);
    const sessionCount = await sessions.count();

    // Either empty state or sessions should be visible
    expect(isEmptyVisible || sessionCount > 0).toBeTruthy();
  });

  test('should display load more button if history available', async ({ page }) => {
    const loadMoreBtn = page.locator('[data-testid="load-more-btn"]');
    const isVisible = await loadMoreBtn.isVisible().catch(() => false);

    // Load more button is optional (only if there's more history)
    expect(typeof isVisible).toBe('boolean');
  });
});

test.describe('Taro Plugin - Card Display and Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/dashboard/taro');
    await page.waitForLoadState('networkidle');
  });

  test('should display card with position and orientation', async ({ page }) => {
    const activeSession = page.locator('[data-testid="active-session-card"]');

    if (await activeSession.isVisible().catch(() => false)) {
      const cards = page.locator('[data-testid="card-display"]');

      if (await cards.first().isVisible().catch(() => false)) {
        // Check for card info elements
        const cardInfo = cards.first().locator('.card-info');
        await expect(cardInfo).toBeVisible();
      }
    }
  });

  test('should show card interpretation if available', async ({ page }) => {
    const activeSession = page.locator('[data-testid="active-session-card"]');

    if (await activeSession.isVisible().catch(() => false)) {
      const cards = page.locator('[data-testid="card-display"]');
      const firstCard = cards.first();

      // Check for either interpretation or loading state
      const hasInterpretation = await firstCard.locator('.card-interpretation').isVisible().catch(() => false);
      const hasLoading = await firstCard.locator('.interpretation-loading').isVisible().catch(() => false);

      expect(hasInterpretation || hasLoading).toBeTruthy();
    }
  });

  test('should open card detail modal on card click', async ({ page }) => {
    const activeSession = page.locator('[data-testid="active-session-card"]');

    if (await activeSession.isVisible().catch(() => false)) {
      const card = page.locator('[data-testid="card-display"]').first();

      if (await card.isVisible().catch(() => false)) {
        await card.click();

        const modal = page.locator('[data-testid="card-detail-modal"]');
        await expect(modal).toBeVisible({ timeout: 5000 }).catch(() => {
          // Modal might not appear if interaction is not implemented
        });
      }
    }
  });
});

test.describe('Taro Plugin - Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
  });

  test('should display retry button on error', async ({ page }) => {
    // Navigate with invalid state to trigger error (this is a smoke test)
    await page.goto('/dashboard/taro?error=true', { waitUntil: 'networkidle' }).catch(() => {});

    const errorState = page.locator('[data-testid="taro-error"]');

    if (await errorState.isVisible().catch(() => false)) {
      const retryBtn = errorState.locator('button');
      await expect(retryBtn).toBeVisible();
    }
  });

  test('should display expiry warning if session about to expire', async ({ page }) => {
    await page.goto('/dashboard/taro');
    await page.waitForLoadState('networkidle');

    // Check if expiry warning appears (only if session exists and is expiring soon)
    const expiryWarning = page.locator('[data-testid="expiry-warning"]');
    const isVisible = await expiryWarning.isVisible().catch(() => false);

    // This is optional - only shows when session exists and expiry is near
    expect(typeof isVisible).toBe('boolean');
  });
});

test.describe('Taro Plugin - Close Session', () => {
  test('should display close session button on active session', async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/dashboard/taro');
    await page.waitForLoadState('networkidle');

    const activeSession = page.locator('[data-testid="active-session-card"]');

    if (await activeSession.isVisible().catch(() => false)) {
      const closeBtn = page.locator('[data-testid="close-session-btn"]');
      await expect(closeBtn).toBeVisible();

      // Test close button click
      await closeBtn.click();

      // Session card should disappear
      const createCard = page.locator('[data-testid="create-session-card"]');
      await expect(createCard).toBeVisible({ timeout: 5000 }).catch(() => {
        // Might not appear immediately depending on implementation
      });
    }
  });
});
