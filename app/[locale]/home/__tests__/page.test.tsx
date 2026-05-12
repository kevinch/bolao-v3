import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"

import HomeDashboard from "../page"

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

vi.mock("@/app/ui/home/boloesList", () => ({
  default: () => <div data-testid="boloes-list">BoloesList</div>,
}))

vi.mock("@/app/ui/skeletons", () => ({
  BoloesListSkeleton: () => <div data-testid="skeleton">Loading...</div>,
}))

vi.mock("@/app/lib/auth-session", () => ({
  getCachedCurrentUser: vi.fn(),
}))

const params = Promise.resolve({ locale: "en" })

describe("HomeDashboard (/home)", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders nothing when user is missing", async () => {
    const { getCachedCurrentUser } = await import("@/app/lib/auth-session")
    const { getTranslations } = await import("next-intl/server")
    vi.mocked(getCachedCurrentUser).mockResolvedValue(null as never)
    vi.mocked(getTranslations).mockResolvedValue(((k: string) => k) as never)

    const { container } = render(await HomeDashboard({ params }))

    expect(container.firstChild).toBeNull()
  })

  it("renders greeting with username", async () => {
    const { getCachedCurrentUser } = await import("@/app/lib/auth-session")
    const { getTranslations } = await import("next-intl/server")
    vi.mocked(getCachedCurrentUser).mockResolvedValue({
      username: "johndoe",
      emailAddresses: [{ emailAddress: "john@example.com" }],
    } as never)
    vi.mocked(getTranslations).mockResolvedValue(((key: string) => {
      if (key === "greeting") return "Hey"
      return key
    }) as never)

    render(await HomeDashboard({ params }))

    expect(screen.getByText("Hey")).toBeInTheDocument()
    expect(screen.getByText("johndoe.")).toBeInTheDocument()
    expect(screen.getByTestId("boloes-list")).toBeInTheDocument()
  })

  it("renders email local part when username missing", async () => {
    const { getCachedCurrentUser } = await import("@/app/lib/auth-session")
    const { getTranslations } = await import("next-intl/server")
    vi.mocked(getCachedCurrentUser).mockResolvedValue({
      username: null,
      emailAddresses: [{ emailAddress: "jane@example.com" }],
    } as never)
    vi.mocked(getTranslations).mockResolvedValue(((key: string) => {
      if (key === "greeting") return "Hey"
      return key
    }) as never)

    render(await HomeDashboard({ params }))

    expect(screen.getByText("jane")).toBeInTheDocument()
  })
})
