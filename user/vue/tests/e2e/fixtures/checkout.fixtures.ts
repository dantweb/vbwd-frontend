import { Page } from '@playwright/test';

export const TEST_USER = {
  email: 'test@example.com',
  password: 'TestPass123@',
};

export async function loginAsTestUser(page: Page): Promise<void> {
  await page.goto('/login');
  await page.fill('[data-testid="email"]', TEST_USER.email);
  await page.fill('[data-testid="password"]', TEST_USER.password);
  await page.click('[data-testid="login-button"]');
  await page.waitForURL('/dashboard');
}

export async function navigateToCheckout(page: Page, planSlug: string = 'pro'): Promise<void> {
  await page.goto(`/checkout/${planSlug}`);
}

export async function selectPlanFromList(page: Page): Promise<void> {
  await page.goto('/plans');
  await page.click('[data-testid^="select-plan-"]');
  await page.waitForURL(/\/checkout\//);
}
