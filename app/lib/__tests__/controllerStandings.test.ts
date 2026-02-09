import { describe, it, expect, vi, beforeEach } from "vitest"
import { getData } from "../controllerStandings"
import type { Bolao, StandingsLeague } from "@/app/lib/definitions"

// Mock data fetching functions
vi.mock("@/app/lib/data", () => ({
  fetchBolao: vi.fn(),
  fetchStandings: vi.fn(),
}))

describe("controllerStandings", () => {
  const mockBolao: Bolao = {
    id: "bolao-1",
    name: "Test Bolao",
    competition_id: "2",
    created_by: "user-1",
    created_at: new Date("2024-01-01"),
    year: 2024,
    start: "2024-01-01",
    end: "2024-12-31",
  }

  const mockStandingsLeague: StandingsLeague = {
    id: 2,
    name: "Champions League",
    country: "World",
    logo: "https://example.com/logo.png",
    flag: "https://example.com/flag.png",
    season: 2024,
    standings: [],
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("getData", () => {
    it("should fetch and return bolao and standings data", async () => {
      const { fetchBolao, fetchStandings } = await import("@/app/lib/data")

      vi.mocked(fetchBolao).mockResolvedValue(mockBolao as any)
      vi.mocked(fetchStandings).mockResolvedValue(mockStandingsLeague)

      const result = await getData("bolao-1")

      expect(fetchBolao).toHaveBeenCalledWith("bolao-1")
      expect(fetchStandings).toHaveBeenCalledWith({
        leagueId: "2",
        year: 2024,
      })
      expect(result).toEqual({
        bolao: mockBolao,
        standingsLeague: mockStandingsLeague,
      })
    })

    it("should extract year from bolao", async () => {
      const { fetchBolao, fetchStandings } = await import("@/app/lib/data")
      const bolaoWith2023 = { ...mockBolao, year: 2023 }

      vi.mocked(fetchBolao).mockResolvedValue(bolaoWith2023 as any)
      vi.mocked(fetchStandings).mockResolvedValue(mockStandingsLeague)

      await getData("bolao-1")

      expect(fetchStandings).toHaveBeenCalledWith({
        leagueId: "2",
        year: 2023,
      })
    })

    it("should extract competition_id as leagueId", async () => {
      const { fetchBolao, fetchStandings } = await import("@/app/lib/data")
      const bolaoWithDifferentCompetition = {
        ...mockBolao,
        competition_id: "39",
      }

      vi.mocked(fetchBolao).mockResolvedValue(
        bolaoWithDifferentCompetition as any
      )
      vi.mocked(fetchStandings).mockResolvedValue(mockStandingsLeague)

      await getData("bolao-1")

      expect(fetchStandings).toHaveBeenCalledWith({
        leagueId: "39",
        year: 2024,
      })
    })

    it("should propagate errors from fetchBolao", async () => {
      const { fetchBolao } = await import("@/app/lib/data")
      const error = new Error("Failed to fetch bolao")

      vi.mocked(fetchBolao).mockRejectedValue(error)

      await expect(getData("bolao-1")).rejects.toThrow("Failed to fetch bolao")
    })

    it("should propagate errors from fetchStandings", async () => {
      const { fetchBolao, fetchStandings } = await import("@/app/lib/data")
      const error = new Error("Failed to fetch standings")

      vi.mocked(fetchBolao).mockResolvedValue(mockBolao as any)
      vi.mocked(fetchStandings).mockRejectedValue(error)

      await expect(getData("bolao-1")).rejects.toThrow(
        "Failed to fetch standings"
      )
    })

    it("should handle standings with multiple groups", async () => {
      const { fetchBolao, fetchStandings } = await import("@/app/lib/data")
      const standingsWithGroups = {
        ...mockStandingsLeague,
        standings: [[], [], []] as any,
      }

      vi.mocked(fetchBolao).mockResolvedValue(mockBolao as any)
      vi.mocked(fetchStandings).mockResolvedValue(standingsWithGroups)

      const result = await getData("bolao-1")

      expect(result.standingsLeague.standings).toHaveLength(3)
    })

    it("should handle empty standings", async () => {
      const { fetchBolao, fetchStandings } = await import("@/app/lib/data")
      const emptyStandings = {
        ...mockStandingsLeague,
        standings: [],
      }

      vi.mocked(fetchBolao).mockResolvedValue(mockBolao as any)
      vi.mocked(fetchStandings).mockResolvedValue(emptyStandings)

      const result = await getData("bolao-1")

      expect(result.standingsLeague.standings).toHaveLength(0)
    })
  })
})
