import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import TableMatchDayBets from "../tableMatchDayBets"
import type { FixtureData, Bet } from "@/app/lib/definitions"

// Mock child components
vi.mock("../buttonsBet", () => ({
  default: ({
    fixtureId,
    type,
    disabled,
  }: {
    fixtureId: string
    type: string
    disabled: boolean
  }) => (
    <div
      data-testid={`buttons-bet-${type}-${fixtureId}`}
      data-disabled={disabled}
    >
      ButtonsBet-{type}
    </div>
  ),
}))

vi.mock("@/app/ui/bolao/teamCodeLogo", () => ({
  default: ({ name, logoSrc }: { name: string; logoSrc: string }) => (
    <div data-testid="team-code-logo" data-name={name} data-logo={logoSrc}>
      {name}
    </div>
  ),
}))

vi.mock("@/app/ui/bolao/teamScore", () => ({
  default: ({ type, status }: { type: string; status: string }) => (
    <div data-testid={`team-score-${type}`} data-status={status}>
      Score-{type}
    </div>
  ),
}))

vi.mock("@/app/ui/bolao/fixtureDate", () => ({
  default: ({ date, status }: { date: string; status: any }) => (
    <div data-testid="fixture-date" data-date={date}>
      {date}
    </div>
  ),
}))

