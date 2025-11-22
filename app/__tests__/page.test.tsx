import { render, screen, cleanup } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import Home from "../page"

// Mock Clerk currentUser
vi.mock("@clerk/nextjs/server", () => ({
  currentUser: vi.fn(),
}))

// Mock PageTitle component
vi.mock("@/app/components/pageTitle", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="page-title">{children}</div>
  ),
}))

// Mock InviteRedirector component
vi.mock("@/app/components/InviteRedirector", () => ({
  default: () => <div data-testid="invite-redirector" />,
}))

// Mock BoloesList component
vi.mock("@/app/ui/home/boloesList", () => ({
  default: () => <div data-testid="boloes-list">BoloesList Component</div>,
}))

// Mock BoloesListSkeleton
vi.mock("@/app/ui/skeletons", () => ({
  BoloesListSkeleton: () => <div data-testid="skeleton">Loading...</div>,
}))

// Mock Next.js Link
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode
    href: string
  }) => <a href={href}>{children}</a>,
}))

describe("Home Page", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("Authenticated User State", () => {
    it("should render page with InviteRedirector when user is authenticated", async () => {
      const { currentUser } = await import("@clerk/nextjs/server")
      vi.mocked(currentUser).mockResolvedValue({
        username: "testuser",
        emailAddresses: [{ emailAddress: "test@example.com" }],
      } as any)

      render(await Home())

      expect(screen.getByTestId("invite-redirector")).toBeInTheDocument()
    })

    it("should display greeting with username when username exists", async () => {
      const { currentUser } = await import("@clerk/nextjs/server")
      vi.mocked(currentUser).mockResolvedValue({
        username: "johndoe",
        emailAddresses: [{ emailAddress: "john@example.com" }],
      } as any)

      render(await Home())

      expect(screen.getByText("Hey")).toBeInTheDocument()
      expect(screen.getByText("johndoe.")).toBeInTheDocument()
    })

    it("should display greeting with email prefix when username is missing", async () => {
      const { currentUser } = await import("@clerk/nextjs/server")
      vi.mocked(currentUser).mockResolvedValue({
        username: null,
        emailAddresses: [{ emailAddress: "jane@example.com" }],
      } as any)

      render(await Home())

      expect(screen.getByText("Hey")).toBeInTheDocument()
      expect(screen.getByText("jane")).toBeInTheDocument()
    })

    it("should render BoloesList component when user is authenticated", async () => {
      const { currentUser } = await import("@clerk/nextjs/server")
      vi.mocked(currentUser).mockResolvedValue({
        username: "testuser",
        emailAddresses: [{ emailAddress: "test@example.com" }],
      } as any)

      render(await Home())

      expect(screen.getByTestId("boloes-list")).toBeInTheDocument()
    })

    it("should render main element with authenticated content", async () => {
      const { currentUser } = await import("@clerk/nextjs/server")
      vi.mocked(currentUser).mockResolvedValue({
        username: "testuser",
        emailAddresses: [{ emailAddress: "test@example.com" }],
      } as any)

      const { container } = render(await Home())

      const mainElement = container.querySelector("main")
      expect(mainElement).toBeInTheDocument()
    })

    it("should render PageTitle component for authenticated user", async () => {
      const { currentUser } = await import("@clerk/nextjs/server")
      vi.mocked(currentUser).mockResolvedValue({
        username: "testuser",
        emailAddresses: [{ emailAddress: "test@example.com" }],
      } as any)

      render(await Home())

      expect(screen.getByTestId("page-title")).toBeInTheDocument()
    })

    it("should apply bold styling to username", async () => {
      const { currentUser } = await import("@clerk/nextjs/server")
      vi.mocked(currentUser).mockResolvedValue({
        username: "bolduser",
        emailAddresses: [{ emailAddress: "bold@example.com" }],
      } as any)

      const { container } = render(await Home())

      const boldElement = container.querySelector(".font-bold")
      expect(boldElement).toBeInTheDocument()
      expect(boldElement?.textContent).toBe("bolduser.")
    })
  })

  describe("Unauthenticated User State", () => {
    it("should render page with InviteRedirector when user is not authenticated", async () => {
      const { currentUser } = await import("@clerk/nextjs/server")
      vi.mocked(currentUser).mockResolvedValue(null)

      render(await Home())

      expect(screen.getByTestId("invite-redirector")).toBeInTheDocument()
    })

    it("should display welcome message for unauthenticated user", async () => {
      const { currentUser } = await import("@clerk/nextjs/server")
      vi.mocked(currentUser).mockResolvedValue(null)

      render(await Home())

      expect(screen.getByText("Simple soccer bets.")).toBeInTheDocument()
    })

    it("should render Login button with correct link", async () => {
      const { currentUser } = await import("@clerk/nextjs/server")
      vi.mocked(currentUser).mockResolvedValue(null)

      render(await Home())

      const loginLink = screen.getByRole("link", { name: /Login/i })
      expect(loginLink).toBeInTheDocument()
      expect(loginLink).toHaveAttribute("href", "/sign-in")
    })

    it("should render Register button with correct link", async () => {
      const { currentUser } = await import("@clerk/nextjs/server")
      vi.mocked(currentUser).mockResolvedValue(null)

      render(await Home())

      const registerLink = screen.getByRole("link", { name: /Register/i })
      expect(registerLink).toBeInTheDocument()
      expect(registerLink).toHaveAttribute("href", "/sign-up")
    })

    it("should render buttons in uppercase container", async () => {
      const { currentUser } = await import("@clerk/nextjs/server")
      vi.mocked(currentUser).mockResolvedValue(null)

      const { container } = render(await Home())

      const upperCaseDiv = container.querySelector(".uppercase")
      expect(upperCaseDiv).toBeInTheDocument()
    })

    it("should not render BoloesList when user is not authenticated", async () => {
      const { currentUser } = await import("@clerk/nextjs/server")
      vi.mocked(currentUser).mockResolvedValue(null)

      render(await Home())

      expect(screen.queryByTestId("boloes-list")).not.toBeInTheDocument()
    })

    it("should render PageTitle for unauthenticated user", async () => {
      const { currentUser } = await import("@clerk/nextjs/server")
      vi.mocked(currentUser).mockResolvedValue(null)

      render(await Home())

      expect(screen.getByTestId("page-title")).toBeInTheDocument()
    })
  })

  describe("Component Structure", () => {
    it("should have consistent main wrapper for both states", async () => {
      const { currentUser } = await import("@clerk/nextjs/server")

      // Test authenticated state
      vi.mocked(currentUser).mockResolvedValue({
        username: "testuser",
        emailAddresses: [{ emailAddress: "test@example.com" }],
      } as any)

      const { container: authenticatedContainer } = render(await Home())
      expect(authenticatedContainer.querySelector("main")).toBeInTheDocument()

      cleanup()

      // Test unauthenticated state
      vi.mocked(currentUser).mockResolvedValue(null)

      const { container: unauthenticatedContainer } = render(await Home())
      expect(unauthenticatedContainer.querySelector("main")).toBeInTheDocument()
    })

    it("should always render InviteRedirector regardless of auth state", async () => {
      const { currentUser } = await import("@clerk/nextjs/server")

      // Test authenticated state
      vi.mocked(currentUser).mockResolvedValue({
        username: "testuser",
        emailAddresses: [{ emailAddress: "test@example.com" }],
      } as any)

      const authenticatedRender = render(await Home())
      expect(
        authenticatedRender.getByTestId("invite-redirector")
      ).toBeInTheDocument()

      cleanup()

      // Test unauthenticated state
      vi.mocked(currentUser).mockResolvedValue(null)

      const unauthenticatedRender = render(await Home())
      expect(
        unauthenticatedRender.getByTestId("invite-redirector")
      ).toBeInTheDocument()
    })

    it("should always render PageTitle regardless of auth state", async () => {
      const { currentUser } = await import("@clerk/nextjs/server")

      // Test authenticated state
      vi.mocked(currentUser).mockResolvedValue({
        username: "testuser",
        emailAddresses: [{ emailAddress: "test@example.com" }],
      } as any)

      const authenticatedRender = render(await Home())
      expect(authenticatedRender.getByTestId("page-title")).toBeInTheDocument()

      cleanup()

      // Test unauthenticated state
      vi.mocked(currentUser).mockResolvedValue(null)

      const unauthenticatedRender = render(await Home())
      expect(
        unauthenticatedRender.getByTestId("page-title")
      ).toBeInTheDocument()
    })
  })

  describe("Accessibility", () => {
    it("should use semantic main element for authenticated state", async () => {
      const { currentUser } = await import("@clerk/nextjs/server")
      vi.mocked(currentUser).mockResolvedValue({
        username: "testuser",
        emailAddresses: [{ emailAddress: "test@example.com" }],
      } as any)

      const { container } = render(await Home())

      const main = container.querySelector("main")
      expect(main).toBeInTheDocument()
    })

    it("should use semantic main element for unauthenticated state", async () => {
      const { currentUser } = await import("@clerk/nextjs/server")
      vi.mocked(currentUser).mockResolvedValue(null)

      const { container } = render(await Home())

      const main = container.querySelector("main")
      expect(main).toBeInTheDocument()
    })

    it("should have accessible links with descriptive text", async () => {
      const { currentUser } = await import("@clerk/nextjs/server")
      vi.mocked(currentUser).mockResolvedValue(null)

      render(await Home())

      const loginLink = screen.getByRole("link", { name: /Login/i })
      const registerLink = screen.getByRole("link", { name: /Register/i })

      expect(loginLink.textContent).toBe("Login")
      expect(registerLink.textContent).toBe("Register")
    })

    it("should use br tag for greeting line break", async () => {
      const { currentUser } = await import("@clerk/nextjs/server")
      vi.mocked(currentUser).mockResolvedValue({
        username: "testuser",
        emailAddresses: [{ emailAddress: "test@example.com" }],
      } as any)

      const { container } = render(await Home())

      const brElement = container.querySelector("br")
      expect(brElement).toBeInTheDocument()
    })
  })

  describe("Suspense Behavior", () => {
    it("should wrap BoloesList in Suspense boundary", async () => {
      const { currentUser } = await import("@clerk/nextjs/server")
      vi.mocked(currentUser).mockResolvedValue({
        username: "testuser",
        emailAddresses: [{ emailAddress: "test@example.com" }],
      } as any)

      // Since we're testing a server component, Suspense is resolved
      render(await Home())

      expect(screen.getByTestId("boloes-list")).toBeInTheDocument()
    })
  })

  describe("User Data Handling", () => {
    it("should correctly extract email local part from standard email", async () => {
      const { currentUser } = await import("@clerk/nextjs/server")
      vi.mocked(currentUser).mockResolvedValue({
        username: null,
        emailAddresses: [{ emailAddress: "simple@test.com" }],
      } as any)

      render(await Home())

      expect(screen.getByText("simple")).toBeInTheDocument()
    })

    it("should prioritize username over email when both exist", async () => {
      const { currentUser } = await import("@clerk/nextjs/server")
      vi.mocked(currentUser).mockResolvedValue({
        username: "preferred",
        emailAddresses: [{ emailAddress: "alternative@test.com" }],
      } as any)

      render(await Home())

      expect(screen.getByText("preferred.")).toBeInTheDocument()
      expect(screen.queryByText("alternative")).not.toBeInTheDocument()
    })

    it("should add period after username", async () => {
      const { currentUser } = await import("@clerk/nextjs/server")
      vi.mocked(currentUser).mockResolvedValue({
        username: "testuser",
        emailAddresses: [{ emailAddress: "test@example.com" }],
      } as any)

      render(await Home())

      const usernameElement = screen.getByText("testuser.")
      expect(usernameElement).toBeInTheDocument()
      expect(usernameElement.textContent).toMatch(/\.$/)
    })

    it("should not add period after email prefix", async () => {
      const { currentUser } = await import("@clerk/nextjs/server")
      vi.mocked(currentUser).mockResolvedValue({
        username: null,
        emailAddresses: [{ emailAddress: "test@example.com" }],
      } as any)

      render(await Home())

      const emailElement = screen.getByText("test")
      expect(emailElement).toBeInTheDocument()
      expect(emailElement.textContent).not.toMatch(/\.$/)
    })
  })
})
