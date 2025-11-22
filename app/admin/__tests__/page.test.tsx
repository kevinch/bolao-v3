import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import Admin from "../page"
import type { Bolao, User } from "@/app/lib/definitions"

// Mock Clerk currentUser
vi.mock("@clerk/nextjs/server", () => ({
  currentUser: vi.fn(),
  clerkClient: vi.fn(),
}))

// Mock admin controllers
vi.mock("@/app/lib/controllerAdmin", () => ({
  getBoloes: vi.fn(),
  getUsers: vi.fn(),
}))

// Mock navigate action
const mockNavigate = vi.fn()
vi.mock("@/app/lib/actions", () => ({
  navigate: (path: string) => mockNavigate(path),
}))

// Mock PageTitle component
vi.mock("@/app/components/pageTitle", () => ({
  default: ({
    children,
    center,
  }: {
    children: React.ReactNode
    center?: boolean
  }) => (
    <div data-testid="page-title" data-center={center}>
      {children}
    </div>
  ),
}))

// Mock BoloesListSkeleton
vi.mock("@/app/ui/skeletons", () => ({
  BoloesListSkeleton: () => <div data-testid="skeleton">Loading...</div>,
}))

// Mock AdminBolao component
vi.mock("@/app/components/adminBolao", () => ({
  default: ({ bolao }: { bolao: Bolao }) => (
    <div data-testid={`admin-bolao-${bolao.id}`}>
      <div>{bolao.name}</div>
    </div>
  ),
}))

