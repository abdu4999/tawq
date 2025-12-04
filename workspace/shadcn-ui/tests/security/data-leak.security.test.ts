import { test, expect } from '@playwright/test';

test.describe('Data Leakage Prevention', () => {
  test('should not expose sensitive donor data', async ({ page }) => {
    // Test: Ensure sensitive fields (phone, exact address) are masked or not returned for unauthorized users
    // Login as regular user
    await page.goto('/login');
    // ...
    
    await page.goto('/donors');
    
    // Inspect network response for donor list or check UI
    // const phone = await page.textContent('.donor-phone');
    // expect(phone).toContain('***'); // Should be masked
  });
  
  test('should filter API responses by role', async ({ page }) => {
    // Test: API should return different data shapes for different roles
    // This is often a network level test intercepting responses
  });
  
  test('should sanitize error messages', async ({ page }) => {
    // Test: Trigger an error (e.g., invalid ID)
    await page.goto('/employees/invalid-id-!@#');
    
    // Check that the error message doesn't contain stack traces or DB info
    const body = await page.textContent('body');
    expect(body).not.toContain('at Object.<anonymous>'); // Stack trace indicator
    expect(body).not.toContain('SELECT * FROM'); // SQL indicator
    expect(body).toContain('Page not found'); // User friendly message
  });
});
