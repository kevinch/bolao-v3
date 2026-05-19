import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}))

vi.mock("next/server", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next/server")>()

  return {
    ...actual,
  }
})

import { revalidatePath, revalidateTag } from "next/cache"
import { POST } from "../route"

describe("api/revalidate route", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.unstubAllEnvs()
  })

  it("returns 500 when the revalidation secret is missing", async () => {
    const response = await POST(
      new Request("http://localhost/api/revalidate", { method: "POST" })
    )

    expect(response.status).toBe(500)
    expect(response.headers.get("cache-control")).toBe(
      "private, no-store, max-age=0"
    )
    await expect(response.json()).resolves.toEqual({
      error: "REVALIDATE_SECRET is not configured.",
    })
  })

  it("returns 401 when the provided secret is invalid", async () => {
    vi.stubEnv("REVALIDATE_SECRET", "top-secret")

    const response = await POST(
      new Request("http://localhost/api/revalidate", {
        method: "POST",
        body: JSON.stringify({ secret: "wrong-secret" }),
      })
    )

    expect(response.status).toBe(401)
    expect(response.headers.get("cache-control")).toBe(
      "private, no-store, max-age=0"
    )
    await expect(response.json()).resolves.toEqual({
      error: "Unauthorized.",
    })
  })

  it("revalidates the default prismic tag with a valid header secret", async () => {
    vi.stubEnv("REVALIDATE_SECRET", "top-secret")

    const response = await POST(
      new Request("http://localhost/api/revalidate", {
        method: "POST",
        headers: {
          "x-revalidate-secret": "top-secret",
        },
      })
    )

    expect(response.status).toBe(200)
    expect(response.headers.get("cache-control")).toBe(
      "private, no-store, max-age=0"
    )
    expect(revalidateTag).toHaveBeenCalledWith("prismic", { expire: 0 })
    expect(revalidatePath).not.toHaveBeenCalled()

    await expect(response.json()).resolves.toMatchObject({
      revalidated: true,
      tags: ["prismic"],
      paths: [],
    })
  })

  it("revalidates unique tags and paths from the request body", async () => {
    vi.stubEnv("REVALIDATE_SECRET", "top-secret")

    const response = await POST(
      new Request("http://localhost/api/revalidate", {
        method: "POST",
        body: JSON.stringify({
          secret: "top-secret",
          tags: [" bolao:123 ", "players:123", "bolao:123"],
          paths: ["/", "/bolao/123/results", "/"],
        }),
      })
    )

    expect(response.status).toBe(200)
    expect(response.headers.get("cache-control")).toBe(
      "private, no-store, max-age=0"
    )
    expect(revalidateTag).toHaveBeenCalledTimes(2)
    expect(revalidateTag).toHaveBeenNthCalledWith(1, "bolao:123", {
      expire: 0,
    })
    expect(revalidateTag).toHaveBeenNthCalledWith(2, "players:123", {
      expire: 0,
    })
    expect(revalidatePath).toHaveBeenCalledTimes(2)
    expect(revalidatePath).toHaveBeenNthCalledWith(1, "/")
    expect(revalidatePath).toHaveBeenNthCalledWith(2, "/bolao/123/results")

    await expect(response.json()).resolves.toMatchObject({
      revalidated: true,
      tags: ["bolao:123", "players:123"],
      paths: ["/", "/bolao/123/results"],
    })
  })
})
