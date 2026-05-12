import { screen } from "@testing-library/dom"
import { render } from "@testing-library/react"
import { vi } from "vitest"

import Header from "../header"

const mockUseAuth = vi.fn()
vi.mock("@clerk/nextjs", () => ({
  useAuth: () => mockUseAuth(),
}))

vi.mock("@/i18n/navigation", () => ({
  Link: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode
    href: string
    [key: string]: unknown
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

vi.mock("../userButtonWrapper", () => ({
  default: () => <div data-testid="user-button">User Button</div>,
}))

vi.mock("../logoSvg", () => ({
  default: ({ size }: { size: number }) => (
    <div data-testid="logo-svg" data-size={size}>
      Logo
    </div>
  ),
}))

vi.mock("../backgroundStripes", () => ({
  default: () => null,
}))

describe("Header", () => {
  it("should render logo link", () => {
    mockUseAuth.mockReturnValue({ isLoaded: true, userId: null })

    render(<Header />)

    const logoLink = screen.getByTestId("logo-link-header")
    expect(logoLink).toBeInTheDocument()
    expect(logoLink).toHaveAttribute("href", "/")
    expect(logoLink.className).toContain("text-muted-foreground")
    expect(logoLink.className).toContain("transition-colors")
  })

  it("should render LogoSvg with correct props", () => {
    mockUseAuth.mockReturnValue({ isLoaded: true, userId: null })

    render(<Header />)

    const logoSvg = screen.getByTestId("logo-svg")
    expect(logoSvg).toBeInTheDocument()
    expect(logoSvg).toHaveAttribute("data-size", "80")
  })

  it("should render UserButton when user is authenticated", () => {
    mockUseAuth.mockReturnValue({ isLoaded: true, userId: "user123" })

    render(<Header />)

    expect(screen.getByTestId("user-button")).toBeInTheDocument()
  })

  it("should not render UserButton when user is not authenticated", () => {
    mockUseAuth.mockReturnValue({ isLoaded: true, userId: null })

    render(<Header />)

    expect(screen.queryByTestId("user-button")).not.toBeInTheDocument()
  })

  it("should not render UserButton before Clerk auth is loaded", () => {
    mockUseAuth.mockReturnValue({ isLoaded: false, userId: "user123" })

    render(<Header />)

    expect(screen.queryByTestId("user-button")).not.toBeInTheDocument()
  })
})
