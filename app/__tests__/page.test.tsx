import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import Home from "../page"

vi.mock("@/app/components/pageTitle", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="page-title">{children}</div>
  ),
}))

vi.mock("@/app/components/InviteRedirector", () => ({
  default: () => <div data-testid="invite-redirector" />,
}))

vi.mock("@/app/components/homeHeroActions", () => ({
  default: () => <div data-testid="home-hero-actions" />,
}))

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    className,
  }: {
    children: React.ReactNode
    href: string
    className?: string
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}))

describe("Home Page", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders the landing page shell and invite redirector", async () => {
    const { container } = render(await Home())

    expect(screen.getByTestId("invite-redirector")).toBeInTheDocument()
    expect(screen.getByTestId("page-title")).toBeInTheDocument()
    expect(container.querySelector("main.max-w-4xl")).toBeInTheDocument()
  })

  it("renders hero content and home actions", async () => {
    render(await Home())

    expect(
      screen.getByText("Soccer betting pools with friends.")
    ).toBeInTheDocument()
    expect(screen.getByText(/Compete on predictions/i)).toBeInTheDocument()
    expect(
      screen.getByText(/Track results in real-time/i)
    ).toBeInTheDocument()
    expect(screen.getByTestId("home-hero-actions")).toBeInTheDocument()
  })

  it("renders the learn more link to the about page", async () => {
    render(await Home())

    const aboutLink = screen.getByRole("link", {
      name: /Learn more about Bolão\.io/i,
    })

    expect(aboutLink).toHaveAttribute("href", "/about")
  })

  it("renders the marketing sections below the hero", async () => {
    render(await Home())

    expect(
      screen.getByRole("heading", { name: /What is a bolão\?/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("heading", { name: /How it works/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("heading", { name: /Why Bolão\.io\?/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("heading", { name: /Ready to start\?/i })
    ).toBeInTheDocument()
  })
})
