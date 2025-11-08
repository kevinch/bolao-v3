import { test, expect } from '@playwright/test';

test.describe('About Page', () => {
  test('should render about page', async ({ page }) => {
    await page.goto('/about');

    // Check that the page title is visible
    await expect(page.getByRole('heading', { name: /about/i })).toBeVisible();

    // Check that key content sections are present
    await expect(page.getByRole('heading', { name: /bolão\?/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /who's behind this\?/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /on the tech side/i })).toBeVisible();
  });

  test('should have working external links', async ({ page }) => {
    await page.goto('/about');

    // Check that the wiki link exists
    const wikiLink = page.getByRole('link', { name: /wiki page/i });
    await expect(wikiLink).toBeVisible();
    await expect(wikiLink).toHaveAttribute('href', 'https://en.wiktionary.org/wiki/bol%C3%A3o');

    // Check that the LinkedIn link exists
    const linkedInLink = page.getByRole('link', { name: /linkedin/i });
    await expect(linkedInLink).toBeVisible();
    await expect(linkedInLink).toHaveAttribute('href', 'https://www.linkedin.com/in/kevinchevallier/');
  });
});