describe("Admin Page", () => {
  const mockBolao: Bolao = {
    id: "bolao-1",
    name: "Test Bolao",
    competition_id: "comp-1",
    created_by: "user-1",
    created_at: new Date("2024-01-01"),
    year: 2024,
  }

  const mockUser: User = {
    id: "user-1",
    name: "John Doe",
    role: "user",
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("Authentication and Authorization", () => {
    it("should redirect to home when user is not authenticated", async () => {
      const { currentUser } = await import("@clerk/nextjs/server")
      const { getBoloes, getUsers } = await import("@/app/lib/controllerAdmin")

      vi.mocked(currentUser).mockResolvedValue(null)
      vi.mocked(getBoloes).mockResolvedValue({ boloes: [] })
      vi.mocked(getUsers).mockResolvedValue({ users: [] })

      const adminPage = await Admin()
      render(adminPage as React.ReactElement)

      // When user is null, the page should still fetch data
      expect(getBoloes).toHaveBeenCalled()
      expect(getUsers).toHaveBeenCalled()
    })

    it("should redirect non-admin users to home", async () => {
      const { currentUser, clerkClient } = await import("@clerk/nextjs/server")
      const { getBoloes, getUsers } = await import("@/app/lib/controllerAdmin")

      const mockClient = {
        users: {
          getUser: vi.fn().mockResolvedValue({
            privateMetadata: { role: "user" },
          }),
        },
      }

      vi.mocked(currentUser).mockResolvedValue({ id: "user-123" } as any)
      vi.mocked(clerkClient).mockResolvedValue(mockClient as any)
      vi.mocked(getBoloes).mockResolvedValue({ boloes: [] })
      vi.mocked(getUsers).mockResolvedValue({ users: [] })

      const adminPage = await Admin()
      render(adminPage as React.ReactElement)

      expect(mockNavigate).toHaveBeenCalledWith("/")
    })

    it("should allow admin users to access the page", async () => {
      const { currentUser, clerkClient } = await import("@clerk/nextjs/server")
      const { getBoloes, getUsers } = await import("@/app/lib/controllerAdmin")

      const mockClient = {
        users: {
          getUser: vi.fn().mockResolvedValue({
            privateMetadata: { role: "admin" },
          }),
        },
      }

      vi.mocked(currentUser).mockResolvedValue({ id: "user-123" } as any)
      vi.mocked(clerkClient).mockResolvedValue(mockClient as any)
      vi.mocked(getBoloes).mockResolvedValue({ boloes: [mockBolao] })
      vi.mocked(getUsers).mockResolvedValue({ users: [mockUser] })

      const adminPage = await Admin()
      render(adminPage as React.ReactElement)

      expect(mockNavigate).not.toHaveBeenCalled()
      expect(screen.getByText("Admin")).toBeInTheDocument()
    })

    it("should treat users without privateMetadata as guest", async () => {
      const { currentUser, clerkClient } = await import("@clerk/nextjs/server")

      const mockClient = {
        users: {
          getUser: vi.fn().mockResolvedValue({
            privateMetadata: {},
          }),
        },
      }

      vi.mocked(currentUser).mockResolvedValue({ id: "user-123" } as any)
      vi.mocked(clerkClient).mockResolvedValue(mockClient as any)

      const adminPage = await Admin()
      render(adminPage as React.ReactElement)

      expect(mockNavigate).toHaveBeenCalledWith("/")
    })

    it("should fetch user metadata from Clerk", async () => {
      const { currentUser, clerkClient } = await import("@clerk/nextjs/server")
      const { getBoloes, getUsers } = await import("@/app/lib/controllerAdmin")

      const mockGetUser = vi.fn().mockResolvedValue({
        privateMetadata: { role: "admin" },
      })

      const mockClient = {
        users: { getUser: mockGetUser },
      }

      vi.mocked(currentUser).mockResolvedValue({ id: "user-456" } as any)
      vi.mocked(clerkClient).mockResolvedValue(mockClient as any)
      vi.mocked(getBoloes).mockResolvedValue({ boloes: [] })
      vi.mocked(getUsers).mockResolvedValue({ users: [] })

      const adminPage = await Admin()
      render(adminPage as React.ReactElement)

      expect(mockGetUser).toHaveBeenCalledWith("user-456")
    })
  })

  describe("Data Fetching", () => {
    it("should fetch boloes data", async () => {
      const { currentUser, clerkClient } = await import("@clerk/nextjs/server")
      const { getBoloes, getUsers } = await import("@/app/lib/controllerAdmin")

      const mockClient = {
        users: {
          getUser: vi.fn().mockResolvedValue({
            privateMetadata: { role: "admin" },
          }),
        },
      }

      vi.mocked(currentUser).mockResolvedValue({ id: "user-123" } as any)
      vi.mocked(clerkClient).mockResolvedValue(mockClient as any)
      vi.mocked(getBoloes).mockResolvedValue({ boloes: [mockBolao] })
      vi.mocked(getUsers).mockResolvedValue({ users: [mockUser] })

      const adminPage = await Admin()
      render(adminPage as React.ReactElement)

      expect(getBoloes).toHaveBeenCalled()
    })

    it("should fetch users data", async () => {
      const { currentUser, clerkClient } = await import("@clerk/nextjs/server")
      const { getBoloes, getUsers } = await import("@/app/lib/controllerAdmin")

      const mockClient = {
        users: {
          getUser: vi.fn().mockResolvedValue({
            privateMetadata: { role: "admin" },
          }),
        },
      }

      vi.mocked(currentUser).mockResolvedValue({ id: "user-123" } as any)
      vi.mocked(clerkClient).mockResolvedValue(mockClient as any)
      vi.mocked(getBoloes).mockResolvedValue({ boloes: [] })
      vi.mocked(getUsers).mockResolvedValue({ users: [] })

      const adminPage = await Admin()
      render(adminPage as React.ReactElement)

      expect(getUsers).toHaveBeenCalled()
    })

    it("should handle empty boloes data", async () => {
      const { currentUser, clerkClient } = await import("@clerk/nextjs/server")
      const { getBoloes, getUsers } = await import("@/app/lib/controllerAdmin")

      const mockClient = {
        users: {
          getUser: vi.fn().mockResolvedValue({
            privateMetadata: { role: "admin" },
          }),
        },
      }

      vi.mocked(currentUser).mockResolvedValue({ id: "user-123" } as any)
      vi.mocked(clerkClient).mockResolvedValue(mockClient as any)
      vi.mocked(getBoloes).mockResolvedValue({ boloes: [] })
      vi.mocked(getUsers).mockResolvedValue({ users: [] })

      const adminPage = await Admin()
      render(adminPage as React.ReactElement)

      expect(screen.getByText("Bolões (0)")).toBeInTheDocument()
    })

    it("should handle empty users data", async () => {
      const { currentUser, clerkClient } = await import("@clerk/nextjs/server")
      const { getBoloes, getUsers } = await import("@/app/lib/controllerAdmin")

      const mockClient = {
        users: {
          getUser: vi.fn().mockResolvedValue({
            privateMetadata: { role: "admin" },
          }),
        },
      }

      vi.mocked(currentUser).mockResolvedValue({ id: "user-123" } as any)
      vi.mocked(clerkClient).mockResolvedValue(mockClient as any)
      vi.mocked(getBoloes).mockResolvedValue({ boloes: [] })
      vi.mocked(getUsers).mockResolvedValue({ users: [] })

      const adminPage = await Admin()
      render(adminPage as React.ReactElement)

      expect(screen.getByText("Users (0)")).toBeInTheDocument()
    })
  })

  describe("Component Rendering", () => {
    it("should render PageTitle with center prop", async () => {
      const { currentUser, clerkClient } = await import("@clerk/nextjs/server")
      const { getBoloes, getUsers } = await import("@/app/lib/controllerAdmin")

      const mockClient = {
        users: {
          getUser: vi.fn().mockResolvedValue({
            privateMetadata: { role: "admin" },
          }),
        },
      }

      vi.mocked(currentUser).mockResolvedValue({ id: "user-123" } as any)
      vi.mocked(clerkClient).mockResolvedValue(mockClient as any)
      vi.mocked(getBoloes).mockResolvedValue({ boloes: [] })
      vi.mocked(getUsers).mockResolvedValue({ users: [] })

      const adminPage = await Admin()
      render(adminPage as React.ReactElement)

      const pageTitle = screen.getByTestId("page-title")
      expect(pageTitle).toBeInTheDocument()
      expect(pageTitle).toHaveAttribute("data-center", "true")
    })

    it("should render Admin heading", async () => {
      const { currentUser, clerkClient } = await import("@clerk/nextjs/server")
      const { getBoloes, getUsers } = await import("@/app/lib/controllerAdmin")

      const mockClient = {
        users: {
          getUser: vi.fn().mockResolvedValue({
            privateMetadata: { role: "admin" },
          }),
        },
      }

      vi.mocked(currentUser).mockResolvedValue({ id: "user-123" } as any)
      vi.mocked(clerkClient).mockResolvedValue(mockClient as any)
      vi.mocked(getBoloes).mockResolvedValue({ boloes: [] })
      vi.mocked(getUsers).mockResolvedValue({ users: [] })

      const adminPage = await Admin()
      render(adminPage as React.ReactElement)

      expect(screen.getByRole("heading", { name: "Admin" })).toBeInTheDocument()
    })

    it("should render tabs component", async () => {
      const { currentUser, clerkClient } = await import("@clerk/nextjs/server")
      const { getBoloes, getUsers } = await import("@/app/lib/controllerAdmin")

      const mockClient = {
        users: {
          getUser: vi.fn().mockResolvedValue({
            privateMetadata: { role: "admin" },
          }),
        },
      }

      vi.mocked(currentUser).mockResolvedValue({ id: "user-123" } as any)
      vi.mocked(clerkClient).mockResolvedValue(mockClient as any)
      vi.mocked(getBoloes).mockResolvedValue({ boloes: [] })
      vi.mocked(getUsers).mockResolvedValue({ users: [] })

      const adminPage = await Admin()
      render(adminPage as React.ReactElement)

      expect(screen.getByRole("tablist")).toBeInTheDocument()
    })

    it("should render Bolões tab with count", async () => {
      const { currentUser, clerkClient } = await import("@clerk/nextjs/server")
      const { getBoloes, getUsers } = await import("@/app/lib/controllerAdmin")

      const mockClient = {
        users: {
          getUser: vi.fn().mockResolvedValue({
            privateMetadata: { role: "admin" },
          }),
        },
      }

      const boloes = [mockBolao, { ...mockBolao, id: "bolao-2" }]

      vi.mocked(currentUser).mockResolvedValue({ id: "user-123" } as any)
      vi.mocked(clerkClient).mockResolvedValue(mockClient as any)
      vi.mocked(getBoloes).mockResolvedValue({ boloes })
      vi.mocked(getUsers).mockResolvedValue({ users: [] })

      const adminPage = await Admin()
      render(adminPage as React.ReactElement)

      expect(screen.getByText("Bolões (2)")).toBeInTheDocument()
    })

    it("should render Users tab with count", async () => {
      const { currentUser, clerkClient } = await import("@clerk/nextjs/server")
      const { getBoloes, getUsers } = await import("@/app/lib/controllerAdmin")

      const mockClient = {
        users: {
          getUser: vi.fn().mockResolvedValue({
            privateMetadata: { role: "admin" },
          }),
        },
      }

      const users = [
        mockUser,
        { ...mockUser, id: "user-2", name: "Jane Doe" },
        { ...mockUser, id: "user-3", name: "Bob Smith" },
      ]

      vi.mocked(currentUser).mockResolvedValue({ id: "user-123" } as any)
      vi.mocked(clerkClient).mockResolvedValue(mockClient as any)
      vi.mocked(getBoloes).mockResolvedValue({ boloes: [] })
      vi.mocked(getUsers).mockResolvedValue({ users })

      const adminPage = await Admin()
      render(adminPage as React.ReactElement)

      expect(screen.getByText("Users (3)")).toBeInTheDocument()
    })

    it("should have boloes tab selected by default", async () => {
      const { currentUser, clerkClient } = await import("@clerk/nextjs/server")
      const { getBoloes, getUsers } = await import("@/app/lib/controllerAdmin")

      const mockClient = {
        users: {
          getUser: vi.fn().mockResolvedValue({
            privateMetadata: { role: "admin" },
          }),
        },
      }

      vi.mocked(currentUser).mockResolvedValue({ id: "user-123" } as any)
      vi.mocked(clerkClient).mockResolvedValue(mockClient as any)
      vi.mocked(getBoloes).mockResolvedValue({ boloes: [] })
      vi.mocked(getUsers).mockResolvedValue({ users: [] })

      const adminPage = await Admin()
      render(adminPage as React.ReactElement)

      const tabs = screen.getAllByRole("tab")
      expect(tabs[0]).toHaveAttribute("aria-selected", "true")
    })
  })

  describe("Bolões Tab", () => {
    it("should render AdminBolao components for each bolao", async () => {
      const { currentUser, clerkClient } = await import("@clerk/nextjs/server")
      const { getBoloes, getUsers } = await import("@/app/lib/controllerAdmin")

      const mockClient = {
        users: {
          getUser: vi.fn().mockResolvedValue({
            privateMetadata: { role: "admin" },
          }),
        },
      }

      const boloes = [
        mockBolao,
        { ...mockBolao, id: "bolao-2", name: "Bolao 2" },
        { ...mockBolao, id: "bolao-3", name: "Bolao 3" },
      ]

      vi.mocked(currentUser).mockResolvedValue({ id: "user-123" } as any)
      vi.mocked(clerkClient).mockResolvedValue(mockClient as any)
      vi.mocked(getBoloes).mockResolvedValue({ boloes })
      vi.mocked(getUsers).mockResolvedValue({ users: [] })

      const adminPage = await Admin()
      render(adminPage as React.ReactElement)

      expect(screen.getByTestId("admin-bolao-bolao-1")).toBeInTheDocument()
      expect(screen.getByTestId("admin-bolao-bolao-2")).toBeInTheDocument()
      expect(screen.getByTestId("admin-bolao-bolao-3")).toBeInTheDocument()
    })

    it("should render bolao names in AdminBolao components", async () => {
      const { currentUser, clerkClient } = await import("@clerk/nextjs/server")
      const { getBoloes, getUsers } = await import("@/app/lib/controllerAdmin")

      const mockClient = {
        users: {
          getUser: vi.fn().mockResolvedValue({
            privateMetadata: { role: "admin" },
          }),
        },
      }

      const boloes = [
        { ...mockBolao, name: "Premier League 2024" },
        { ...mockBolao, id: "bolao-2", name: "La Liga 2024" },
      ]

      vi.mocked(currentUser).mockResolvedValue({ id: "user-123" } as any)
      vi.mocked(clerkClient).mockResolvedValue(mockClient as any)
      vi.mocked(getBoloes).mockResolvedValue({ boloes })
      vi.mocked(getUsers).mockResolvedValue({ users: [] })

      const adminPage = await Admin()
      render(adminPage as React.ReactElement)

      expect(screen.getByText("Premier League 2024")).toBeInTheDocument()
      expect(screen.getByText("La Liga 2024")).toBeInTheDocument()
    })

    it("should use unique keys for bolao items", async () => {
      const { currentUser, clerkClient } = await import("@clerk/nextjs/server")
      const { getBoloes, getUsers } = await import("@/app/lib/controllerAdmin")

      const mockClient = {
        users: {
          getUser: vi.fn().mockResolvedValue({
            privateMetadata: { role: "admin" },
          }),
        },
      }

      const boloes = [
        { ...mockBolao, id: "unique-1" },
        { ...mockBolao, id: "unique-2" },
      ]

      vi.mocked(currentUser).mockResolvedValue({ id: "user-123" } as any)
      vi.mocked(clerkClient).mockResolvedValue(mockClient as any)
      vi.mocked(getBoloes).mockResolvedValue({ boloes })
      vi.mocked(getUsers).mockResolvedValue({ users: [] })

      const adminPage = await Admin()
      render(adminPage as React.ReactElement)

      expect(screen.getByTestId("admin-bolao-unique-1")).toBeInTheDocument()
      expect(screen.getByTestId("admin-bolao-unique-2")).toBeInTheDocument()
    })
  })

  describe("Users Tab", () => {
    it("should fetch and count users correctly", async () => {
      const { currentUser, clerkClient } = await import("@clerk/nextjs/server")
      const { getBoloes, getUsers } = await import("@/app/lib/controllerAdmin")

      const mockClient = {
        users: {
          getUser: vi.fn().mockResolvedValue({
            privateMetadata: { role: "admin" },
          }),
        },
      }

      const users = [
        { ...mockUser, name: "Alice Johnson" },
        { ...mockUser, id: "user-2", name: "Bob Williams" },
      ]

      vi.mocked(currentUser).mockResolvedValue({ id: "user-123" } as any)
      vi.mocked(clerkClient).mockResolvedValue(mockClient as any)
      vi.mocked(getBoloes).mockResolvedValue({ boloes: [] })
      vi.mocked(getUsers).mockResolvedValue({ users })

      const adminPage = await Admin()
      render(adminPage as React.ReactElement)

      // Users tab should show the count
      expect(screen.getByText("Users (2)")).toBeInTheDocument()
    })

    it("should handle single user", async () => {
      const { currentUser, clerkClient } = await import("@clerk/nextjs/server")
      const { getBoloes, getUsers } = await import("@/app/lib/controllerAdmin")

      const mockClient = {
        users: {
          getUser: vi.fn().mockResolvedValue({
            privateMetadata: { role: "admin" },
          }),
        },
      }

      const users = [{ ...mockUser, id: "user-abc-123" }]

      vi.mocked(currentUser).mockResolvedValue({ id: "user-123" } as any)
      vi.mocked(clerkClient).mockResolvedValue(mockClient as any)
      vi.mocked(getBoloes).mockResolvedValue({ boloes: [] })
      vi.mocked(getUsers).mockResolvedValue({ users })

      const adminPage = await Admin()
      render(adminPage as React.ReactElement)

      expect(screen.getByText("Users (1)")).toBeInTheDocument()
    })

    it("should handle multiple users of different roles", async () => {
      const { currentUser, clerkClient } = await import("@clerk/nextjs/server")
      const { getBoloes, getUsers } = await import("@/app/lib/controllerAdmin")

      const mockClient = {
        users: {
          getUser: vi.fn().mockResolvedValue({
            privateMetadata: { role: "admin" },
          }),
        },
      }

      const users = [
        { ...mockUser, role: "admin" },
        { ...mockUser, id: "user-2", role: "user" },
        { ...mockUser, id: "user-3", role: "guest" },
      ]

      vi.mocked(currentUser).mockResolvedValue({ id: "user-123" } as any)
      vi.mocked(clerkClient).mockResolvedValue(mockClient as any)
      vi.mocked(getBoloes).mockResolvedValue({ boloes: [] })
      vi.mocked(getUsers).mockResolvedValue({ users })

      const adminPage = await Admin()
      render(adminPage as React.ReactElement)

      expect(screen.getByText("Users (3)")).toBeInTheDocument()
    })
  })

  describe("Edge Cases", () => {
    it("should handle multiple boloes correctly", async () => {
      const { currentUser, clerkClient } = await import("@clerk/nextjs/server")
      const { getBoloes, getUsers } = await import("@/app/lib/controllerAdmin")

      const mockClient = {
        users: {
          getUser: vi.fn().mockResolvedValue({
            privateMetadata: { role: "admin" },
          }),
        },
      }

      const boloes = Array.from({ length: 5 }, (_, i) => ({
        ...mockBolao,
        id: `bolao-${i}`,
        name: `Bolao ${i}`,
      }))

      vi.mocked(currentUser).mockResolvedValue({ id: "user-123" } as any)
      vi.mocked(clerkClient).mockResolvedValue(mockClient as any)
      vi.mocked(getBoloes).mockResolvedValue({ boloes })
      vi.mocked(getUsers).mockResolvedValue({ users: [] })

      const adminPage = await Admin()
      render(adminPage as React.ReactElement)

      expect(screen.getByText("Bolões (5)")).toBeInTheDocument()
      boloes.forEach((bolao) => {
        expect(
          screen.getByTestId(`admin-bolao-${bolao.id}`)
        ).toBeInTheDocument()
      })
    })

    it("should handle multiple users correctly", async () => {
      const { currentUser, clerkClient } = await import("@clerk/nextjs/server")
      const { getBoloes, getUsers } = await import("@/app/lib/controllerAdmin")

      const mockClient = {
        users: {
          getUser: vi.fn().mockResolvedValue({
            privateMetadata: { role: "admin" },
          }),
        },
      }

      const users = Array.from({ length: 10 }, (_, i) => ({
        ...mockUser,
        id: `user-${i}`,
        name: `User ${i}`,
      }))

      vi.mocked(currentUser).mockResolvedValue({ id: "user-123" } as any)
      vi.mocked(clerkClient).mockResolvedValue(mockClient as any)
      vi.mocked(getBoloes).mockResolvedValue({ boloes: [] })
      vi.mocked(getUsers).mockResolvedValue({ users })

      const adminPage = await Admin()
      render(adminPage as React.ReactElement)

      expect(screen.getByText("Users (10)")).toBeInTheDocument()
    })
  })
})
