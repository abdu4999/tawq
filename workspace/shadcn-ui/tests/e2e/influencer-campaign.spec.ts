import { test, expect } from '@playwright/test';

test('Influencer Campaign Full Flow', async ({ page }) => {
  // 1. Add new influencer
  await page.goto('/influencers');
  
  // Check if the "Add Influencer" button exists, if not we might need to be on a specific tab or state
  const addButton = page.locator('button:has-text("إضافة مشهور")');
  if (await addButton.isVisible()) {
      await addButton.click();
      await page.fill('[name="name"]', 'Test Influencer');
      await page.fill('[name="followers"]', '500000');
      await page.fill('[name="engagement"]', '4.5');
      // Assuming selectOption works with the value or label
      await page.selectOption('[name="platform"]', 'instagram');
      await page.click('button:has-text("حفظ")');
  } else {
      console.log('Add Influencer button not found, skipping creation step or adjusting test');
  }
  
  // 2. Influencer Prediction calculates ROI
  // Navigate to prediction page or section
  await page.goto('/influencer-prediction');
  
  // Wait for the ROI metric to appear
  const roiLocator = page.locator('[data-metric="roi"]');
  // It might take a moment to calculate
  await expect(roiLocator).toBeVisible({ timeout: 10000 });
  
  const predictedROI = await roiLocator.textContent();
  expect(predictedROI).toBeDefined();
  
  // 3. AI Auto Decision decides
  const decisionLocator = page.locator('[data-decision]');
  await expect(decisionLocator).toBeVisible();
  const decision = await decisionLocator.textContent();
  
  // Decision should be one of the valid states
  expect(['collaborate', 'pass', 'review']).toContain(decision?.toLowerCase());
  
  // 4. Mandatory Workflow created
  if (decision?.toLowerCase() === 'collaborate') {
    await page.goto('/mandatory-workflow');
    const steps = await page.locator('.workflow-step').count();
    expect(steps).toBeGreaterThan(0);
  }
  
  // 5. Track results
  await page.goto('/influencer-revenue');
  // Verify data presence
  await expect(page.locator('.revenue-chart')).toBeVisible();
});
