import { describe, it, expect, vi, beforeEach } from "vitest"
import {
  fetchClerkUsersByIds,
  getPlayersFromUsersBolao,
} from "../players"
import type { UserBolao } from "@/app/lib/definitions"

vi.mock("@clerk/nextjs/server", () => ({
  clerkClient: vi.fn(),
}))

describe("players", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("fetchClerkUsersByIds", () => {
    it("returns empty array without calling Clerk when no user ids", async () => {
      const { clerkClient } = await import("@clerk/nextjs/server")
      const mockGetUserList = vi.fn()
      vi.mocked(clerkClient).mockResolvedValue({
        users: { getUserList: mockGetUserList },
      } as any)

      const result = await fetchClerkUsersByIds([])

      expect(result).toEqual([])
      expect(mockGetUserList).not.toHaveBeenCalled()
    })

    it("passes limit matching batch size so more than 10 members are returned", async () => {
      const { clerkClient } = await import("@clerk/nextjs/server")
      const userIds = Array.from({ length: 11 }, (_, i) => `user-${i + 1}`)
      const mockGetUserList = vi.fn().mockResolvedValue({
        data: userIds.map((id) => ({
          id,
          username: id,
          emailAddresses: [{ emailAddress: `${id}@example.com` }],
        })),
      })
      vi.mocked(clerkClient).mockResolvedValue({
        users: { getUserList: mockGetUserList },
      } as any)

      const result = await fetchClerkUsersByIds(userIds)

      expect(mockGetUserList).toHaveBeenCalledTimes(1)
      expect(mockGetUserList).toHaveBeenCalledWith({
        userId: userIds,
        limit: 11,
      })
      expect(result).toHaveLength(11)
    })

    it("batches requests when more than 100 user ids are provided", async () => {
      const { clerkClient } = await import("@clerk/nextjs/server")
      const userIds = Array.from({ length: 101 }, (_, i) => `user-${i + 1}`)
      const mockGetUserList = vi
        .fn()
        .mockImplementation(({ userId }: { userId: string[] }) =>
          Promise.resolve({
            data: userId.map((id) => ({
              id,
              username: id,
              emailAddresses: [{ emailAddress: `${id}@example.com` }],
            })),
          })
        )
      vi.mocked(clerkClient).mockResolvedValue({
        users: { getUserList: mockGetUserList },
      } as any)

      const result = await fetchClerkUsersByIds(userIds)

      expect(mockGetUserList).toHaveBeenCalledTimes(2)
      expect(mockGetUserList).toHaveBeenNthCalledWith(1, {
        userId: userIds.slice(0, 100),
        limit: 100,
      })
      expect(mockGetUserList).toHaveBeenNthCalledWith(2, {
        userId: userIds.slice(100),
        limit: 1,
      })
      expect(result).toHaveLength(101)
    })
  })

  describe("getPlayersFromUsersBolao", () => {
    it("maps all bolao members to player data", async () => {
      const { clerkClient } = await import("@clerk/nextjs/server")
      const usersBolao: UserBolao[] = Array.from({ length: 11 }, (_, i) => ({
        id: `ub-${i + 1}`,
        bolao_id: "bolao-1",
        user_id: `user-${i + 1}`,
      }))
      const mockGetUserList = vi.fn().mockResolvedValue({
        data: usersBolao.map((ub) => ({
          id: ub.user_id,
          username: ub.user_id,
          emailAddresses: [{ emailAddress: `${ub.user_id}@example.com` }],
        })),
      })
      vi.mocked(clerkClient).mockResolvedValue({
        users: { getUserList: mockGetUserList },
      } as any)

      const players = await getPlayersFromUsersBolao(usersBolao)

      expect(players).toHaveLength(11)
      expect(players[0]).toEqual({
        id: "user-1",
        username: "user-1",
        email: "user-1@example.com",
        userBolaoId: "ub-1",
      })
      expect(players[10]).toEqual({
        id: "user-11",
        username: "user-11",
        email: "user-11@example.com",
        userBolaoId: "ub-11",
      })
    })
  })
})
