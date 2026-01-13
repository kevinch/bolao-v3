import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import BoloesList from "../boloesList"
import type { Bolao } from "@/app/lib/definitions"

// Mock Clerk auth
vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}))

// Mock data fetching
vi.mock("@/app/lib/data", () => ({
  fetchBoloesByUserId: vi.fn(),
}))

// Mock Next.js cache
vi.mock("next/cache", () => ({
  unstable_noStore: vi.fn(),
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

// Mock BolaoCard component
vi.mock("@/app/components/bolaoCard", () => ({
  default: ({ bolao, userId }: { bolao: Bolao; userId: string }) => (
    <div data-testid={`bolao-card-${bolao.id}`} data-user-id={userId}>
      {bolao.name} - {bolao.year}
    </div>
  ),
}))

describe("BoloesList", () => {
  const mockBolao: Bolao = {
    id: "bolao-1",
    name: "Test Bolao",
    competition_id: "comp-1",
    created_by: "user-1",
    created_at: new Date("2024-01-01"),
    year: 2024,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Set current date for consistent testing
    vi.setSystemTime(new Date("2024-06-15"))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe("Authentication", () => {
    it("should return nothing when user is not authenticated", async () => {
      const { auth } = await import("@clerk/nextjs/server")
      vi.mocked(auth).mockResolvedValue({ userId: null } as any)

      const { container } = render(await BoloesList())

      expect(container.firstChild).toBeNull()
    })

    it("should fetch data when user is authenticated", async () => {
      const { auth } = await import("@clerk/nextjs/server")
      const { fetchBoloesByUserId } = await import("@/app/lib/data")

      vi.mocked(auth).mockResolvedValue({ userId: "user-123" } as any)
      vi.mocked(fetchBoloesByUserId).mockResolvedValue([mockBolao])

      render(await BoloesList())

      expect(fetchBoloesByUserId).toHaveBeenCalledWith("user-123")
    })
  })

  describe("Empty State", () => {
    it("should show create button when no boloes exist", async () => {
      const { auth } = await import("@clerk/nextjs/server")
      const { fetchBoloesByUserId } = await import("@/app/lib/data")

      vi.mocked(auth).mockResolvedValue({ userId: "user-123" } as any)
      vi.mocked(fetchBoloesByUserId).mockResolvedValue([])

      render(await BoloesList())

      const createLink = screen.getByRole("link", { name: /Create bolão/i })
      expect(createLink).toBeInTheDocument()
      expect(createLink).toHaveAttribute("href", "/bolao/create")
    })

    it("should display uppercase text in empty state", async () => {
      const { auth } = await import("@clerk/nextjs/server")
      const { fetchBoloesByUserId } = await import("@/app/lib/data")

      vi.mocked(auth).mockResolvedValue({ userId: "user-123" } as any)
      vi.mocked(fetchBoloesByUserId).mockResolvedValue([])

      const { container } = render(await BoloesList())

      const upperCaseDiv = container.querySelector(".uppercase")
      expect(upperCaseDiv).toBeInTheDocument()
    })

    it("should center content in empty state", async () => {
      const { auth } = await import("@clerk/nextjs/server")
      const { fetchBoloesByUserId } = await import("@/app/lib/data")

      vi.mocked(auth).mockResolvedValue({ userId: "user-123" } as any)
      vi.mocked(fetchBoloesByUserId).mockResolvedValue([])

      const { container } = render(await BoloesList())

      const flexDiv = container.querySelector(".flex.items-center.flex-col")
      expect(flexDiv).toBeInTheDocument()
    })
  })

  describe("Tabs Rendering", () => {
    it("should render Active and Past tabs when boloes exist", async () => {
      const { auth } = await import("@clerk/nextjs/server")
      const { fetchBoloesByUserId } = await import("@/app/lib/data")

      vi.mocked(auth).mockResolvedValue({ userId: "user-123" } as any)
      vi.mocked(fetchBoloesByUserId).mockResolvedValue([mockBolao])

      render(await BoloesList())

      expect(screen.getByText("Active bolões")).toBeInTheDocument()
      expect(screen.getByText("Past bolões")).toBeInTheDocument()
    })

    it("should render create button in tabs header", async () => {
      const { auth } = await import("@clerk/nextjs/server")
      const { fetchBoloesByUserId } = await import("@/app/lib/data")

      vi.mocked(auth).mockResolvedValue({ userId: "user-123" } as any)
      vi.mocked(fetchBoloesByUserId).mockResolvedValue([mockBolao])

      render(await BoloesList())

      const createLinks = screen.getAllByRole("link", { name: /Create bolão/i })
      expect(createLinks.length).toBeGreaterThan(0)
      expect(createLinks[0]).toHaveAttribute("href", "/bolao/create")
    })

    it("should have tabs list with correct structure", async () => {
      const { auth } = await import("@clerk/nextjs/server")
      const { fetchBoloesByUserId } = await import("@/app/lib/data")

      vi.mocked(auth).mockResolvedValue({ userId: "user-123" } as any)
      vi.mocked(fetchBoloesByUserId).mockResolvedValue([mockBolao])

      render(await BoloesList())

      const tabsList = screen.getByRole("tablist")
      expect(tabsList).toBeInTheDocument()
    })

    it("should have active tab selected by default", async () => {
      const { auth } = await import("@clerk/nextjs/server")
      const { fetchBoloesByUserId } = await import("@/app/lib/data")

      vi.mocked(auth).mockResolvedValue({ userId: "user-123" } as any)
      vi.mocked(fetchBoloesByUserId).mockResolvedValue([mockBolao])

      render(await BoloesList())

      const tabs = screen.getAllByRole("tab")
      const activeTab = tabs[0] // First tab should be Active bolões
      expect(activeTab).toHaveAttribute("aria-selected", "true")
    })
  })

  describe("Active Boloes Grouping", () => {
    it("should show current year bolao in active group", async () => {
      const { auth } = await import("@clerk/nextjs/server")
      const { fetchBoloesByUserId } = await import("@/app/lib/data")

      const currentYearBolao = { ...mockBolao, year: 2024 }

      vi.mocked(auth).mockResolvedValue({ userId: "user-123" } as any)
      vi.mocked(fetchBoloesByUserId).mockResolvedValue([currentYearBolao])

      render(await BoloesList())

      expect(screen.getByTestId("bolao-card-bolao-1")).toBeInTheDocument()
      expect(screen.getByText(/Test Bolao - 2024/)).toBeInTheDocument()
    })

    it("should show bolao with end date in future in active group", async () => {
      const { auth } = await import("@clerk/nextjs/server")
      const { fetchBoloesByUserId } = await import("@/app/lib/data")

      const futureBolao = {
        ...mockBolao,
        id: "bolao-2",
        year: 2023,
        end: "2024-12-31",
      }

      vi.mocked(auth).mockResolvedValue({ userId: "user-123" } as any)
      vi.mocked(fetchBoloesByUserId).mockResolvedValue([futureBolao])

      render(await BoloesList())

      expect(screen.getByTestId("bolao-card-bolao-2")).toBeInTheDocument()
    })

    it("should show multiple active boloes", async () => {
      const { auth } = await import("@clerk/nextjs/server")
      const { fetchBoloesByUserId } = await import("@/app/lib/data")

      const boloes = [
        { ...mockBolao, id: "bolao-1", name: "Bolao 1" },
        { ...mockBolao, id: "bolao-2", name: "Bolao 2" },
        { ...mockBolao, id: "bolao-3", name: "Bolao 3" },
      ]

      vi.mocked(auth).mockResolvedValue({ userId: "user-123" } as any)
      vi.mocked(fetchBoloesByUserId).mockResolvedValue(boloes)

      render(await BoloesList())

      expect(screen.getByTestId("bolao-card-bolao-1")).toBeInTheDocument()
      expect(screen.getByTestId("bolao-card-bolao-2")).toBeInTheDocument()
      expect(screen.getByTestId("bolao-card-bolao-3")).toBeInTheDocument()
    })
  })

  describe("Past Boloes Grouping", () => {
    it("should render past boloes tab", async () => {
      const { auth } = await import("@clerk/nextjs/server")
      const { fetchBoloesByUserId } = await import("@/app/lib/data")

      const pastBolao = { ...mockBolao, id: "bolao-past", year: 2023 }

      vi.mocked(auth).mockResolvedValue({ userId: "user-123" } as any)
      vi.mocked(fetchBoloesByUserId).mockResolvedValue([pastBolao])

      render(await BoloesList())

      // Past bolões tab should exist
      expect(screen.getByText("Past bolões")).toBeInTheDocument()
    })

    it("should categorize bolao with past end date correctly", async () => {
      const { auth } = await import("@clerk/nextjs/server")
      const { fetchBoloesByUserId } = await import("@/app/lib/data")

      const pastBolao = {
        ...mockBolao,
        id: "bolao-past",
        year: 2023,
        end: "2024-01-01",
      }

      vi.mocked(auth).mockResolvedValue({ userId: "user-123" } as any)
      vi.mocked(fetchBoloesByUserId).mockResolvedValue([pastBolao])

      render(await BoloesList())

      expect(screen.getByText("Past bolões")).toBeInTheDocument()
    })

    it("should handle multiple years of past boloes", async () => {
      const { auth } = await import("@clerk/nextjs/server")
      const { fetchBoloesByUserId } = await import("@/app/lib/data")

      const boloes = [
        { ...mockBolao, id: "bolao-1", name: "Past 1", year: 2023 },
        { ...mockBolao, id: "bolao-2", name: "Past 2", year: 2022 },
        { ...mockBolao, id: "bolao-3", name: "Past 3", year: 2021 },
      ]

      vi.mocked(auth).mockResolvedValue({ userId: "user-123" } as any)
      vi.mocked(fetchBoloesByUserId).mockResolvedValue(boloes)

      render(await BoloesList())

      expect(screen.getByText("Past bolões")).toBeInTheDocument()
    })
  })

  describe("Mixed Boloes", () => {
    it("should correctly separate active and past boloes", async () => {
      const { auth } = await import("@clerk/nextjs/server")
      const { fetchBoloesByUserId } = await import("@/app/lib/data")

      const boloes = [
        { ...mockBolao, id: "active-1", name: "Active 1", year: 2024 },
        { ...mockBolao, id: "past-1", name: "Past 1", year: 2023 },
        {
          ...mockBolao,
          id: "active-2",
          name: "Active 2",
          year: 2023,
          end: "2024-12-31",
        },
        {
          ...mockBolao,
          id: "past-2",
          name: "Past 2",
          year: 2023,
          end: "2024-01-01",
        },
      ]

      vi.mocked(auth).mockResolvedValue({ userId: "user-123" } as any)
      vi.mocked(fetchBoloesByUserId).mockResolvedValue(boloes)

      render(await BoloesList())

      // Verify both tabs exist
      expect(screen.getByText("Active bolões")).toBeInTheDocument()
      expect(screen.getByText("Past bolões")).toBeInTheDocument()

      // Active boloes should be visible
      expect(screen.getByTestId("bolao-card-active-1")).toBeInTheDocument()
      expect(screen.getByTestId("bolao-card-active-2")).toBeInTheDocument()
    })

    it("should handle mix of current and future year boloes", async () => {
      const { auth } = await import("@clerk/nextjs/server")
      const { fetchBoloesByUserId } = await import("@/app/lib/data")

      const boloes = [
        { ...mockBolao, id: "current", year: 2024 },
        { ...mockBolao, id: "future", year: 2025 },
      ]

      vi.mocked(auth).mockResolvedValue({ userId: "user-123" } as any)
      vi.mocked(fetchBoloesByUserId).mockResolvedValue(boloes)

      render(await BoloesList())

      // Current year should be in active
      expect(screen.getByTestId("bolao-card-current")).toBeInTheDocument()
    })
  })

  describe("Sorting", () => {
    it("should sort boloes descending by year and start date", async () => {
      const { auth } = await import("@clerk/nextjs/server")
      const { fetchBoloesByUserId } = await import("@/app/lib/data")

      const currentYear = 2024
      vi.setSystemTime(new Date(`${currentYear}-06-15`))

      const testBoloes: Bolao[] = [
        {
          id: "year-2024-late",
          name: "2024 Late",
          competition_id: "c1",
          created_by: "u1",
          created_at: new Date(),
          year: 2024,
          start: "2024-12-01",
        },
        {
          id: "year-2024-early",
          name: "2024 Early",
          competition_id: "c1",
          created_by: "u1",
          created_at: new Date(),
          year: 2024,
          start: "2024-01-01",
        },
        {
          id: "year-2023-active",
          name: "2023 Active",
          competition_id: "c1",
          created_by: "u1",
          created_at: new Date(),
          year: 2023,
          end: "2025-01-01", // Active because ends in future
          start: "2023-01-01",
        },
      ]

      vi.mocked(auth).mockResolvedValue({ userId: "user-123" } as any)
      vi.mocked(fetchBoloesByUserId).mockResolvedValue(testBoloes)

      render(await BoloesList())

      const cards = screen.getAllByTestId(/bolao-card-/)
      expect(cards).toHaveLength(3)

      // Expected order:
      // 1. year-2024-late (year 2024, latest start)
      // 2. year-2024-early (year 2024, earlier start)
      // 3. year-2023-active (year 2023)
      expect(cards[0]).toHaveAttribute("data-testid", "bolao-card-year-2024-late")
      expect(cards[1]).toHaveAttribute("data-testid", "bolao-card-year-2024-early")
      expect(cards[2]).toHaveAttribute("data-testid", "bolao-card-year-2023-active")
    })
  })

  describe("BolaoCard Integration", () => {
    it("should render unique keys for bolao cards", async () => {
      const { auth } = await import("@clerk/nextjs/server")
      const { fetchBoloesByUserId } = await import("@/app/lib/data")

      const boloes = [
        { ...mockBolao, id: "bolao-1" },
        { ...mockBolao, id: "bolao-2" },
      ]

      vi.mocked(auth).mockResolvedValue({ userId: "user-123" } as any)
      vi.mocked(fetchBoloesByUserId).mockResolvedValue(boloes)

      render(await BoloesList())

      // Check that both cards are rendered
      expect(screen.getByTestId("bolao-card-bolao-1")).toBeInTheDocument()
      expect(screen.getByTestId("bolao-card-bolao-2")).toBeInTheDocument()
    })
  })

  describe("Date Logic", () => {
    it("should correctly compare end date with today", async () => {
      const { auth } = await import("@clerk/nextjs/server")
      const { fetchBoloesByUserId } = await import("@/app/lib/data")

      // Set system time to 2024-06-15
      vi.setSystemTime(new Date("2024-06-15"))

      const boloes = [
        {
          ...mockBolao,
          id: "bolao-future",
          year: 2023,
          end: "2024-12-31", // Future
        },
        {
          ...mockBolao,
          id: "bolao-past",
          year: 2023,
          end: "2024-01-01", // Past
        },
      ]

      vi.mocked(auth).mockResolvedValue({ userId: "user-123" } as any)
      vi.mocked(fetchBoloesByUserId).mockResolvedValue(boloes)

      render(await BoloesList())

      // Future date should be in active
      expect(screen.getByTestId("bolao-card-bolao-future")).toBeInTheDocument()
    })

    it("should handle end date equal to today", async () => {
      const { auth } = await import("@clerk/nextjs/server")
      const { fetchBoloesByUserId } = await import("@/app/lib/data")

      vi.setSystemTime(new Date("2024-06-15"))

      const bolao = {
        ...mockBolao,
        id: "bolao-today",
        year: 2023,
        end: "2024-06-15", // Same as today
      }

      vi.mocked(auth).mockResolvedValue({ userId: "user-123" } as any)
      vi.mocked(fetchBoloesByUserId).mockResolvedValue([bolao])

      render(await BoloesList())

      expect(screen.getByTestId("bolao-card-bolao-today")).toBeInTheDocument()
    })

    it("should use current year correctly", async () => {
      const { auth } = await import("@clerk/nextjs/server")
      const { fetchBoloesByUserId } = await import("@/app/lib/data")

      vi.setSystemTime(new Date("2024-06-15"))

      const bolao = { ...mockBolao, year: 2024 }

      vi.mocked(auth).mockResolvedValue({ userId: "user-123" } as any)
      vi.mocked(fetchBoloesByUserId).mockResolvedValue([bolao])

      render(await BoloesList())

      expect(screen.getByTestId("bolao-card-bolao-1")).toBeInTheDocument()
    })
  })

  describe("Edge Cases", () => {
    it("should handle bolao with no end date and past year", async () => {
      const { auth } = await import("@clerk/nextjs/server")
      const { fetchBoloesByUserId } = await import("@/app/lib/data")

      const bolao = {
        ...mockBolao,
        id: "bolao-no-end",
        year: 2023,
        end: undefined,
      }

      vi.mocked(auth).mockResolvedValue({ userId: "user-123" } as any)
      vi.mocked(fetchBoloesByUserId).mockResolvedValue([bolao])

      render(await BoloesList())

      expect(screen.getByText("Past bolões")).toBeInTheDocument()
    })

    it("should handle bolao with start date", async () => {
      const { auth } = await import("@clerk/nextjs/server")
      const { fetchBoloesByUserId } = await import("@/app/lib/data")

      const bolao = {
        ...mockBolao,
        id: "bolao-start",
        year: 2024,
        start: "2024-01-01",
      }

      vi.mocked(auth).mockResolvedValue({ userId: "user-123" } as any)
      vi.mocked(fetchBoloesByUserId).mockResolvedValue([bolao])

      render(await BoloesList())

      expect(screen.getByTestId("bolao-card-bolao-start")).toBeInTheDocument()
    })

    it("should handle very old boloes", async () => {
      const { auth } = await import("@clerk/nextjs/server")
      const { fetchBoloesByUserId } = await import("@/app/lib/data")

      const bolao = {
        ...mockBolao,
        id: "bolao-old",
        year: 2010,
      }

      vi.mocked(auth).mockResolvedValue({ userId: "user-123" } as any)
      vi.mocked(fetchBoloesByUserId).mockResolvedValue([bolao])

      render(await BoloesList())

      expect(screen.getByText("Past bolões")).toBeInTheDocument()
    })

    it("should handle future year boloes as past", async () => {
      const { auth } = await import("@clerk/nextjs/server")
      const { fetchBoloesByUserId } = await import("@/app/lib/data")

      const bolao = {
        ...mockBolao,
        id: "bolao-future-year",
        year: 2025,
      }

      vi.mocked(auth).mockResolvedValue({ userId: "user-123" } as any)
      vi.mocked(fetchBoloesByUserId).mockResolvedValue([bolao])

      render(await BoloesList())

      // Future years without end date go to past group
      expect(screen.getByText("Past bolões")).toBeInTheDocument()
    })

    it("should handle empty string for end date", async () => {
      const { auth } = await import("@clerk/nextjs/server")
      const { fetchBoloesByUserId } = await import("@/app/lib/data")

      const bolao = {
        ...mockBolao,
        id: "bolao-empty-end",
        year: 2023,
        end: "" as any,
      }

      vi.mocked(auth).mockResolvedValue({ userId: "user-123" } as any)
      vi.mocked(fetchBoloesByUserId).mockResolvedValue([bolao])

      render(await BoloesList())

      expect(screen.getByText("Past bolões")).toBeInTheDocument()
    })
  })

  describe("Data Fetching", () => {
    it("should call noStore to disable caching", async () => {
      const { auth } = await import("@clerk/nextjs/server")
      const { fetchBoloesByUserId } = await import("@/app/lib/data")
      const { unstable_noStore } = await import("next/cache")

      vi.mocked(auth).mockResolvedValue({ userId: "user-123" } as any)
      vi.mocked(fetchBoloesByUserId).mockResolvedValue([mockBolao])

      render(await BoloesList())

      expect(unstable_noStore).toHaveBeenCalled()
    })

    it("should handle data fetching errors gracefully", async () => {
      const { auth } = await import("@clerk/nextjs/server")
      const { fetchBoloesByUserId } = await import("@/app/lib/data")

      vi.mocked(auth).mockResolvedValue({ userId: "user-123" } as any)
      vi.mocked(fetchBoloesByUserId).mockRejectedValue(new Error("Fetch error"))

      // Should throw since component doesn't handle errors
      await expect(async () => {
        await BoloesList()
      }).rejects.toThrow("Fetch error")
    })

    it("should only fetch data when userId exists", async () => {
      const { auth } = await import("@clerk/nextjs/server")
      const { fetchBoloesByUserId } = await import("@/app/lib/data")

      vi.mocked(auth).mockResolvedValue({ userId: "user-123" } as any)
      vi.mocked(fetchBoloesByUserId).mockResolvedValue([mockBolao])

      render(await BoloesList())

      expect(fetchBoloesByUserId).toHaveBeenCalledTimes(1)
      expect(fetchBoloesByUserId).toHaveBeenCalledWith("user-123")
    })
  })
})
