import { test, expect } from '@playwright/test';

test.describe('Chat Interface', () => {
  test('should load chat page', async ({ page }) => {
    await page.goto('/a/anna-ai-assistant');
    await expect(page.locator('text=Anna')).toBeVisible();
  });

  test('should send a message', async ({ page }) => {
    await page.goto('/a/anna-ai-assistant');

    // Find input field
    const input = page.locator('input[type="text"], textarea').first();
    await input.fill('Show CPU usage');

    // Click send button
    const sendButton = page.locator('button:has-text("Send"), button[type="submit"]').first();
    await sendButton.click();

    // Wait for response
    await expect(page.locator('text=CPU')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Plugin Navigation', () => {
  test('should navigate to main page', async ({ page }) => {
    await page.goto('/a/anna-ai-assistant');
    await expect(page).toHaveTitle(/Anna/);
  });
});
