import { expect, test } from "@playwright/test"

test("mobile menu navigation starts the next page at the top", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/")
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0)

  await page.getByRole("button", { name: "Open menu" }).click()
  await page.getByRole("link", { name: "About", exact: true }).click()

  await expect(page).toHaveURL(/\/about$/)
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)

  await page.goBack()
  await expect(page).toHaveURL(/\/$/)
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0)
})
