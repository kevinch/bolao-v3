import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import TeamScore from "../teamScore"
import type { ScoreGroup } from "@/app/lib/definitions"

// Mock utils
vi.mock("@/app/lib/utils", () => ({
  INITIAL_BET_VALUE: ".",
  STATUSES_FINISHED: ["FT", "AET", "PEN", "CANC", ""],
  STATUSES_IN_PLAY: ["1H", "HT", "2H", "ET", "BT", "LIVE"],
}))

describe("TeamScore", () => {
  const mockScore: ScoreGroup = {
    halftime: { home: 1, away: 0 },
    fulltime: { home: 2, away: 1 },
    extratime: { home: null, away: null },
    penalty: { home: null, away: null },
  }

  const mockGoals = {
    home: 2,
    away: 1,
  }

  describe("Finished Match Display", () => {
    it("should display fulltime home score for finished match (FT)", () => {
      render(
        <TeamScore
          score={mockScore}
          type="home"
          status="FT"
          goals={mockGoals}
        />
      )

      expect(screen.getByText("2")).toBeInTheDocument()
    })

    it("should display fulltime away score for finished match (FT)", () => {
      render(
        <TeamScore
          score={mockScore}
          type="away"
          status="FT"
          goals={mockGoals}
        />
      )

      expect(screen.getByText("1")).toBeInTheDocument()
    })

    it("should display score for AET status", () => {
      render(
        <TeamScore
          score={mockScore}
          type="home"
          status="AET"
          goals={mockGoals}
        />
      )

      expect(screen.getByText("2")).toBeInTheDocument()
    })

    it("should display score for PEN status", () => {
      render(
        <TeamScore
          score={mockScore}
          type="away"
          status="PEN"
          goals={mockGoals}
        />
      )

      expect(screen.getByText("1")).toBeInTheDocument()
    })

    it("should display score for CANC status", () => {
      render(
        <TeamScore
          score={mockScore}
          type="home"
          status="CANC"
          goals={mockGoals}
        />
      )

      expect(screen.getByText("2")).toBeInTheDocument()
    })

    it("should display score for empty string status (finished)", () => {
      render(
        <TeamScore score={mockScore} type="home" status="" goals={mockGoals} />
      )

      expect(screen.getByText("2")).toBeInTheDocument()
    })
  })

  describe("In-Play Match Display", () => {
    it("should display current goals for first half (1H)", () => {
      render(
        <TeamScore
          score={mockScore}
          type="home"
          status="1H"
          goals={mockGoals}
        />
      )

      expect(screen.getByText("2")).toBeInTheDocument()
    })

    it("should display current goals for halftime (HT)", () => {
      render(
        <TeamScore
          score={mockScore}
          type="away"
          status="HT"
          goals={mockGoals}
        />
      )

      expect(screen.getByText("1")).toBeInTheDocument()
    })

    it("should display current goals for second half (2H)", () => {
      render(
        <TeamScore
          score={mockScore}
          type="home"
          status="2H"
          goals={mockGoals}
        />
      )

      expect(screen.getByText("2")).toBeInTheDocument()
    })

    it("should display current goals for extra time (ET)", () => {
      render(
        <TeamScore
          score={mockScore}
          type="away"
          status="ET"
          goals={mockGoals}
        />
      )

      expect(screen.getByText("1")).toBeInTheDocument()
    })

    it("should display current goals for penalty shootout (BT)", () => {
      render(
        <TeamScore
          score={mockScore}
          type="home"
          status="BT"
          goals={mockGoals}
        />
      )

      expect(screen.getByText("2")).toBeInTheDocument()
    })

    it("should display current goals for live status (LIVE)", () => {
      render(
        <TeamScore
          score={mockScore}
          type="away"
          status="LIVE"
          goals={mockGoals}
        />
      )

      expect(screen.getByText("1")).toBeInTheDocument()
    })
  })

  describe("Not Started Match Display", () => {
    it("should display dot for not started match (NS)", () => {
      render(
        <TeamScore
          score={mockScore}
          type="home"
          status="NS"
          goals={{ home: null, away: null }}
        />
      )

      expect(screen.getByText(".")).toBeInTheDocument()
    })

    it("should display dot for TBD status", () => {
      render(
        <TeamScore
          score={mockScore}
          type="away"
          status="TBD"
          goals={{ home: null, away: null }}
        />
      )

      expect(screen.getByText(".")).toBeInTheDocument()
    })

    it("should display dot for postponed match (PST)", () => {
      render(
        <TeamScore
          score={mockScore}
          type="home"
          status="PST"
          goals={{ home: null, away: null }}
        />
      )

      expect(screen.getByText(".")).toBeInTheDocument()
    })
  })

  describe("Null Score Handling", () => {
    it("should display dot when fulltime score is null for finished match", () => {
      const scoreWithNull: ScoreGroup = {
        halftime: { home: 0, away: 0 },
        fulltime: { home: null, away: null },
        extratime: { home: null, away: null },
        penalty: { home: null, away: null },
      }

      render(
        <TeamScore
          score={scoreWithNull}
          type="home"
          status="FT"
          goals={mockGoals}
        />
      )

      expect(screen.getByText(".")).toBeInTheDocument()
    })

    it("should display dot when goals is null for in-play match", () => {
      render(
        <TeamScore
          score={mockScore}
          type="home"
          status="1H"
          goals={{ home: null, away: null }}
        />
      )

      expect(screen.getByText(".")).toBeInTheDocument()
    })

    it("should display dot when away goal is null in in-play match", () => {
      render(
        <TeamScore
          score={mockScore}
          type="away"
          status="2H"
          goals={{ home: 2, away: null }}
        />
      )

      expect(screen.getByText(".")).toBeInTheDocument()
    })
  })

  describe("Zero Score Handling", () => {
    it("should display 0 for home team with zero score", () => {
      const zeroScore: ScoreGroup = {
        halftime: { home: 0, away: 0 },
        fulltime: { home: 0, away: 1 },
        extratime: { home: null, away: null },
        penalty: { home: null, away: null },
      }

      render(
        <TeamScore
          score={zeroScore}
          type="home"
          status="FT"
          goals={{ home: 0, away: 1 }}
        />
      )

      expect(screen.getByText("0")).toBeInTheDocument()
    })

    it("should display 0 for away team with zero score", () => {
      const zeroScore: ScoreGroup = {
        halftime: { home: 0, away: 0 },
        fulltime: { home: 1, away: 0 },
        extratime: { home: null, away: null },
        penalty: { home: null, away: null },
      }

      render(
        <TeamScore
          score={zeroScore}
          type="away"
          status="FT"
          goals={{ home: 1, away: 0 }}
        />
      )

      expect(screen.getByText("0")).toBeInTheDocument()
    })

    it("should display 0 for both teams in 0-0 draw", () => {
      const drawScore: ScoreGroup = {
        halftime: { home: 0, away: 0 },
        fulltime: { home: 0, away: 0 },
        extratime: { home: null, away: null },
        penalty: { home: null, away: null },
      }

      const { rerender } = render(
        <TeamScore
          score={drawScore}
          type="home"
          status="FT"
          goals={{ home: 0, away: 0 }}
        />
      )
      expect(screen.getByText("0")).toBeInTheDocument()

      rerender(
        <TeamScore
          score={drawScore}
          type="away"
          status="FT"
          goals={{ home: 0, away: 0 }}
        />
      )
      expect(screen.getByText("0")).toBeInTheDocument()
    })
  })

  describe("High Score Handling", () => {
    it("should display high scores correctly", () => {
      const highScore: ScoreGroup = {
        halftime: { home: 5, away: 4 },
        fulltime: { home: 7, away: 6 },
        extratime: { home: null, away: null },
        penalty: { home: null, away: null },
      }

      render(
        <TeamScore
          score={highScore}
          type="home"
          status="FT"
          goals={{ home: 7, away: 6 }}
        />
      )

      expect(screen.getByText("7")).toBeInTheDocument()
    })

    it("should display double-digit scores", () => {
      const highScore: ScoreGroup = {
        halftime: { home: 5, away: 5 },
        fulltime: { home: 10, away: 8 },
        extratime: { home: null, away: null },
        penalty: { home: null, away: null },
      }

      render(
        <TeamScore
          score={highScore}
          type="home"
          status="FT"
          goals={{ home: 10, away: 8 }}
        />
      )

      expect(screen.getByText("10")).toBeInTheDocument()
    })
  })

  describe("Component Styling", () => {
    it("should have correct CSS classes", () => {
      const { container } = render(
        <TeamScore
          score={mockScore}
          type="home"
          status="FT"
          goals={mockGoals}
        />
      )

      const div = container.querySelector("div")
      expect(div).toHaveClass("mx-2", "content-center", "text-base")
    })

    it("should render score within a div", () => {
      const { container } = render(
        <TeamScore
          score={mockScore}
          type="home"
          status="FT"
          goals={mockGoals}
        />
      )

      const div = container.querySelector("div")
      expect(div).toBeInTheDocument()
      expect(div?.textContent).toBe("2")
    })
  })

  describe("Status Priority and Logic", () => {
    it("should prioritize finished status over in-play", () => {
      // Even if goals are provided, finished status shows fulltime
      render(
        <TeamScore
          score={mockScore}
          type="home"
          status="FT"
          goals={{ home: 5, away: 3 }}
        />
      )

      // Should show fulltime score (2), not goals (5)
      expect(screen.getByText("2")).toBeInTheDocument()
      expect(screen.queryByText("5")).not.toBeInTheDocument()
    })

    it("should check in-play status when not finished", () => {
      render(
        <TeamScore
          score={mockScore}
          type="home"
          status="1H"
          goals={{ home: 3, away: 2 }}
        />
      )

      // Should show current goals (3), not fulltime (2)
      expect(screen.getByText("3")).toBeInTheDocument()
      expect(screen.queryByText("2")).not.toBeInTheDocument()
    })

    it("should default to dot when status is unknown", () => {
      render(
        <TeamScore
          score={mockScore}
          type="home"
          status="UNKNOWN"
          goals={{ home: null, away: null }}
        />
      )

      expect(screen.getByText(".")).toBeInTheDocument()
    })
  })

  describe("Home vs Away Type", () => {
    it("should correctly display home type scores", () => {
      const { rerender } = render(
        <TeamScore
          score={mockScore}
          type="home"
          status="FT"
          goals={mockGoals}
        />
      )
      expect(screen.getByText("2")).toBeInTheDocument()

      rerender(
        <TeamScore
          score={mockScore}
          type="home"
          status="1H"
          goals={{ home: 1, away: 0 }}
        />
      )
      expect(screen.getByText("1")).toBeInTheDocument()
    })

    it("should correctly display away type scores", () => {
      const { rerender } = render(
        <TeamScore
          score={mockScore}
          type="away"
          status="FT"
          goals={mockGoals}
        />
      )
      expect(screen.getByText("1")).toBeInTheDocument()

      rerender(
        <TeamScore
          score={mockScore}
          type="away"
          status="2H"
          goals={{ home: 2, away: 3 }}
        />
      )
      expect(screen.getByText("3")).toBeInTheDocument()
    })
  })

  describe("Edge Cases", () => {
    it("should handle undefined fulltime scores", () => {
      const incompleteScore = {
        halftime: { home: 1, away: 1 },
        fulltime: { home: undefined as any, away: undefined as any },
        extratime: { home: null, away: null },
        penalty: { home: null, away: null },
      }

      render(
        <TeamScore
          score={incompleteScore}
          type="home"
          status="FT"
          goals={mockGoals}
        />
      )

      expect(screen.getByText(".")).toBeInTheDocument()
    })

    it("should handle undefined goals", () => {
      render(
        <TeamScore
          score={mockScore}
          type="home"
          status="1H"
          goals={{ home: undefined as any, away: undefined as any }}
        />
      )

      expect(screen.getByText(".")).toBeInTheDocument()
    })

    it("should convert numbers to strings for display", () => {
      render(
        <TeamScore
          score={mockScore}
          type="home"
          status="FT"
          goals={mockGoals}
        />
      )

      // Should display as string "2", not number 2
      const scoreElement = screen.getByText("2")
      expect(scoreElement.textContent).toBe("2")
    })
  })

  describe("Different Match Scenarios", () => {
    it("should handle match that just started (0-0)", () => {
      const earlyScore: ScoreGroup = {
        halftime: { home: 0, away: 0 },
        fulltime: { home: 0, away: 0 },
        extratime: { home: null, away: null },
        penalty: { home: null, away: null },
      }

      render(
        <TeamScore
          score={earlyScore}
          type="home"
          status="1H"
          goals={{ home: 0, away: 0 }}
        />
      )

      expect(screen.getByText("0")).toBeInTheDocument()
    })

    it("should handle one-sided match", () => {
      const oneSidedScore: ScoreGroup = {
        halftime: { home: 3, away: 0 },
        fulltime: { home: 5, away: 0 },
        extratime: { home: null, away: null },
        penalty: { home: null, away: null },
      }

      render(
        <TeamScore
          score={oneSidedScore}
          type="home"
          status="FT"
          goals={{ home: 5, away: 0 }}
        />
      )

      expect(screen.getByText("5")).toBeInTheDocument()
    })
  })
})
