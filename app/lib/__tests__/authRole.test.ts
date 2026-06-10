import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("@clerk/nextjs/server", () => ({
  clerkClient: vi.fn(),
}))

import { clerkClient } from "@clerk/nextjs/server"
import { getUserRole } from "../authRole"

describe("getUserRole", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    console.error = vi.fn()
  })

  it("returns role from Clerk privateMetadata", async () => {
    vi.mocked(clerkClient).mockResolvedValue({
      users: {
        getUser: vi.fn().mockResolvedValue({
          privateMetadata: { role: "admin" },
        }),
      },
    } as any)

    await expect(getUserRole("user-1")).resolves.toBe("admin")
  })

  it("returns guest when Clerk has no role", async () => {
    vi.mocked(clerkClient).mockResolvedValue({
      users: {
        getUser: vi.fn().mockResolvedValue({
          privateMetadata: {},
        }),
      },
    } as any)

    await expect(getUserRole("user-1")).resolves.toBe("guest")
  })

  it("returns guest when Clerk fails", async () => {
    vi.mocked(clerkClient).mockRejectedValue(new Error("clerk down"))

    await expect(getUserRole("user-1")).resolves.toBe("guest")
  })
})
