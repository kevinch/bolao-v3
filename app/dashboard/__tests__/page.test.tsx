import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import Dashboard from "../page"

const mockCurrentUser = vi.fn()
const mockRedirect = vi.fn()

vi.mock("@clerk/nextjs/server", () => ({
  currentUser: () => mockCurrentUser(),
}))

vi.mock("next/navigation", () => ({
  redirect: (path: string) => mockRedirect(path),
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
  default: () => <div data-testid="boloes-list">BoloesList Component</div>,
}))

vi.mock("@/app/ui/skeletons", () => ({
  BoloesListSkeleton: () => <div data-testid="skeleton">Loading...</div>,
}))

describe("Dashboard Page", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("redirects unauthenticated users to sign-in", async () => {
    mockCurrentUser.mockResolvedValue(null)

    render(await Dashboard())

    expect(mockRedirect).toHaveBeenCalledWith("/sign-in")
  })

  it("renders the greeting with username when available", async () => {
    mockCurrentUser.mockResolvedValue({
      username: "johndoe",
      emailAddresses: [{ emailAddress: "john@example.com" }],
    })

    render(await Dashboard())

    expect(screen.getByText("Hey")).toBeInTheDocument()
    expect(screen.getByText("johndoe.")).toBeInTheDocument()
    expect(screen.getByTestId("boloes-list")).toBeInTheDocument()
  })

  it("falls back to the email prefix when username is missing", async () => {
    mockCurrentUser.mockResolvedValue({
      username: null,
      emailAddresses: [{ emailAddress: "jane@example.com" }],
    })

    render(await Dashboard())

    expect(screen.getByText("jane")).toBeInTheDocument()
  })

  it("keeps invite redirector and page title in the dashboard shell", async () => {
    mockCurrentUser.mockResolvedValue({
      username: "testuser",
      emailAddresses: [{ emailAddress: "test@example.com" }],
    })

    render(await Dashboard())

    expect(screen.getByTestId("invite-redirector")).toBeInTheDocument()
    expect(screen.getByTestId("page-title")).toBeInTheDocument()
  })
})
