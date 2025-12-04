import { test, expect } from '@playwright/test';

test('basic test', async ({ page }) => {
  await page.goto('about:blank');
  expect(1).toBe(1);
});
