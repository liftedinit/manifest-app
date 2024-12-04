import { test, expect, Page } from '@playwright/test';
import { signInWithGitHub } from '@/e2e/utils/auth';

const github = {
  email: process.env.GITHUB_USER_EMAIL || '',
  password: process.env.GITHUB_USER_PASSWORD || '',
};

test.describe.serial('Bank', () => {
  let page: Page;
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    test.setTimeout(1200000);
    await signInWithGitHub({ page, github });
    await page.goto('/');
    await page.getByRole('button', { name: 'Connect Wallet' }).click();
    const page1Promise = page.waitForEvent('popup');
    await page.getByRole('button', { name: 'GitHub' }).click();
    const page1 = await page1Promise;

    if (await page.locator('text=Authorize iam-login').isVisible()) {
      console.log('Reauthorization screen detected');
      await page1.getByRole('button', { name: 'Authorize iam-login' }).click();
    } else {
      console.log('Reauthorization screen not detected. Continuing...');
    }

    await page1.waitForEvent('close', { timeout: 45000 });
    await page.waitForSelector('button:has-text("Disconnect")', {
      state: 'visible',
      timeout: 10000,
    });
  });

  test('has assets', async ({ page }) => {
    await page.goto('/bank');
    await page.screenshot({ path: 'screenshots/bank.png' });
    await expect(page.getByText('Your Assets', { exact: true })).toBeVisible();
  });
});
