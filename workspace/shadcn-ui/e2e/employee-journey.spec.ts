import { test, expect } from '@playwright/test';

test.describe('User Journey: Employee Workflow', () => {
  test('should allow employee to login and navigate to dashboard', async ({ page }) => {
    // 1. Login
    await page.goto('/login');
    await page.fill('input[type="email"]', 'employee@example.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');

    // 2. Verify Dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByText('لوحة التحكم')).toBeVisible();

    // 3. Navigate to Tasks
    await page.click('a[href="/tasks"]');
    await expect(page).toHaveURL('/tasks');
    await expect(page.getByText('إدارة المهام')).toBeVisible();

    // 4. Verify Micro Measurement (Implicit)
    // We can check if localStorage has the session data
    const sessionData = await page.evaluate(() => localStorage.getItem('currentMicroSession'));
    expect(sessionData).toBeTruthy();
  });

  test('should track behavior analytics', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Simulate rapid clicks (potential frustration/distraction)
    for (let i = 0; i < 5; i++) {
      await page.click('body');
    }

    // Navigate to Behavior Analytics screen
    await page.goto('/behavior-analytics');
    
    // Check if charts or metrics are visible
    await expect(page.getByText('تحليل السلوك')).toBeVisible();
  });
});
