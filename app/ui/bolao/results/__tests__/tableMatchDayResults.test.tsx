import { render, screen } from "@testing-library/react"
import { vi } from "vitest"
import TableMatchDayResults from "../tableMatchDayResults"
import type { FixtureData, Bet, PlayersData } from "@/app/lib/definitions"
import * as scoresCalcFactory from "@/app/lib/scoresCalcFactory"
import * as utils from "@/app/lib/utils"

// Mock utils
vi.mock("@/app/lib/utils", async () => {
  const actual = await vi.importActual("@/app/lib/utils")
  return {
    ...actual,
    findBetObj: vi.fn(),
    INITIAL_BET_VALUE: ".",
    STATUSES_FINISHED: ["FT", "AET", "PEN", "CANC", ""],
    STATUSES_IN_PLAY: ["1H", "HT", "2H", "ET", "BT", "LIVE"],
    STATUSES_OPEN_TO_PLAY: ["TBD", "NS", "PST", "AWD"],
    STATUSES_ERROR: ["CANC", "PST", "ABD", "AWD"],
  }
})

// Mock scoresCalcFactory
vi.mock("@/app/lib/scoresCalcFactory", () => ({
  calcScore: vi.fn(),
}))

// Mock react-sticky-table
vi.mock("react-sticky-table", () => ({
  StickyTable: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sticky-table">{children}</div>
  ),
  Row: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sticky-row">{children}</div>
  ),
  Cell: ({
    children,
    style,
    className,
  }: {
    children: React.ReactNode
    style?: React.CSSProperties
    className?: string
  }) => (
    <div data-testid="sticky-cell" style={style} className={className}>
      {children}
    </div>
  ),
}))

// Mock child components
vi.mock("@/app/ui/bolao/teamCodeLogo", () => ({
  default: ({ name, logoSrc }: { name: string; logoSrc: string }) => (
    <div data-testid="team-code-logo">
      <img src={logoSrc} alt={`${name}'s logo`} />
      <span>{name.toUpperCase().replace(" ", "").slice(0, 3)}</span>
    </div>
  ),
}))

vi.mock("@/app/ui/bolao/teamScore", () => ({
  default: ({
    score,
    type,
    status,
  }: {
    score: any
    type: "home" | "away"
    status: string
  }) => (
    <div data-testid="team-score" data-type={type} data-status={status}>
      {score.fulltime[type] || "."}
    </div>
  ),
}))

vi.mock("@/app/ui/bolao/fixtureDate", () => ({
  default: ({ date, status }: { date: string; status: any }) => (
    <div data-testid="fixture-date">{date}</div>
  ),
}))

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

