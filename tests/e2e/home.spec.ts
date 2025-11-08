import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should render home page for unauthenticated users', async ({ page }) => {
    await page.goto('/');

    // Check that the page title is visible
    await expect(page.getByText('Simple soccer bets.')).toBeVisible();

    // Check that login and register buttons are visible
    await expect(page.getByRole('link', { name: /login/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /register/i })).toBeVisible();
  });

  test('should have working navigation to login', async ({ page }) => {
    await page.goto('/');

    const loginLink = page.getByRole('link', { name: /login/i });
    await expect(loginLink).toBeVisible();
    
    await loginLink.click();
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test('should have working navigation to register', async ({ page }) => {
    await page.goto('/');

    const registerLink = page.getByRole('link', { name: /register/i });
    await expect(registerLink).toBeVisible();
    
    await registerLink.click();
    await expect(page).toHaveURL(/\/sign-up/);
  });
});

