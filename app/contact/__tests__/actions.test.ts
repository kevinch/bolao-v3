import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { submitContactMessage } from "../actions"

const { mockSend, MockResend } = vi.hoisted(() => ({
  mockSend: vi.fn(),
  MockResend: vi.fn(),
}))

vi.mock("resend", () => ({ Resend: MockResend }))

describe("submitContactMessage", () => {
  const originalApiKey = process.env.RESEND_API_KEY
  const originalFrom = process.env.RESEND_FROM_EMAIL
  const consoleError = vi.spyOn(console, "error").mockImplementation(() => {})

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.RESEND_API_KEY = "test-api-key"
    process.env.RESEND_FROM_EMAIL = "Bolão.io <feedback@example.com>"
    MockResend.mockImplementation(function () {
      return { emails: { send: mockSend } }
    })
    mockSend.mockResolvedValue({ data: { id: "email-1" }, error: null })
  })

  afterEach(() => {
    if (originalApiKey === undefined) delete process.env.RESEND_API_KEY
    else process.env.RESEND_API_KEY = originalApiKey

    if (originalFrom === undefined) delete process.env.RESEND_FROM_EMAIL
    else process.env.RESEND_FROM_EMAIL = originalFrom
  })

  function makeFormData(values: Record<string, string>) {
    const formData = new FormData()
    Object.entries(values).forEach(([key, value]) => formData.set(key, value))
    return formData
  }

  it("sends a validated message to the feedback inbox with the sender as reply-to", async () => {
    const result = await submitContactMessage(
      { status: "idle" },
      makeFormData({ email: "person@example.com", message: "I have an idea." })
    )

    expect(result).toEqual({ status: "success" })
    expect(MockResend).toHaveBeenCalledWith("test-api-key")
    expect(mockSend).toHaveBeenCalledWith({
      from: "Bolão.io <feedback@example.com>",
      to: "hibolaoio@gmail.com",
      replyTo: "person@example.com",
      subject: "Bolão.io website feedback",
      text: "From: person@example.com\n\nI have an idea.",
    })
  })

  it("rejects an invalid email without sending", async () => {
    const result = await submitContactMessage(
      { status: "idle" },
      makeFormData({ email: "invalid-email", message: "I have an idea." })
    )

    expect(result).toEqual({ status: "error", error: "invalidEmail" })
    expect(mockSend).not.toHaveBeenCalled()
  })

  it("rejects messages outside the allowed length", async () => {
    const result = await submitContactMessage(
      { status: "idle" },
      makeFormData({ email: "person@example.com", message: "Hi!" })
    )

    expect(result).toEqual({ status: "error", error: "invalidMessage" })
    expect(mockSend).not.toHaveBeenCalled()
  })

  it("silently discards submissions caught by the honeypot", async () => {
    const result = await submitContactMessage(
      { status: "idle" },
      makeFormData({
        email: "bot@example.com",
        message: "Automated message",
        website: "https://spam.example",
      })
    )

    expect(result).toEqual({ status: "success" })
    expect(mockSend).not.toHaveBeenCalled()
  })

  it("returns a generic failure if Resend rejects the send", async () => {
    mockSend.mockResolvedValue({ data: null, error: new Error("provider failure") })

    const result = await submitContactMessage(
      { status: "idle" },
      makeFormData({ email: "person@example.com", message: "I have an idea." })
    )

    expect(result).toEqual({ status: "error", error: "sendFailed" })
    expect(consoleError).toHaveBeenCalled()
  })

  it("fails clearly when Resend credentials are not configured", async () => {
    delete process.env.RESEND_API_KEY

    const result = await submitContactMessage(
      { status: "idle" },
      makeFormData({ email: "person@example.com", message: "I have an idea." })
    )

    expect(result).toEqual({ status: "error", error: "sendFailed" })
    expect(mockSend).not.toHaveBeenCalled()
  })
})
