import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock @vercel/postgres
vi.mock("@vercel/postgres", () => ({
  sql: vi.fn(),
}))

// Mock next/navigation
vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}))

// Mock @clerk/nextjs/server
vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}))

// Mock data fetching
vi.mock("../data", () => ({
  fetchLeague: vi.fn(),
}))

// Mock utils
vi.mock("../utils", () => ({
  getCurrentSeasonObject: vi.fn(),
}))

import {
  createUser,
  navigate,
  createBolao,
  updateBolao,
  createUserBolao,
  createBet,
  updateBet,
  deleteBolao,
  deleteUserBolao,
  deleteBet,
} from "../actions"
import { sql } from "@vercel/postgres"
import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { fetchLeague } from "../data"
import { getCurrentSeasonObject } from "../utils"

describe("actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    console.error = vi.fn()
    console.log = vi.fn()
  })

  describe("createUser", () => {
    it("should create a user successfully", async () => {
      vi.mocked(sql).mockResolvedValue({ rows: [] } as any)

      const result = await createUser({ id: "user-123", role: "user" })

      expect(sql).toHaveBeenCalled()
      const [strings, id, role] = vi.mocked(sql).mock.calls[0]
      expect(strings.join("")).toContain("INSERT INTO users")
      expect(id).toBe("user-123")
      expect(role).toBe("user")
      expect(result).toBeUndefined()
    })

    it("should handle database errors", async () => {
      const error = new Error("Database error")
      vi.mocked(sql).mockRejectedValue(error)

      const result = await createUser({ id: "user-123", role: "user" })

      expect(console.error).toHaveBeenCalledWith("ERROR", error)
      expect(result).toEqual({
        message: "Database Error: failed to Create User.",
      })
    })

    it("should use ON CONFLICT to handle duplicate users", async () => {
      vi.mocked(sql).mockResolvedValue({ rows: [] } as any)

      await createUser({ id: "user-123", role: "admin" })

      const [strings] = vi.mocked(sql).mock.calls[0]
      expect(strings.join("")).toContain("ON CONFLICT (id) DO NOTHING")
    })
  })

  describe("navigate", () => {
    it("should call redirect with the provided path", async () => {
      const path = "/dashboard"

      await navigate(path)

      expect(redirect).toHaveBeenCalledWith(path)
    })

    it("should handle different paths", async () => {
      const paths = ["/", "/admin", "/bolao/123", "/results"]

      for (const path of paths) {
        vi.mocked(redirect).mockClear()
        await navigate(path)
        expect(redirect).toHaveBeenCalledWith(path)
      }
    })
  })

  describe("createBolao", () => {
    beforeEach(() => {
      vi.mocked(auth).mockResolvedValue({ userId: "user-123" } as any)
    })

    it("should create a bolao successfully with current season", async () => {
      const formData = new FormData()
      formData.append("name", "Test Bolao")
      formData.append("competitionId", "2")

      const mockLeague = {
        seasons: [
          { year: 2023, start: "2023-01-01", end: "2023-12-31" },
          { year: 2024, start: "2024-01-01", end: "2024-12-31", current: true },
        ],
      }

      const mockSeason = { year: 2024, start: "2024-01-01", end: "2024-12-31" }

      vi.mocked(fetchLeague).mockResolvedValue(mockLeague as any)
      vi.mocked(getCurrentSeasonObject).mockReturnValue(mockSeason as any)
      vi.mocked(sql).mockResolvedValueOnce({
        rows: [
          {
            id: "bolao-1",
            name: "Test Bolao",
            competition_id: "2",
          },
        ],
      } as any)
      vi.mocked(sql).mockResolvedValueOnce({
        rows: [
          {
            id: "ub-1",
            bolao_id: "bolao-1",
            user_id: "user-123",
          },
        ],
      } as any)

      const result = await createBolao(formData)

      expect(fetchLeague).toHaveBeenCalledWith(2)
      expect(getCurrentSeasonObject).toHaveBeenCalled()
      expect(result).toEqual({ success: true })
    })

    it("should return error when name is not a string", async () => {
      const formData = new FormData()
      formData.append("competitionId", "2")
      // name is missing

      const result = await createBolao(formData)

      expect(result).toEqual({
        success: false,
        message: "Invalid data: name or compeitionId is not a string.",
      })
    })

    it("should return error when competitionId is not a string", async () => {
      const formData = new FormData()
      formData.append("name", "Test Bolao")
      // competitionId is missing

      const result = await createBolao(formData)

      expect(result).toEqual({
        success: false,
        message: "Invalid data: name or compeitionId is not a string.",
      })
    })

    it("should handle database errors during bolao creation", async () => {
      const formData = new FormData()
      formData.append("name", "Test Bolao")
      formData.append("competitionId", "2")

      vi.mocked(fetchLeague).mockResolvedValue({ seasons: [] } as any)
      vi.mocked(getCurrentSeasonObject).mockReturnValue(null as any)
      vi.mocked(sql).mockRejectedValue(new Error("Database error"))

      const result = await createBolao(formData)

      expect(result).toEqual({
        success: false,
        message: "Database Error: failed to create a Bolao.",
      })
    })

    it("should handle userBolao creation failure", async () => {
      const formData = new FormData()
      formData.append("name", "Test Bolao")
      formData.append("competitionId", "2")

      vi.mocked(fetchLeague).mockResolvedValue({ seasons: [] } as any)
      vi.mocked(getCurrentSeasonObject).mockReturnValue(null as any)
      vi.mocked(sql).mockResolvedValueOnce({
        rows: [{ id: "bolao-1" }],
      } as any)
      vi.mocked(sql).mockRejectedValueOnce(new Error("Database error"))

      const result = await createBolao(formData)

      expect(result).toEqual({
        success: false,
        message: "Database Error: failed to create a Bolao.",
      })
    })

    it("should handle bolao creation without current season", async () => {
      const formData = new FormData()
      formData.append("name", "Test Bolao")
      formData.append("competitionId", "2")

      vi.mocked(fetchLeague).mockResolvedValue({ seasons: [] } as any)
      vi.mocked(getCurrentSeasonObject).mockReturnValue(null as any)
      vi.mocked(sql).mockResolvedValueOnce({
        rows: [{ id: "bolao-1" }],
      } as any)
      vi.mocked(sql).mockResolvedValueOnce({
        rows: [{ id: "ub-1", bolao_id: "bolao-1", user_id: "user-123" }],
      } as any)

      const result = await createBolao(formData)

      expect(result).toEqual({ success: true })
    })
  })

  describe("updateBolao", () => {
    it("should update a bolao successfully", async () => {
      vi.mocked(sql).mockResolvedValue({
        rows: [{ id: "bolao-1", name: "Updated Name" }],
      } as any)

      const result = await updateBolao({
        bolaoId: "bolao-1",
        name: "Updated Name",
      })

      expect(sql).toHaveBeenCalled()
      const [strings, name, bolaoId] = vi.mocked(sql).mock.calls[0]
      expect(strings.join("")).toContain("UPDATE boloes")
      expect(name).toBe("Updated Name")
      expect(bolaoId).toBe("bolao-1")
      expect(result).toEqual({ success: true })
    })

    it("should handle database errors", async () => {
      vi.mocked(sql).mockRejectedValue(new Error("Database error"))

      const result = await updateBolao({
        bolaoId: "bolao-1",
        name: "Updated Name",
      })

      expect(result).toEqual({
        success: false,
        message: "Database Error: failed to update a bolao.",
      })
    })
  })

  describe("createUserBolao", () => {
    beforeEach(() => {
      vi.mocked(auth).mockResolvedValue({ userId: "user-123" } as any)
    })

    it("should create a user bolao successfully", async () => {
      vi.mocked(sql).mockResolvedValue({
        rows: [
          {
            id: "ub-1",
            bolao_id: "bolao-1",
            user_id: "user-123",
          },
        ],
      } as any)

      const result = await createUserBolao("bolao-1")

      expect(sql).toHaveBeenCalled()
      const [strings, bolaoId, userId] = vi.mocked(sql).mock.calls[0]
      expect(strings.join("")).toContain("INSERT INTO user_bolao")
      expect(bolaoId).toBe("bolao-1")
      expect(userId).toBe("user-123")
      expect(result).toEqual({
        id: "ub-1",
        bolao_id: "bolao-1",
        user_id: "user-123",
        success: true,
      })
    })

    it("should accept numeric bolaoId", async () => {
      vi.mocked(sql).mockResolvedValue({
        rows: [
          {
            id: "ub-1",
            bolao_id: 1,
            user_id: "user-123",
          },
        ],
      } as any)

      const result = await createUserBolao(1)

      expect(result.success).toBe(true)
    })

    it("should handle database errors", async () => {
      vi.mocked(sql).mockRejectedValue(new Error("Database error"))

      const result = await createUserBolao("bolao-1")

      expect(result).toEqual({
        success: false,
        message: "Database Error: failed to Create UserBolao.",
      })
    })
  })

  describe("createBet", () => {
    it("should create a bet successfully", async () => {
      const mockBet = {
        id: "bet-1",
        user_bolao_id: "ub-1",
        fixture_id: "fixture-1",
        value: 2,
        type: "home",
      }

      vi.mocked(sql).mockResolvedValue({ rows: [mockBet] } as any)

      const result = await createBet({
        userBolaoId: "ub-1",
        fixtureId: "fixture-1",
        value: 2,
        type: "home",
      })

      expect(sql).toHaveBeenCalled()
      const [strings, userBolaoId, fixtureId, value, type] = vi.mocked(sql).mock.calls[0]
      expect(strings.join("")).toContain("INSERT INTO bets")
      expect(userBolaoId).toBe("ub-1")
      expect(fixtureId).toBe("fixture-1")
      expect(value).toBe(2)
      expect(type).toBe("home")
      expect(result).toEqual(mockBet)
    })

    it("should create an away bet", async () => {
      const mockBet = {
        id: "bet-1",
        user_bolao_id: "ub-1",
        fixture_id: "fixture-1",
        value: 1,
        type: "away",
      }

      vi.mocked(sql).mockResolvedValue({ rows: [mockBet] } as any)

      const result = await createBet({
        userBolaoId: "ub-1",
        fixtureId: "fixture-1",
        value: 1,
        type: "away",
      })

      expect(result).toEqual(mockBet)
    })

    it("should handle database errors", async () => {
      vi.mocked(sql).mockRejectedValue(new Error("Database error"))

      const result = await createBet({
        userBolaoId: "ub-1",
        fixtureId: "fixture-1",
        value: 2,
        type: "home",
      })

      expect(result).toEqual({
        message: "Database Error: failed to set a bet.",
      })
    })
  })

  describe("updateBet", () => {
    it("should update a bet successfully", async () => {
      const mockBet = {
        id: "bet-1",
        value: 3,
      }

      vi.mocked(sql).mockResolvedValue({ rows: [mockBet] } as any)

      const result = await updateBet({
        betId: "bet-1",
        value: 3,
      })

      expect(sql).toHaveBeenCalled()
      const [strings, value, betId] = vi.mocked(sql).mock.calls[0]
      expect(strings.join("")).toContain("UPDATE bets")
      expect(value).toBe(3)
      expect(betId).toBe("bet-1")
      expect(result).toEqual(mockBet)
    })

    it("should handle database errors", async () => {
      vi.mocked(sql).mockRejectedValue(new Error("Database error"))

      const result = await updateBet({
        betId: "bet-1",
        value: 3,
      })

      expect(result).toEqual({
        message: "Database Error: failed to set a bet.",
      })
    })
  })

  describe("deleteBolao", () => {
    it("should delete a bolao successfully", async () => {
      const mockData = [{ id: "bolao-1", name: "Test Bolao" }]
      vi.mocked(sql).mockResolvedValue({ rows: [mockData] } as any)

      const result = await deleteBolao("bolao-1")

      expect(sql).toHaveBeenCalled()
      const [strings, bolaoId] = vi.mocked(sql).mock.calls[0]
      expect(strings.join("")).toContain("DELETE FROM boloes")
      expect(bolaoId).toBe("bolao-1")
      expect(result).toEqual({
        data: [mockData],
        message: "bolao deleted",
        success: true,
      })
    })

    it("should handle database errors", async () => {
      vi.mocked(sql).mockRejectedValue(new Error("Database error"))

      const result = await deleteBolao("bolao-1")

      expect(result).toEqual({
        message: "Database Error: failed to delete a bolao.",
        success: false,
      })
    })

    it("should return RETURNING data", async () => {
      const deletedData = [{ id: "bolao-1", name: "Deleted Bolao" }]
      vi.mocked(sql).mockResolvedValue({ rows: deletedData } as any)

      const result = await deleteBolao("bolao-1")

      expect(result.data).toEqual(deletedData)
    })
  })

  describe("deleteUserBolao", () => {
    it("should delete a user bolao successfully", async () => {
      const mockData = [{ id: "ub-1" }]
      vi.mocked(sql).mockResolvedValue({ rows: mockData } as any)

      const result = await deleteUserBolao("ub-1")

      expect(sql).toHaveBeenCalled()
      const [strings, userBolaoId] = vi.mocked(sql).mock.calls[0]
      expect(strings.join("")).toContain("DELETE FROM user_bolao")
      expect(userBolaoId).toBe("ub-1")
      expect(result).toEqual(mockData)
    })

    it("should handle database errors", async () => {
      vi.mocked(sql).mockRejectedValue(new Error("Database error"))

      const result = await deleteUserBolao("ub-1")

      expect(result).toEqual({
        message: "Database Error: failed to delete a user bolao.",
      })
    })
  })

  describe("deleteBet", () => {
    it("should delete a bet successfully", async () => {
      const mockData = [{ id: "bet-1" }]
      vi.mocked(sql).mockResolvedValue({ rows: mockData } as any)

      const result = await deleteBet("bet-1")

      expect(sql).toHaveBeenCalled()
      const [strings, betId] = vi.mocked(sql).mock.calls[0]
      expect(strings.join("")).toContain("DELETE FROM bets")
      expect(betId).toBe("bet-1")
      expect(result).toEqual(mockData)
    })

    it("should handle database errors", async () => {
      vi.mocked(sql).mockRejectedValue(new Error("Database error"))

      const result = await deleteBet("bet-1")

      expect(result).toEqual({
        message: "Database Error: failed to delete a bet.",
      })
    })
  })

  describe("integration scenarios", () => {
    it("should handle createBolao with createUserBolao chain", async () => {
      vi.mocked(auth).mockResolvedValue({ userId: "user-123" } as any)

      const formData = new FormData()
      formData.append("name", "Test Bolao")
      formData.append("competitionId", "2")

      vi.mocked(fetchLeague).mockResolvedValue({ seasons: [] } as any)
      vi.mocked(getCurrentSeasonObject).mockReturnValue(null as any)

      // First SQL call: create bolao
      vi.mocked(sql).mockResolvedValueOnce({
        rows: [{ id: "bolao-1", name: "Test Bolao" }],
      } as any)

      // Second SQL call: create user_bolao
      vi.mocked(sql).mockResolvedValueOnce({
        rows: [
          {
            id: "ub-1",
            bolao_id: "bolao-1",
            user_id: "user-123",
          },
        ],
      } as any)

      const result = await createBolao(formData)

      expect(sql).toHaveBeenCalledTimes(2)
      expect(result.success).toBe(true)
    })

    it("should handle multiple bet operations", async () => {
      // Create bet
      vi.mocked(sql).mockResolvedValueOnce({
        rows: [{ id: "bet-1", value: 2 }],
      } as any)

      const createResult = await createBet({
        userBolaoId: "ub-1",
        fixtureId: "fixture-1",
        value: 2,
        type: "home",
      })

      expect(createResult).toHaveProperty("id", "bet-1")

      // Update bet
      vi.mocked(sql).mockResolvedValueOnce({
        rows: [{ id: "bet-1", value: 3 }],
      } as any)

      const updateResult = await updateBet({
        betId: "bet-1",
        value: 3,
      })

      expect(updateResult).toHaveProperty("value", 3)

      // Delete bet
      vi.mocked(sql).mockResolvedValueOnce({
        rows: [{ id: "bet-1" }],
      } as any)

      const deleteResult = await deleteBet("bet-1")

      expect(deleteResult).toEqual([{ id: "bet-1" }])
    })
  })
})
