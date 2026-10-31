import { screen } from "@testing-library/dom"
import { fireEvent, render } from "@testing-library/react"
import { vi } from "vitest"
import Header from "../header"

// Mock Clerk auth
const mockAuth = vi.fn()
vi.mock("@clerk/nextjs/server", () => ({
  auth: () => mockAuth(),
}))

// Mock Clerk UserButton
vi.mock("@clerk/nextjs", () => ({
  UserButton: () => <div data-testid="user-button">User Button</div>,
}))

// Mock UserButtonWrapper component
vi.mock("../userButtonWrapper", () => ({
  default: () => <div data-testid="user-button">User Button</div>,
}))

// Mock LogoSvg component
vi.mock("../logoSvg", () => ({
  default: ({ size }: { size: number }) => (
    <div data-testid="logo-svg" data-size={size}>
      Logo
    </div>
  ),
}))

describe("Header", () => {
  it("should render logo link", async () => {
    mockAuth.mockResolvedValue({ userId: null })

    const HeaderComponent = await Header()
    render(HeaderComponent)

    const logoLink = screen.getByTestId("logo-link-header")
    expect(logoLink).toBeInTheDocument()
    expect(logoLink).toHaveAttribute("href", "/")
    expect(logoLink.className).toContain("text-muted-foreground")
    expect(logoLink.className).toContain("transition-colors")
  })

  it("should render LogoSvg with correct props", async () => {
    mockAuth.mockResolvedValue({ userId: null })

    const HeaderComponent = await Header()
    render(HeaderComponent)

    const logoSvg = screen.getByTestId("logo-svg")
    expect(logoSvg).toBeInTheDocument()
    expect(logoSvg).toHaveAttribute("data-size", "80")
  })

  it("should render UserButton when user is authenticated", async () => {
    mockAuth.mockResolvedValue({ userId: "user123" })

    const HeaderComponent = await Header()
    render(HeaderComponent)

    expect(screen.getByTestId("user-button")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute(
      "aria-current",
      "page"
    )
    expect(
      screen.getAllByRole("link", { name: "Create a bolão" })[0]
    ).toHaveAttribute("href", "/bolao/create")
    expect(
      screen.queryByRole("link", { name: "Get started" })
    ).not.toBeInTheDocument()
  })

  it("should not render UserButton when user is not authenticated", async () => {
    mockAuth.mockResolvedValue({ userId: null })

    const HeaderComponent = await Header()
    render(HeaderComponent)

    expect(screen.queryByTestId("user-button")).not.toBeInTheDocument()
  })

  it("shows acquisition and public navigation when signed out", async () => {
    mockAuth.mockResolvedValue({ userId: null })

    const HeaderComponent = await Header()
    render(HeaderComponent)

    expect(screen.getByRole("link", { name: "About" })).toHaveAttribute(
      "href",
      "/about"
    )
    expect(screen.getByRole("link", { name: "News" })).toHaveAttribute(
      "href",
      "/news"
    )
    expect(screen.getByRole("link", { name: "FAQ" })).toHaveAttribute(
      "href",
      "/faq"
    )
    expect(screen.getByRole("link", { name: "Login" })).toHaveAttribute(
      "href",
      "/sign-in"
    )
    expect(
      screen.getAllByRole("link", { name: "Get started" })
    ).toHaveLength(2)
    for (const link of screen.getAllByRole("link", { name: "Get started" })) {
      expect(link).toHaveAttribute("href", "/sign-up")
    }
    const menuButton = screen.getByRole("button", { name: "Open menu" })
    expect(menuButton).toBeInTheDocument()

    fireEvent.click(menuButton)
    const mobileHomeLink = screen.getByRole("link", { name: "Home" })
    expect(mobileHomeLink).toHaveAttribute("href", "/")
    expect(mobileHomeLink).toHaveClass("text-foreground")
    expect(screen.getByRole("heading", { name: "Explore" })).toHaveClass(
      "text-muted-foreground"
    )
  })
})
