import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

setup('authenticate', async ({ page }) => {
  setup.setTimeout(120000);

  const username = process.env.USERNAME;
  if (!username) {
    throw new Error('USERNAME is not set');
  }

  const password = process.env.PASSWORD;
  if (!password) {
    throw new Error('PASSWORD is not set');
  }

  await page.goto('/');
  await page.getByRole('button', { name: 'Connect Wallet' }).click();
  const page1Promise = page.waitForEvent('popup');
  await page.getByRole('button', { name: 'GitHub' }).click();
  const page1 = await page1Promise;
  await page1.getByLabel('Username or email address').click();
  await page1.getByLabel('Username or email address').fill(username);
  await page1.getByLabel('Password').click();
  await page1.getByLabel('Password').fill(password);
  await page1.getByRole('button', { name: 'Sign in', exact: true }).click();
  await page.getByLabel('GitHub').getByRole('button').first().click();
  await page.locator('.p-1 > .p-2').click();
  await page.context().storageState({ path: authFile });
});
