import { expect, Page } from '@playwright/test';

export async function signInWithGitHub({
  page,
  github,
}: {
  page: Page;
  github: {
    email: string;
    password: string;
  };
}): Promise<boolean> {
  try {
    await page.goto('https://github.com/login');
    await page.waitForSelector('text=Sign in');
    await page.isVisible('text=Sign in');

    await page.fill('input[autocomplete="username"]', github.email);

    await page.fill('input[autocomplete="current-password"]', github.password);

    await page.click('input[value="Sign in"]');

    await page.waitForSelector('text=Create repository');
    expect(page.isVisible('text=Create repository')).toBe(true);
    return true;
  } catch {
    return false;
  }
}
