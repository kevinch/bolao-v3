import { describe, it, expect } from "vitest"
import { signInvite, verifyInvite } from "../inviteToken"

describe("inviteToken", () => {
  it("verifies a token it signed for the same bolao", () => {
    const token = signInvite("bolao-1")
    expect(verifyInvite("bolao-1", token)).toBe(true)
  })

  it("rejects a token signed for a different bolao", () => {
    const token = signInvite("bolao-1")
    expect(verifyInvite("bolao-2", token)).toBe(false)
  })

  it("rejects a missing or empty token", () => {
    expect(verifyInvite("bolao-1", undefined)).toBe(false)
    expect(verifyInvite("bolao-1", null)).toBe(false)
    expect(verifyInvite("bolao-1", "")).toBe(false)
  })

  it("rejects a tampered token", () => {
    const token = signInvite("bolao-1")
    expect(verifyInvite("bolao-1", `${token}x`)).toBe(false)
    expect(verifyInvite("bolao-1", token.slice(0, -1))).toBe(false)
  })
})
