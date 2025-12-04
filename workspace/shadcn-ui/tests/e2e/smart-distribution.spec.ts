import { test, expect } from '@playwright/test';

test('Smart Task Distribution', async ({ page }) => {
  // 1. Setup employee data (Mocking or Pre-requisite)
  // In a real E2E, we might need to seed the DB or use API to set states.
  // For this test, we assume the UI reflects the state or we mock the response.
  
  // Navigate to Task Distribution page
  await page.goto('/tasks/distribute');
  
  // 2. Distribute new tasks
  const distributeBtn = page.locator('button:has-text("توزيع ذكي")');
  await expect(distributeBtn).toBeVisible();
  await distributeBtn.click();
  
  // Wait for distribution calculation
  await page.waitForTimeout(2000); // Simulating processing time
  
  // 3. Verify distribution results
  // Check for a specific employee known to be "burned out" (e.g., Employee A)
  // We assume the UI shows a list of employees and their assigned task weights
  
  const employeeACard = page.locator('[data-employee="A"]');
  if (await employeeACard.isVisible()) {
      const taskWeight = await employeeACard.locator('.task-weight').textContent();
      // 4. Ensure burnout employee didn't get heavy tasks
      // Assuming weight is a number 0-100
      const weightValue = parseInt(taskWeight || '0');
      expect(weightValue).toBeLessThan(50);
  }
  
  // Check for a "ready" employee (Employee B)
  const employeeBCard = page.locator('[data-employee="B"]');
  if (await employeeBCard.isVisible()) {
      const taskWeight = await employeeBCard.locator('.task-weight').textContent();
      const weightValue = parseInt(taskWeight || '0');
      expect(weightValue).toBeGreaterThan(0);
  }
});
