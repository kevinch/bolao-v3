import { beforeEach, describe, expect, it, vi } from "vitest"
import { getChampionshipPreviews, getPersonalPreviews } from "../controllerHome"
import { fetchHomeCurrentSeason, fetchHomeFixtures, fetchHomeSeason } from "../homeFootball"
import { fetchHomeMemberships, fetchUsersBets } from "../data"
import type { FixtureData, Bolao } from "../definitions"

vi.mock("../homeFootball", () => ({ fetchHomeCurrentSeason: vi.fn(), fetchHomeFixtures: vi.fn(), fetchHomeSeason: vi.fn() }))
vi.mock("../data", () => ({ fetchHomeMemberships: vi.fn(), fetchUsersBets: vi.fn() }))

const fixture = {
  fixture: { id: 1, timestamp: 5000000000, status: { short: "NS" } },
  league: { id: 71, season: 2026, round: "Regular Season - 1" },
} as FixtureData
const membership = (id: string) => ({ id, name: id, competition_id: "71", year: 2026, user_bolao_id: `membership-${id}` }) as Bolao & { user_bolao_id: string }

describe("homepage data", () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(fetchHomeCurrentSeason).mockResolvedValue({ year: 2026, current: true } as any)
    vi.mocked(fetchHomeFixtures).mockResolvedValue([fixture])
    vi.mocked(fetchHomeSeason).mockResolvedValue({ fixtures: [fixture], rounds: [fixture.league.round] })
    vi.mocked(fetchUsersBets).mockResolvedValue([])
  })

  it("only requests fixtures for provider current seasons", async () => {
    vi.mocked(fetchHomeCurrentSeason).mockImplementation(async (id) => id === 71 ? { year: 2026, current: true } as any : null)
    const result = await getChampionshipPreviews()
    expect(fetchHomeFixtures).toHaveBeenCalledExactlyOnceWith("71", 2026)
    expect(fetchHomeSeason).not.toHaveBeenCalled()
    expect(result.championships.map((league) => league.id)).toEqual([71])
  })

  it("preserves successful championships when one provider request fails", async () => {
    vi.mocked(fetchHomeCurrentSeason).mockImplementation(async (id) => {
      if (id === 71) return { year: 2026, current: true } as any
      throw new Error("unavailable")
    })
    expect(await getChampionshipPreviews()).toMatchObject({ hasErrors: true, championships: [{ id: 71 }] })
  })

  it("handles unpublished schedules without reporting a network error", async () => {
    vi.mocked(fetchHomeFixtures).mockResolvedValue([])
    vi.mocked(fetchHomeSeason).mockResolvedValue({ fixtures: [], rounds: [] })
    expect(await getChampionshipPreviews()).toEqual({ championships: [], hasErrors: false })
    vi.mocked(fetchHomeMemberships).mockResolvedValue([membership("a")])
    expect(await getPersonalPreviews("user")).toMatchObject({ previews: [], notices: [{ state: "awaitingData" }] })
  })

  it("returns three eligible championships without requesting separate betting rounds", async () => {
    const result = await getChampionshipPreviews()
    expect(result.championships).toHaveLength(3)
    expect(fetchHomeSeason).not.toHaveBeenCalled()
  })

  it("limits championship discovery to three simultaneous requests", async () => {
    let active = 0
    let peak = 0
    vi.mocked(fetchHomeCurrentSeason).mockImplementation(async () => {
      active++
      peak = Math.max(peak, active)
      await Promise.resolve()
      active--
      return { year: 2026, current: true } as any
    })
    await getChampionshipPreviews()
    expect(peak).toBe(3)
  })

  it("avoids historical fixture and prediction requests for finished bolões", async () => {
    vi.mocked(fetchHomeMemberships).mockResolvedValue([{ ...membership("old"), end: "2000-01-01" }])
    expect(await getPersonalPreviews("user")).toEqual({ hasBoloes: true, previews: [], notices: [] })
    expect(fetchHomeSeason).not.toHaveBeenCalled()
    expect(fetchUsersBets).not.toHaveBeenCalled()
  })

  it("deduplicates schedules while scoping predictions to each membership", async () => {
    vi.mocked(fetchHomeMemberships).mockResolvedValue([membership("a"), membership("b")])
    vi.mocked(fetchUsersBets).mockImplementation(async ([id]) => id === "membership-a" ? [
      { id: "1", user_bolao_id: id, fixture_id: "1", type: "home", value: 0 },
      { id: "2", user_bolao_id: id, fixture_id: "1", type: "away", value: 0 },
    ] : [])
    const result = await getPersonalPreviews("user")
    expect(fetchHomeMemberships).toHaveBeenCalledWith("user")
    expect(fetchHomeSeason).toHaveBeenCalledTimes(1)
    expect(fetchUsersBets).toHaveBeenCalledWith(["membership-a"])
    expect(fetchUsersBets).toHaveBeenCalledWith(["membership-b"])
    expect(result.previews.map((preview) => preview.bolao.id)).toEqual(["b"])
  })

  it("does not claim caught up when a group's predictions fail to load", async () => {
    vi.mocked(fetchHomeMemberships).mockResolvedValue([membership("a"), membership("b")])
    vi.mocked(fetchUsersBets).mockRejectedValueOnce(new Error("DB error")).mockResolvedValueOnce([])
    expect(await getPersonalPreviews("user")).toMatchObject({
      previews: [{ bolao: { id: "b" } }], notices: [{ bolao: { id: "a" }, state: "unavailable" }],
    })
  })

  it("does not fetch fixtures or predictions for users without memberships", async () => {
    vi.mocked(fetchHomeMemberships).mockResolvedValue([])
    expect(await getPersonalPreviews("user")).toEqual({ hasBoloes: false, previews: [], notices: [] })
    expect(fetchHomeSeason).not.toHaveBeenCalled()
    expect(fetchUsersBets).not.toHaveBeenCalled()
  })
})
