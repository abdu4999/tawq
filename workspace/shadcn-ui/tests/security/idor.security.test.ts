import { test, expect } from '@playwright/test';

test.describe('IDOR Prevention', () => {
  test('should prevent accessing other employee data', async ({ page }) => {
    // Login as Employee A (ID: 123)
    await page.goto('/login');
    await page.fill('[name="email"]', 'employeeA@test.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');

    // Attempt to access Employee B's profile (ID: 456)
    // Assuming URL structure /employees/:id
    await page.goto('/employees/456');

    // Should be denied
    // Expect redirection or error message
    const content = await page.content();
    expect(content).not.toContain('Employee B Name'); // Should not see other's data
    // Or expect 403 page
    // await expect(page.locator('text=Unauthorized')).toBeVisible();
  });
  
  test('should prevent accessing other donor profiles', async ({ page }) => {
    // Login as restricted user
    await page.goto('/login');
    // ... login steps ...
    
    // Attempt to access restricted donor
    await page.goto('/donors/999');
    
    // Verify access denied
    const url = page.url();
    expect(url).not.toContain('/donors/999');
  });
  
  test('should prevent modifying other users tasks', async ({ page }) => {
    // This might be an API test or UI test trying to edit a task not assigned to user
    // For UI, maybe try to navigate to edit page of another's task
    await page.goto('/tasks/edit/888'); // Task 888 belongs to someone else
    
    // Should handle gracefully
    await expect(page).toHaveURL(/.*tasks/); // Redirects back to list
  });
});
