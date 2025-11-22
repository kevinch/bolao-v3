import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import TableLead from "../tableLead"
import type { LeadData } from "@/app/lib/definitions"

describe("TableLead", () => {
  describe("Component Rendering", () => {
    it("should render the component with title", () => {
      const mockData: LeadData[] = [
        { name: "John Doe", total: 100 },
        { name: "Jane Smith", total: 90 },
      ]

      render(<TableLead data={mockData} />)

      expect(screen.getByText("Players lead")).toBeInTheDocument()
    })

    it("should render table headers correctly", () => {
      const mockData: LeadData[] = [{ name: "John Doe", total: 100 }]

      render(<TableLead data={mockData} />)

      expect(screen.getByText("player")).toBeInTheDocument()
      expect(screen.getByText("score")).toBeInTheDocument()
      expect(screen.getByText("needs")).toBeInTheDocument()
    })

    it("should render empty table when data array is empty", () => {
      const mockData: LeadData[] = []

      render(<TableLead data={mockData} />)

      expect(screen.getByText("Players lead")).toBeInTheDocument()
      expect(screen.queryByText("01")).not.toBeInTheDocument()
    })
  })

  describe("Player Data Display", () => {
    it("should display all players with correct names", () => {
      const mockData: LeadData[] = [
        { name: "John Doe", total: 100 },
        { name: "Jane Smith", total: 90 },
        { name: "Bob Johnson", total: 80 },
      ]

      render(<TableLead data={mockData} />)

      expect(screen.getByText("John Doe")).toBeInTheDocument()
      expect(screen.getByText("Jane Smith")).toBeInTheDocument()
      expect(screen.getByText("Bob Johnson")).toBeInTheDocument()
    })

    it("should display player scores correctly", () => {
      const mockData: LeadData[] = [
        { name: "John Doe", total: 100 },
        { name: "Jane Smith", total: 90 },
      ]

      render(<TableLead data={mockData} />)

      expect(screen.getByText("100")).toBeInTheDocument()
      expect(screen.getByText("90")).toBeInTheDocument()
    })

    it("should display player rankings with zero-padded numbers", () => {
      const mockData: LeadData[] = [
        { name: "Player 1", total: 100 },
        { name: "Player 2", total: 90 },
        { name: "Player 3", total: 80 },
      ]

      render(<TableLead data={mockData} />)

      expect(screen.getByText("01")).toBeInTheDocument()
      expect(screen.getByText("02")).toBeInTheDocument()
      expect(screen.getByText("03")).toBeInTheDocument()
    })

    it("should handle double-digit rankings correctly", () => {
      const mockData: LeadData[] = Array.from({ length: 12 }, (_, i) => ({
        name: `Player ${i + 1}`,
        total: 100 - i,
      }))

      const { container } = render(<TableLead data={mockData} />)

      expect(screen.getByText("01")).toBeInTheDocument()
      expect(screen.getByText("09")).toBeInTheDocument()
      // Check for ranking 10 specifically in the rank column
      const rows = container.querySelectorAll("tbody tr")
      const row10 = rows[9] // 10th row (0-indexed)
      expect(row10.querySelector("span")?.textContent).toBe("10")
      expect(screen.getByText("12")).toBeInTheDocument()
    })
  })

  describe("Points Needed Calculation", () => {
    it("should show '-' for the leader (no points needed)", () => {
      const mockData: LeadData[] = [
        { name: "Leader", total: 100 },
        { name: "Second", total: 90 },
      ]

      const { container } = render(<TableLead data={mockData} />)

      // The leader should have a dash
      const rows = container.querySelectorAll("tbody tr")
      const leaderRow = rows[0]
      expect(leaderRow.textContent).toContain("-")
    })

    it("should calculate correct points needed for second place", () => {
      const mockData: LeadData[] = [
        { name: "Leader", total: 100 },
        { name: "Second", total: 90 },
      ]

      render(<TableLead data={mockData} />)

      expect(screen.getByText("10")).toBeInTheDocument()
    })

    it("should calculate correct points needed for multiple players", () => {
      const mockData: LeadData[] = [
        { name: "Leader", total: 100 },
        { name: "Second", total: 95 },
        { name: "Third", total: 85 },
        { name: "Fourth", total: 70 },
      ]

      render(<TableLead data={mockData} />)

      expect(screen.getByText("5")).toBeInTheDocument()
      expect(screen.getByText("15")).toBeInTheDocument()
      expect(screen.getByText("30")).toBeInTheDocument()
    })

    it("should handle players with the same score as the leader", () => {
      const mockData: LeadData[] = [
        { name: "Leader 1", total: 100 },
        { name: "Leader 2", total: 100 },
        { name: "Third", total: 90 },
      ]

      const { container } = render(<TableLead data={mockData} />)

      const rows = container.querySelectorAll("tbody tr")
      // Both leaders should have a dash
      const leaderRow1 = rows[0]
      const leaderRow2 = rows[1]

      expect(leaderRow1.textContent).toContain("-")
      expect(leaderRow2.textContent).toContain("-")
      expect(screen.getByText("10")).toBeInTheDocument()
    })

    it("should handle zero score scenarios", () => {
      const mockData: LeadData[] = [
        { name: "Leader", total: 50 },
        { name: "Player", total: 0 },
      ]

      const { container } = render(<TableLead data={mockData} />)

      // Check that both "50" values exist (one in score column, one in needs column)
      const allFifties = screen.getAllByText("50")
      expect(allFifties).toHaveLength(2)
    })
  })

  describe("Styling and Layout", () => {
    it("should apply alternating row background colors", () => {
      const mockData: LeadData[] = [
        { name: "Player 1", total: 100 },
        { name: "Player 2", total: 90 },
        { name: "Player 3", total: 80 },
        { name: "Player 4", total: 70 },
      ]

      const { container } = render(<TableLead data={mockData} />)

      const rows = container.querySelectorAll("tbody tr")

      // First row (index 0) should not have bg-slate-50
      expect(rows[0]).not.toHaveClass("bg-slate-50")

      // Second row (index 1) should have bg-slate-50
      expect(rows[1]).toHaveClass("bg-slate-50")

      // Third row (index 2) should not have bg-slate-50
      expect(rows[2]).not.toHaveClass("bg-slate-50")

      // Fourth row (index 3) should have bg-slate-50
      expect(rows[3]).toHaveClass("bg-slate-50")
    })

    it("should render table with correct structure", () => {
      const mockData: LeadData[] = [{ name: "John Doe", total: 100 }]

      const { container } = render(<TableLead data={mockData} />)

      const table = container.querySelector("table")
      expect(table).toBeInTheDocument()
      expect(table).toHaveClass("w-full", "text-xs")

      const thead = container.querySelector("thead")
      expect(thead).toBeInTheDocument()
      expect(thead).toHaveClass("uppercase")

      const tbody = container.querySelector("tbody")
      expect(tbody).toBeInTheDocument()
    })

    it("should have correct number of columns", () => {
      const mockData: LeadData[] = [{ name: "Player", total: 100 }]

      const { container } = render(<TableLead data={mockData} />)

      const headerCells = container.querySelectorAll("thead th")
      expect(headerCells).toHaveLength(4) // rank, player, score, needs

      const bodyCells = container.querySelectorAll("tbody tr:first-child td")
      expect(bodyCells).toHaveLength(4)
    })
  })

  describe("Edge Cases", () => {
    it("should handle single player", () => {
      const mockData: LeadData[] = [{ name: "Only Player", total: 100 }]

      const { container } = render(<TableLead data={mockData} />)

      expect(screen.getByText("Only Player")).toBeInTheDocument()
      expect(screen.getByText("100")).toBeInTheDocument()
      expect(screen.getByText("01")).toBeInTheDocument()

      const rows = container.querySelectorAll("tbody tr")
      expect(rows).toHaveLength(1)
    })

    it("should handle large number of players", () => {
      const mockData: LeadData[] = Array.from({ length: 50 }, (_, i) => ({
        name: `Player ${i + 1}`,
        total: 500 - i * 10,
      }))

      const { container } = render(<TableLead data={mockData} />)

      const rows = container.querySelectorAll("tbody tr")
      expect(rows).toHaveLength(50)
    })

    it("should handle players with special characters in names", () => {
      const mockData: LeadData[] = [
        { name: "O'Connor", total: 100 },
        { name: "José García", total: 90 },
        { name: "李明", total: 80 },
      ]

      render(<TableLead data={mockData} />)

      expect(screen.getByText("O'Connor")).toBeInTheDocument()
      expect(screen.getByText("José García")).toBeInTheDocument()
      expect(screen.getByText("李明")).toBeInTheDocument()
    })

    it("should handle empty player names", () => {
      const mockData: LeadData[] = [
        { name: "", total: 100 },
        { name: "Player 2", total: 90 },
      ]

      render(<TableLead data={mockData} />)

      expect(screen.getByText("Player 2")).toBeInTheDocument()
      const rows = screen.getAllByRole("row")
      // Should still render even with empty name
      expect(rows.length).toBeGreaterThan(0)
    })

    it("should handle all players with zero score", () => {
      const mockData: LeadData[] = [
        { name: "Player 1", total: 0 },
        { name: "Player 2", total: 0 },
        { name: "Player 3", total: 0 },
      ]

      const { container } = render(<TableLead data={mockData} />)

      const rows = container.querySelectorAll("tbody tr")
      // All players should show dash since they're all tied for first
      rows.forEach((row) => {
        expect(row.textContent).toContain("-")
      })
    })
  })

  describe("Data Integrity", () => {
    it("should maintain correct player order from input data", () => {
      const mockData: LeadData[] = [
        { name: "Alice", total: 100 },
        { name: "Bob", total: 90 },
        { name: "Charlie", total: 80 },
        { name: "David", total: 70 },
      ]

      const { container } = render(<TableLead data={mockData} />)

      const playerNames = container.querySelectorAll(".leadtable-playername")
      expect(playerNames[0].textContent).toBe("Alice")
      expect(playerNames[1].textContent).toBe("Bob")
      expect(playerNames[2].textContent).toBe("Charlie")
      expect(playerNames[3].textContent).toBe("David")
    })

    it("should preserve player data when rendering", () => {
      const mockData: LeadData[] = [{ name: "Test Player", total: 42 }]

      render(<TableLead data={mockData} />)

      expect(screen.getByText("Test Player")).toBeInTheDocument()
      expect(screen.getByText("42")).toBeInTheDocument()
      expect(screen.getByText("01")).toBeInTheDocument()
    })
  })

  describe("Accessibility", () => {
    it("should have proper table structure for screen readers", () => {
      const mockData: LeadData[] = [{ name: "Player", total: 100 }]

      const { container } = render(<TableLead data={mockData} />)

      const table = container.querySelector("table")
      const thead = container.querySelector("thead")
      const tbody = container.querySelector("tbody")

      expect(table).toBeInTheDocument()
      expect(thead).toBeInTheDocument()
      expect(tbody).toBeInTheDocument()
    })

    it("should render within Card component structure", () => {
      const mockData: LeadData[] = [{ name: "Player", total: 100 }]

      render(<TableLead data={mockData} />)

      // Card components render proper semantic structure
      expect(screen.getByText("Players lead")).toBeInTheDocument()
    })
  })
})
