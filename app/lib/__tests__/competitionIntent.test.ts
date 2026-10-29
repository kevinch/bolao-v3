import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { COMPETITION_INTENT_KEY, rememberCompetition, consumeCompetition, supportedCompetitionId } from "../competitionIntent"

describe("championship signup intent", () => {
  beforeEach(() => { sessionStorage.clear(); vi.useFakeTimers(); vi.setSystemTime(new Date("2026-10-28T12:00:00Z")) })
  afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks() })

  it("survives a redirect, is allowlisted and is consumed only once", () => {
    rememberCompetition("71")
    expect(consumeCompetition()).toBe("71")
    expect(consumeCompetition()).toBeUndefined()
    for (const invalid of ["99999", "https://example.com", ["71"], null, "071"]) {
      expect(supportedCompetitionId(invalid)).toBeUndefined()
      rememberCompetition(invalid)
      expect(consumeCompetition()).toBeUndefined()
    }
  })

  it("expires after an hour and rejects corrupt or future-dated values", () => {
    rememberCompetition("71")
    vi.advanceTimersByTime(3600001)
    expect(consumeCompetition()).toBeUndefined()
    for (const invalid of ['{"competitionId":"71","at":9999999999999}', "null", "{bad json}"]) {
      sessionStorage.setItem(COMPETITION_INTENT_KEY, invalid)
      expect(consumeCompetition()).toBeUndefined()
      expect(sessionStorage.getItem(COMPETITION_INTENT_KEY)).toBeNull()
    }
  })

  it("keeps signup usable when storage is blocked", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("disabled") })
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("disabled") })
    expect(() => rememberCompetition("71")).not.toThrow()
    expect(consumeCompetition()).toBeUndefined()
  })
})
