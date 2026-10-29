import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { fetchHomeCurrentSeason, fetchHomeFixtures, fetchHomeSeason } from "../homeFootball"

const { stored, cacheOptions } = vi.hoisted(() => ({
  stored: new Map<string, unknown>(), cacheOptions: [] as { revalidate: number }[],
}))
vi.mock("next/cache", () => ({
  unstable_cache: (fn: (...args: any[]) => Promise<unknown>, keys: string[], options: { revalidate: number }) => {
    cacheOptions.push(options)
    return async (...args: any[]) => {
      const key = JSON.stringify([keys, args])
      if (stored.has(key)) return stored.get(key)
      const result = await fn(...args)
      stored.set(key, result)
      return result
    }
  },
}))
const fetchMock = vi.fn()
const response = (items: unknown[], errors: unknown = []) => ({ ok: true, json: async () => ({ response: items, errors }) })

describe("public homepage football requests", () => {
  beforeEach(() => {
    stored.clear()
    vi.stubEnv("RAPID_API_KEY", "test-key")
    vi.stubGlobal("fetch", fetchMock)
    fetchMock.mockReset()
  })
  afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals() })

  it("shares validated season data while bypassing cached HTTP error bodies", async () => {
    fetchMock.mockResolvedValue(response([{ seasons: [{ year: 2025, current: false }, { year: 2026, current: true }] }]))
    expect(await fetchHomeCurrentSeason(71)).toEqual({ year: 2026, current: true })
    expect(await fetchHomeCurrentSeason(71)).toEqual({ year: 2026, current: true })
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock.mock.calls[0][1].cache).toBe("no-store")
    expect(cacheOptions).toContainEqual({ revalidate: 3600 })
    expect(cacheOptions).toContainEqual({ revalidate: 300 })
  })

  it("does not cache HTTP 200 rate-limit errors and recovers on a subsequent successful request", async () => {
    fetchMock.mockResolvedValueOnce(response([], { rateLimit: "too many requests" }))
      .mockResolvedValueOnce(response([{ seasons: [{ year: 2026, current: true }] }]))
    await expect(fetchHomeCurrentSeason(71)).rejects.toThrow("Invalid football data response")
    expect(await fetchHomeCurrentSeason(71)).toEqual({ year: 2026, current: true })
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it("loads public fixtures without an unnecessary rounds request", async () => {
    fetchMock.mockResolvedValue(response([]))
    expect(await fetchHomeFixtures("71", 2026)).toEqual([])
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock.mock.calls[0][0]).not.toContain("rounds")
    expect(await fetchHomeSeason("71", 2026)).toEqual({ fixtures: [], rounds: [] })
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it("rejects malformed fixtures without caching them", async () => {
    fetchMock.mockResolvedValueOnce(response([{ fixture: { timestamp: 5 } }])).mockResolvedValueOnce(response([]))
    await expect(fetchHomeFixtures("71", 2026)).rejects.toThrow("Invalid fixture data")
    expect(await fetchHomeFixtures("71", 2026)).toEqual([])
  })

  it("fails gracefully without sending requests when API configuration is absent", async () => {
    vi.stubEnv("RAPID_API_KEY", "")
    await expect(fetchHomeCurrentSeason(71)).rejects.toThrow("not configured")
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
