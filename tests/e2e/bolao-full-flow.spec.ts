import { test, expect } from "@playwright/test"

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
  await page.getByRole("textbox", { name: "Name:" }).fill("my test e2e")

  // Select a competition (Serie A from Brazil)
  await page.getByRole("combobox").click()
  await page.getByLabel("Brazil").getByText("Serie A").click()

  // Submit the form to create the bolão
  await page.getByRole("button", { name: "Create" }).click()

  // Verify the success toast appears (targeting the div element specifically)
  await expect(
    page.locator("div").getByText("The bolão was successfully created.")
  ).toBeVisible()

  // Navigate back to home page using the logo link in the header
  await page.getByTestId("logo-link-header").click()

  // Verify the newly created bolão appears on the home page
  await expect(page.getByRole("heading", { name: "my test e2e" })).toBeVisible()

  // Navigate to the Results page for the bolão
  await page.getByRole("link", { name: "Results" }).click()

  // Verify the Results page displays the bolão name and competition
  await expect(page.getByText("my test e2eSerie A")).toBeVisible()

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
  await expect(page.getByText("my test e2eSerie A")).toBeVisible()

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
  // Open the dropdown menu for the bolão card
  await page
    .getByRole("tabpanel", { name: "Active bolões" })
    .getByRole("button")
    .click()

  // Click the Delete option from the dropdown menu
  await page.getByText("Delete").click()

  // Confirm the deletion
  await page.getByRole("button", { name: "Confirm" }).click()

  // Verify the deletion success message appears (targeting the div element specifically)
  await expect(
    page.locator("div").getByText("The bolão was successfully deleted.")
  ).toBeVisible()
})
