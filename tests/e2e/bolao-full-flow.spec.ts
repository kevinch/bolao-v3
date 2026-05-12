import { test, expect, type Page } from "@playwright/test"

/** Radix Toast: viewport wrapper is role=region with aria-label like "Notifications (F8)". */
function notificationsRegion(page: Page) {
  return page.getByRole("region", { name: /Notifications/i })
}

/** Targets the visible toast surface (open `li`), avoiding broad `div` matches during layout churn. */
function openToastWithText(page: Page, text: string) {
  return notificationsRegion(page)
    .locator('li[data-state="open"]')
    .filter({ hasText: text })
}

test("Full bolão flow: create, navigate, and delete a bolão", async ({
  page,
}) => {
  // Get test credentials from environment variables
  const testEmail = process.env.E2E_TEST_EMAIL
  const testPassword = process.env.E2E_TEST_PASSWORD

  if (!testEmail || !testPassword) {
    throw new Error(
      "E2E_TEST_EMAIL and E2E_TEST_PASSWORD must be set in .env.test file"
    )
  }

  // Extract username from email for verification
  const expectedUsername = testEmail.split("@")[0]

  // Unique name so this run does not collide with leftover bolões from earlier runs
  const bolaoName = `my test e2e ${Date.now()}`

  // Navigate to home page
  await page.goto("http://localhost:3000/")

  // Navigate to login page
  await page.getByRole("link", { name: "Login" }).click()

  // Fill in email/username and continue
  await page.getByRole("textbox", { name: "Email address or username" }).click()
  await page
    .getByRole("textbox", { name: "Email address or username" })
    .fill(testEmail)
  await page.getByRole("button", { name: "Continue" }).click()

  // Fill in password and continue (Clerk uses a two-step authentication flow)
  await page.getByRole("textbox", { name: "Password" }).click()
  await page.getByRole("textbox", { name: "Password" }).fill(testPassword)
  await page.getByRole("button", { name: "Continue" }).click()

  // Verify login was successful by checking for the welcome message
  await expect(page.getByText(`${expectedUsername}.`)).toBeVisible()

  // Verify the "Create bolão" link is visible on the home page
  await expect(
    page.getByRole("main").getByRole("link", { name: "Create bolão" })
  ).toBeVisible()

  // Navigate to the create bolão page
  await page
    .getByRole("main")
    .getByRole("link", { name: "Create bolão" })
    .click()

  // Fill in the bolão creation form
  await page.getByRole("textbox", { name: "Name:" }).click()
  await page.getByRole("textbox", { name: "Name:" }).fill(bolaoName)

  // Select a competition (Serie A from Brazil)
  await page.getByRole("combobox").click()
  await page.getByLabel("Brazil").getByText("Serie A").click()

  // Submit the form to create the bolão
  await page.getByRole("button", { name: "Create" }).click()

  // Toast: scope to Radix region + open item; longer timeout for enter animation / navigation.
  await expect(
    openToastWithText(page, "The bolão was successfully created.")
  ).toBeVisible({ timeout: 15_000 })

  // Navigate back to home page using the logo link in the header
  await page.getByTestId("logo-link-header").click()

  // Verify the newly created bolão appears on the home page
  await expect(
    page
      .getByRole("tabpanel", { name: "Active bolões" })
      .getByRole("heading", { name: bolaoName })
  ).toBeVisible()

  // Navigate to the Results page for this bolão (home can list multiple cards with "Results")
  await page
    .getByRole("tabpanel", { name: "Active bolões" })
    .getByRole("heading", { name: bolaoName })
    .locator("xpath=../..")
    .getByRole("link", { name: "Results" })
    .click()

  // Verify the Results page displays the bolão name and competition
  await expect(page.getByText(`${bolaoName}Serie A`)).toBeVisible()

  // Verify all navigation links are present on the Results page
  await expect(page.getByRole("link", { name: "BET" })).toBeVisible()
  await expect(page.getByRole("link", { name: "STANDINGS" })).toBeVisible()
  await expect(page.getByRole("link", { name: "RESULTS" })).toBeVisible()
  await expect(page.getByRole("link", { name: "LEAD" })).toBeVisible()

  // Verify the "Next games" section is visible
  await expect(page.getByRole("heading", { name: "Next games" })).toBeVisible()

  // Navigate to the BET page
  await page.getByRole("link", { name: "BET" }).click()

  // Verify the BET page displays the bolão name and competition
  await expect(page.getByText(`${bolaoName}Serie A`)).toBeVisible()

  // Navigate to the STANDINGS page
  await page.getByRole("link", { name: "STANDINGS" }).click()

  // Verify the Standings page heading is visible
  await expect(page.getByRole("heading", { name: "Standings" })).toBeVisible()

  // Navigate to the LEAD page
  await page.getByRole("link", { name: "LEAD" }).click()

  // Verify the Players lead heading is visible
  await expect(
    page.getByRole("heading", { name: "Players lead" })
  ).toBeVisible()

  // Navigate back to home page using the logo link
  await page.getByTestId("logo-link-header").click()

  // Clean up: Delete the test bolão
  // Open the dropdown menu for this bolão's card only
  await page
    .getByRole("tabpanel", { name: "Active bolões" })
    .getByRole("heading", { name: bolaoName })
    .locator("xpath=../..")
    .getByRole("button")
    .click()

  // Click the Delete option from the dropdown menu
  await page.getByText("Delete").click()

  // Confirm the deletion
  await page.getByRole("button", { name: "Confirm" }).click()

  await expect(
    openToastWithText(page, "The bolão was successfully deleted.")
  ).toBeVisible({ timeout: 15_000 })
})
