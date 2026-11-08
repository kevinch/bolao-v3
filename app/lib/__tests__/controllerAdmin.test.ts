import { describe, it, expect, vi, beforeEach } from "vitest"
import { getBoloes, getUsers } from "../controllerAdmin"
import type { Bolao, User } from "@/app/lib/definitions"

// Mock data fetching functions
vi.mock("@/app/lib/data", () => ({
  fetchBoloes: vi.fn(),
  fetchUsers: vi.fn(),
  fetchAdminUsageStats: vi.fn(),
}))

// deleteBolaoGroup is re-exported from actions.ts; stub it so importing
// controllerAdmin does not pull in the real actions module here.
vi.mock("@/app/lib/actions", () => ({
  deleteBolaoGroup: vi.fn(),
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
})
