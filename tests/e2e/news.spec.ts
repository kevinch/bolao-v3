import { test, expect } from '@playwright/test';

test.describe('News Page', () => {
  test('should render news page', async ({ page }) => {
    await page.goto('/news');

    // Check that the page title is visible
    await expect(page.getByRole('heading', { name: /news/i })).toBeVisible();

    // Check that the page structure is present
    await expect(page.locator('.news-container')).toBeVisible();
  });
});

