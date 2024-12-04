import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Alberto - Blockchain App/);
});

test('learn how it works', async ({ page }) => {
  await page.goto('/');
  const button = page.locator('text=Learn how it works');
  await expect(button).toBeVisible();
});
