import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}))

vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND")
  }),
}))

vi.mock("../authRole", () => ({
  getUserRole: vi.fn(),
}))

vi.mock("../data", () => ({
  fetchUserBolao: vi.fn(),
}))

import { requireBolaoAccess, requireBolaoMembership } from "../bolaoAccess"
import { auth } from "@clerk/nextjs/server"
import { notFound } from "next/navigation"
import { getUserRole } from "../authRole"
import { fetchUserBolao } from "../data"

describe("requireBolaoAccess", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns the userId for a member", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: "user-1" } as any)
    vi.mocked(getUserRole).mockResolvedValue("user")
    vi.mocked(fetchUserBolao).mockResolvedValue({
      id: "ub-1",
      bolao_id: "bolao-1",
      user_id: "user-1",
    })

    const result = await requireBolaoAccess("bolao-1")

    expect(result).toBe("user-1")
    expect(fetchUserBolao).toHaveBeenCalledWith({
      bolaoId: "bolao-1",
      userId: "user-1",
    })
    expect(notFound).not.toHaveBeenCalled()
  })

  it("allows an admin without checking membership", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: "admin-1" } as any)
    vi.mocked(getUserRole).mockResolvedValue("admin")

    const result = await requireBolaoAccess("bolao-1")

    expect(result).toBe("admin-1")
    expect(fetchUserBolao).not.toHaveBeenCalled()
    expect(notFound).not.toHaveBeenCalled()
  })

  it("calls notFound for a non-member", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: "stranger" } as any)
    vi.mocked(getUserRole).mockResolvedValue("user")
    vi.mocked(fetchUserBolao).mockResolvedValue(undefined as any)

    await expect(requireBolaoAccess("bolao-1")).rejects.toThrow(
      "NEXT_NOT_FOUND"
    )
    expect(notFound).toHaveBeenCalled()
  })

  it("calls notFound for an unauthenticated caller", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null } as any)

    await expect(requireBolaoAccess("bolao-1")).rejects.toThrow(
      "NEXT_NOT_FOUND"
    )
    expect(notFound).toHaveBeenCalled()
    expect(getUserRole).not.toHaveBeenCalled()
    expect(fetchUserBolao).not.toHaveBeenCalled()
  })
})

describe("requireBolaoMembership", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns the userId for a member", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: "user-1" } as any)
    vi.mocked(fetchUserBolao).mockResolvedValue({
      id: "ub-1",
      bolao_id: "bolao-1",
      user_id: "user-1",
    })

    const result = await requireBolaoMembership("bolao-1")

    expect(result).toBe("user-1")
    expect(notFound).not.toHaveBeenCalled()
  })

  it("calls notFound for an admin who is not a member (no bypass)", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: "admin-1" } as any)
    vi.mocked(getUserRole).mockResolvedValue("admin")
    vi.mocked(fetchUserBolao).mockResolvedValue(undefined as any)

    await expect(requireBolaoMembership("bolao-1")).rejects.toThrow(
      "NEXT_NOT_FOUND"
    )
    expect(notFound).toHaveBeenCalled()
  })

  it("calls notFound for a non-member", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: "stranger" } as any)
    vi.mocked(fetchUserBolao).mockResolvedValue(undefined as any)

    await expect(requireBolaoMembership("bolao-1")).rejects.toThrow(
      "NEXT_NOT_FOUND"
    )
    expect(notFound).toHaveBeenCalled()
  })

  it("calls notFound for an unauthenticated caller", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null } as any)

    await expect(requireBolaoMembership("bolao-1")).rejects.toThrow(
      "NEXT_NOT_FOUND"
    )
    expect(notFound).toHaveBeenCalled()
    expect(fetchUserBolao).not.toHaveBeenCalled()
  })
})
