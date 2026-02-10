import { test, expect } from "@playwright/test"

test.describe("Home Page", () => {
  test("should render home page for unauthenticated users", async ({
    page,
  }) => {
    await page.goto("/")

    // Check that the main heading is visible
    await expect(
      page.getByText("Soccer betting pools with friends.")
    ).toBeVisible()

    // Check that key sections are visible
    await expect(
      page.getByRole("heading", { name: /What is a bolão\?/i })
    ).toBeVisible()
    await expect(
      page.getByRole("heading", { name: /How it works/i })
    ).toBeVisible()
    await expect(
      page.getByRole("heading", { name: /Why Bolão\.io\?/i })
    ).toBeVisible()

    // Check that CTA buttons are visible
    await expect(
      page.getByRole("link", { name: /^GET STARTED$/i })
    ).toBeVisible()
    await expect(page.getByRole("link", { name: /^LOGIN$/i })).toBeVisible()
  })

  test("should have working navigation to login", async ({ page }) => {
    await page.goto("/")

    const loginLink = page.getByRole("link", { name: /^LOGIN$/i })
    await expect(loginLink).toBeVisible()

    await loginLink.click()
    await expect(page).toHaveURL(/\/sign-in/)
  })

  test("should have working navigation to register", async ({ page }) => {
    await page.goto("/")

    const registerLink = page
      .getByRole("link", { name: /^GET STARTED$/i })
      .first()
    await expect(registerLink).toBeVisible()

    await registerLink.click()
    await expect(page).toHaveURL(/\/sign-up/)
  })

  test("should display informative content sections", async ({ page }) => {
    await page.goto("/")

    // Check "What is a bolão?" section content
    await expect(
      page.getByText(/In Brazil, a bolão is a betting pool/i)
    ).toBeVisible()
    await expect(page.getByText(/just friendly competition/i)).toBeVisible()

    // Check "How it works" steps
    await expect(
      page.getByRole("heading", { name: /Create or Join/i })
    ).toBeVisible()
    await expect(
      page.getByRole("heading", { name: /Make Predictions/i })
    ).toBeVisible()
    await expect(
      page.getByRole("heading", { name: /Track & Win/i })
    ).toBeVisible()

    // Check "Why Bolão.io?" features
    await expect(
      page.getByRole("heading", { name: /Multiple Leagues/i })
    ).toBeVisible()
    await expect(
      page.getByRole("heading", { name: /Works Everywhere/i })
    ).toBeVisible()
    await expect(
      page.getByRole("heading", { name: /Completely Free/i })
    ).toBeVisible()
    await expect(
      page.getByRole("heading", { name: /Real-Time Updates/i })
    ).toBeVisible()
  })

  test("should have link to about page", async ({ page }) => {
    await page.goto("/")

    const aboutLink = page.getByRole("link", {
      name: /Learn more about Bolão\.io/i,
    })
    await expect(aboutLink).toBeVisible()

    await aboutLink.click()
    await expect(page).toHaveURL(/\/about/)
  })

  test("should have final CTA section", async ({ page }) => {
    await page.goto("/")

    await expect(
      page.getByRole("heading", { name: /Ready to start\?/i })
    ).toBeVisible()
    await expect(
      page.getByText(/Create your first bolão in minutes/i)
    ).toBeVisible()
    await expect(
      page.getByRole("link", { name: /GET STARTED FOR FREE/i })
    ).toBeVisible()
  })
})
