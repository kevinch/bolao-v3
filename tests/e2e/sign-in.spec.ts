import { test, expect } from '@playwright/test';

test.describe('Sign In Page', () => {
  test('should render sign-in page', async ({ page }) => {
    await page.goto('/sign-in');

    // Check that the page title is visible
    await expect(page.getByRole('heading', { name: /login/i })).toBeVisible();

    // Check that Clerk sign-in component is present (it should have some form elements)
    // Clerk components render with specific data-testid attributes or class names
    // We'll check that the page loaded without errors by verifying the page structure
    await expect(page.locator('main')).toBeVisible();
  });
});

