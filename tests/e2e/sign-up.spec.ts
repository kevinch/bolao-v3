import { test, expect } from '@playwright/test';

test.describe('Sign Up Page', () => {
  test('should render sign-up page', async ({ page }) => {
    await page.goto('/sign-up');

    // Check that the page title is visible
    await expect(page.getByRole('heading', { name: /register/i })).toBeVisible();

    // Check that Clerk sign-up component is present
    await expect(page.locator('main')).toBeVisible();
  });
});

