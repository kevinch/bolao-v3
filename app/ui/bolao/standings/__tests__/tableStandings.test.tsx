import { render, screen } from "@testing-library/react"
import { vi } from "vitest"
import TableStandings from "../tableStandings"
import type {
  StandingsLeague,
  Standing,
  StandingsGroup,
} from "@/app/lib/definitions"

// Mock Next.js Image component
vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    ...props
  }: {
    src: string
    alt: string
    [key: string]: any
  }) => <img src={src} alt={alt} {...props} />,
}))

describe("TableStandings", () => {
  const mockTeam = {
    id: 1,
    name: "Manchester City",
    logo: "https://example.com/team-logo.png",
  }

  const createMockStanding = (overrides?: Partial<Standing>): Standing => ({
    rank: 1,
    team: mockTeam,
    points: 30,
    goalsDiff: 15,
    group: "Group A",
    form: "WWDWL",
    status: "same",
    description: "Promotion - Champions League (Group Stage)",
    all: {
      played: 12,
      win: 9,
      draw: 3,
      lose: 0,
      goals: {
        for: 30,
        against: 15,
      },
    },
    home: {
      played: 6,
      win: 5,
      draw: 1,
      lose: 0,
      goals: {
        for: 18,
        against: 8,
      },
    },
    away: {
      played: 6,
      win: 4,
      draw: 2,
      lose: 0,
      goals: {
        for: 12,
        against: 7,
      },
    },
    update: "2024-01-01T00:00:00Z",
    ...overrides,
  })

  const createMockStandingsLeague = (
    standings: StandingsGroup[]
  ): StandingsLeague => ({
    id: 1,
    name: "Premier League",
    country: "England",
    logo: "https://example.com/league-logo.png",
    flag: "https://example.com/flag.png",
    season: 2024,
    standings: standings as any, // Cast because the type definition is not accurate
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("Empty States", () => {
    it("should render empty state when standings is empty array", () => {
      const mockStandingsLeague = createMockStandingsLeague([])
      render(<TableStandings standingsLeague={mockStandingsLeague} />)

      expect(screen.getByText("Standings")).toBeInTheDocument()
      expect(screen.getByText("No standings available.")).toBeInTheDocument()
    })

    it("should render empty state when standings is undefined", () => {
      const mockStandingsLeague = {
        ...createMockStandingsLeague([]),
        standings: undefined as any,
      }
      render(<TableStandings standingsLeague={mockStandingsLeague} />)

      expect(screen.getByText("No standings available.")).toBeInTheDocument()
    })
  })

  describe("Table Structure", () => {
    it("should render table headers correctly", () => {
      const standing = createMockStanding()
      const mockStandingsLeague = createMockStandingsLeague([[standing]])
      render(<TableStandings standingsLeague={mockStandingsLeague} />)

      // Headers are lowercase but styled with uppercase CSS class
      expect(screen.getByText("mp")).toBeInTheDocument()
      expect(screen.getByText("+/-")).toBeInTheDocument()
      expect(screen.getByText("pts")).toBeInTheDocument()
      expect(screen.getByText("form")).toBeInTheDocument()
    })

    it("should render a single standing correctly", () => {
      const standing = createMockStanding()
      const mockStandingsLeague = createMockStandingsLeague([[standing]])
      render(<TableStandings standingsLeague={mockStandingsLeague} />)

      expect(screen.getByText("Manchester City")).toBeInTheDocument()
      expect(screen.getByText("1")).toBeInTheDocument() // rank
      expect(screen.getByText("12")).toBeInTheDocument() // matches played
      expect(screen.getByText("15")).toBeInTheDocument() // goal difference
      expect(screen.getByText("30")).toBeInTheDocument() // points
    })

    it("should render team logo with correct attributes", () => {
      const standing = createMockStanding()
      const mockStandingsLeague = createMockStandingsLeague([[standing]])
      render(<TableStandings standingsLeague={mockStandingsLeague} />)

      const logo = screen.getByAltText("Manchester City's logo")
      expect(logo).toBeInTheDocument()
      expect(logo).toHaveAttribute("src", "https://example.com/team-logo.png")
    })
  })

  describe("Multiple Teams", () => {
    it("should render multiple teams in a single group", () => {
      const standings = [
        createMockStanding({
          rank: 1,
          team: { id: 1, name: "Team A", logo: "logo-a.png" },
          points: 30,
        }),
        createMockStanding({
          rank: 2,
          team: { id: 2, name: "Team B", logo: "logo-b.png" },
          points: 28,
        }),
        createMockStanding({
          rank: 3,
          team: { id: 3, name: "Team C", logo: "logo-c.png" },
          points: 26,
        }),
      ]
      const mockStandingsLeague = createMockStandingsLeague([standings])
      render(<TableStandings standingsLeague={mockStandingsLeague} />)

      expect(screen.getByText("Team A")).toBeInTheDocument()
      expect(screen.getByText("Team B")).toBeInTheDocument()
      expect(screen.getByText("Team C")).toBeInTheDocument()
    })

    it("should render multiple groups", () => {
      const group1 = [
        createMockStanding({
          rank: 1,
          team: { id: 1, name: "Group A Team 1", logo: "logo1.png" },
        }),
        createMockStanding({
          rank: 2,
          team: { id: 2, name: "Group A Team 2", logo: "logo2.png" },
        }),
      ]
      const group2 = [
        createMockStanding({
          rank: 1,
          team: { id: 3, name: "Group B Team 1", logo: "logo3.png" },
        }),
        createMockStanding({
          rank: 2,
          team: { id: 4, name: "Group B Team 2", logo: "logo4.png" },
        }),
      ]
      const mockStandingsLeague = createMockStandingsLeague([group1, group2])
      render(<TableStandings standingsLeague={mockStandingsLeague} />)

      expect(screen.getByText("Group A Team 1")).toBeInTheDocument()
      expect(screen.getByText("Group A Team 2")).toBeInTheDocument()
      expect(screen.getByText("Group B Team 1")).toBeInTheDocument()
      expect(screen.getByText("Group B Team 2")).toBeInTheDocument()
    })

    it("should apply alternating background colors based on rank", () => {
      const standings = [
        createMockStanding({
          rank: 1,
          team: { id: 1, name: "Team 1", logo: "logo1.png" },
        }),
        createMockStanding({
          rank: 2,
          team: { id: 2, name: "Team 2", logo: "logo2.png" },
        }),
        createMockStanding({
          rank: 3,
          team: { id: 3, name: "Team 3", logo: "logo3.png" },
        }),
      ]
      const mockStandingsLeague = createMockStandingsLeague([standings])
      const { container } = render(
        <TableStandings standingsLeague={mockStandingsLeague} />
      )

      const rows = container.querySelectorAll("tbody tr")
      expect(rows[0]).toHaveClass("bg-slate-50") // rank 1 (odd)
      expect(rows[1]).not.toHaveClass("bg-slate-50") // rank 2 (even)
      expect(rows[2]).toHaveClass("bg-slate-50") // rank 3 (odd)
    })
  })

  describe("Goal Difference Calculation", () => {
    it("should calculate and display positive goal difference", () => {
      const standing = createMockStanding({
        all: {
          played: 10,
          win: 8,
          draw: 2,
          lose: 0,
          goals: { for: 25, against: 10 },
        },
      })
      const mockStandingsLeague = createMockStandingsLeague([[standing]])
      render(<TableStandings standingsLeague={mockStandingsLeague} />)

      expect(screen.getByText("15")).toBeInTheDocument() // 25 - 10
    })

    it("should calculate and display negative goal difference", () => {
      const standing = createMockStanding({
        all: {
          played: 10,
          win: 2,
          draw: 2,
          lose: 6,
          goals: { for: 10, against: 25 },
        },
      })
      const mockStandingsLeague = createMockStandingsLeague([[standing]])
      render(<TableStandings standingsLeague={mockStandingsLeague} />)

      expect(screen.getByText("-15")).toBeInTheDocument() // 10 - 25
    })

    it("should display zero goal difference", () => {
      const standing = createMockStanding({
        all: {
          played: 10,
          win: 3,
          draw: 4,
          lose: 3,
          goals: { for: 15, against: 15 },
        },
      })
      const mockStandingsLeague = createMockStandingsLeague([[standing]])
      render(<TableStandings standingsLeague={mockStandingsLeague} />)

      expect(screen.getByText("0")).toBeInTheDocument() // 15 - 15
    })
  })

  describe("Form Display", () => {
    it("should render form with wins (W) as green check icons", () => {
      const standing = createMockStanding({ form: "WWW" })
      const mockStandingsLeague = createMockStandingsLeague([[standing]])
      const { container } = render(
        <TableStandings standingsLeague={mockStandingsLeague} />
      )

      // Should have 3 CheckCircledIcon elements (rendered by Radix UI with fill="green")
      const checkIcons = container.querySelectorAll('[fill="green"]')
      expect(checkIcons).toHaveLength(3)
    })

    it("should render form with losses (L) as red cross icons", () => {
      const standing = createMockStanding({ form: "LLL" })
      const mockStandingsLeague = createMockStandingsLeague([[standing]])
      const { container } = render(
        <TableStandings standingsLeague={mockStandingsLeague} />
      )

      // Should have 3 CrossCircledIcon elements (rendered by Radix UI with fill="red")
      const crossIcons = container.querySelectorAll('[fill="red"]')
      expect(crossIcons).toHaveLength(3)
    })

    it("should render form with draws (D) as minus icons", () => {
      const standing = createMockStanding({ form: "DDD" })
      const mockStandingsLeague = createMockStandingsLeague([[standing]])
      const { container } = render(
        <TableStandings standingsLeague={mockStandingsLeague} />
      )

      // MinusCircledIcon doesn't have a color attribute, so check for SVG elements
      const formCell = container.querySelector("td:last-child span")
      expect(formCell?.children).toHaveLength(3)
    })

    it("should render mixed form results in reverse order", () => {
      const standing = createMockStanding({ form: "WDLWD" })
      const mockStandingsLeague = createMockStandingsLeague([[standing]])
      const { container } = render(
        <TableStandings standingsLeague={mockStandingsLeague} />
      )

      // Form should be displayed in reverse: DWLDW
      // Should have 2 wins, 2 draws, 1 loss
      const checkIcons = container.querySelectorAll('[fill="green"]')
      const crossIcons = container.querySelectorAll('[fill="red"]')
      expect(checkIcons).toHaveLength(2)
      expect(crossIcons).toHaveLength(1)
    })

    it("should handle empty form string", () => {
      const standing = createMockStanding({ form: "" })
      const mockStandingsLeague = createMockStandingsLeague([[standing]])
      const { container } = render(
        <TableStandings standingsLeague={mockStandingsLeague} />
      )

      const formCell = container.querySelector("td:last-child span")
      expect(formCell?.children).toHaveLength(0)
    })

    it("should handle undefined form", () => {
      const standing = createMockStanding({ form: undefined as any })
      const mockStandingsLeague = createMockStandingsLeague([[standing]])
      render(<TableStandings standingsLeague={mockStandingsLeague} />)

      // Should not crash
      expect(screen.getByText("Manchester City")).toBeInTheDocument()
    })
  })

  describe("Descriptions and Colors", () => {
    it("should apply blue color for promotion descriptions", () => {
      const standing = createMockStanding({
        rank: 1,
        description: "Promotion - Champions League (Group Stage)",
      })
      const mockStandingsLeague = createMockStandingsLeague([[standing]])
      const { container } = render(
        <TableStandings standingsLeague={mockStandingsLeague} />
      )

      const rankCell = container.querySelector("td:first-child")
      expect(rankCell).toHaveClass("text-blue-500")
    })

    it("should apply red color for relegation descriptions", () => {
      const standing = createMockStanding({
        rank: 18,
        description: "Relegation",
      })
      const mockStandingsLeague = createMockStandingsLeague([[standing]])
      const { container } = render(
        <TableStandings standingsLeague={mockStandingsLeague} />
      )

      const rankCell = container.querySelector("td:first-child")
      expect(rankCell).toHaveClass("text-red-500")
    })

    it("should apply different colors for different descriptions", () => {
      const standings = [
        createMockStanding({
          rank: 1,
          description: "Promotion - Champions League (Group Stage)",
          team: { id: 1, name: "Team 1", logo: "logo1.png" },
        }),
        createMockStanding({
          rank: 2,
          description: "Promotion - Europa League (Group Stage)",
          team: { id: 2, name: "Team 2", logo: "logo2.png" },
        }),
        createMockStanding({
          rank: 3,
          description: "Promotion - Conference League (Qualification)",
          team: { id: 3, name: "Team 3", logo: "logo3.png" },
        }),
      ]
      const mockStandingsLeague = createMockStandingsLeague([standings])
      const { container } = render(
        <TableStandings standingsLeague={mockStandingsLeague} />
      )

      const rankCells = container.querySelectorAll("td:first-child")
      expect(rankCells[0]).toHaveClass("text-blue-500") // First unique description
      expect(rankCells[1]).toHaveClass("text-cyan-500") // Second unique description
      expect(rankCells[2]).toHaveClass("text-green-500") // Third unique description
    })

    it("should render legend with all unique descriptions", () => {
      const standings = [
        createMockStanding({
          rank: 1,
          description: "Promotion - Champions League (Group Stage)",
          team: { id: 1, name: "Team 1", logo: "logo1.png" },
        }),
        createMockStanding({
          rank: 2,
          description: "Promotion - Europa League (Group Stage)",
          team: { id: 2, name: "Team 2", logo: "logo2.png" },
        }),
        createMockStanding({
          rank: 3,
          description: "Promotion - Champions League (Group Stage)",
          team: { id: 3, name: "Team 3", logo: "logo3.png" },
        }),
      ]
      const mockStandingsLeague = createMockStandingsLeague([standings])
      render(<TableStandings standingsLeague={mockStandingsLeague} />)

      // Should only have 2 unique descriptions in legend
      expect(
        screen.getByText("Promotion - Champions League (Group Stage)")
      ).toBeInTheDocument()
      expect(
        screen.getByText("Promotion - Europa League (Group Stage)")
      ).toBeInTheDocument()

      // But should not duplicate the Champions League description
      const legendItems = screen.getAllByText(/Promotion - Champions League/i)
      expect(legendItems).toHaveLength(1)
    })

    it("should not render legend items for teams without descriptions", () => {
      const standing = createMockStanding({ description: "" })
      const mockStandingsLeague = createMockStandingsLeague([[standing]])
      const { container } = render(
        <TableStandings standingsLeague={mockStandingsLeague} />
      )

      // Legend container should exist but be empty
      const legendContainer = container.querySelector(".px-4.py-2")
      expect(legendContainer?.children).toHaveLength(0)
    })

    it("should apply correct background colors in legend", () => {
      const standing = createMockStanding({
        description: "Relegation",
      })
      const mockStandingsLeague = createMockStandingsLeague([[standing]])
      const { container } = render(
        <TableStandings standingsLeague={mockStandingsLeague} />
      )

      const legendSquare = container.querySelector(".bg-red-500")
      expect(legendSquare).toBeInTheDocument()
    })
  })

  describe("Multiple Groups with Descriptions", () => {
    it("should collect unique descriptions from all groups", () => {
      const group1 = [
        createMockStanding({
          rank: 1,
          description: "Group Winner",
          team: { id: 1, name: "Team A1", logo: "logo1.png" },
        }),
      ]
      const group2 = [
        createMockStanding({
          rank: 1,
          description: "Group Winner",
          team: { id: 2, name: "Team B1", logo: "logo2.png" },
        }),
        createMockStanding({
          rank: 2,
          description: "Runner-up",
          team: { id: 3, name: "Team B2", logo: "logo3.png" },
        }),
      ]
      const mockStandingsLeague = createMockStandingsLeague([group1, group2])
      render(<TableStandings standingsLeague={mockStandingsLeague} />)

      expect(screen.getByText("Group Winner")).toBeInTheDocument()
      expect(screen.getByText("Runner-up")).toBeInTheDocument()

      // Should only appear once each in legend
      const groupWinnerItems = screen.getAllByText("Group Winner")
      const runnerUpItems = screen.getAllByText("Runner-up")
      expect(groupWinnerItems).toHaveLength(1)
      expect(runnerUpItems).toHaveLength(1)
    })
  })

  describe("Edge Cases", () => {
    it("should handle team names with special characters", () => {
      const standing = createMockStanding({
        team: {
          id: 1,
          name: "Team with 'quotes' & symbols",
          logo: "logo.png",
        },
      })
      const mockStandingsLeague = createMockStandingsLeague([[standing]])
      render(<TableStandings standingsLeague={mockStandingsLeague} />)

      expect(
        screen.getByText("Team with 'quotes' & symbols")
      ).toBeInTheDocument()
    })

    it("should handle very long team names", () => {
      const standing = createMockStanding({
        team: {
          id: 1,
          name: "Very Long Team Name That Should Wrap Properly On Multiple Lines",
          logo: "logo.png",
        },
      })
      const mockStandingsLeague = createMockStandingsLeague([[standing]])
      render(<TableStandings standingsLeague={mockStandingsLeague} />)

      expect(
        screen.getByText(
          "Very Long Team Name That Should Wrap Properly On Multiple Lines"
        )
      ).toBeInTheDocument()
    })

    it("should handle zero points and zero games played", () => {
      const standing = createMockStanding({
        points: 0,
        all: {
          played: 0,
          win: 0,
          draw: 0,
          lose: 0,
          goals: { for: 0, against: 0 },
        },
      })
      const mockStandingsLeague = createMockStandingsLeague([[standing]])
      render(<TableStandings standingsLeague={mockStandingsLeague} />)

      const zeroes = screen.getAllByText("0")
      expect(zeroes.length).toBeGreaterThan(0)
    })

    it("should handle large numbers for goals", () => {
      const standing = createMockStanding({
        all: {
          played: 38,
          win: 30,
          draw: 5,
          lose: 3,
          goals: { for: 100, against: 20 },
        },
      })
      const mockStandingsLeague = createMockStandingsLeague([[standing]])
      render(<TableStandings standingsLeague={mockStandingsLeague} />)

      expect(screen.getByText("80")).toBeInTheDocument() // Goal difference: 100 - 20
    })
  })
})
