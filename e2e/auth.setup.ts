import { test as setup } from '@playwright/test';
import path from 'path';
import { signInWithGitHub } from '@/e2e/utils/auth';

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

const github = {
  email: process.env.GITHUB_USER_EMAIL ?? '',
  password: process.env.GITHUB_USER_PASSWORD ?? '',
};

setup('authenticate', async ({ page }) => {
  setup.setTimeout(120000);

  await signInWithGitHub({ page, github });
  await page.goto('/');
  await page.getByRole('button', { name: 'Connect Wallet' }).click();
  const page1Promise = page.waitForEvent('popup');
  await page.getByRole('button', { name: 'GitHub' }).click();
  const page1 = await page1Promise;

  // GitHub will sometime ask for reauthorization
  try {
    await page1.waitForSelector('button:has-text("Authorize iam-login")', {
      state: 'visible',
      timeout: 10000,
    });
    console.log('Reauthorization screen detected');
    await page1.getByRole('button', { name: 'Authorize iam-login' }).click();
  } catch {
    console.log('Reauthorization screen not detected. Continuing...');
  }

  // Web3Auth will sometimes ask for 2FA setup
  try {
    await page1.waitForSelector('text=Skip for now', {
      state: 'visible',
      timeout: 10000,
    });
    console.log('2FA setup screen detected');
    await page1.getByRole('button', { name: 'Skip for now' }).click();
  } catch {
    console.log('2FA setup screen not detected. Continuing...');
  }

  await page1.waitForEvent('close', { timeout: 45000 });
  await page.waitForSelector('button:has-text("Disconnect")', {
    state: 'visible',
    timeout: 20000,
  });

  await page.context().storageState({ path: authFile });
});
