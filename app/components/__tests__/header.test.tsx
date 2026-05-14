import { screen } from "@testing-library/dom"
import { render } from "@testing-library/react"
import { vi } from "vitest"
import Header from "../header"

// Mock HeaderUserActions component
vi.mock("../headerUserActions", () => ({
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
  it("should render logo link", () => {
    render(<Header />)

    const logoLink = screen.getByTestId("logo-link-header")
    expect(logoLink).toBeInTheDocument()
    expect(logoLink).toHaveAttribute("href", "/")
    expect(logoLink.className).toContain("text-muted-foreground")
    expect(logoLink.className).toContain("transition-colors")
  })

  it("should render LogoSvg with correct props", () => {
    render(<Header />)

    const logoSvg = screen.getByTestId("logo-svg")
    expect(logoSvg).toBeInTheDocument()
    expect(logoSvg).toHaveAttribute("data-size", "80")
  })

  it("should render header user actions", () => {
    render(<Header />)

    expect(screen.getByTestId("user-button")).toBeInTheDocument()
  })
})
