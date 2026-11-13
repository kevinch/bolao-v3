import { test, expect } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"

/**
 * Accessibility smoke test, run in CI on every PR.
 *
 * Scans the public pages that render without a database, api-football or
 * Prismic (so the CI job needs only the Clerk keys to boot the app). Each
 * page is checked against WCAG 2.0/2.1/2.2 level A + AA with axe-core; any
 * violation fails the build.
 *
 * The signed-in / bolão pages are intentionally not covered here: they need
 * a seeded test account and live data. Add them later with a test account in
 * CI secrets if desired.
 */
const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]

const publicPages: { name: string; path: string }[] = [
  { name: "about", path: "/about" },
  { name: "faq", path: "/faq" },
  { name: "privacy", path: "/privacy" },
  { name: "terms", path: "/terms" },
  { name: "contact", path: "/contact" },
  { name: "sign-in", path: "/sign-in" },
  { name: "sign-up", path: "/sign-up" },
]

for (const { name, path } of publicPages) {
  test(`a11y: ${name} (${path}) has no WCAG A/AA violations`, async ({
    page,
  }) => {
    await page.goto(path, { waitUntil: "load" })
    // Let client components (Clerk widgets, theme toggle) finish rendering;
    // `networkidle` never settles against the dev server's HMR socket.
    await page.waitForTimeout(1500)

    const results = await new AxeBuilder({ page })
      .withTags(WCAG_TAGS)
      // The Next.js dev-mode overlay is injected into the page and is not part
      // of the shipped app, so its nodes must not fail the scan.
      .exclude("nextjs-portal")
      .analyze()

    // Readable failure output: list each rule, impact and the elements hit.
    const summary = results.violations
      .map(
        (v) =>
          `  [${v.impact}] ${v.id}: ${v.help}\n` +
          v.nodes.map((n) => `      ${n.target.join(" ")}`).join("\n")
      )
      .join("\n")

    expect(
      results.violations,
      `axe found ${results.violations.length} violation type(s) on ${path}:\n${summary}`
    ).toEqual([])
  })
}
