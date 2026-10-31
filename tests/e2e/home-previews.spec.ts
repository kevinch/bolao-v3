import { test, expect } from "@playwright/test"

test("championship previews stay compact and carry a choice to signup", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1280, height: 1000 })
  await page.goto("/")
  await expect(page.locator("main .animate-pulse")).toHaveCount(0, {
    timeout: 15_000,
  })
  const section = page.getByRole("region", { name: "Coming up on Bolão.io" })
  if (await section.count() === 0) {
    await expect(page.getByText("Coming up on Bolão.io", { exact: true })).toHaveCount(0)
    await expect(page.getByText(/couldn’t load match details/)).toHaveCount(0)
    return
  }
  await expect(section).toBeVisible()
  // Provider data is intentionally live; fallback states must also be usable.
  const actions = section.getByRole("link", { name: /^Create a bolão for / })
  await expect.poll(async () =>
    await actions.count() || await section.getByText(/Match details will be available soon|couldn’t load match details/).count()
  ).toBeGreaterThan(0)
  const count = await actions.count()
  expect(count).toBeLessThanOrEqual(3)
  // Desktop must display every returned card, including the third one.
  await expect(section.locator("article:visible")).toHaveCount(count)
  await page.screenshot({ path: testInfo.outputPath("visitor-desktop.png"), fullPage: true })
  if (count > 0) {
    const href = await actions.first().getAttribute("href")
    expect(href).toMatch(/^\/sign-up\?competitionId=\d+$/)
    await actions.first().click()
    await expect(page).toHaveURL(new RegExp(href!.replace("?", "\\?")))
    await expect(page.getByRole("heading", { name: "Register" })).toBeVisible()
    const competitionId = new URL(page.url()).searchParams.get("competitionId")
    await expect.poll(() => page.evaluate(() => {
      const stored = sessionStorage.getItem("bolao:competition-intent")
      return stored ? JSON.parse(stored).competitionId : null
    })).toBe(competitionId)
  }
})

test("homepage fits a narrow mobile screen", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 360, height: 800 })
  await page.goto("/")
  await expect(page.locator("main .animate-pulse")).toHaveCount(0, {
    timeout: 15_000,
  })
  const section = page.getByRole("region", { name: "Coming up on Bolão.io" })
  if (await section.count() === 0) {
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
    return
  }
  await expect(section).toBeVisible()
  await expect(section.getByRole("heading")).not.toHaveCount(0)
  const cards = section.locator("article")
  await expect(section.locator("article:visible")).toHaveCount(Math.min(2, await cards.count()))
  for (const card of await section.locator("article:visible").all()) {
    await expect(card.locator("li:visible")).toHaveCount(1)
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await page.screenshot({ path: testInfo.outputPath("visitor-mobile.png"), fullPage: true })
})

test("championship choice survives login and the signed-in homepage shows personal games", async ({ page }, testInfo) => {
  const email = process.env.E2E_TEST_EMAIL
  const password = process.env.E2E_TEST_PASSWORD
  test.skip(!email || !password, "Read-only login check requires the existing e2e credentials")
  await page.goto("/sign-up?competitionId=71")
  await expect.poll(() => page.evaluate(() => {
    const stored = sessionStorage.getItem("bolao:competition-intent")
    return stored ? JSON.parse(stored).competitionId : null
  })).toBe("71")
  await page.goto("/sign-in")
  await page.getByRole("textbox", { name: "Email address or username" }).fill(email!)
  await page.getByRole("button", { name: "Continue", exact: true }).click()
  await page.getByRole("textbox", { name: "Password", exact: true }).fill(password!)
  await page.getByRole("button", { name: "Continue", exact: true }).click()
  await expect(page).toHaveURL(/\/bolao\/create\?competitionId=71/)
  await expect(page.getByRole("combobox")).toHaveText("Serie A")
  await page.goto("/")
  await expect(page.getByRole("heading", { name: "Predictions to make" })).toBeVisible()
  await expect(page.getByRole("region", { name: "Coming up on Bolão.io" })).toHaveCount(0)
  expect(await page.getByRole("region", { name: "Predictions to make" }).locator("article").count()).toBeLessThanOrEqual(3)
  await page.screenshot({ path: testInfo.outputPath("personal-desktop.png"), fullPage: true })
  await page.setViewportSize({ width: 360, height: 800 })
  const personal = page.getByRole("region", { name: "Predictions to make" })
  await expect(personal.locator("article:visible")).toHaveCount(Math.min(2, await personal.locator("article").count()))
  for (const card of await personal.locator("article:visible").all()) {
    await expect(card.locator("li:visible")).toHaveCount(1)
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await page.screenshot({ path: testInfo.outputPath("personal-mobile.png"), fullPage: true })
})
