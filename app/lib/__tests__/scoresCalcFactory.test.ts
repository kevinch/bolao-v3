import { describe, it, expect } from "vitest"
import {
  calcScore,
  isScore1,
  isScore2,
  isScore3,
  isScore4,
  isScore5,
  isScore6,
} from "../scoresCalcFactory"
import { ScoreArgs } from "../definitions"

describe("scoresCalcFactory", () => {
  describe("isScore1 - Perfect score", () => {
    it("should return true when both home and away scores match exactly", () => {
      const data: ScoreArgs = {
        resultHome: 3,
        resultAway: 0,
        betHome: 3,
        betAway: 0,
      }
      expect(isScore1(data)).toBe(true)
    })

    it("should return true for a draw with exact match", () => {
      const data: ScoreArgs = {
        resultHome: 2,
        resultAway: 2,
        betHome: 2,
        betAway: 2,
      }
      expect(isScore1(data)).toBe(true)
    })

    it("should return false when only home score matches", () => {
      const data: ScoreArgs = {
        resultHome: 3,
        resultAway: 0,
        betHome: 3,
        betAway: 1,
      }
      expect(isScore1(data)).toBe(false)
    })

    it("should return false when only away score matches", () => {
      const data: ScoreArgs = {
        resultHome: 3,
        resultAway: 0,
        betHome: 2,
        betAway: 0,
      }
      expect(isScore1(data)).toBe(false)
    })
  })

  describe("isScore2 - Score of the winner", () => {
    it("should return true when home team wins and home score matches", () => {
      const data: ScoreArgs = {
        resultHome: 3,
        resultAway: 0,
        betHome: 3,
        betAway: 1,
      }
      expect(isScore2(data)).toBe(true)
    })

    it("should return true when away team wins and away score matches", () => {
      const data: ScoreArgs = {
        resultHome: 0,
        resultAway: 2,
        betHome: 1,
        betAway: 2,
      }
      expect(isScore2(data)).toBe(true)
    })

    it("should return false when winner's score doesn't match", () => {
      const data: ScoreArgs = {
        resultHome: 3,
        resultAway: 0,
        betHome: 2,
        betAway: 1,
      }
      expect(isScore2(data)).toBe(false)
    })

    it("should return false for draws", () => {
      const data: ScoreArgs = {
        resultHome: 1,
        resultAway: 1,
        betHome: 1,
        betAway: 1,
      }
      expect(isScore2(data)).toBe(false)
    })

    it("should return false when winner is wrong but score matches", () => {
      const data: ScoreArgs = {
        resultHome: 3,
        resultAway: 1,
        betHome: 1,
        betAway: 3,
      }
      expect(isScore2(data)).toBe(false)
    })
  })

  describe("isScore3 - Winner and goal difference", () => {
    it("should return true when winner and goal difference match", () => {
      const data: ScoreArgs = {
        resultHome: 2,
        resultAway: 1,
        betHome: 1,
        betAway: 0,
      }
      expect(isScore3(data)).toBe(true)
    })

    it("should return true for away winner with matching goal difference", () => {
      const data: ScoreArgs = {
        resultHome: 1,
        resultAway: 3,
        betHome: 0,
        betAway: 2,
      }
      expect(isScore3(data)).toBe(true)
    })

    it("should return false when winner matches but goal difference doesn't", () => {
      const data: ScoreArgs = {
        resultHome: 3,
        resultAway: 0,
        betHome: 2,
        betAway: 0,
      }
      expect(isScore3(data)).toBe(false)
    })

    it("should return false for draws", () => {
      const data: ScoreArgs = {
        resultHome: 1,
        resultAway: 1,
        betHome: 2,
        betAway: 2,
      }
      expect(isScore3(data)).toBe(false)
    })
  })

  describe("isScore4 - Draw (not perfect)", () => {
    it("should return true for non-perfect draw", () => {
      const data: ScoreArgs = {
        resultHome: 1,
        resultAway: 1,
        betHome: 0,
        betAway: 0,
      }
      expect(isScore4(data)).toBe(true)
    })

    it("should return true for another non-perfect draw", () => {
      const data: ScoreArgs = {
        resultHome: 2,
        resultAway: 2,
        betHome: 1,
        betAway: 1,
      }
      expect(isScore4(data)).toBe(true)
    })

    it("should return false for perfect draw (covered by isScore1)", () => {
      const data: ScoreArgs = {
        resultHome: 1,
        resultAway: 1,
        betHome: 1,
        betAway: 1,
      }
      expect(isScore4(data)).toBe(false)
    })

    it("should return false when result is not a draw", () => {
      const data: ScoreArgs = {
        resultHome: 2,
        resultAway: 1,
        betHome: 0,
        betAway: 0,
      }
      expect(isScore4(data)).toBe(false)
    })

    it("should return false when bet is not a draw", () => {
      const data: ScoreArgs = {
        resultHome: 1,
        resultAway: 1,
        betHome: 2,
        betAway: 0,
      }
      expect(isScore4(data)).toBe(false)
    })
  })

  describe("isScore5 - Winner and loser's score", () => {
    it("should return true when home wins and away (loser) score matches", () => {
      const data: ScoreArgs = {
        resultHome: 3,
        resultAway: 1,
        betHome: 2,
        betAway: 1,
      }
      expect(isScore5(data)).toBe(true)
    })

    it("should return true when away wins and home (loser) score matches", () => {
      const data: ScoreArgs = {
        resultHome: 1,
        resultAway: 3,
        betHome: 1,
        betAway: 2,
      }
      expect(isScore5(data)).toBe(true)
    })

    it("should return false when winner matches but loser's score doesn't", () => {
      const data: ScoreArgs = {
        resultHome: 3,
        resultAway: 1,
        betHome: 2,
        betAway: 0,
      }
      expect(isScore5(data)).toBe(false)
    })

    it("should return false for draws", () => {
      const data: ScoreArgs = {
        resultHome: 1,
        resultAway: 1,
        betHome: 2,
        betAway: 2,
      }
      expect(isScore5(data)).toBe(false)
    })
  })

  describe("isScore6 - Just the winner", () => {
    it("should return true when only winner matches (home wins)", () => {
      const data: ScoreArgs = {
        resultHome: 1,
        resultAway: 0,
        betHome: 3,
        betAway: 2,
      }
      expect(isScore6(data)).toBe(true)
    })

    it("should return true when only winner matches (away wins)", () => {
      const data: ScoreArgs = {
        resultHome: 0,
        resultAway: 1,
        betHome: 2,
        betAway: 3,
      }
      expect(isScore6(data)).toBe(true)
    })

    it("should return true for any home win bet when home wins", () => {
      const data: ScoreArgs = {
        resultHome: 5,
        resultAway: 2,
        betHome: 1,
        betAway: 0,
      }
      expect(isScore6(data)).toBe(true)
    })

    it("should return false when winner doesn't match", () => {
      const data: ScoreArgs = {
        resultHome: 1,
        resultAway: 0,
        betHome: 0,
        betAway: 2,
      }
      expect(isScore6(data)).toBe(false)
    })

    it("should return false for draws", () => {
      const data: ScoreArgs = {
        resultHome: 1,
        resultAway: 1,
        betHome: 2,
        betAway: 0,
      }
      expect(isScore6(data)).toBe(false)
    })
  })

  describe("calcScore - Score calculation", () => {
    it("should return 200 points for perfect score", () => {
      const data: ScoreArgs = {
        resultHome: 3,
        resultAway: 0,
        betHome: 3,
        betAway: 0,
      }
      expect(calcScore(data)).toBe(200)
    })

    it("should return 150 points for winner's score match", () => {
      const data: ScoreArgs = {
        resultHome: 3,
        resultAway: 0,
        betHome: 3,
        betAway: 1,
      }
      expect(calcScore(data)).toBe(150)
    })

    it("should return 100 points for winner and goal difference", () => {
      const data: ScoreArgs = {
        resultHome: 2,
        resultAway: 1,
        betHome: 1,
        betAway: 0,
      }
      expect(calcScore(data)).toBe(100)
    })

    it("should return 150 points for non-perfect draw", () => {
      const data: ScoreArgs = {
        resultHome: 1,
        resultAway: 1,
        betHome: 0,
        betAway: 0,
      }
      expect(calcScore(data)).toBe(150)
    })

    it("should return 120 points for winner and loser's score", () => {
      const data: ScoreArgs = {
        resultHome: 3,
        resultAway: 1,
        betHome: 2,
        betAway: 1,
      }
      expect(calcScore(data)).toBe(120)
    })

    it("should return 80 points for just the winner", () => {
      const data: ScoreArgs = {
        resultHome: 3,
        resultAway: 0,
        betHome: 2,
        betAway: 1,
      }
      expect(calcScore(data)).toBe(80)
    })

    it("should return 0 points when winner doesn't match", () => {
      const data: ScoreArgs = {
        resultHome: 3,
        resultAway: 1,
        betHome: 0,
        betAway: 2,
      }
      expect(calcScore(data)).toBe(0)
    })

    it("should return 0 points when betHome is null", () => {
      const data: ScoreArgs = {
        resultHome: 3,
        resultAway: 1,
        betHome: null as any,
        betAway: 2,
      }
      expect(calcScore(data)).toBe(0)
    })

    it("should return 0 points when betAway is null", () => {
      const data: ScoreArgs = {
        resultHome: 3,
        resultAway: 1,
        betHome: 2,
        betAway: null as any,
      }
      expect(calcScore(data)).toBe(0)
    })

    it("should return 0 points when resultHome is undefined", () => {
      const data: ScoreArgs = {
        resultHome: undefined as any,
        resultAway: 1,
        betHome: 2,
        betAway: 1,
      }
      expect(calcScore(data)).toBe(0)
    })

    it("should return 0 points when resultAway is undefined", () => {
      const data: ScoreArgs = {
        resultHome: 3,
        resultAway: undefined as any,
        betHome: 2,
        betAway: 1,
      }
      expect(calcScore(data)).toBe(0)
    })

    it("should return 0 points when all values are null", () => {
      const data: ScoreArgs = {
        resultHome: null as any,
        resultAway: null as any,
        betHome: null as any,
        betAway: null as any,
      }
      expect(calcScore(data)).toBe(0)
    })
  })

  describe("calcScore - Priority order", () => {
    it("should prioritize perfect score over other matches", () => {
      // This is implicitly tested, but let's be explicit
      const data: ScoreArgs = {
        resultHome: 2,
        resultAway: 1,
        betHome: 2,
        betAway: 1,
      }
      // This matches isScore1, isScore2, isScore3, isScore5, isScore6
      // but should return score1 (200)
      expect(calcScore(data)).toBe(200)
    })

    it("should prioritize winner's score over goal difference", () => {
      const data: ScoreArgs = {
        resultHome: 3,
        resultAway: 1,
        betHome: 3,
        betAway: 0,
      }
      // This matches isScore2 (150) and should not return isScore3
      expect(calcScore(data)).toBe(150)
    })
  })

  describe("calcScore - Edge cases", () => {
    it("should handle 0-0 perfect draw", () => {
      const data: ScoreArgs = {
        resultHome: 0,
        resultAway: 0,
        betHome: 0,
        betAway: 0,
      }
      expect(calcScore(data)).toBe(200)
    })

    it("should handle high scoring games", () => {
      const data: ScoreArgs = {
        resultHome: 7,
        resultAway: 5,
        betHome: 7,
        betAway: 5,
      }
      expect(calcScore(data)).toBe(200)
    })

    it("should handle away team winning with large margin", () => {
      const data: ScoreArgs = {
        resultHome: 0,
        resultAway: 5,
        betHome: 1,
        betAway: 5,
      }
      expect(calcScore(data)).toBe(150)
    })

    it("should correctly calculate when bet is draw but result is not", () => {
      const data: ScoreArgs = {
        resultHome: 2,
        resultAway: 1,
        betHome: 1,
        betAway: 1,
      }
      expect(calcScore(data)).toBe(0)
    })
  })
})

