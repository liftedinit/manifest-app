import { test, expect, Page } from '@playwright/test';
import { signInWithGitHub } from '@/e2e/utils/auth';

test.describe.serial('Bank', () => {
  test('has assets', async ({ page }) => {
    try {
      await page.goto('/bank');
      await expect(page.getByText('Your Assets', { exact: true })).toBeVisible();
      await expect(page.getByText('mfx', { exact: true })).toBeVisible();

      await page.getByPlaceholder('0.00').click();
      await page.getByPlaceholder('0.00').fill('1');
      await page.getByPlaceholder('Enter address').click();
      await page
        .getByPlaceholder('Enter address')
        .fill('manifest1hj5fveer5cjtn4wd6wstzugjfdxzl0xp8ws9ct');
      await page.getByPlaceholder('Memo').click();
      await page.getByPlaceholder('Memo').fill('E2E bank test');
      await page.getByLabel('send-btn').click();
      await page.getByRole('button', { name: 'Approve' }).click();
      await page.waitForSelector('text=Transaction Successful');
    } catch (error) {
      console.error(error);
      await page.screenshot({ path: 'screenshots/bank-error.png' });
      throw error;
    }
  });
});