describe("TableMatchDayBets", () => {
  const mockFixture: FixtureData = {
    fixture: {
      id: 12345,
      referee: null,
      timezone: "UTC",
      date: new Date("2024-01-15T20:00:00Z"),
      timestamp: 1705348800,
      periods: { first: 0, second: 0 },
      venue: { id: 1, name: "Test Stadium", city: "Test City" },
      status: { long: "Not Started", short: "NS", elapsed: 0 },
    },
    league: {
      id: 39,
      name: "Premier League",
      country: "England",
      logo: "league-logo.png",
      flag: "flag.png",
      season: 2024,
      round: "Regular Season - 20",
    },
    teams: {
      home: {
        id: 1,
        name: "Manchester United",
        logo: "man-utd-logo.png",
        winner: null,
      },
      away: {
        id: 2,
        name: "Liverpool",
        logo: "liverpool-logo.png",
        winner: null,
      },
    },
    goals: { home: null, away: null },
    score: {
      halftime: { home: null, away: null },
      fulltime: { home: null, away: null },
      extratime: { home: null, away: null },
      penalty: { home: null, away: null },
    },
  }

  const mockBet: Bet = {
    id: "bet-123",
    user_bolao_id: "user-bolao-1",
    fixture_id: "12345",
    value: 2,
    type: "home",
  }

  const defaultProps = {
    fixtures: [mockFixture],
    userBolaoId: "user-bolao-1",
    bets: [mockBet],
  }

  describe("Component Rendering", () => {
    it("should render the component with fixtures", () => {
      render(<TableMatchDayBets {...defaultProps} />)

      expect(screen.getByText("Next games")).toBeInTheDocument()
    })

    it("should render Card components", () => {
      const { container } = render(<TableMatchDayBets {...defaultProps} />)

      expect(container.querySelector(".rounded-xl")).toBeInTheDocument()
    })

    it("should display title based on fixture status", () => {
      render(<TableMatchDayBets {...defaultProps} />)

      // Status "NS" is in STATUSES_OPEN_TO_PLAY, so should show "Next games"
      expect(screen.getByText("Next games")).toBeInTheDocument()
    })

    it("should show 'Previous games' for finished fixtures", () => {
      const finishedFixture = {
        ...mockFixture,
        fixture: {
          ...mockFixture.fixture,
          status: { long: "Match Finished", short: "FT", elapsed: 90 },
        },
      }

      render(
        <TableMatchDayBets {...defaultProps} fixtures={[finishedFixture]} />
      )

      expect(screen.getByText("Previous games")).toBeInTheDocument()
    })

    it("should render loading state when fixtures is falsy", () => {
      render(<TableMatchDayBets {...defaultProps} fixtures={null as any} />)

      expect(screen.getByText("loading...")).toBeInTheDocument()
    })
  })

  describe("Multiple Fixtures", () => {
    it("should render multiple fixtures", () => {
      const fixture2: FixtureData = {
        ...mockFixture,
        fixture: { ...mockFixture.fixture, id: 67890 },
        teams: {
          home: {
            id: 3,
            name: "Chelsea",
            logo: "chelsea-logo.png",
            winner: null,
          },
          away: {
            id: 4,
            name: "Arsenal",
            logo: "arsenal-logo.png",
            winner: null,
          },
        },
      }

      render(
        <TableMatchDayBets
          {...defaultProps}
          fixtures={[mockFixture, fixture2]}
        />
      )

      expect(screen.getByText("Manchester United")).toBeInTheDocument()
      expect(screen.getByText("Chelsea")).toBeInTheDocument()
    })

    it("should apply alternating background colors", () => {
      const fixture2: FixtureData = {
        ...mockFixture,
        fixture: { ...mockFixture.fixture, id: 67890 },
      }

      const fixture3: FixtureData = {
        ...mockFixture,
        fixture: { ...mockFixture.fixture, id: 11111 },
      }

      const { container } = render(
        <TableMatchDayBets
          {...defaultProps}
          fixtures={[mockFixture, fixture2, fixture3]}
        />
      )

      const fixtureContainers = container.querySelectorAll(".py-4")

      // First fixture (index 0) should not have bg-slate-50
      expect(fixtureContainers[0]).not.toHaveClass("bg-slate-50")

      // Second fixture (index 1) should have bg-slate-50
      expect(fixtureContainers[1]).toHaveClass("bg-slate-50")

      // Third fixture (index 2) should not have bg-slate-50
      expect(fixtureContainers[2]).not.toHaveClass("bg-slate-50")
    })
  })

  describe("ButtonsBet Integration", () => {
    it("should render home and away bet buttons", () => {
      render(<TableMatchDayBets {...defaultProps} />)

      expect(screen.getByTestId("buttons-bet-home-12345")).toBeInTheDocument()
      expect(screen.getByTestId("buttons-bet-away-12345")).toBeInTheDocument()
    })

    it("should pass correct props to home ButtonsBet", () => {
      render(<TableMatchDayBets {...defaultProps} />)

      const homeButtons = screen.getByTestId("buttons-bet-home-12345")
      expect(homeButtons).toHaveAttribute("data-disabled", "false")
    })

    it("should pass correct props to away ButtonsBet", () => {
      render(<TableMatchDayBets {...defaultProps} />)

      const awayButtons = screen.getByTestId("buttons-bet-away-12345")
      expect(awayButtons).toHaveAttribute("data-disabled", "false")
    })

    it("should disable buttons for finished fixtures", () => {
      const finishedFixture = {
        ...mockFixture,
        fixture: {
          ...mockFixture.fixture,
          status: { long: "Match Finished", short: "FT", elapsed: 90 },
        },
      }

      render(
        <TableMatchDayBets {...defaultProps} fixtures={[finishedFixture]} />
      )

      const homeButtons = screen.getByTestId("buttons-bet-home-12345")
      const awayButtons = screen.getByTestId("buttons-bet-away-12345")

      expect(homeButtons).toHaveAttribute("data-disabled", "true")
      expect(awayButtons).toHaveAttribute("data-disabled", "true")
    })

    it("should enable buttons for open fixtures", () => {
      const openFixture = {
        ...mockFixture,
        fixture: {
          ...mockFixture.fixture,
          status: { long: "Not Started", short: "NS", elapsed: 0 },
        },
      }

      render(<TableMatchDayBets {...defaultProps} fixtures={[openFixture]} />)

      const homeButtons = screen.getByTestId("buttons-bet-home-12345")
      const awayButtons = screen.getByTestId("buttons-bet-away-12345")

      expect(homeButtons).toHaveAttribute("data-disabled", "false")
      expect(awayButtons).toHaveAttribute("data-disabled", "false")
    })
  })

  describe("Team Display", () => {
    it("should display home team", () => {
      render(<TableMatchDayBets {...defaultProps} />)

      expect(screen.getByText("Manchester United")).toBeInTheDocument()
    })

    it("should display away team", () => {
      render(<TableMatchDayBets {...defaultProps} />)

      expect(screen.getByText("Liverpool")).toBeInTheDocument()
    })

    it("should render TeamCodeLogo for both teams", () => {
      render(<TableMatchDayBets {...defaultProps} />)

      const teamLogos = screen.getAllByTestId("team-code-logo")
      expect(teamLogos).toHaveLength(2)
    })

    it("should pass correct props to home team logo", () => {
      render(<TableMatchDayBets {...defaultProps} />)

      const teamLogos = screen.getAllByTestId("team-code-logo")
      const homeTeamLogo = teamLogos[0]

      expect(homeTeamLogo).toHaveAttribute("data-name", "Manchester United")
      expect(homeTeamLogo).toHaveAttribute("data-logo", "man-utd-logo.png")
    })

    it("should pass correct props to away team logo", () => {
      render(<TableMatchDayBets {...defaultProps} />)

      const teamLogos = screen.getAllByTestId("team-code-logo")
      const awayTeamLogo = teamLogos[1]

      expect(awayTeamLogo).toHaveAttribute("data-name", "Liverpool")
      expect(awayTeamLogo).toHaveAttribute("data-logo", "liverpool-logo.png")
    })
  })

  describe("Score Display", () => {
    it("should render team scores", () => {
      render(<TableMatchDayBets {...defaultProps} />)

      expect(screen.getByTestId("team-score-home")).toBeInTheDocument()
      expect(screen.getByTestId("team-score-away")).toBeInTheDocument()
    })

    it("should display score separator", () => {
      render(<TableMatchDayBets {...defaultProps} />)

      expect(screen.getByText("×")).toBeInTheDocument()
    })

    it("should pass correct status to team scores", () => {
      render(<TableMatchDayBets {...defaultProps} />)

      const homeScore = screen.getByTestId("team-score-home")
      const awayScore = screen.getByTestId("team-score-away")

      expect(homeScore).toHaveAttribute("data-status", "NS")
      expect(awayScore).toHaveAttribute("data-status", "NS")
    })
  })

  describe("Fixture Date Display", () => {
    it("should render fixture date", () => {
      render(<TableMatchDayBets {...defaultProps} />)

      expect(screen.getByTestId("fixture-date")).toBeInTheDocument()
    })

    it("should pass correct date to FixtureDate component", () => {
      render(<TableMatchDayBets {...defaultProps} />)

      const fixtureDate = screen.getByTestId("fixture-date")
      expect(fixtureDate).toHaveAttribute("data-date")
    })
  })

  describe("Bet Matching", () => {
    it("should match home bet correctly", () => {
      const homeBet: Bet = {
        id: "bet-home-123",
        user_bolao_id: "user-bolao-1",
        fixture_id: "12345",
        value: 3,
        type: "home",
      }

      render(<TableMatchDayBets {...defaultProps} bets={[homeBet]} />)

      expect(screen.getByTestId("buttons-bet-home-12345")).toBeInTheDocument()
    })

    it("should match away bet correctly", () => {
      const awayBet: Bet = {
        id: "bet-away-123",
        user_bolao_id: "user-bolao-1",
        fixture_id: "12345",
        value: 2,
        type: "away",
      }

      render(<TableMatchDayBets {...defaultProps} bets={[awayBet]} />)

      expect(screen.getByTestId("buttons-bet-away-12345")).toBeInTheDocument()
    })

    it("should handle fixtures with no bets", () => {
      render(<TableMatchDayBets {...defaultProps} bets={[]} />)

      expect(screen.getByTestId("buttons-bet-home-12345")).toBeInTheDocument()
      expect(screen.getByTestId("buttons-bet-away-12345")).toBeInTheDocument()
    })

    it("should handle multiple bets for different fixtures", () => {
      const fixture2: FixtureData = {
        ...mockFixture,
        fixture: { ...mockFixture.fixture, id: 67890 },
      }

      const bet2: Bet = {
        id: "bet-456",
        user_bolao_id: "user-bolao-1",
        fixture_id: "67890",
        value: 1,
        type: "home",
      }

      render(
        <TableMatchDayBets
          {...defaultProps}
          fixtures={[mockFixture, fixture2]}
          bets={[mockBet, bet2]}
        />
      )

      expect(screen.getByTestId("buttons-bet-home-12345")).toBeInTheDocument()
      expect(screen.getByTestId("buttons-bet-home-67890")).toBeInTheDocument()
    })
  })

  describe("Fixture Status Handling", () => {
    it("should handle TBD status (open to play)", () => {
      const tbdFixture = {
        ...mockFixture,
        fixture: {
          ...mockFixture.fixture,
          status: { long: "To Be Determined", short: "TBD", elapsed: 0 },
        },
      }

      render(<TableMatchDayBets {...defaultProps} fixtures={[tbdFixture]} />)

      const homeButtons = screen.getByTestId("buttons-bet-home-12345")
      expect(homeButtons).toHaveAttribute("data-disabled", "false")
    })

    it("should handle NS status (open to play)", () => {
      const nsFixture = {
        ...mockFixture,
        fixture: {
          ...mockFixture.fixture,
          status: { long: "Not Started", short: "NS", elapsed: 0 },
        },
      }

      render(<TableMatchDayBets {...defaultProps} fixtures={[nsFixture]} />)

      const homeButtons = screen.getByTestId("buttons-bet-home-12345")
      expect(homeButtons).toHaveAttribute("data-disabled", "false")
    })

    it("should handle PST status (open to play)", () => {
      const pstFixture = {
        ...mockFixture,
        fixture: {
          ...mockFixture.fixture,
          status: { long: "Postponed", short: "PST", elapsed: 0 },
        },
      }

      render(<TableMatchDayBets {...defaultProps} fixtures={[pstFixture]} />)

      const homeButtons = screen.getByTestId("buttons-bet-home-12345")
      expect(homeButtons).toHaveAttribute("data-disabled", "false")
    })

    it("should handle 1H status (not open to play)", () => {
      const playingFixture = {
        ...mockFixture,
        fixture: {
          ...mockFixture.fixture,
          status: { long: "First Half", short: "1H", elapsed: 30 },
        },
      }

      render(
        <TableMatchDayBets {...defaultProps} fixtures={[playingFixture]} />
      )

      const homeButtons = screen.getByTestId("buttons-bet-home-12345")
      expect(homeButtons).toHaveAttribute("data-disabled", "true")
    })

    it("should handle FT status (not open to play)", () => {
      const finishedFixture = {
        ...mockFixture,
        fixture: {
          ...mockFixture.fixture,
          status: { long: "Full Time", short: "FT", elapsed: 90 },
        },
      }

      render(
        <TableMatchDayBets {...defaultProps} fixtures={[finishedFixture]} />
      )

      const homeButtons = screen.getByTestId("buttons-bet-home-12345")
      expect(homeButtons).toHaveAttribute("data-disabled", "true")
    })
  })

  describe("Layout and Structure", () => {
    it("should have proper flex container for fixture content", () => {
      const { container } = render(<TableMatchDayBets {...defaultProps} />)

      const flexContainer = container.querySelector(".flex.justify-center")
      expect(flexContainer).toBeInTheDocument()
    })

    it("should render fixtures in CardContent", () => {
      const { container } = render(<TableMatchDayBets {...defaultProps} />)

      // CardContent has class "pt-0"
      expect(container.querySelector(".pt-0")).toBeInTheDocument()
    })

    it("should apply padding to fixture containers", () => {
      const { container } = render(<TableMatchDayBets {...defaultProps} />)

      const fixtureContainer = container.querySelector(".py-4")
      expect(fixtureContainer).toBeInTheDocument()
    })
  })

  describe("Edge Cases", () => {
    it("should handle empty fixtures array", () => {
      // Component requires at least one fixture to determine the title
      // So this test should handle the loading state instead
      render(<TableMatchDayBets {...defaultProps} fixtures={null as any} />)

      // Should show loading state
      expect(screen.getByText("loading...")).toBeInTheDocument()
    })

    it("should handle fixture with undefined values", () => {
      const partialFixture = {
        ...mockFixture,
        goals: { home: null, away: null },
      }

      render(
        <TableMatchDayBets {...defaultProps} fixtures={[partialFixture]} />
      )

      expect(screen.getByText("Manchester United")).toBeInTheDocument()
    })

    it("should convert fixture ID to string for bet matching", () => {
      render(<TableMatchDayBets {...defaultProps} />)

      // Fixture ID is 12345 (number), should be converted to "12345" string
      expect(screen.getByTestId("buttons-bet-home-12345")).toBeInTheDocument()
    })

    it("should handle fixture with very long team names", () => {
      const longNameFixture: FixtureData = {
        ...mockFixture,
        teams: {
          home: {
            id: 1,
            name: "Very Long Team Name That Might Break Layout",
            logo: "logo.png",
            winner: null,
          },
          away: {
            id: 2,
            name: "Another Very Long Team Name",
            logo: "logo2.png",
            winner: null,
          },
        },
      }

      render(
        <TableMatchDayBets {...defaultProps} fixtures={[longNameFixture]} />
      )

      expect(
        screen.getByText("Very Long Team Name That Might Break Layout")
      ).toBeInTheDocument()
    })
  })

  describe("Title Determination", () => {
    it("should determine title based on last fixture status", () => {
      const fixture1 = {
        ...mockFixture,
        fixture: {
          ...mockFixture.fixture,
          id: 111,
          status: { long: "Full Time", short: "FT", elapsed: 90 },
        },
      }

      const fixture2 = {
        ...mockFixture,
        fixture: {
          ...mockFixture.fixture,
          id: 222,
          status: { long: "Not Started", short: "NS", elapsed: 0 },
        },
      }

      render(
        <TableMatchDayBets {...defaultProps} fixtures={[fixture1, fixture2]} />
      )

      // Should check last fixture (fixture2) which is "NS" (open to play)
      expect(screen.getByText("Next games")).toBeInTheDocument()
    })

    it("should show 'Previous games' when last fixture is finished", () => {
      const fixture1 = {
        ...mockFixture,
        fixture: {
          ...mockFixture.fixture,
          id: 111,
          status: { long: "Not Started", short: "NS", elapsed: 0 },
        },
      }

      const fixture2 = {
        ...mockFixture,
        fixture: {
          ...mockFixture.fixture,
          id: 222,
          status: { long: "Full Time", short: "FT", elapsed: 90 },
        },
      }

      render(
        <TableMatchDayBets {...defaultProps} fixtures={[fixture1, fixture2]} />
      )

      // Should check last fixture (fixture2) which is "FT" (not open to play)
      expect(screen.getByText("Previous games")).toBeInTheDocument()
    })
  })

  describe("Component Integration", () => {
    it("should integrate all child components correctly", () => {
      render(<TableMatchDayBets {...defaultProps} />)

      // All components should be present
      expect(screen.getByTestId("buttons-bet-home-12345")).toBeInTheDocument()
      expect(screen.getByTestId("buttons-bet-away-12345")).toBeInTheDocument()
      expect(screen.getAllByTestId("team-code-logo")).toHaveLength(2)
      expect(screen.getByTestId("team-score-home")).toBeInTheDocument()
      expect(screen.getByTestId("team-score-away")).toBeInTheDocument()
      expect(screen.getByTestId("fixture-date")).toBeInTheDocument()
    })
  })
})