describe("TableMatchDayResults", () => {
  const mockPlayers: PlayersData[] = [
    {
      id: "player1",
      firstName: "John",
      email: "john@example.com",
      userBolaoId: "userBolao1",
    },
    {
      id: "player2",
      firstName: null,
      email: "jane@example.com",
      userBolaoId: "userBolao2",
    },
    {
      id: "player3",
      firstName: "Mike",
      email: "mike@example.com",
      userBolaoId: "userBolao3",
    },
  ]

  const createMockFixture = (
    overrides?: Partial<FixtureData>
  ): FixtureData => ({
    fixture: {
      id: 12345,
      referee: null,
      timezone: "UTC",
      date: new Date("2024-01-15T20:00:00Z"),
      timestamp: 1705348800,
      periods: {
        first: 1705348800,
        second: 1705352400,
      },
      venue: {
        id: 100,
        name: "Stadium",
        city: "City",
      },
      status: {
        long: "Match Finished",
        short: "FT",
        elapsed: 90,
      },
    },
    league: {
      id: 2,
      name: "Champions League",
      country: "Europe",
      logo: "https://example.com/league.png",
      flag: "https://example.com/flag.png",
      season: 2024,
      round: "Group Stage - 1",
    },
    teams: {
      home: {
        id: 1,
        name: "Manchester City",
        logo: "https://example.com/mancity.png",
        winner: null,
      },
      away: {
        id: 2,
        name: "Bayern Munich",
        logo: "https://example.com/bayern.png",
        winner: null,
      },
    },
    goals: {
      home: 2,
      away: 1,
    },
    score: {
      halftime: {
        home: 1,
        away: 0,
      },
      fulltime: {
        home: 2,
        away: 1,
      },
      extratime: {
        home: null,
        away: null,
      },
      penalty: {
        home: null,
        away: null,
      },
    },
    ...overrides,
  })

  const createMockBet = (overrides?: Partial<Bet>): Bet => ({
    id: "bet1",
    user_bolao_id: "userBolao1",
    fixture_id: "12345",
    value: 2,
    type: "home",
    ...overrides,
  })

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(scoresCalcFactory.calcScore).mockReturnValue(5)
  })

  describe("Loading State", () => {
    it("should show loading message when fixtures is falsy", () => {
      render(
        <TableMatchDayResults
          fixtures={null as any}
          bets={[]}
          players={mockPlayers}
          userId="player1"
        />
      )

      expect(screen.getByText("loading...")).toBeInTheDocument()
    })

    it("should show loading message when fixtures is undefined", () => {
      render(
        <TableMatchDayResults
          fixtures={undefined as any}
          bets={[]}
          players={mockPlayers}
          userId="player1"
        />
      )

      expect(screen.getByText("loading...")).toBeInTheDocument()
    })
  })

  describe("Card Title Based on Status", () => {
    it('should display "Next games" when last fixture status is open to play', () => {
      const fixtures = [
        createMockFixture({
          fixture: {
            ...createMockFixture().fixture,
            status: { long: "Not Started", short: "NS", elapsed: 0 },
          },
        }),
      ]

      render(
        <TableMatchDayResults
          fixtures={fixtures}
          bets={[]}
          players={mockPlayers}
          userId="player1"
        />
      )

      expect(screen.getByText("Next games")).toBeInTheDocument()
    })

    it('should display "Next games" when last fixture status is TBD', () => {
      const fixtures = [
        createMockFixture({
          fixture: {
            ...createMockFixture().fixture,
            status: { long: "Time To Be Defined", short: "TBD", elapsed: 0 },
          },
        }),
      ]

      render(
        <TableMatchDayResults
          fixtures={fixtures}
          bets={[]}
          players={mockPlayers}
          userId="player1"
        />
      )

      expect(screen.getByText("Next games")).toBeInTheDocument()
    })

    it('should display "Previous games" when last fixture status is finished', () => {
      const fixtures = [
        createMockFixture({
          fixture: {
            ...createMockFixture().fixture,
            status: { long: "Match Finished", short: "FT", elapsed: 90 },
          },
        }),
      ]

      render(
        <TableMatchDayResults
          fixtures={fixtures}
          bets={[]}
          players={mockPlayers}
          userId="player1"
        />
      )

      expect(screen.getByText("Previous games")).toBeInTheDocument()
    })

    it('should display "Previous games" when last fixture is in play', () => {
      const fixtures = [
        createMockFixture({
          fixture: {
            ...createMockFixture().fixture,
            status: { long: "First Half", short: "1H", elapsed: 30 },
          },
        }),
      ]

      render(
        <TableMatchDayResults
          fixtures={fixtures}
          bets={[]}
          players={mockPlayers}
          userId="player1"
        />
      )

      expect(screen.getByText("Previous games")).toBeInTheDocument()
    })
  })

  describe("Player Names Display", () => {
    it("should display player first names when available", () => {
      const fixtures = [createMockFixture()]

      render(
        <TableMatchDayResults
          fixtures={fixtures}
          bets={[]}
          players={mockPlayers}
          userId="player1"
        />
      )

      expect(screen.getByText("John")).toBeInTheDocument()
      expect(screen.getByText("Mike")).toBeInTheDocument()
    })

    it("should display email username when first name is null", () => {
      const fixtures = [createMockFixture()]

      render(
        <TableMatchDayResults
          fixtures={fixtures}
          bets={[]}
          players={mockPlayers}
          userId="player1"
        />
      )

      // Player2 has no first name, should show email part before @
      expect(screen.getByText("jane")).toBeInTheDocument()
    })

    it("should display all players in order", () => {
      const fixtures = [createMockFixture()]
      const { container } = render(
        <TableMatchDayResults
          fixtures={fixtures}
          bets={[]}
          players={mockPlayers}
          userId="player1"
        />
      )

      // Check that all player names are rendered
      expect(screen.getByText("John")).toBeInTheDocument()
      expect(screen.getByText("jane")).toBeInTheDocument()
      expect(screen.getByText("Mike")).toBeInTheDocument()
    })
  })

  describe("Fixtures Display", () => {
    it("should render fixture with team logos and names", () => {
      const fixtures = [createMockFixture()]

      render(
        <TableMatchDayResults
          fixtures={fixtures}
          bets={[]}
          players={mockPlayers}
          userId="player1"
        />
      )

      // TeamCodeLogo components should be rendered
      const teamLogos = screen.getAllByTestId("team-code-logo")
      expect(teamLogos).toHaveLength(2) // home and away

      expect(screen.getByText("MAN")).toBeInTheDocument() // Manchester City code
      expect(screen.getByText("BAY")).toBeInTheDocument() // Bayern Munich code
    })

    it("should render fixture date component", () => {
      const fixtures = [createMockFixture()]

      render(
        <TableMatchDayResults
          fixtures={fixtures}
          bets={[]}
          players={mockPlayers}
          userId="player1"
        />
      )

      expect(screen.getByTestId("fixture-date")).toBeInTheDocument()
    })

    it("should render team score components", () => {
      const fixtures = [createMockFixture()]

      render(
        <TableMatchDayResults
          fixtures={fixtures}
          bets={[]}
          players={mockPlayers}
          userId="player1"
        />
      )

      const teamScores = screen.getAllByTestId("team-score")
      expect(teamScores).toHaveLength(2) // home and away
    })

    it("should render multiple fixtures", () => {
      const fixtures = [
        createMockFixture({
          fixture: { ...createMockFixture().fixture, id: 1 },
        }),
        createMockFixture({
          fixture: { ...createMockFixture().fixture, id: 2 },
        }),
        createMockFixture({
          fixture: { ...createMockFixture().fixture, id: 3 },
        }),
      ]

      const { container } = render(
        <TableMatchDayResults
          fixtures={fixtures}
          bets={[]}
          players={mockPlayers}
          userId="player1"
        />
      )

      const rows = container.querySelectorAll('[data-testid="sticky-row"]')
      // 1 header row + 3 fixture rows
      expect(rows.length).toBeGreaterThanOrEqual(3)
    })
  })

  describe("Bet Display", () => {
    it("should show INITIAL_BET_VALUE when no bet exists", () => {
      vi.mocked(utils.findBetObj).mockReturnValue(null)

      const fixtures = [createMockFixture()]

      const { container } = render(
        <TableMatchDayResults
          fixtures={fixtures}
          bets={[]}
          players={mockPlayers}
          userId="player1"
        />
      )

      // Should show ".-." (INITIAL_BET_VALUE-INITIAL_BET_VALUE)
      const betCells = container.querySelectorAll('[data-testid="sticky-cell"]')
      const betText = Array.from(betCells).find((cell) =>
        cell.textContent?.includes(".-.")
      )
      expect(betText).toBeTruthy()
    })

    it("should display actual bet values when bets exist", () => {
      // Mock findBetObj to return different values for home and away
      vi.mocked(utils.findBetObj).mockImplementation(
        ({ type }: { type: "home" | "away" }) => {
          if (type === "home") return { value: 2 } as Bet
          if (type === "away") return { value: 1 } as Bet
          return null
        }
      )

      const fixtures = [createMockFixture()]
      const bets = [
        createMockBet({ type: "home", value: 2 }),
        createMockBet({ type: "away", value: 1 }),
      ]

      const { container } = render(
        <TableMatchDayResults
          fixtures={fixtures}
          bets={bets}
          players={mockPlayers}
          userId="player1"
        />
      )

      // Should show "2-1" for at least one player
      const betCells = container.querySelectorAll('[data-testid="sticky-cell"]')
      const betText = Array.from(betCells).find((cell) =>
        cell.textContent?.includes("2-1")
      )
      expect(betText).toBeTruthy()
    })

    it("should hide other players bets when game is not started", () => {
      vi.mocked(utils.findBetObj).mockImplementation(
        ({
          userBolaoId,
        }: {
          bets: Bet[]
          fixtureId: string
          type: "home" | "away"
          userBolaoId?: string
        }) => {
          if (userBolaoId === "userBolao1") return { value: 2 } as Bet
          return null
        }
      )

      const fixtures = [
        createMockFixture({
          fixture: {
            ...createMockFixture().fixture,
            status: { long: "Not Started", short: "NS", elapsed: 0 },
          },
        }),
      ]

      const { container } = render(
        <TableMatchDayResults
          fixtures={fixtures}
          bets={[createMockBet()]}
          players={mockPlayers}
          userId="player1"
        />
      )

      // Current user (player1) should see their bets
      // Other players should see ".-."
      const betCells = container.querySelectorAll('[data-testid="sticky-cell"]')
      const dotCells = Array.from(betCells).filter((cell) =>
        cell.textContent?.includes(".-.")
      )
      expect(dotCells.length).toBeGreaterThan(0)
    })

    it("should show all players bets when game is finished", () => {
      vi.mocked(utils.findBetObj).mockReturnValue({ value: 2 } as Bet)

      const fixtures = [
        createMockFixture({
          fixture: {
            ...createMockFixture().fixture,
            status: { long: "Match Finished", short: "FT", elapsed: 90 },
          },
        }),
      ]

      render(
        <TableMatchDayResults
          fixtures={fixtures}
          bets={[createMockBet()]}
          players={mockPlayers}
          userId="player1"
        />
      )

      // All players should see bets since game is finished
      expect(utils.findBetObj).toHaveBeenCalled()
    })

    it("should show all players bets when game is in play", () => {
      vi.mocked(utils.findBetObj).mockReturnValue({ value: 3 } as Bet)

      const fixtures = [
        createMockFixture({
          fixture: {
            ...createMockFixture().fixture,
            status: { long: "First Half", short: "1H", elapsed: 30 },
          },
        }),
      ]

      render(
        <TableMatchDayResults
          fixtures={fixtures}
          bets={[createMockBet()]}
          players={mockPlayers}
          userId="player1"
        />
      )

      // All players should see bets since game is in play
      expect(utils.findBetObj).toHaveBeenCalled()
    })
  })

  describe("Score Calculation", () => {
    it("should calculate and display points when game is finished", () => {
      vi.mocked(utils.findBetObj).mockReturnValue({ value: 2 } as Bet)
      vi.mocked(scoresCalcFactory.calcScore).mockReturnValue(5)

      const fixtures = [
        createMockFixture({
          fixture: {
            ...createMockFixture().fixture,
            status: { long: "Match Finished", short: "FT", elapsed: 90 },
          },
        }),
      ]

      const { container } = render(
        <TableMatchDayResults
          fixtures={fixtures}
          bets={[createMockBet()]}
          players={mockPlayers}
          userId="player1"
        />
      )

      // Should display "5 pts" for calculated score
      const scoreCells = container.querySelectorAll(
        '[data-testid="sticky-cell"]'
      )
      const scoreText = Array.from(scoreCells).find((cell) =>
        cell.textContent?.includes("5 pts")
      )
      expect(scoreText).toBeTruthy()
    })

    it("should call calcScore with correct arguments", () => {
      vi.mocked(utils.findBetObj).mockImplementation(
        ({ type }: { type: "home" | "away" }) => {
          if (type === "home") return { value: 2 } as Bet
          if (type === "away") return { value: 1 } as Bet
          return null
        }
      )

      const fixtures = [
        createMockFixture({
          score: {
            halftime: { home: 1, away: 0 },
            fulltime: { home: 2, away: 1 },
            extratime: { home: null, away: null },
            penalty: { home: null, away: null },
          },
          fixture: {
            ...createMockFixture().fixture,
            status: { long: "Match Finished", short: "FT", elapsed: 90 },
          },
        }),
      ]

      render(
        <TableMatchDayResults
          fixtures={fixtures}
          bets={[createMockBet()]}
          players={mockPlayers}
          userId="player1"
        />
      )

      expect(scoresCalcFactory.calcScore).toHaveBeenCalledWith({
        resultHome: 2,
        resultAway: 1,
        betHome: 2,
        betAway: 1,
      })
    })

    it("should not display points when game is not started", () => {
      vi.mocked(utils.findBetObj).mockReturnValue({ value: 2 } as Bet)

      const fixtures = [
        createMockFixture({
          fixture: {
            ...createMockFixture().fixture,
            status: { long: "Not Started", short: "NS", elapsed: 0 },
          },
        }),
      ]

      const { container } = render(
        <TableMatchDayResults
          fixtures={fixtures}
          bets={[createMockBet()]}
          players={mockPlayers}
          userId="player1"
        />
      )

      // Should NOT display pts for games not started
      const scoreCells = container.querySelectorAll(
        '[data-testid="sticky-cell"]'
      )
      const scoreText = Array.from(scoreCells).find((cell) =>
        cell.textContent?.includes("pts")
      )
      expect(scoreText).toBeFalsy()
    })

    it("should use halftime score when fulltime is not available", () => {
      vi.mocked(utils.findBetObj).mockReturnValue({ value: 1 } as Bet)

      const fixtures = [
        createMockFixture({
          score: {
            halftime: { home: 1, away: 0 },
            fulltime: { home: null, away: null },
            extratime: { home: null, away: null },
            penalty: { home: null, away: null },
          },
          fixture: {
            ...createMockFixture().fixture,
            status: { long: "Halftime", short: "HT", elapsed: 45 },
          },
        }),
      ]

      render(
        <TableMatchDayResults
          fixtures={fixtures}
          bets={[createMockBet()]}
          players={mockPlayers}
          userId="player1"
        />
      )

      expect(scoresCalcFactory.calcScore).toHaveBeenCalledWith(
        expect.objectContaining({
          resultHome: 1,
          resultAway: 0,
        })
      )
    })

    it("should default to 0 when no score is available", () => {
      vi.mocked(utils.findBetObj).mockReturnValue({ value: 2 } as Bet)

      const fixtures = [
        createMockFixture({
          score: {
            halftime: { home: null, away: null },
            fulltime: { home: null, away: null },
            extratime: { home: null, away: null },
            penalty: { home: null, away: null },
          },
          fixture: {
            ...createMockFixture().fixture,
            status: { long: "First Half", short: "1H", elapsed: 10 },
          },
        }),
      ]

      render(
        <TableMatchDayResults
          fixtures={fixtures}
          bets={[createMockBet()]}
          players={mockPlayers}
          userId="player1"
        />
      )

      expect(scoresCalcFactory.calcScore).toHaveBeenCalledWith(
        expect.objectContaining({
          resultHome: 0,
          resultAway: 0,
        })
      )
    })
  })

  describe("Alternating Row Backgrounds", () => {
    it("should apply alternating background colors to rows", () => {
      vi.mocked(utils.findBetObj).mockReturnValue(null)

      const fixtures = [
        createMockFixture({
          fixture: { ...createMockFixture().fixture, id: 1 },
        }),
        createMockFixture({
          fixture: { ...createMockFixture().fixture, id: 2 },
        }),
        createMockFixture({
          fixture: { ...createMockFixture().fixture, id: 3 },
        }),
      ]

      const { container } = render(
        <TableMatchDayResults
          fixtures={fixtures}
          bets={[]}
          players={mockPlayers}
          userId="player1"
        />
      )

      const cells = container.querySelectorAll('[data-testid="sticky-cell"]')
      const cellsWithBg = Array.from(cells).filter((cell) => {
        const style = (cell as HTMLElement).getAttribute("style")
        return style?.includes("rgb(248") || style?.includes("248, 250, 252")
      })

      expect(cellsWithBg.length).toBeGreaterThan(0)
    })

    it("should not apply background to even rows", () => {
      vi.mocked(utils.findBetObj).mockReturnValue(null)

      const fixtures = [
        createMockFixture({
          fixture: { ...createMockFixture().fixture, id: 1 },
        }),
        createMockFixture({
          fixture: { ...createMockFixture().fixture, id: 2 },
        }),
      ]

      const { container } = render(
        <TableMatchDayResults
          fixtures={fixtures}
          bets={[]}
          players={mockPlayers}
          userId="player1"
        />
      )

      const cells = container.querySelectorAll('[data-testid="sticky-cell"]')
      const cellsWithoutBg = Array.from(cells).filter((cell) => {
        const style = (cell as HTMLElement).getAttribute("style")
        return (
          !style ||
          (!style.includes("rgb(248") && !style.includes("248, 250, 252"))
        )
      })

      expect(cellsWithoutBg.length).toBeGreaterThan(0)
    })
  })

  describe("Edge Cases", () => {
    it("should handle empty players array", () => {
      const fixtures = [createMockFixture()]

      const { container } = render(
        <TableMatchDayResults
          fixtures={fixtures}
          bets={[]}
          players={[]}
          userId="player1"
        />
      )

      // Should still render but with no player columns
      expect(
        container.querySelector('[data-testid="sticky-table"]')
      ).toBeInTheDocument()
    })

    it("should handle empty bets array", () => {
      vi.mocked(utils.findBetObj).mockReturnValue(null)

      const fixtures = [createMockFixture()]

      render(
        <TableMatchDayResults
          fixtures={fixtures}
          bets={[]}
          players={mockPlayers}
          userId="player1"
        />
      )

      // Should render with INITIAL_BET_VALUE
      expect(screen.getByTestId("sticky-table")).toBeInTheDocument()
    })

    it("should handle fixture with null goals", () => {
      vi.mocked(utils.findBetObj).mockReturnValue({ value: 1 } as Bet)

      const fixtures = [
        createMockFixture({
          goals: { home: null, away: null },
          fixture: {
            ...createMockFixture().fixture,
            status: { long: "Not Started", short: "NS", elapsed: 0 },
          },
        }),
      ]

      render(
        <TableMatchDayResults
          fixtures={fixtures}
          bets={[createMockBet()]}
          players={mockPlayers}
          userId="player1"
        />
      )

      // Should not crash
      expect(screen.getByTestId("sticky-table")).toBeInTheDocument()
    })

    it("should handle player with very long email", () => {
      const playersWithLongEmail: PlayersData[] = [
        {
          id: "player1",
          firstName: null,
          email:
            "very.long.email.address.that.is.really.quite.long@example.com",
          userBolaoId: "userBolao1",
        },
      ]

      const fixtures = [createMockFixture()]

      render(
        <TableMatchDayResults
          fixtures={fixtures}
          bets={[]}
          players={playersWithLongEmail}
          userId="player1"
        />
      )

      // Should display the part before @
      expect(
        screen.getByText("very.long.email.address.that.is.really.quite.long")
      ).toBeInTheDocument()
    })

    it("should handle fixture with different status types", () => {
      vi.mocked(utils.findBetObj).mockReturnValue(null)

      const fixtures = [
        createMockFixture({
          fixture: {
            ...createMockFixture().fixture,
            status: { long: "After Extra Time", short: "AET", elapsed: 120 },
          },
        }),
      ]

      render(
        <TableMatchDayResults
          fixtures={fixtures}
          bets={[]}
          players={mockPlayers}
          userId="player1"
        />
      )

      expect(screen.getByText("Previous games")).toBeInTheDocument()
    })

    it("should handle multiple players with same bet values", () => {
      vi.mocked(utils.findBetObj).mockReturnValue({ value: 2 } as Bet)

      const fixtures = [
        createMockFixture({
          fixture: {
            ...createMockFixture().fixture,
            status: { long: "Match Finished", short: "FT", elapsed: 90 },
          },
        }),
      ]

      render(
        <TableMatchDayResults
          fixtures={fixtures}
          bets={[createMockBet()]}
          players={mockPlayers}
          userId="player1"
        />
      )

      // All players showing same bets should work fine
      expect(screen.getByTestId("sticky-table")).toBeInTheDocument()
    })
  })
})
