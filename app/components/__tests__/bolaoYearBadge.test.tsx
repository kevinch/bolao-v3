import { render, screen } from "@testing-library/react"
import { vi } from "vitest"
import BolaoYearBadge from "../bolaoYearBadge"
import type { Bolao } from "@/app/lib/definitions"

// Mock date-fns
const mockFormat = vi.fn()
vi.mock("date-fns", () => ({
  format: (date: Date | string, formatStr: string) =>
    mockFormat(date, formatStr),
}))

// Mock Badge component
vi.mock("@/components/ui/badge", () => ({
  Badge: ({
    children,
    variant,
  }: {
    children: React.ReactNode
    variant: string
  }) => (
    <span data-testid="badge" data-variant={variant}>
      {children}
    </span>
  ),
}))

describe("BolaoYearBadge", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should render badge with year when no start/end dates", () => {
    const mockBolao: Bolao = {
      id: "bolao-123",
      name: "Test Bolao",
      year: 2024,
      competition_id: "2",
      created_by: "user-123",
      created_at: new Date("2024-01-01"),
    }

    render(<BolaoYearBadge bolao={mockBolao} />)

    const badge = screen.getByTestId("badge")
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveTextContent("2024")
  })

  it("should render badge with year when start/end dates are in the same year", () => {
    mockFormat.mockImplementation((date: Date | string, formatStr: string) => {
      const d = new Date(date)
      return d.getFullYear().toString()
    })

    const mockBolao: Bolao = {
      id: "bolao-123",
      name: "Test Bolao",
      year: 2024,
      competition_id: "2",
      created_by: "user-123",
      created_at: new Date("2024-01-01"),
      start: "2024-01-01",
      end: "2024-12-31",
    }

    render(<BolaoYearBadge bolao={mockBolao} />)

    const badge = screen.getByTestId("badge")
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveTextContent("2024")
  })

  it("should render badge with date range when start/end years differ", () => {
    let callCount = 0
    mockFormat.mockImplementation((date: Date | string, formatStr: string) => {
      callCount++
      const d = new Date(date)
      return d.getFullYear().toString()
    })

    const mockBolao: Bolao = {
      id: "bolao-123",
      name: "Test Bolao",
      year: 2023,
      competition_id: "2",
      created_by: "user-123",
      created_at: new Date("2023-01-01"),
      start: "2023-09-01",
      end: "2024-05-31",
    }

    render(<BolaoYearBadge bolao={mockBolao} />)

    const badge = screen.getByTestId("badge")
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveTextContent("2023/2024")
  })

  it("should call date-fns format with correct arguments for date range", () => {
    mockFormat
      .mockReturnValue("2023")
      .mockReturnValueOnce("2023")
      .mockReturnValueOnce("2024")

    const mockBolao: Bolao = {
      id: "bolao-123",
      name: "Test Bolao",
      year: 2023,
      competition_id: "2",
      created_by: "user-123",
      created_at: new Date("2023-01-01"),
      start: "2023-09-01",
      end: "2024-05-31",
    }

    render(<BolaoYearBadge bolao={mockBolao} />)

    expect(mockFormat).toHaveBeenCalledTimes(2)
    expect(mockFormat).toHaveBeenNthCalledWith(1, "2023-09-01", "yyyy")
    expect(mockFormat).toHaveBeenNthCalledWith(2, "2024-05-31", "yyyy")
  })

  it("should render Badge with outline variant", () => {
    const mockBolao: Bolao = {
      id: "bolao-123",
      name: "Test Bolao",
      year: 2024,
      competition_id: "2",
      created_by: "user-123",
      created_at: new Date("2024-01-01"),
    }

    render(<BolaoYearBadge bolao={mockBolao} />)

    const badge = screen.getByTestId("badge")
    expect(badge).toHaveAttribute("data-variant", "outline")
  })

  it("should not format dates when only start date is provided", () => {
    const mockBolao: Bolao = {
      id: "bolao-123",
      name: "Test Bolao",
      year: 2024,
      competition_id: "2",
      created_by: "user-123",
      created_at: new Date("2024-01-01"),
      start: "2024-01-01",
    }

    render(<BolaoYearBadge bolao={mockBolao} />)

    const badge = screen.getByTestId("badge")
    expect(badge).toHaveTextContent("2024")
    expect(mockFormat).not.toHaveBeenCalled()
  })

  it("should not format dates when only end date is provided", () => {
    const mockBolao: Bolao = {
      id: "bolao-123",
      name: "Test Bolao",
      year: 2024,
      competition_id: "2",
      created_by: "user-123",
      created_at: new Date("2024-01-01"),
      end: "2024-12-31",
    }

    render(<BolaoYearBadge bolao={mockBolao} />)

    const badge = screen.getByTestId("badge")
    expect(badge).toHaveTextContent("2024")
    expect(mockFormat).not.toHaveBeenCalled()
  })

  it("should handle multi-year span correctly (e.g., 2023/2024)", () => {
    mockFormat.mockReturnValueOnce("2023").mockReturnValueOnce("2024")

    const mockBolao: Bolao = {
      id: "bolao-123",
      name: "UEFA Champions League",
      year: 2023,
      competition_id: "2",
      created_by: "user-123",
      created_at: new Date("2023-01-01"),
      start: "2023-09-01",
      end: "2024-06-30",
    }

    render(<BolaoYearBadge bolao={mockBolao} />)

    const badge = screen.getByTestId("badge")
    expect(badge).toHaveTextContent("2023/2024")
  })
})
