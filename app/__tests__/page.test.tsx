import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"

import Home from "../[locale]/page"

vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn(),
  setRequestLocale: vi.fn(),
}))

vi.mock("@/app/components/pageTitle", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="page-title">{children}</div>
  ),
}))

vi.mock("@/app/components/InviteRedirector", () => ({
  default: () => <div data-testid="invite-redirector" />,
}))

vi.mock("@/i18n/navigation", () => ({
  Link: ({
    children,
    href,
  }: {
    children: React.ReactNode
    href: string
  }) => <a href={href}>{children}</a>,
}))

const params = Promise.resolve({ locale: "en" })

async function mockHomeTranslations() {
  const { getTranslations } = await import("next-intl/server")
  const copy: Record<string, string> = {
    hero: "Soccer betting pools with friends.",
    tagline1: "Compete on predictions.",
    tagline2: "Track results in real-time.",
    tagline3: "Win bragging rights.",
    getStarted: "GET STARTED",
    login: "LOGIN",
    learnMore: "Learn more about Bolão.io",
    whatIsBolao: "What is a bolão?",
    whatIsBolaoDesc:
      "In Brazil, a bolão is a betting pool with friends — just friendly competition.",
    howItWorks: "How it works",
    step1Title: "Create or Join",
    step1Desc: "s1",
    step2Title: "Make Predictions",
    step2Desc: "s2",
    step3Title: "Track & Win",
    step3Desc: "s3",
    whyBolao: "Why Bolão.io?",
    featureLeagues: "Multiple Leagues",
    featureLeaguesDesc: "fl",
    featureEverywhere: "Works Everywhere",
    featureEverywhereDesc: "fe",
    featureFree: "Completely Free",
    featureFreeDesc: "ff",
    featureRealtime: "Real-Time Updates",
    featureRealtimeDesc: "fr",
    readyToStart: "Ready to start?",
    createFirstBolao: "Create your first bolão in minutes",
    getStartedFree: "GET STARTED FOR FREE",
  }
  vi.mocked(getTranslations).mockImplementation(async () => (key: string) => {
    return copy[key] ?? key
  })
}

describe("Home Page (marketing)", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should render InviteRedirector and page title", async () => {
    await mockHomeTranslations()

    render(await Home({ params }))

    expect(screen.getByTestId("invite-redirector")).toBeInTheDocument()
    expect(screen.getByTestId("page-title")).toBeInTheDocument()
  })

  it("should display hero title", async () => {
    await mockHomeTranslations()

    render(await Home({ params }))

    expect(
      screen.getByText("Soccer betting pools with friends.")
    ).toBeInTheDocument()
  })

  it("should render sign-up and sign-in links", async () => {
    await mockHomeTranslations()

    render(await Home({ params }))

    const getStartedLinks = screen.getAllByRole("link", {
      name: /GET STARTED/i,
    })
    expect(getStartedLinks[0]).toHaveAttribute("href", "/sign-up")

    const loginLink = screen.getByRole("link", { name: /^LOGIN$/i })
    expect(loginLink).toHaveAttribute("href", "/sign-in")
  })

  it("should render Learn more link to about", async () => {
    await mockHomeTranslations()

    render(await Home({ params }))

    const aboutLink = screen.getByRole("link", {
      name: /Learn more about Bolão\.io/i,
    })
    expect(aboutLink).toHaveAttribute("href", "/about")
  })

  it("should use semantic main with max-width wrapper", async () => {
    await mockHomeTranslations()

    const { container } = render(await Home({ params }))

    expect(container.querySelector("main.max-w-4xl")).toBeInTheDocument()
  })

  it("should display How it works section", async () => {
    await mockHomeTranslations()

    render(await Home({ params }))

    expect(
      screen.getByRole("heading", { name: /How it works/i })
    ).toBeInTheDocument()
  })
})
