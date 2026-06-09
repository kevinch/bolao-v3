import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("@vercel/postgres", () => ({
  sql: vi.fn(),
}))

import { sql } from "@vercel/postgres"
import { fetchBetPageContext } from "../data"

describe("fetchBetPageContext", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    console.error = vi.fn()
  })

  it("returns combined bolao, membership, and champion pick", async () => {
    vi.mocked(sql).mockResolvedValue({
      rows: [
        {
          id: "bolao-1",
          name: "Copa 2026",
          competition_id: "1",
          created_by: "user-1",
          created_at: new Date("2024-01-01"),
          year: 2026,
          start: "2026-06-01",
          end: "2026-07-15",
          user_bolao_id: "ub-1",
          bolao_id: "bolao-1",
          user_id: "user-1",
          champion_pick_id: "cp-1",
          team_id: 10,
          team_name: "Brazil",
          team_logo: "b.png",
          champion_pick_created_at: "2026-06-01",
          champion_pick_updated_at: "2026-06-01",
        },
      ],
    } as any)

    await expect(fetchBetPageContext({ bolaoId: "bolao-1", userId: "user-1" }))
      .resolves.toEqual({
        bolao: {
          id: "bolao-1",
          name: "Copa 2026",
          competition_id: "1",
          created_by: "user-1",
          created_at: new Date("2024-01-01"),
          year: 2026,
          start: "2026-06-01",
          end: "2026-07-15",
        },
        userBolao: {
          id: "ub-1",
          bolao_id: "bolao-1",
          user_id: "user-1",
        },
        championPick: {
          id: "cp-1",
          user_bolao_id: "ub-1",
          team_id: 10,
          team_name: "Brazil",
          team_logo: "b.png",
          created_at: "2026-06-01",
          updated_at: "2026-06-01",
        },
      })
  })

  it("returns null when user is not in bolao", async () => {
    vi.mocked(sql).mockResolvedValue({ rows: [] } as any)

    await expect(
      fetchBetPageContext({ bolaoId: "bolao-1", userId: "user-1" })
    ).resolves.toBeNull()
  })
})
