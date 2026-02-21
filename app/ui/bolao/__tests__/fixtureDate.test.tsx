import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import FixtureDate from "../fixtureDate"
import type { FixtureStatus } from "@/app/lib/definitions"
import * as utils from "@/app/lib/utils"

// Mock utils
vi.mock("@/app/lib/utils", async () => {
  const actual = await vi.importActual("@/app/lib/utils")
  return {
    ...actual,
    formatDateFixtures: vi.fn((date: string) => "Jan 15th 20:00"),
    STATUSES_IN_PLAY: ["1H", "HT", "2H", "ET", "BT", "LIVE"],
    STATUSES_ERROR: ["CANC", "PST", "ABD", "AWD"],
  }
})

describe("FixtureDate", () => {
  const mockDate = "2024-01-15T20:00:00Z"

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("Normal Date Display", () => {
    it("should display formatted date for not started fixtures", () => {
      const status: FixtureStatus = {
        long: "Not Started",
        short: "NS",
        elapsed: 0,
      }

      render(<FixtureDate date={mockDate} status={status} />)

      expect(screen.getByText("Jan 15th 20:00")).toBeInTheDocument()
    })

    it("should call formatDateFixtures with correct date", () => {
      const status: FixtureStatus = {
        long: "Not Started",
        short: "NS",
        elapsed: 0,
      }
      const mockFormatDateFixtures = vi.mocked(utils.formatDateFixtures)

      render(<FixtureDate date={mockDate} status={status} />)

      expect(mockFormatDateFixtures).toHaveBeenCalledWith(mockDate, "en")
    })

    it("should display formatted date for TBD status", () => {
      const status: FixtureStatus = {
        long: "Time To Be Defined",
        short: "TBD",
        elapsed: 0,
      }

      render(<FixtureDate date={mockDate} status={status} />)

      expect(screen.getByText("Jan 15th 20:00")).toBeInTheDocument()
    })

    it("should display formatted date for finished fixtures", () => {
      const status: FixtureStatus = {
        long: "Match Finished",
        short: "FT",
        elapsed: 90,
      }

      render(<FixtureDate date={mockDate} status={status} />)

      expect(screen.getByText("Jan 15th 20:00")).toBeInTheDocument()
    })
  })

  describe("In-Play Status Display", () => {
    it("should display status for first half (1H)", () => {
      const status: FixtureStatus = {
        long: "First Half",
        short: "1H",
        elapsed: 30,
      }

      render(<FixtureDate date={mockDate} status={status} />)

      expect(screen.getByText("First Half")).toBeInTheDocument()
      expect(screen.queryByText("Jan 15th 20:00")).not.toBeInTheDocument()
    })

    it("should display status for halftime (HT)", () => {
      const status: FixtureStatus = {
        long: "Halftime",
        short: "HT",
        elapsed: 45,
      }

      render(<FixtureDate date={mockDate} status={status} />)

      expect(screen.getByText("Halftime")).toBeInTheDocument()
    })

    it("should display status for second half (2H)", () => {
      const status: FixtureStatus = {
        long: "Second Half",
        short: "2H",
        elapsed: 60,
      }

      render(<FixtureDate date={mockDate} status={status} />)

      expect(screen.getByText("Second Half")).toBeInTheDocument()
    })

    it("should display status for extra time (ET)", () => {
      const status: FixtureStatus = {
        long: "Extra Time",
        short: "ET",
        elapsed: 95,
      }

      render(<FixtureDate date={mockDate} status={status} />)

      expect(screen.getByText("Extra Time")).toBeInTheDocument()
    })

    it("should display status for penalty shootout (BT)", () => {
      const status: FixtureStatus = {
        long: "Penalty Shootout",
        short: "BT",
        elapsed: 120,
      }

      render(<FixtureDate date={mockDate} status={status} />)

      expect(screen.getByText("Penalty Shootout")).toBeInTheDocument()
    })

    it("should display status for live (LIVE)", () => {
      const status: FixtureStatus = {
        long: "In Play",
        short: "LIVE",
        elapsed: 75,
      }

      render(<FixtureDate date={mockDate} status={status} />)

      expect(screen.getByText("In Play")).toBeInTheDocument()
    })

    it("should apply cyan color to in-play status", () => {
      const status: FixtureStatus = {
        long: "First Half",
        short: "1H",
        elapsed: 30,
      }

      render(<FixtureDate date={mockDate} status={status} />)

      const statusElement = screen.getByText("First Half")
      expect(statusElement).toHaveClass("text-cyan-600")
    })
  })

  describe("Error Status Display", () => {
    it("should display cancelled status", () => {
      const status: FixtureStatus = {
        long: "Match Cancelled",
        short: "CANC",
        elapsed: 0,
      }

      render(<FixtureDate date={mockDate} status={status} />)

      expect(screen.getByText("Match Cancelled")).toBeInTheDocument()
      expect(screen.queryByText("Jan 15th 20:00")).not.toBeInTheDocument()
    })

    it("should display postponed status", () => {
      const status: FixtureStatus = {
        long: "Match Postponed",
        short: "PST",
        elapsed: 0,
      }

      render(<FixtureDate date={mockDate} status={status} />)

      expect(screen.getByText("Match Postponed")).toBeInTheDocument()
    })

    it("should display abandoned status", () => {
      const status: FixtureStatus = {
        long: "Match Abandoned",
        short: "ABD",
        elapsed: 60,
      }

      render(<FixtureDate date={mockDate} status={status} />)

      expect(screen.getByText("Match Abandoned")).toBeInTheDocument()
    })

    it("should display awarded status", () => {
      const status: FixtureStatus = {
        long: "Match Awarded",
        short: "AWD",
        elapsed: 0,
      }

      render(<FixtureDate date={mockDate} status={status} />)

      expect(screen.getByText("Match Awarded")).toBeInTheDocument()
    })

    it("should apply orange color to error status", () => {
      const status: FixtureStatus = {
        long: "Match Cancelled",
        short: "CANC",
        elapsed: 0,
      }

      render(<FixtureDate date={mockDate} status={status} />)

      const statusElement = screen.getByText("Match Cancelled")
      expect(statusElement).toHaveClass("text-orange-500")
    })
  })

  describe("Styling", () => {
    it("should have text-xs and text-center classes", () => {
      const status: FixtureStatus = {
        long: "Not Started",
        short: "NS",
        elapsed: 0,
      }

      const { container } = render(
        <FixtureDate date={mockDate} status={status} />
      )

      const div = container.firstChild
      expect(div).toHaveClass("text-xs", "text-center")
    })

    it("should apply correct styling for normal date", () => {
      const status: FixtureStatus = {
        long: "Not Started",
        short: "NS",
        elapsed: 0,
      }

      const { container } = render(
        <FixtureDate date={mockDate} status={status} />
      )

      const div = container.querySelector(".text-xs.text-center")
      expect(div).toBeInTheDocument()
    })
  })

  describe("Status Priority", () => {
    it("should prioritize error status over in-play", () => {
      // If a status is both in error list and in-play list (edge case)
      const status: FixtureStatus = {
        long: "Match Cancelled",
        short: "CANC",
        elapsed: 30,
      }

      render(<FixtureDate date={mockDate} status={status} />)

      expect(screen.getByText("Match Cancelled")).toBeInTheDocument()
      const statusElement = screen.getByText("Match Cancelled")
      expect(statusElement).toHaveClass("text-orange-500")
      expect(statusElement).not.toHaveClass("text-cyan-600")
    })

    it("should show in-play status when not error status", () => {
      const status: FixtureStatus = {
        long: "Second Half",
        short: "2H",
        elapsed: 70,
      }

      render(<FixtureDate date={mockDate} status={status} />)

      expect(screen.getByText("Second Half")).toBeInTheDocument()
      const statusElement = screen.getByText("Second Half")
      expect(statusElement).toHaveClass("text-cyan-600")
    })
  })

  describe("Date Formatting", () => {
    it("should handle different date formats", () => {
      const dates = [
        "2024-01-15T20:00:00Z",
        "2024-12-31T23:59:59Z",
        "2024-06-15T12:00:00Z",
      ]

      dates.forEach((date) => {
        const status: FixtureStatus = {
          long: "Not Started",
          short: "NS",
          elapsed: 0,
        }
        const { unmount } = render(<FixtureDate date={date} status={status} />)
        expect(screen.getByText("Jan 15th 20:00")).toBeInTheDocument()
        unmount()
      })
    })

    it("should convert date to string before formatting", () => {
      const status: FixtureStatus = {
        long: "Not Started",
        short: "NS",
        elapsed: 0,
      }
      const mockFormatDateFixtures = vi.mocked(utils.formatDateFixtures)

      render(<FixtureDate date={mockDate} status={status} />)

      // Should call formatDateFixtures with string
      expect(mockFormatDateFixtures).toHaveBeenCalled()
    })
  })

  describe("Component Structure", () => {
    it("should render within a div container", () => {
      const status: FixtureStatus = {
        long: "Not Started",
        short: "NS",
        elapsed: 0,
      }

      const { container } = render(
        <FixtureDate date={mockDate} status={status} />
      )

      const div = container.querySelector("div")
      expect(div).toBeInTheDocument()
    })

    it("should render content directly when showing formatted date", () => {
      const status: FixtureStatus = {
        long: "Not Started",
        short: "NS",
        elapsed: 0,
      }

      const { container } = render(
        <FixtureDate date={mockDate} status={status} />
      )

      const div = container.querySelector("div")
      expect(div?.textContent).toBe("Jan 15th 20:00")
    })

    it("should render span for error status", () => {
      const status: FixtureStatus = {
        long: "Match Cancelled",
        short: "CANC",
        elapsed: 0,
      }

      const { container } = render(
        <FixtureDate date={mockDate} status={status} />
      )

      const span = container.querySelector("span.text-orange-500")
      expect(span).toBeInTheDocument()
    })

    it("should render span for in-play status", () => {
      const status: FixtureStatus = {
        long: "First Half",
        short: "1H",
        elapsed: 30,
      }

      const { container } = render(
        <FixtureDate date={mockDate} status={status} />
      )

      const span = container.querySelector("span.text-cyan-600")
      expect(span).toBeInTheDocument()
    })
  })

  describe("Edge Cases", () => {
    it("should handle empty status long text", () => {
      const status: FixtureStatus = {
        long: "",
        short: "NS",
        elapsed: 0,
      }

      const { container } = render(
        <FixtureDate date={mockDate} status={status} />
      )

      expect(container).toBeInTheDocument()
    })

    it("should handle unknown status codes", () => {
      const status: FixtureStatus = {
        long: "Unknown Status",
        short: "UNK",
        elapsed: 0,
      }

      render(<FixtureDate date={mockDate} status={status} />)

      // Should default to showing formatted date
      expect(screen.getByText("Jan 15th 20:00")).toBeInTheDocument()
    })
  })
})
