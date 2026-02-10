import { describe, it, expect, vi, beforeEach } from "vitest"
import { getBoloes, getUsers, deleteBolaoGroup } from "../controllerAdmin"
import type { Bolao, User, UserBolao, Bet } from "@/app/lib/definitions"

// Mock data fetching functions
vi.mock("@/app/lib/data", () => ({
  fetchBoloes: vi.fn(),
  fetchUsers: vi.fn(),
  fetchUsersBolao: vi.fn(),
  fetchUsersBets: vi.fn(),
}))

// Mock action functions
vi.mock("@/app/lib/actions", () => ({
  deleteBolao: vi.fn(),
  deleteUserBolao: vi.fn(),
  deleteBet: vi.fn(),
}))

describe("controllerAdmin", () => {
  const mockBolao: Bolao = {
    id: "bolao-1",
    name: "Test Bolao",
    competition_id: "comp-1",
    created_by: "user-1",
    created_at: new Date("2024-01-01"),
    year: 2024,
  }

  const mockUser: User = {
    id: "user-1",
    name: "John Doe",
    role: "user",
  }

  const mockUserBolao: UserBolao = {
    id: "user-bolao-1",
    bolao_id: "bolao-1",
    user_id: "user-1",
  }

  const mockBet: Bet = {
    id: "bet-1",
    user_bolao_id: "user-bolao-1",
    fixture_id: "fixture-1",
    value: 2,
    type: "home",
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("getBoloes", () => {
    it("should fetch and return boloes data", async () => {
      const { fetchBoloes } = await import("@/app/lib/data")
      const boloes = [mockBolao, { ...mockBolao, id: "bolao-2" }]

      vi.mocked(fetchBoloes).mockResolvedValue(boloes)

      const result = await getBoloes()

      expect(fetchBoloes).toHaveBeenCalled()
      expect(result).toEqual({ boloes })
    })

    it("should return empty array when no boloes exist", async () => {
      const { fetchBoloes } = await import("@/app/lib/data")

      vi.mocked(fetchBoloes).mockResolvedValue([])

      const result = await getBoloes()

      expect(result).toEqual({ boloes: [] })
    })

    it("should handle multiple boloes", async () => {
      const { fetchBoloes } = await import("@/app/lib/data")
      const boloes = [
        mockBolao,
        { ...mockBolao, id: "bolao-2", name: "Bolao 2" },
        { ...mockBolao, id: "bolao-3", name: "Bolao 3" },
      ]

      vi.mocked(fetchBoloes).mockResolvedValue(boloes)

      const result = await getBoloes()

      expect(result.boloes).toHaveLength(3)
      expect(result.boloes).toEqual(boloes)
    })

    it("should propagate errors from fetchBoloes", async () => {
      const { fetchBoloes } = await import("@/app/lib/data")
      const error = new Error("Database connection failed")

      vi.mocked(fetchBoloes).mockRejectedValue(error)

      await expect(getBoloes()).rejects.toThrow("Database connection failed")
    })
  })

  describe("getUsers", () => {
    it("should fetch and return users data", async () => {
      const { fetchUsers } = await import("@/app/lib/data")
      const users = [mockUser, { ...mockUser, id: "user-2", name: "Jane Doe" }]

      vi.mocked(fetchUsers).mockResolvedValue(users)

      const result = await getUsers()

      expect(fetchUsers).toHaveBeenCalled()
      expect(result).toEqual({ users })
    })

    it("should return empty array when no users exist", async () => {
      const { fetchUsers } = await import("@/app/lib/data")

      vi.mocked(fetchUsers).mockResolvedValue([])

      const result = await getUsers()

      expect(result).toEqual({ users: [] })
    })

    it("should handle multiple users", async () => {
      const { fetchUsers } = await import("@/app/lib/data")
      const users = [
        mockUser,
        { ...mockUser, id: "user-2", name: "Jane Doe", role: "admin" },
        { ...mockUser, id: "user-3", name: "Bob Smith", role: "guest" },
      ]

      vi.mocked(fetchUsers).mockResolvedValue(users)

      const result = await getUsers()

      expect(result.users).toHaveLength(3)
      expect(result.users).toEqual(users)
    })

    it("should propagate errors from fetchUsers", async () => {
      const { fetchUsers } = await import("@/app/lib/data")
      const error = new Error("Database query failed")

      vi.mocked(fetchUsers).mockRejectedValue(error)

      await expect(getUsers()).rejects.toThrow("Database query failed")
    })
  })

  describe("deleteBolaoGroup", () => {
    it("should delete bolao and all related data in correct order", async () => {
      const { fetchUsersBolao, fetchUsersBets } = await import("@/app/lib/data")
      const { deleteBolao, deleteUserBolao, deleteBet } =
        await import("@/app/lib/actions")

      const usersBolao = [
        mockUserBolao,
        { ...mockUserBolao, id: "user-bolao-2", user_id: "user-2" },
      ]
      const bets = [
        mockBet,
        { ...mockBet, id: "bet-2", user_bolao_id: "user-bolao-2" },
      ]

      vi.mocked(fetchUsersBolao).mockResolvedValue(usersBolao as any)
      vi.mocked(fetchUsersBets).mockResolvedValue(bets)
      vi.mocked(deleteBet).mockResolvedValue([])
      vi.mocked(deleteUserBolao).mockResolvedValue([])
      vi.mocked(deleteBolao).mockResolvedValue({
        data: [],
        message: "bolao deleted",
        success: true,
      })

      const result = await deleteBolaoGroup("bolao-1")

      // Verify correct order of operations
      expect(fetchUsersBolao).toHaveBeenCalledWith("bolao-1")
      expect(fetchUsersBets).toHaveBeenCalledWith([
        "user-bolao-1",
        "user-bolao-2",
      ])
      expect(deleteBet).toHaveBeenCalledTimes(2)
      expect(deleteUserBolao).toHaveBeenCalledTimes(2)
      expect(deleteBolao).toHaveBeenCalledWith("bolao-1")
      expect(result).toEqual({
        data: [],
        message: "bolao deleted",
        success: true,
      })
    })

    it("should fetch user_boloes for the given bolao", async () => {
      const { fetchUsersBolao, fetchUsersBets } = await import("@/app/lib/data")
      const { deleteBolao, deleteUserBolao, deleteBet } =
        await import("@/app/lib/actions")

      vi.mocked(fetchUsersBolao).mockResolvedValue([mockUserBolao] as any)
      vi.mocked(fetchUsersBets).mockResolvedValue([mockBet])
      vi.mocked(deleteBet).mockResolvedValue([])
      vi.mocked(deleteUserBolao).mockResolvedValue([])
      vi.mocked(deleteBolao).mockResolvedValue({
        data: [],
        message: "bolao deleted",
        success: true,
      })

      await deleteBolaoGroup("test-bolao-id")

      expect(fetchUsersBolao).toHaveBeenCalledWith("test-bolao-id")
    })

    it("should extract user_bolao IDs correctly", async () => {
      const { fetchUsersBolao, fetchUsersBets } = await import("@/app/lib/data")
      const { deleteBolao, deleteUserBolao, deleteBet } =
        await import("@/app/lib/actions")

      const usersBolao = [
        { id: "ub-1", bolao_id: "bolao-1", user_id: "user-1" },
        { id: "ub-2", bolao_id: "bolao-1", user_id: "user-2" },
        { id: "ub-3", bolao_id: "bolao-1", user_id: "user-3" },
      ]

      vi.mocked(fetchUsersBolao).mockResolvedValue(usersBolao as any)
      vi.mocked(fetchUsersBets).mockResolvedValue([])
      vi.mocked(deleteUserBolao).mockResolvedValue([])
      vi.mocked(deleteBolao).mockResolvedValue({
        data: [],
        message: "bolao deleted",
        success: true,
      })

      await deleteBolaoGroup("bolao-1")

      expect(fetchUsersBets).toHaveBeenCalledWith(["ub-1", "ub-2", "ub-3"])
    })

    it("should fetch bets for user_boloes", async () => {
      const { fetchUsersBolao, fetchUsersBets } = await import("@/app/lib/data")
      const { deleteBolao, deleteUserBolao, deleteBet } =
        await import("@/app/lib/actions")

      vi.mocked(fetchUsersBolao).mockResolvedValue([mockUserBolao] as any)
      vi.mocked(fetchUsersBets).mockResolvedValue([mockBet])
      vi.mocked(deleteBet).mockResolvedValue([])
      vi.mocked(deleteUserBolao).mockResolvedValue([])
      vi.mocked(deleteBolao).mockResolvedValue({
        data: [],
        message: "bolao deleted",
        success: true,
      })

      await deleteBolaoGroup("bolao-1")

      expect(fetchUsersBets).toHaveBeenCalledWith(["user-bolao-1"])
    })

    it("should delete all bets in parallel", async () => {
      const { fetchUsersBolao, fetchUsersBets } = await import("@/app/lib/data")
      const { deleteBolao, deleteUserBolao, deleteBet } =
        await import("@/app/lib/actions")

      const bets = [
        { ...mockBet, id: "bet-1" },
        { ...mockBet, id: "bet-2" },
        { ...mockBet, id: "bet-3" },
      ]

      vi.mocked(fetchUsersBolao).mockResolvedValue([mockUserBolao] as any)
      vi.mocked(fetchUsersBets).mockResolvedValue(bets)
      vi.mocked(deleteBet).mockResolvedValue([])
      vi.mocked(deleteUserBolao).mockResolvedValue([])
      vi.mocked(deleteBolao).mockResolvedValue({
        data: [],
        message: "bolao deleted",
        success: true,
      })

      await deleteBolaoGroup("bolao-1")

      expect(deleteBet).toHaveBeenCalledTimes(3)
      expect(deleteBet).toHaveBeenCalledWith("bet-1")
      expect(deleteBet).toHaveBeenCalledWith("bet-2")
      expect(deleteBet).toHaveBeenCalledWith("bet-3")
    })

    it("should delete all user_boloes in parallel", async () => {
      const { fetchUsersBolao, fetchUsersBets } = await import("@/app/lib/data")
      const { deleteBolao, deleteUserBolao, deleteBet } =
        await import("@/app/lib/actions")

      const usersBolao = [
        { id: "ub-1", bolao_id: "bolao-1", user_id: "user-1" },
        { id: "ub-2", bolao_id: "bolao-1", user_id: "user-2" },
      ]

      vi.mocked(fetchUsersBolao).mockResolvedValue(usersBolao as any)
      vi.mocked(fetchUsersBets).mockResolvedValue([])
      vi.mocked(deleteUserBolao).mockResolvedValue([])
      vi.mocked(deleteBolao).mockResolvedValue({
        data: [],
        message: "bolao deleted",
        success: true,
      })

      await deleteBolaoGroup("bolao-1")

      expect(deleteUserBolao).toHaveBeenCalledTimes(2)
      expect(deleteUserBolao).toHaveBeenCalledWith("ub-1")
      expect(deleteUserBolao).toHaveBeenCalledWith("ub-2")
    })

    it("should delete bets before user_boloes", async () => {
      const { fetchUsersBolao, fetchUsersBets } = await import("@/app/lib/data")
      const { deleteBolao, deleteUserBolao, deleteBet } =
        await import("@/app/lib/actions")

      const deletionOrder: string[] = []

      vi.mocked(fetchUsersBolao).mockResolvedValue([mockUserBolao] as any)
      vi.mocked(fetchUsersBets).mockResolvedValue([mockBet])
      vi.mocked(deleteBet).mockImplementation(async () => {
        deletionOrder.push("bet")
        return []
      })
      vi.mocked(deleteUserBolao).mockImplementation(async () => {
        deletionOrder.push("userBolao")
        return []
      })
      vi.mocked(deleteBolao).mockImplementation(async () => {
        deletionOrder.push("bolao")
        return { data: [], message: "bolao deleted", success: true }
      })

      await deleteBolaoGroup("bolao-1")

      expect(deletionOrder).toEqual(["bet", "userBolao", "bolao"])
    })

    it("should delete user_boloes before bolao", async () => {
      const { fetchUsersBolao, fetchUsersBets } = await import("@/app/lib/data")
      const { deleteBolao, deleteUserBolao } = await import("@/app/lib/actions")

      const deletionOrder: string[] = []

      vi.mocked(fetchUsersBolao).mockResolvedValue([mockUserBolao] as any)
      vi.mocked(fetchUsersBets).mockResolvedValue([])
      vi.mocked(deleteUserBolao).mockImplementation(async () => {
        deletionOrder.push("userBolao")
        return []
      })
      vi.mocked(deleteBolao).mockImplementation(async () => {
        deletionOrder.push("bolao")
        return { data: [], message: "bolao deleted", success: true }
      })

      await deleteBolaoGroup("bolao-1")

      expect(deletionOrder).toEqual(["userBolao", "bolao"])
    })

    it("should return result from deleteBolao", async () => {
      const { fetchUsersBolao, fetchUsersBets } = await import("@/app/lib/data")
      const { deleteBolao, deleteUserBolao, deleteBet } =
        await import("@/app/lib/actions")

      vi.mocked(fetchUsersBolao).mockResolvedValue([mockUserBolao] as any)
      vi.mocked(fetchUsersBets).mockResolvedValue([mockBet])
      vi.mocked(deleteBet).mockResolvedValue([])
      vi.mocked(deleteUserBolao).mockResolvedValue([])
      vi.mocked(deleteBolao).mockResolvedValue({
        data: [],
        message: "Bolao deleted",
        success: true,
      } as any)

      const result = await deleteBolaoGroup("bolao-1")

      expect(result).toEqual({
        data: [],
        message: "Bolao deleted",
        success: true,
      })
    })

    it("should handle bolao with no user_boloes", async () => {
      const { fetchUsersBolao, fetchUsersBets } = await import("@/app/lib/data")
      const { deleteBolao, deleteUserBolao, deleteBet } =
        await import("@/app/lib/actions")

      vi.mocked(fetchUsersBolao).mockResolvedValue([])
      vi.mocked(fetchUsersBets).mockResolvedValue([])
      vi.mocked(deleteBolao).mockResolvedValue({
        data: [],
        message: "bolao deleted",
        success: true,
      })

      await deleteBolaoGroup("bolao-1")

      expect(fetchUsersBets).toHaveBeenCalledWith([])
      expect(deleteBet).not.toHaveBeenCalled()
      expect(deleteUserBolao).not.toHaveBeenCalled()
      expect(deleteBolao).toHaveBeenCalledWith("bolao-1")
    })

    it("should handle user_boloes with no bets", async () => {
      const { fetchUsersBolao, fetchUsersBets } = await import("@/app/lib/data")
      const { deleteBolao, deleteUserBolao, deleteBet } =
        await import("@/app/lib/actions")

      vi.mocked(fetchUsersBolao).mockResolvedValue([mockUserBolao] as any)
      vi.mocked(fetchUsersBets).mockResolvedValue([])
      vi.mocked(deleteUserBolao).mockResolvedValue([])
      vi.mocked(deleteBolao).mockResolvedValue({
        data: [],
        message: "bolao deleted",
        success: true,
      })

      await deleteBolaoGroup("bolao-1")

      expect(deleteBet).not.toHaveBeenCalled()
      expect(deleteUserBolao).toHaveBeenCalledWith("user-bolao-1")
      expect(deleteBolao).toHaveBeenCalledWith("bolao-1")
    })

    it("should handle large number of deletions", async () => {
      const { fetchUsersBolao, fetchUsersBets } = await import("@/app/lib/data")
      const { deleteBolao, deleteUserBolao, deleteBet } =
        await import("@/app/lib/actions")

      // Create 50 user_boloes with 10 bets each = 500 bets
      const usersBolao = Array.from({ length: 50 }, (_, i) => ({
        id: `ub-${i}`,
        bolao_id: "bolao-1",
        user_id: `user-${i}`,
      }))

      const bets = Array.from({ length: 500 }, (_, i) => ({
        id: `bet-${i}`,
        user_bolao_id: `ub-${Math.floor(i / 10)}`,
        fixture_id: `fixture-${i}`,
        value: 1,
        type: "home" as const,
      }))

      vi.mocked(fetchUsersBolao).mockResolvedValue(usersBolao as any)
      vi.mocked(fetchUsersBets).mockResolvedValue(bets)
      vi.mocked(deleteBet).mockResolvedValue([])
      vi.mocked(deleteUserBolao).mockResolvedValue([])
      vi.mocked(deleteBolao).mockResolvedValue({
        data: [],
        message: "bolao deleted",
        success: true,
      })

      await deleteBolaoGroup("bolao-1")

      expect(deleteBet).toHaveBeenCalledTimes(500)
      expect(deleteUserBolao).toHaveBeenCalledTimes(50)
      expect(deleteBolao).toHaveBeenCalledTimes(1)
    })

    it("should propagate errors from fetchUsersBolao", async () => {
      const { fetchUsersBolao } = await import("@/app/lib/data")
      const error = new Error("Failed to fetch user_boloes")

      vi.mocked(fetchUsersBolao).mockRejectedValue(error)

      await expect(deleteBolaoGroup("bolao-1")).rejects.toThrow(
        "Failed to fetch user_boloes"
      )
    })

    it("should propagate errors from fetchUsersBets", async () => {
      const { fetchUsersBolao, fetchUsersBets } = await import("@/app/lib/data")
      const error = new Error("Failed to fetch bets")

      vi.mocked(fetchUsersBolao).mockResolvedValue([mockUserBolao] as any)
      vi.mocked(fetchUsersBets).mockRejectedValue(error)

      await expect(deleteBolaoGroup("bolao-1")).rejects.toThrow(
        "Failed to fetch bets"
      )
    })

    it("should propagate errors from deleteBet", async () => {
      const { fetchUsersBolao, fetchUsersBets } = await import("@/app/lib/data")
      const { deleteBet } = await import("@/app/lib/actions")
      const error = new Error("Failed to delete bet")

      vi.mocked(fetchUsersBolao).mockResolvedValue([mockUserBolao] as any)
      vi.mocked(fetchUsersBets).mockResolvedValue([mockBet])
      vi.mocked(deleteBet).mockRejectedValue(error)

      await expect(deleteBolaoGroup("bolao-1")).rejects.toThrow(
        "Failed to delete bet"
      )
    })

    it("should propagate errors from deleteUserBolao", async () => {
      const { fetchUsersBolao, fetchUsersBets } = await import("@/app/lib/data")
      const { deleteBet, deleteUserBolao } = await import("@/app/lib/actions")
      const error = new Error("Failed to delete user_bolao")

      vi.mocked(fetchUsersBolao).mockResolvedValue([mockUserBolao] as any)
      vi.mocked(fetchUsersBets).mockResolvedValue([mockBet])
      vi.mocked(deleteBet).mockResolvedValue([])
      vi.mocked(deleteUserBolao).mockRejectedValue(error)

      await expect(deleteBolaoGroup("bolao-1")).rejects.toThrow(
        "Failed to delete user_bolao"
      )
    })

    it("should propagate errors from deleteBolao", async () => {
      const { fetchUsersBolao, fetchUsersBets } = await import("@/app/lib/data")
      const { deleteBolao, deleteUserBolao, deleteBet } =
        await import("@/app/lib/actions")
      const error = new Error("Failed to delete bolao")

      vi.mocked(fetchUsersBolao).mockResolvedValue([mockUserBolao] as any)
      vi.mocked(fetchUsersBets).mockResolvedValue([mockBet])
      vi.mocked(deleteBet).mockResolvedValue([])
      vi.mocked(deleteUserBolao).mockResolvedValue([])
      vi.mocked(deleteBolao).mockRejectedValue(error)

      await expect(deleteBolaoGroup("bolao-1")).rejects.toThrow(
        "Failed to delete bolao"
      )
    })
  })
})
