import { screen } from "@testing-library/dom"
import { render } from "@testing-library/react"
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

// Mock LogoSvg component
vi.mock("../logoSvg", () => ({
  default: ({ size, color }: { size: number; color: string }) => (
    <div data-testid="logo-svg" data-size={size} data-color={color}>
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
  })

  it("should render LogoSvg with correct props", async () => {
    mockAuth.mockResolvedValue({ userId: null })

    const HeaderComponent = await Header()
    render(HeaderComponent)

    const logoSvg = screen.getByTestId("logo-svg")
    expect(logoSvg).toBeInTheDocument()
    expect(logoSvg).toHaveAttribute("data-size", "80")
    expect(logoSvg).toHaveAttribute("data-color", "#666666")
  })

  it("should render UserButton when user is authenticated", async () => {
    mockAuth.mockResolvedValue({ userId: "user123" })

    const HeaderComponent = await Header()
    render(HeaderComponent)

    expect(screen.getByTestId("user-button")).toBeInTheDocument()
  })

  it("should not render UserButton when user is not authenticated", async () => {
    mockAuth.mockResolvedValue({ userId: null })

    const HeaderComponent = await Header()
    render(HeaderComponent)

    expect(screen.queryByTestId("user-button")).not.toBeInTheDocument()
  })
})
